FROM python:3.11-slim AS builder

# Налаштування дзеркала PyPI
RUN pip config set global.index-url https://pypi.douban.com/simple

# Встановлення системних залежностей
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Встановлення Poetry зі збільшеним таймаутом
RUN pip install --default-timeout=1000 poetry

# Копіювання файлів залежностей
WORKDIR /app
COPY pyproject.toml poetry.lock* ./

# Встановлення залежностей зі збільшеним таймаутом
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

# Development stage
FROM python:3.11-slim

# Встановлення тільки runtime залежностей
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копіювання коду
WORKDIR /app
COPY --from=builder /app /app

# Запуск додатку з перезавантаженням
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]