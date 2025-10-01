from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func  # Виправлений імпорт - func з sqlalchemy, не з sqlalchemy.future
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from . import models, schemas
from src.core.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)

class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, invoice_id: UUID) -> Optional[models.Invoice]:
        try:
            result = await self.db.execute(
                select(models.Invoice).where(models.Invoice.id == invoice_id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching invoice: {e}")
            raise DatabaseException("Failed to fetch invoice")
    
    async def get_by_number(self, invoice_number: str) -> Optional[models.Invoice]:
        try:
            result = await self.db.execute(
                select(models.Invoice).where(models.Invoice.invoice_number == invoice_number)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching invoice: {e}")
            raise DatabaseException("Failed to fetch invoice")
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None,
        client_id: Optional[UUID] = None
    ) -> List[models.Invoice]:
        try:
            query = select(models.Invoice)
            
            if status:
                query = query.where(models.Invoice.status == status)
            if client_id:
                query = query.where(models.Invoice.client_id == client_id)
                
            result = await self.db.execute(
                query.order_by(models.Invoice.issue_date.desc())
                .offset(skip).limit(limit)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error fetching invoices: {e}")
            raise DatabaseException("Failed to fetch invoices")
    
    async def generate_invoice_number(self) -> str:
        try:
            # Generate invoice number like INV-2024-001
            current_year = datetime.now().year
            result = await self.db.execute(
                select(func.count(models.Invoice.id)).where(
                    func.extract('year', models.Invoice.created_at) == current_year
                )
            )
            count = result.scalar() or 0
            return f"INV-{current_year}-{count + 1:03d}"
        except SQLAlchemyError as e:
            logger.error(f"Error generating invoice number: {e}")
            raise DatabaseException("Failed to generate invoice number")
    
    async def create(self, invoice_data: schemas.InvoiceCreate) -> models.Invoice:
        try:
            # Generate invoice number
            invoice_number = await self.generate_invoice_number()
            
            # Calculate totals
            subtotal = sum(item.quantity * item.unit_price for item in invoice_data.items)
            tax_amount = subtotal * (invoice_data.tax_rate / 100)
            discount_amount = subtotal * (invoice_data.discount_rate / 100)
            total_amount = subtotal + tax_amount - discount_amount
            
            # Create invoice
            db_invoice = models.Invoice(
                **invoice_data.dict(exclude={'items'}),
                invoice_number=invoice_number,
                subtotal=subtotal,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total_amount=total_amount,
                balance_due=total_amount
            )
            
            self.db.add(db_invoice)
            await self.db.flush()  # Flush to get invoice ID
            
            # Create invoice items
            for item_data in invoice_data.items:
                item_total = item_data.quantity * item_data.unit_price
                db_item = models.InvoiceItem(
                    **item_data.dict(),
                    invoice_id=db_invoice.id,
                    total=item_total
                )
                self.db.add(db_item)
            
            await self.db.commit()
            await self.db.refresh(db_invoice)
            return db_invoice
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error creating invoice: {e}")
            raise DatabaseException("Failed to create invoice")
    
    async def update_status(
        self, 
        invoice_id: UUID, 
        status: str,
        payment_method: Optional[str] = None,
        payment_reference: Optional[str] = None
    ) -> Optional[models.Invoice]:
        try:
            db_invoice = await self.get_by_id(invoice_id)
            if not db_invoice:
                return None
            
            db_invoice.status = status
            if status == "sent":
                db_invoice.sent_date = datetime.utcnow()
            elif status == "paid":
                db_invoice.paid_date = datetime.utcnow()
                db_invoice.amount_paid = db_invoice.total_amount
                db_invoice.balance_due = 0
                if payment_method:
                    db_invoice.payment_method = payment_method
                if payment_reference:
                    db_invoice.payment_reference = payment_reference
            
            self.db.add(db_invoice)  # Додано self.db.add()
            await self.db.commit()
            await self.db.refresh(db_invoice)
            return db_invoice
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(f"Error updating invoice status: {e}")
            raise DatabaseException("Failed to update invoice status")
    
    async def get_stats(self) -> Dict[str, Any]:
        try:
            result = await self.db.execute(select(models.Invoice))
            invoices = result.scalars().all()
            
            total_revenue = sum(inv.total_amount for inv in invoices if inv.status == "paid")
            pending_revenue = sum(inv.balance_due for inv in invoices if inv.status in ["sent", "partial"])
            overdue_amount = sum(
                inv.balance_due for inv in invoices 
                if inv.status in ["sent", "partial"] and inv.due_date and inv.due_date < datetime.utcnow()
            )
            
            # Count by status
            status_counts = {}
            for status in models.InvoiceStatus:
                status_counts[status.value] = len([
                    inv for inv in invoices if inv.status == status.value
                ])
            
            return {
                "total_invoices": len(invoices),
                "total_revenue": total_revenue,
                "pending_revenue": pending_revenue,
                "overdue_amount": overdue_amount,
                "by_status": status_counts
            }
        except SQLAlchemyError as e:
            logger.error(f"Error getting invoice stats: {e}")
            raise DatabaseException("Failed to get invoice statistics")