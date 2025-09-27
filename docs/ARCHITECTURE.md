# Lawyer CRM Architecture

## Overview
The Lawyer CRM is a SaaS application designed to manage legal cases, clients, documents, and other related entities. It consists of a backend built with FastAPI and a frontend built with React and TypeScript.

## Components
- **Backend (FastAPI)**
  - **Database:** PostgreSQL
  - **Cache:** Redis
  - **File Storage:** MinIO
  - **Task Queue:** Celery
  - **Monitoring:** Prometheus, Grafana
  - **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

- **Frontend (React + TypeScript)**
  - Built with Vite
  - Uses Ant Design for UI components
  - Internationalized with i18next

- **Mobile (React Native)**
  - (Optional) Mobile application for Lawyer CRM

## Modules
- **Auth:** Authentication and user management
- **Cases:** Case management
- **Clients:** Client management
- **Documents:** Document management
- **Calendar:** Calendar events management
- **Hearings:** Hearing management
- **Tasks:** Task management
- **Time Tracking:** Time tracking for cases and tasks
- **Invoices:** Invoice management
- **Payments:** Payment processing
- **Notifications:** Notification management
- **Workflows:** Workflow automation

## Data Flow
1. **User Interaction:** Users interact with the frontend application.
2. **API Requests:** Frontend sends requests to the backend API.
3. **Database Operations:** Backend performs CRUD operations on the PostgreSQL database.
4. **Task Queue:** Background tasks are managed by Celery.
5. **File Storage:** Documents are stored in MinIO.
6. **Monitoring & Logging:** Prometheus and Grafana monitor the application, while ELK Stack handles logging.

## Diagram
![Architecture Diagram](./docs/architecture_diagram.png)