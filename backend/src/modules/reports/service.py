from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime, timedelta
import json

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException
from src.modules.auth.models import User

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, report_id: UUID) -> Optional[models.Report]:
        """Отримання звіту за ID"""
        try:
            result = await self.db.execute(
                select(models.Report).where(models.Report.id == report_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching report: {e}")
            raise DatabaseException("Failed to fetch report")
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        report_type: Optional[schemas.ReportType] = None,
        status: Optional[schemas.ReportStatus] = None
    ) -> List[models.Report]:
        """Отримання всіх звітів"""
        try:
            query = select(models.Report)
            
            if report_type:
                query = query.where(models.Report.report_type == report_type)
            if status:
                query = query.where(models.Report.status == status)
                
            result = await self.db.execute(
                query.order_by(models.Report.created_at.desc())
                .offset(skip).limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching reports: {e}")
            raise DatabaseException("Failed to fetch reports")
    
    async def create(self, report_: schemas.ReportCreate, user_id: UUID) -> models.Report:
        """Створення нового звіту"""
        try:
            # Convert dicts to JSON strings for database storage
            parameters_json = json.dumps(report_data.parameters or {}) if report_data.parameters else None
            filters_json = json.dumps(report_data.filters or {}) if report_data.filters else None
            data_json = json.dumps({})  # Empty data initially
            summary_json = json.dumps({})  # Empty summary initially
            
            db_report = models.Report(
                **report_data.dict(exclude={'parameters', 'filters'}),
                created_by_id=user_id,
                parameters=parameters_json,
                filters=filters_json,
                data=data_json,
                summary=summary_json,
                status=schemas.ReportStatus.PENDING
            )
            
            self.db.add(db_report)
            await self.db.commit()
            await self.db.refresh(db_report)
            return db_report
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating report: {e}")
            raise DatabaseException("Failed to create report")
    
    async def update(
        self, 
        report_id: UUID, 
        report_data: schemas.ReportUpdate
    ) -> Optional[models.Report]:
        """Оновлення звіту"""
        try:
            db_report = await self.get_by_id(report_id)
            if not db_report:
                return None
            
            update_data = report_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_report, field, value)
            
            self.db.add(db_report)
            await self.db.commit()
            await self.db.refresh(db_report)
            return db_report
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error updating report: {e}")
            raise DatabaseException("Failed to update report")
    
    async def delete(self, report_id: UUID) -> bool:
        """Видалення звіту"""
        try:
            db_report = await self.get_by_id(report_id)
            if not db_report:
                return False
            
            await self.db.delete(db_report)
            await self.db.commit()
            return True
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error deleting report: {e}")
            raise DatabaseException("Failed to delete report")
    
    async def generate_report(
        self, 
        report_id: UUID,
        user: User
    ) -> schemas.ReportGenerationResponse:
        """Генерація звіту"""
        try:
            db_report = await self.get_by_id(report_id)
            if not db_report:
                raise NotFoundException("Report not found")
            
            # Mark report as generating
            db_report.status = schemas.ReportStatus.GENERATING
            db_report.last_generated = datetime.utcnow()
            self.db.add(db_report)
            await self.db.commit()
            await self.db.refresh(db_report)
            
            # Generate report data based on type
            report_data = {}
            report_summary = {}
            
            if db_report.report_type == schemas.ReportType.FINANCIAL:
                report_data, report_summary = await self._generate_financial_report(db_report)
            elif db_report.report_type == schemas.ReportType.CASE_SUMMARY:
                report_data, report_summary = await self._generate_case_report(db_report)
            elif db_report.report_type == schemas.ReportType.CLIENT_ACTIVITY:
                report_data, report_summary = await self._generate_client_activity_report(db_report)
            elif db_report.report_type == schemas.ReportType.TIME_TRACKING:
                report_data, report_summary = await self._generate_time_tracking_report(db_report)
            elif db_report.report_type == schemas.ReportType.PERFORMANCE:
                report_data, report_summary = await self._generate_performance_report(db_report)
            elif db_report.report_type == schemas.ReportType.COMPLIANCE:
                report_data, report_summary = await self._generate_compliance_report(db_report)
            elif db_report.report_type == schemas.ReportType.HEARING_SCHEDULE:
                report_data, report_summary = await self._generate_hearing_schedule_report(db_report)
            elif db_report.report_type == schemas.ReportType.TASK_COMPLETION:
                report_data, report_summary = await self._generate_task_completion_report(db_report)
            
            # Update report with generated data
            db_report.data = json.dumps(report_data)
            db_report.summary = json.dumps(report_summary)
            db_report.status = schemas.ReportStatus.COMPLETED
            db_report.next_run = self._calculate_next_run(db_report)
            
            self.db.add(db_report)
            await self.db.commit()
            await self.db.refresh(db_report)
            
            return schemas.ReportGenerationResponse(
                report_id=db_report.id,
                status=db_report.status,
                message=f"Report {db_report.title} generated successfully",
                download_url=f"/api/v1/reports/{db_report.id}/download"
            )
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error generating report: {e}")
            # Mark report as failed
            db_report = await self.get_by_id(report_id)
            if db_report:
                db_report.status = schemas.ReportStatus.FAILED
                self.db.add(db_report)
                await self.db.commit()
            raise DatabaseException(f"Failed to generate report: {str(e)}")
    
    async def _generate_financial_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація фінансового звіту"""
        # Тут буде логіка генерації фінансового звіту
        report_data = {
            "period": "2025-09",
            "total_revenue": 150000.00,
            "total_expenses": 80000.00,
            "net_profit": 70000.00,
            "by_category": {
                "cases": 120000.00,
                "consulting": 30000.00
            },
            "trends": {
                "revenue": [120000, 130000, 150000],
                "expenses": [70000, 75000, 80000]
            }
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_case_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по справах"""
        # Тут буде логіка генерації звіту по справах
        report_data = {
            "total_cases": 45,
            "active_cases": 30,
            "closed_cases": 15,
            "success_rate": 0.85,
            "average_duration": 45.5,
            "by_practice_area": {
                "civil": 20,
                "criminal": 15,
                "family": 10
            }
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_client_activity_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по активності клієнтів"""
        # Тут буде логіка генерації звіту по активності клієнтів
        report_data = {
            "total_clients": 120,
            "active_clients": 85,
            "new_clients": 15,
            "client_retention_rate": 0.92,
            "by_activity_level": {
                "high": 30,
                "medium": 40,
                "low": 15
            }
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_time_tracking_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по відстеженню часу"""
        # Тут буде логіка генерації звіту по відстеженню часу
        report_data = {
            "total_hours": 1200.5,
            "billable_hours": 950.0,
            "non_billable_hours": 250.5,
            "by_user": {
                "john_doe": 400.0,
                "jane_smith": 350.0,
                "bob_wilson": 450.5
            },
            "by_project": {
                "project_a": 300.0,
                "project_b": 400.0,
                "project_c": 500.5
            },
            "productivity_trends": [350.0, 400.0, 450.5]
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_performance_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по продуктивності"""
        # Тут буде логіка генерації звіту по продуктивності
        report_data = {
            "cases_completed": 25,
            "tasks_completed": 150,
            "meetings_held": 30,
            "documents_processed": 75,
            "average_response_time": 2.5,
            "client_satisfaction": 4.8
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_compliance_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по відповідності"""
        # Тут буде логіка генерації звіту по відповідності
        report_data = {
            "compliance_score": 95.5,
            "violations_found": 2,
            "corrective_actions_taken": 5,
            "audit_findings": ["Finding 1", "Finding 2"],
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_hearing_schedule_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по графіку судових засідань"""
        # Тут буде логіка генерації звіту по графіку судових засідань
        report_data = {
            "total_hearings": 20,
            "upcoming_hearings": 8,
            "completed_hearings": 10,
            "cancelled_hearings": 2,
            "by_court": {
                "Kyiv Court": 12,
                "Lviv Court": 8
            },
            "by_judge": {
                "Judge Smith": 10,
                "Judge Johnson": 10
            }
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    async def _generate_task_completion_report(self, report: models.Report) -> tuple[Dict[str, Any], Dict[str, Any]]:
        """Генерація звіту по завершенню завдань"""
        # Тут буде логіка генерації звіту по завершенню завдань
        report_data = {
            "total_tasks": 150,
            "completed_tasks": 120,
            "pending_tasks": 20,
            "overdue_tasks": 10,
            "completion_rate": 0.80,
            "by_assignee": {
                "john_doe": 50,
                "jane_smith": 40,
                "bob_wilson": 30
            },
            "by_priority": {
                "high": 40,
                "medium": 60,
                "low": 50
            }
        }
        
        report_summary = {
            "total_records": 1,
            "generated_at": datetime.utcnow().isoformat(),
            "data_size": len(json.dumps(report_data))
        }
        
        return report_data, report_summary
    
    def _calculate_next_run(self, report: models.Report) -> Optional[datetime]:
        """Обчислення наступного часу запуску для автоматичних звітів"""
        if not report.is_automated or not report.frequency:
            return None
        
        now = datetime.utcnow()
        if report.frequency == schemas.ReportFrequency.DAILY:
            return now + timedelta(days=1)
        elif report.frequency == schemas.ReportFrequency.WEEKLY:
            return now + timedelta(weeks=1)
        elif report.frequency == schemas.ReportFrequency.MONTHLY:
            return now + timedelta(days=30)
        elif report.frequency == schemas.ReportFrequency.QUARTERLY:
            return now + timedelta(days=90)
        elif report.frequency == schemas.ReportFrequency.YEARLY:
            return now + timedelta(days=365)
        return None
    
    async def get_stats(self) -> schemas.ReportStats:
        """Отримання статистики звітів"""
        try:
            result = await self.db.execute(select(models.Report))
            reports = result.scalars().all()
            
            # Count by type
            type_counts = {}
            for report_type in schemas.ReportType:
                type_counts[report_type.value] = len([
                    r for r in reports if r.report_type == report_type.value
                ])
            
            # Count by status
            status_counts = {}
            for status in schemas.ReportStatus:
                status_counts[status.value] = len([
                    r for r in reports if r.status == status.value
                ])
            
            # Count by frequency
            frequency_counts = {}
            for frequency in schemas.ReportFrequency:
                frequency_counts[frequency.value] = len([
                    r for r in reports if r.frequency == frequency.value
                ])
            
            automated_reports = len([r for r in reports if r.is_automated])
            
            return schemas.ReportStats(
                total_reports=len(reports),
                completed_reports=len([r for r in reports if r.status == schemas.ReportStatus.COMPLETED]),
                failed_reports=len([r for r in reports if r.status == schemas.ReportStatus.FAILED]),
                by_type=type_counts,
                by_status=status_counts,
                by_frequency=frequency_counts,
                automated_reports=automated_reports
            )
        except SQLAlchemyError as e:
            logger.error(f"Error getting report stats: {e}")
            raise DatabaseException("Failed to get report statistics")