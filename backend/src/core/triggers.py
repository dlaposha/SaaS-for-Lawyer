from sqlalchemy import event, DDL
from sqlalchemy.orm import Session
from typing import Any
import logging
from datetime import datetime
from .database import Base  # Імпортуємо Base без циклічного імпорту

logger = logging.getLogger(__name__)

class TriggerManager:
    """Менеджер для керування тригерами бази даних"""
    
    def __init__(self):
        self.triggers = {}
    
    def add_trigger(self, model_name: str, trigger_func: callable):
        """Додає тригер для моделі"""
        self.triggers[model_name] = trigger_func
        logger.info(f"Trigger added for model: {model_name}")
    
    def setup_triggers(self):
        """Налаштовує всі тригери"""
        # Тригери для моделі User
        event.listen(
            Base.metadata,
            'before_create',
            DDL("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            """)
        )
        
        # Додаткові тригери для інших моделей
        # ... (інші тригери)

trigger_manager = TriggerManager()

def setup_triggers():
    """Функція для налаштування тригерів"""
    trigger_manager.setup_triggers()