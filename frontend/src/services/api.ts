import axios from 'axios';

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

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
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
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message
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
      // Створюємо фіктивну відповідь для демо-режиму
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
        // Використовуємо alert тільки для критичних помилок
        if (status === 403 || status === 429) {
          alert(errorMessage);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API сервіс з методами, що повертають data напряму
export const apiService = {
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
};

// Розширені демо-функції
export const demoApi = {
  // Загальна функція для імітації затримки
  delay: (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  getCases: async (): Promise<{ data: any[] }> => {
    await demoApi.delay(500);
    
    return {
      data: [
        {
          id: 1,
          case_number: 'CASE-001',
          title: 'Цивільна справа про стягнення боргу',
          client_id: 1,
          client_name: 'Петренко Іван',
          status: 'in_progress',
          stage: 'first_instance',
          due_date: '2025-10-15',
          hourly_rate: 1500,
          budget: 25000,
          description: 'Стягнення заборгованості за договором позики',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          case_number: 'CASE-002',
          title: 'Кримінальна справа про шахрайство',
          client_id: 2,
          client_name: 'ТОВ "ЮрФірма"',
          status: 'open',
          stage: 'pre_trial',
          due_date: '2025-11-20',
          hourly_rate: 2000,
          budget: 50000,
          description: 'Кримінальне провадження за фактом шахрайства',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ],
    };
  },

  getClients: async (): Promise<{ data: any[] }> => {
    await demoApi.delay(500);
    
    return {
      data: [
        {
          id: 1,
          type: 'person',
          name: 'Петренко Іван Сидорович',
          emails: ['ivan@example.com'],
          phones: ['+380501234567'],
          address: 'м. Київ, вул. Хрещатик, 1',
          kyc_status: 'verified',
          notes: 'Постійний клієнт',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ],
    };
  },

  getTasks: async (): Promise<{ data: any[] }> => {
    await demoApi.delay(300);
    
    return {
      data: [
        {
          id: 1,
          title: 'Підготувати позовну заяву',
          description: 'Підготувати позовну заяву по справі CASE-001',
          priority: 'high',
          status: 'in_progress',
          due_date: '2024-02-01',
          assigned_to: 'Дмитро Лапоша',
          case_id: 1,
        },
      ],
    };
  },

  getInvoices: async (): Promise<{ data: any[] }> => {
    await demoApi.delay(400);
    
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
          description: 'Послуги за січень 2024',
        },
      ],
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
    
    return searchParams.toString();
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
  },

  // Отримання поточного користувача
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default api;