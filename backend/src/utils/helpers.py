import uuid
from typing import Union
from datetime import datetime, date
import re
from email_validator import validate_email, EmailNotValidError

def generate_uuid() -> str:
    """Генерація унікального ідентифікатора"""
    return str(uuid.uuid4())

def is_valid_uuid(value: str) -> bool:
    """Перевірка валідності UUID"""
    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False

def format_date(value: Union[datetime, date], format_str: str = "%Y-%m-%d") -> str:
    """Форматування дати"""
    if isinstance(value, datetime):
        return value.strftime(format_str)
    elif isinstance(value, date):
        return value.strftime(format_str)
    return ""

def parse_date(date_string: str, format_str: str = "%Y-%m-%d") -> datetime:
    """Парсинг дати з рядка"""
    return datetime.strptime(date_string, format_str)

def validate_email_address(email: str) -> bool:
    """Валідація email адреси"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

def validate_phone_number(phone: str) -> bool:
    """Валідація номера телефону (український формат)"""
    pattern = re.compile(r"^\+380\d{9}$")
    return bool(pattern.match(phone))

def sanitize_filename(filename: str) -> str:
    """Саніталізація імені файлу"""
    # Видалення небезпечних символів
    cleaned = re.sub(r'[^\w\s-]', '', filename)
    # Заміна пробілів на підкреслення
    cleaned = re.sub(r'[-\s]+', '_', cleaned)
    return cleaned.strip('-_')

def format_file_size(size_bytes: int) -> str:
    """Форматування розміру файлу"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.2f} {size_names[i]}"

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Обрізання тексту до максимальної довжини"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def generate_random_password(length: int = 12) -> str:
    """Генерація випадкового пароля"""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def camel_to_snake(name: str) -> str:
    """Перетворення CamelCase в snake_case"""
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

def snake_to_camel(name: str) -> str:
    """Перетворення snake_case в CamelCase"""
    return ''.join(word.title() for word in name.split('_'))