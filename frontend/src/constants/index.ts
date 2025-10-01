export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  ASSISTANT: 'assistant',
  PARALEGAL: 'paralegal',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
} as const;