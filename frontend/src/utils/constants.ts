export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  ASSISTANT: 'assistant',
  PARALEGAL: 'paralegal',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
} as const;

export const CASE_STATUS = {
  OPEN: 'open',
  ON_HOLD: 'on_hold',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export const CLIENT_TYPES = {
  PERSON: 'person',
  COMPANY: 'company',
} as const;