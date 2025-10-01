# Lawyer CRM — POC (FastAPI + SQLModel + Docker Compose)

Це стартовий репозиторій з базовими CRUD-модулями: **Client, Case, Invoice, Payment**.
Використовуються **PostgreSQL 16**, **Redis 7**, **MinIO**, **Celery worker**.

## Що встановити (1 раз)
1. **Docker Desktop** (Windows/Mac) або Docker Engine (Linux).
2. **Git** (опційно, якщо хочеш клонувати з git-репо).

## Як запустити (5 хв)
```bash
# у теці з проектом
docker-compose up --build
```
- Backend API: http://localhost:8000/docs (Swagger)
- Postgres: localhost:5432 (db=lawyer_crm, user=crm_user, pass=crm_pass)
- Redis: localhost:6379
- MinIO: http://localhost:9000 (login: minioadmin / pass: minioadmin)

## Приклади запитів (після старту)
### 1) Створити клієнта
```bash
curl -X POST http://localhost:8000/clients -H "Content-Type: application/json" -d '{
  "type":"person","full_name":"Іван Петренко","email":"ivan@example.com","phone":"+380991112233"
}'
```
### 2) Створити справу (потрібен client_id з попереднього кроку)
```bash
curl -X POST http://localhost:8000/cases -H "Content-Type: application/json" -d '{
  "number":"CASE-001","title":"Позов до відповідача","client_id":"<UUID клієнта>"
}'
```
### 3) Створити рахунок
```bash
curl -X POST http://localhost:8000/invoices -H "Content-Type: application/json" -d '{
  "client_id":"<UUID клієнта>","case_id":"<UUID справи>",
  "date":"2025-01-10","due_date":"2025-01-25","total":5000.0,"status":"draft"
}'
```
### 4) Провести оплату
```bash
curl -X POST http://localhost:8000/payments -H "Content-Type: application/json" -d '{
  "client_id":"<UUID клієнта>","invoice_id":"<UUID рахунку>",
  "amount":5000.0,"currency":"UAH","method":"bank"
}'
```

## Де писати код
- **backend/** — увесь Python-код FastAPI та Celery.
- CRUD-роутери лежать у **backend/api/**, моделі у **backend/models/**.

## Наступні кроки
- Додати `Hearing`, `Task`, `StageHistory`, `CaseContact` (Модуль 1).
- Підключити FullCalendar (UI) і Kanban (react-beautiful-dnd) у фронтенд (на окремому етапі).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.