export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'lawyer' | 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  cases?: Case[];
}

export interface Case {
  id: number;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'review' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: number;
  lawyerId: number;
  client?: Client;
  lawyer?: User;
  documents?: Document[];
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface Document {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caseId: number;
  uploadedBy: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}