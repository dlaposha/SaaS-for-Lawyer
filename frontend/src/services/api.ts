import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notification } from 'antd';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          notification.error({
            message: 'Доступ заборонено',
            description: 'У вас немає прав для виконання цієї дії',
          });
          break;
        case 404:
          notification.warning({
            message: 'Не знайдено',
            description: 'Запитуваний ресурс не знайдено',
          });
          break;
        case 422:
          notification.error({
            message: 'Помилка валідації',
            description: data.message || 'Перевірте введені дані',
          });
          break;
        case 500:
          notification.error({
            message: 'Помилка сервера',
            description: 'Щось пішло не так. Спробуйте пізніше',
          });
          break;
        default:
          notification.error({
            message: 'Помилка',
            description: data.message || 'Щось пішло не так',
          });
      }
    } else if (error.request) {
      notification.error({
        message: 'Помилка мережі',
        description: 'Не вдалося підключитися до сервера',
      });
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();