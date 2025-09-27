from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import event
from typing import Callable, Any
import logging

from .database import Base
from ..utils.constants import TaskPriority, CaseStatus, CaseStage

logger = logging.getLogger(__name__)

class TriggerManager:
    """Менеджер тригерів для автоматизації бізнес-процесів"""
    
    def __init__(self):
        self._triggers = {}
    
    def register_trigger(self, model: type[Base], event_type: str, callback: Callable):
        """Реєстрація тригера"""
        key = f"{model.__name__}.{event_type}"
        self._triggers[key] = callback
        logger.info(f"Registered trigger: {key}")
    
    async def execute_trigger(self, model: type[Base], event_type: str, instance: Any, db: AsyncSession):
        """Виконання тригера"""
        key = f"{model.__name__}.{event_type}"
        callback = self._triggers.get(key)
        
        if callback:
            try:
                await callback(instance, db)
                logger.info(f"Executed trigger: {key}")
            except Exception as e:
                logger.error(f"Trigger execution failed for {key}: {e}")

# Глобальний екземпляр менеджера тригерів
trigger_manager = TriggerManager()

# Тригери для справ
async def create_appeal_task_trigger(case_instance, db: AsyncSession):
    """Тригер для створення задачі на апеляцію"""
    from ..modules.tasks.models import Task
    from ..modules.tasks.schemas import TaskCreate
    
    if (hasattr(case_instance, 'status') and 
        case_instance.status == CaseStatus.CLOSED and 
        hasattr(case_instance, 'decision_date')):
        
        due_date = case_instance.decision_date + timedelta(days=10)
        
        task_data = TaskCreate(
            title="Подати апеляційну скаргу",
            description="Подати апеляцію на рішення суду",
            due_date=due_date,
            case_id=case_instance.id,
            priority=TaskPriority.HIGH,
            assigned_to=case_instance.lawyer_id
        )
        
        task_repo = TaskRepository()
        await task_repo.create(db, task_data)

async def create_hearing_preparation_task_trigger(hearing_instance, db: AsyncSession):
    """Тригер для створення задачі підготовки до засідання"""
    from ..modules.tasks.models import Task
    from ..modules.tasks.schemas import TaskCreate
    
    if hasattr(hearing_instance, 'scheduled_for'):
        due_date = hearing_instance.scheduled_for - timedelta(days=3)
        
        # Отримати справу, до якої належить засідання
        if hasattr(hearing_instance, 'case_id'):
            from ..modules.cases.models import Case
            case_repo = CaseRepository()
            case = await case_repo.get(db, hearing_instance.case_id)
            
            if case:
                task_data = TaskCreate(
                    title="Підготовка до засідання",
                    description=f"Підготувати документи та матеріали для засідання по справі '{case.title}'",
                    due_date=due_date,
                    case_id=hearing_instance.case_id,
                    hearing_id=hearing_instance.id,
                    priority=TaskPriority.HIGH,
                    assigned_to=case.lawyer_id
                )
                
                task_repo = TaskRepository()
                await task_repo.create(db, task_data)

async def create_case_review_task_trigger(case_instance, db: AsyncSession):
    """Тригер для створення задачі огляду справи"""
    from ..modules.tasks.models import Task
    from ..modules.tasks.schemas import TaskCreate
    
    if (hasattr(case_instance, 'stage') and 
        case_instance.stage == CaseStage.REVIEW):
        
        task_data = TaskCreate(
            title="Огляд справи",
            description=f"Провести огляд справи '{case_instance.title}'",
            due_date=date.today() + timedelta(days=7),
            case_id=case_instance.id,
            priority=TaskPriority.MEDIUM,
            assigned_to=case_instance.lawyer_id
        )
        
        task_repo = TaskRepository()
        await task_repo.create(db, task_data)

async def create_client_followup_task_trigger(case_instance, db: AsyncSession):
    """Тригер для створення задачі зв'язку з клієнтом"""
    from ..modules.tasks.models import Task
    from ..modules.tasks.schemas import TaskCreate
    
    if (hasattr(case_instance, 'status') and 
        case_instance.status == CaseStatus.CLOSED):
        
        task_data = TaskCreate(
            title="Зв'язок з клієнтом після закриття справи",
            description=f"Зв'язатися з клієнтом щодо результату справи '{case_instance.title}'",
            due_date=date.today() + timedelta(days=14),
            case_id=case_instance.id,
            priority=TaskPriority.MEDIUM,
            assigned_to=case_instance.lawyer_id
        )
        
        task_repo = TaskRepository()
        await task_repo.create(db, task_data)

# Реєстрація тригерів
def setup_triggers():
    """Налаштування тригерів"""
    
    # Тригери для справ
    trigger_manager.register_trigger(Case, 'after_update', create_appeal_task_trigger)
    trigger_manager.register_trigger(Case, 'after_update', create_case_review_task_trigger)
    trigger_manager.register_trigger(Case, 'after_update', create_client_followup_task_trigger)
    
    # Тригери для засідань
    from ..modules.hearings.models import Hearing
    trigger_manager.register_trigger(Hearing, 'after_insert', create_hearing_preparation_task_trigger)
    
    logger.info("All triggers registered successfully")

# SQLAlchemy event handlers
@event.listens_for(Base, 'after_update')
async def receive_after_update(mapper, connection, target):
    """Обробник події оновлення"""
    from ..core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        await trigger_manager.execute_trigger(type(target), 'after_update', target, db)

@event.listens_for(Base, 'after_insert')
async def receive_after_insert(mapper, connection, target):
    """Обробник події вставки"""
    from ..core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        await trigger_manager.execute_trigger(type(target), 'after_insert', target, db)