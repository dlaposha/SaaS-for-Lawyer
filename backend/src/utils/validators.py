import re
from typing import Optional
from datetime import datetime

def validate_ukraine_phone(phone: str) -> bool:
    """Валідація українського номера телефону"""
    pattern = re.compile(r"^\+?380\d{9}$")
    return bool(pattern.match(phone))

def validate_edrpou(edrpou: str) -> bool:
    """Валідація ЄДРПОУ"""
    if not edrpou.isdigit() or len(edrpou) != 8:
        return False
    
    # Алгоритм перевірки контрольної цифри ЄДРПОУ
    coefficients = [1, 2, 3, 4, 5, 6, 7]
    digits = [int(d) for d in edrpou[:7]]
    control_sum = sum(d * c for d, c in zip(digits, coefficients)) % 11
    control_digit = control_sum % 10 if control_sum < 10 else 0
    
    return control_digit == int(edrpou[7])

def validate_drfo(drfo: str) -> bool:
    """Валідація ДРФО"""
    if not drfo.isdigit() or len(drfo) not in [9, 10]:
        return False
    
    # Спрощена перевірка ДРФО
    return len(drfo) in [9, 10]

def validate_iban(iban: str) -> bool:
    """Валідація IBAN"""
    # Базова перевірка формату українського IBAN
    pattern = re.compile(r"^UA\d{2}[A-Z]{4}\d{6}[A-Z0-9]{16}$")
    return bool(pattern.match(iban.replace(" ", "").upper()))

def validate_passport_series(series: str) -> bool:
    """Валідація серії паспорта"""
    pattern = re.compile(r"^[A-Z]{2}$")
    return bool(pattern.match(series.upper()))

def validate_passport_number(number: str) -> bool:
    """Валідація номера паспорта"""
    pattern = re.compile(r"^\d{6}$")
    return bool(pattern.match(number))

def validate_birth_date(date_str: str) -> bool:
    """Валідація дати народження"""
    try:
        birth_date = datetime.strptime(date_str, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return 14 <= age <= 120  # Реалістичний вік
    except ValueError:
        return False

def validate_postal_code(code: str) -> bool:
    """Валідація поштового індексу України"""
    pattern = re.compile(r"^\d{5}$")
    return bool(pattern.match(code))

def validate_inn(inn: str) -> bool:
    """Валідація ІПН"""
    if not inn.isdigit() or len(inn) not in [10, 12]:
        return False
    
    # Спрощена перевірка ІПН
    return len(inn) in [10, 12]

def validate_legal_entity_name(name: str) -> bool:
    """Валідація назви юридичної особи"""
    if len(name) < 2 or len(name) > 255:
        return False
    
    # Дозволені символи для назви
    pattern = re.compile(r"^[a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9\s\"'\-.,()&]+$", re.UNICODE)
    return bool(pattern.match(name))

def validate_court_case_number(case_number: str) -> bool:
    """Валідація номера судової справи"""
    pattern = re.compile(r"^[0-9а-яА-ЯёЁіІїЇєЄ\-/]+\/[0-9]{4}$", re.UNICODE)
    return bool(pattern.match(case_number))