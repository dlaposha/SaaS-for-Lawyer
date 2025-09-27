# deploy.sh
# Скрипт для розгортання Lawyer CRM

# Перевірка, чи встановлені Docker та Docker Compose
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose could not be found. Please install Docker Compose."
    exit 1
fi

# Зупинка та видалення існуючих контейнерів та нейтвоків
echo "Stopping and removing existing containers and networks..."
docker-compose -f docker-compose.prod.yml down -v

# Побудова образів
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск сервісів
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Перевірка стану сервісів
echo "Checking services status..."
docker-compose -f docker-compose.prod.yml ps

# Запуск міграцій бази даних
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Запуск фонових задач
echo "Starting Celery worker..."
docker-compose -f docker-compose.prod.yml exec celery-worker celery -A src.celery worker --loglevel=info --concurrency=4

echo "Starting Celery beat..."
docker-compose -f docker-compose.prod.yml exec celery-beat celery -A src.celery beat --loglevel=info

# Завершення
echo "Deployment completed. You can now access the application at http://your-domain.com."