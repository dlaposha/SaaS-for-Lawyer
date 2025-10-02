// src/services/api.ts
import axios from 'axios';
import { message } from 'antd';

// Базовий URL для API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  NODE_ENV: import.meta.env.MODE
});

// Типи для API
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Основні типи даних
export interface Case {
  id: number;
  case_number: string;
  title: string;
  client_id: number;
  client_name: string;
  status: 'open' | 'in_progress' | 'on_hold' | 'closed' | 'archived';
  stage: 'pre_trial' | 'first_instance' | 'appeal' | 'cassation' | 'enforcement';
  due_date: string;
  hourly_rate: number;
  budget: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  type: 'person' | 'company';
  name: string;
  emails: string[];
  phones: string[];
  address?: string;
  kyc_status: 'unknown' | 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inProgress' | 'done';
  due_date?: string;
  assigned_to?: string;
  case_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  number: string;
  client_id: number;
  client_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'paralegal' | 'accountant' | 'viewer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для додавання токена до запитів
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Додаємо timestamp для уникнення кешування
    if (config.method === 'get' && config.params) {
      config.params._t = Date.now();
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor для обробки помилок
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message,
      data: error.response?.data
    });

    // Автоматичне оновлення токена при 401 помилці
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('authToken', access_token);
          
          // Повторюємо оригінальний запит з новим токеном
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Якщо refresh не вдався, виходимо
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Обробка мережевих помилок для демо-режиму
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED') {
      console.log('🌐 Network error - enabling demo mode fallback');
      // Не показуємо помилку для мережевих проблем
      return Promise.resolve({ 
        data: { 
          _demo: true,
          message: 'Demo mode - network unavailable'
        },
        status: 200,
        statusText: 'OK',
        config: error.config,
        headers: {}
      });
    }
    
    // Обробка інших помилок
    if (error.response) {
      const { status, data } = error.response;
      
      const errorMessage = data?.detail || 
        data?.message ||
        data?.error ||
        (status === 400 ? 'Невірний запит' :
        status === 401 ? 'Неавторизований доступ' :
        status === 403 ? 'Доступ заборонено' :
        status === 404 ? 'Ресурс не знайдено' :
        status === 409 ? 'Конфлікт даних' :
        status === 422 ? 'Невірні дані' :
        status === 429 ? 'Забагато запитів' :
        status === 500 ? 'Внутрішня помилка сервера' :
        status === 502 ? 'Помилка шлюзу' :
        status === 503 ? 'Сервіс недоступний' :
        'Сталася невідома помилка');
      
      console.error(`API Error ${status}:`, errorMessage);
      
      // Показуємо помилку тільки для клієнтських помилок
      if (status >= 400 && status < 500 && status !== 401 && !originalRequest?.silent) {
        message.error(errorMessage);
      }
    } else if (!error.config?.silent) {
      message.error('Помилка мережі. Перевірте підключення до інтернету.');
    }
    
    return Promise.reject(error);
  }
);

// API сервіс з методами, що повертають data напряму
export const apiService = {
  // Базові методи
  get: <T>(url: string, config?: any): Promise<T> =>
    api.get(url, config).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  post: <T>(url: string, data?: any, config?: any): Promise<T> =>
    api.post(url, data, config).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  put: <T>(url: string, data?: any, config?: any): Promise<T> =>
    api.put(url, data, config).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  patch: <T>(url: string, data?: any, config?: any): Promise<T> =>
    api.patch(url, data, config).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  delete: <T>(url: string, config?: any): Promise<T> =>
    api.delete(url, config).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  // Додаткові методи для зручності
  upload: <T>(url: string, formData: FormData, config?: any): Promise<T> =>
    api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }).then(response => {
      if (response.data?._demo) {
        throw new Error('NETWORK_UNAVAILABLE');
      }
      return response.data;
    }),

  download: (url: string, config?: any): Promise<Blob> =>
    api.get(url, {
      ...config,
      responseType: 'blob',
    }).then(response => response.data),

  // Спеціалізовані методи
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiService.post<AuthResponse>('/auth/login', credentials),

  register: (userData: RegisterData): Promise<AuthResponse> =>
    apiService.post<AuthResponse>('/auth/register', userData),

  refreshToken: (refreshToken: string): Promise<{ access_token: string }> =>
    apiService.post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken }),

  getProfile: (): Promise<User> =>
    apiService.get<User>('/auth/profile'),

  updateProfile: (userData: Partial<User>): Promise<User> =>
    apiService.patch<User>('/auth/profile', userData),

  // Cases
  getCases: (params?: PaginationParams): Promise<PaginatedResponse<Case>> =>
    apiService.get<PaginatedResponse<Case>>('/cases', { params }),

  getCase: (id: number): Promise<Case> =>
    apiService.get<Case>(`/cases/${id}`),

  createCase: (caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Promise<Case> =>
    apiService.post<Case>('/cases', caseData),

  updateCase: (id: number, caseData: Partial<Case>): Promise<Case> =>
    apiService.put<Case>(`/cases/${id}`, caseData),

  deleteCase: (id: number): Promise<void> =>
    apiService.delete(`/cases/${id}`),

  // Clients
  getClients: (params?: PaginationParams): Promise<PaginatedResponse<Client>> =>
    apiService.get<PaginatedResponse<Client>>('/clients', { params }),

  getClient: (id: number): Promise<Client> =>
    apiService.get<Client>(`/clients/${id}`),

  createClient: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> =>
    apiService.post<Client>('/clients', clientData),

  updateClient: (id: number, clientData: Partial<Client>): Promise<Client> =>
    apiService.put<Client>(`/clients/${id}`, clientData),

  deleteClient: (id: number): Promise<void> =>
    apiService.delete(`/clients/${id}`),

  // Tasks
  getTasks: (params?: PaginationParams & { case_id?: number }): Promise<PaginatedResponse<Task>> =>
    apiService.get<PaginatedResponse<Task>>('/tasks', { params }),

  getTask: (id: number): Promise<Task> =>
    apiService.get<Task>(`/tasks/${id}`),

  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> =>
    apiService.post<Task>('/tasks', taskData),

  updateTask: (id: number, taskData: Partial<Task>): Promise<Task> =>
    apiService.put<Task>(`/tasks/${id}`, taskData),

  deleteTask: (id: number): Promise<void> =>
    apiService.delete(`/tasks/${id}`),

  // Invoices
  getInvoices: (params?: PaginationParams): Promise<PaginatedResponse<Invoice>> =>
    apiService.get<PaginatedResponse<Invoice>>('/invoices', { params }),

  getInvoice: (id: number): Promise<Invoice> =>
    apiService.get<Invoice>(`/invoices/${id}`),

  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> =>
    apiService.post<Invoice>('/invoices', invoiceData),

  updateInvoice: (id: number, invoiceData: Partial<Invoice>): Promise<Invoice> =>
    apiService.put<Invoice>(`/invoices/${id}`, invoiceData),

  deleteInvoice: (id: number): Promise<void> =>
    apiService.delete(`/invoices/${id}`),

  // Reports
  getIncomeReport: (startDate: string, endDate: string): Promise<any> =>
    apiService.get('/reports/income', { params: { start_date: startDate, end_date: endDate } }),

  getTimeReport: (startDate: string, endDate: string): Promise<any> =>
    apiService.get('/reports/time', { params: { start_date: startDate, end_date: endDate } }),

  getCaseReport: (startDate: string, endDate: string): Promise<any> =>
    apiService.get('/reports/cases', { params: { start_date: startDate, end_date: endDate } }),
};

// Розширені демо-функції
export const demoApi = {
  // Загальна функція для імітації затримки
  delay: (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Аутентифікація
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await demoApi.delay(1000);
    
    if (credentials.email === 'demo@lawyer.com' && credentials.password === 'demo123') {
      const user: User = {
        id: 1,
        email: 'demo@lawyer.com',
        full_name: 'Дмитро Лапоша',
        role: 'lawyer',
        is_active: true,
        last_login: new Date().toISOString(),
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      };
      
      return {
        access_token: 'demo-token-' + Date.now(),
        refresh_token: 'demo-refresh-token-' + Date.now(),
        user,
      };
    } else {
      throw new Error('Невірний email або пароль');
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    await demoApi.delay(1500);
    
    const user: User = {
      id: Date.now(),
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role as User['role'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return {
      access_token: 'demo-token-' + Date.now(),
      refresh_token: 'demo-refresh-token-' + Date.now(),
      user,
    };
  },

  // Cases
  getCases: async (): Promise<{ data: Case[] }> => {
    await demoApi.delay(800);
    
    return {
      data: [
        {
          id: 1,
          case_number: 'CASE-001',
          title: 'Цивільна справа про стягнення боргу',
          client_id: 1,
          client_name: 'Петренко Іван Сидорович',
          status: 'in_progress',
          stage: 'first_instance',
          due_date: '2024-10-15',
          hourly_rate: 1500,
          budget: 25000,
          description: 'Стягнення заборгованості за договором позики. Сума боргу: 150,000 грн.',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
        },
        {
          id: 2,
          case_number: 'CASE-002',
          title: 'Кримінальна справа про шахрайство',
          client_id: 2,
          client_name: 'ТОВ "ЮрФірма"',
          status: 'open',
          stage: 'pre_trial',
          due_date: '2024-11-20',
          hourly_rate: 2000,
          budget: 50000,
          description: 'Кримінальне провадження за фактом шахрайства. Умови: захист інтересів компанії.',
          created_at: '2024-01-16T09:15:00Z',
          updated_at: '2024-01-16T09:15:00Z',
        },
        {
          id: 3,
          case_number: 'CASE-003',
          title: 'Сімейна справа про розподіл майна',
          client_id: 3,
          client_name: 'Марія Коваленко',
          status: 'on_hold',
          stage: 'appeal',
          due_date: '2024-09-30',
          hourly_rate: 1200,
          budget: 18000,
          description: 'Розподіл спільного майна подружжя після розлучення.',
          created_at: '2024-01-10T11:20:00Z',
          updated_at: '2024-01-18T16:45:00Z',
        },
      ],
    };
  },

  // Clients
  getClients: async (): Promise<{ data: Client[] }> => {
    await demoApi.delay(600);
    
    return {
      data: [
        {
          id: 1,
          type: 'person',
          name: 'Петренко Іван Сидорович',
          emails: ['ivan.petrenko@example.com', 'petrenko.i.s@gmail.com'],
          phones: ['+380501234567', '+380441234567'],
          address: 'м. Київ, вул. Хрещатик, 1, кв. 25',
          kyc_status: 'verified',
          notes: 'Постійний клієнт. Надає послуги будівництва.',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          type: 'company',
          name: 'ТОВ "ЮрФірма"',
          emails: ['info@jurfirma.ua', 'director@jurfirma.ua'],
          phones: ['+380442345678'],
          address: 'м. Київ, вул. Велика Васильківська, 72',
          kyc_status: 'verified',
          notes: 'Юридична компанія. Співпраця з 2023 року.',
          created_at: '2024-01-16T09:15:00Z',
          updated_at: '2024-01-16T09:15:00Z',
        },
        {
          id: 3,
          type: 'person',
          name: 'Коваленко Марія Олександрівна',
          emails: ['maria.kovalenko@example.com'],
          phones: ['+380509876543'],
          address: 'м. Київ, вул. Саксаганського, 45, кв. 12',
          kyc_status: 'pending',
          notes: 'Новий клієнт. Потребує консультації з сімейного права.',
          created_at: '2024-01-10T11:20:00Z',
          updated_at: '2024-01-10T11:20:00Z',
        },
      ],
    };
  },

  // Tasks
  getTasks: async (): Promise<{ data: Task[] }> => {
    await demoApi.delay(400);
    
    return {
      data: [
        {
          id: 1,
          title: 'Підготувати позовну заяву',
          description: 'Підготувати позовну заяву по справі CASE-001 про стягнення боргу',
          priority: 'high',
          status: 'todo',
          due_date: '2024-02-01',
          assigned_to: 'Дмитро Лапоша',
          case_id: 1,
          created_at: '2024-01-20T14:30:00Z',
          updated_at: '2024-01-20T14:30:00Z',
        },
        {
          id: 2,
          title: 'Аналіз судової практики',
          description: 'Провести аналіз судової практики по аналогічних справах про шахрайство',
          priority: 'medium',
          status: 'inProgress',
          due_date: '2024-01-25',
          assigned_to: 'Дмитро Лапоша',
          case_id: 2,
          created_at: '2024-01-18T16:45:00Z',
          updated_at: '2024-01-21T10:15:00Z',
        },
        {
          id: 3,
          title: 'Консультація з клієнтом',
          description: 'Провести первинну консультацію з Марією Коваленко щодо розподілу майна',
          priority: 'low',
          status: 'done',
          due_date: '2024-01-15',
          assigned_to: 'Дмитро Лапоша',
          case_id: 3,
          created_at: '2024-01-10T11:20:00Z',
          updated_at: '2024-01-15T15:30:00Z',
        },
        {
          id: 4,
          title: 'Складення договору',
          description: 'Підготувати договір на надання юридичних послуг для ТОВ "ЮрФірма"',
          priority: 'medium',
          status: 'todo',
          due_date: '2024-02-05',
          assigned_to: 'Дмитро Лапоша',
          case_id: 2,
          created_at: '2024-01-22T09:00:00Z',
          updated_at: '2024-01-22T09:00:00Z',
        },
      ],
    };
  },

  // Invoices
  getInvoices: async (): Promise<{ data: Invoice[] }> => {
    await demoApi.delay(500);
    
    return {
      data: [
        {
          id: 1,
          number: 'INV-2024-001',
          client_id: 1,
          client_name: 'Петренко Іван Сидорович',
          amount: 7500,
          status: 'paid',
          issue_date: '2024-01-20',
          due_date: '2024-02-20',
          description: 'Послуги за січень 2024 - консультації та підготовка документів',
          created_at: '2024-01-20T14:30:00Z',
          updated_at: '2024-01-25T11:20:00Z',
        },
        {
          id: 2,
          number: 'INV-2024-002',
          client_id: 2,
          client_name: 'ТОВ "ЮрФірма"',
          amount: 15000,
          status: 'sent',
          issue_date: '2024-01-25',
          due_date: '2024-02-25',
          description: 'Авансовий платіж за кримінальну справу про шахрайство',
          created_at: '2024-01-25T16:15:00Z',
          updated_at: '2024-01-25T16:15:00Z',
        },
        {
          id: 3,
          number: 'INV-2024-003',
          client_id: 3,
          client_name: 'Коваленко Марія Олександрівна',
          amount: 2000,
          status: 'draft',
          issue_date: '2024-01-15',
          due_date: '2024-02-15',
          description: 'Первинна консультація з сімейного права',
          created_at: '2024-01-15T15:30:00Z',
          updated_at: '2024-01-15T15:30:00Z',
        },
      ],
    };
  },

  // Reports
  getIncomeReport: async (): Promise<any> => {
    await demoApi.delay(700);
    
    return {
      data: {
        total_income: 22500,
        average_income: 7500,
        income_by_month: [
          { month: 'Січень 2024', income: 22500 },
          { month: 'Грудень 2023', income: 18000 },
          { month: 'Листопад 2023', income: 21000 },
        ],
        clients_count: 3,
        cases_count: 3,
      },
    };
  },
};

// Утиліти для роботи з API
export const apiUtils = {
  // Генерація query string з параметрами
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  },

  // Перевірка чи це демо-режим
  isDemoMode: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !token || token.startsWith('demo-token-');
  },

  // Очищення локального сховища
  clearAuthData: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🧹 Auth data cleared');
  },

  // Отримання поточного користувача
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Збереження даних автентифікації
  saveAuthData: (authData: AuthResponse): void => {
    localStorage.setItem('authToken', authData.access_token);
    localStorage.setItem('refreshToken', authData.refresh_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    console.log('🔐 Auth data saved for user:', authData.user.email);
  },

  // Перевірка чи токен дійсний
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Проста перевірка - можна додати JWT декодування
      return !token.startsWith('demo-token-') || Date.now() - parseInt(token.split('-')[2]) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  },

  // Отримання заголовків для автентифікації
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Експорт за замовчуванням
export default api;

// Додаткові утиліти для роботи з датами та форматування
export const formatUtils = {
  formatCurrency: (amount: number, currency: string = 'UAH'): string => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  formatDate: (dateString: string, format: string = 'dd.MM.yyyy'): string => {
    const date = new Date(dateString);
    if (format === 'dd.MM.yyyy') {
      return date.toLocaleDateString('uk-UA');
    } else if (format === 'datetime') {
      return date.toLocaleString('uk-UA');
    }
    return date.toISOString().split('T')[0];
  },

  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('380')) {
      return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
    }
    return phone;
  },
};