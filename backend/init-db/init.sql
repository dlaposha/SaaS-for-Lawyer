-- Ініціалізація бази даних для Lawyer CRM

-- Створення розширень
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Створення додаткових типів даних (якщо потрібно)
CREATE TYPE user_role AS ENUM (
    'admin',
    'lawyer', 
    'assistant',
    'paralegal',
    'accountant',
    'viewer'
);

CREATE TYPE case_status AS ENUM (
    'new',
    'in_progress',
    'review',
    'completed',
    'closed',
    'archived'
);

CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

CREATE TYPE document_type AS ENUM (
    'contract',
    'court_document',
    'evidence',
    'correspondence',
    'report',
    'template'
);

-- Додаткові функції
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Індексування для поліпшення продуктивності
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Коментарі до таблиць (для документації)
COMMENT ON TABLE users IS 'Користувачі системи (юристи, адміністратори, клієнти)';
COMMENT ON TABLE clients IS 'Клієнти юридичної фірми';
COMMENT ON TABLE cases IS 'Юридичні справи';
COMMENT ON TABLE documents IS 'Документи, пов''язані з справами';