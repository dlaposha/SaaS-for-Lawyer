import { apiService, demoApi } from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

class UserService {
  async getUsers(page: number = 1, size: number = 10): Promise<PaginatedResponse<User>> {
    try {
      return await apiService.get<PaginatedResponse<User>>(`/users?page=${page}&size=${size}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.warn('🌐 Backend unavailable, using demo data for users');
        // Демо-дані користувачів
        const demoUsers: User[] = [
          {
            id: 1,
            email: 'admin@example.com',
            full_name: 'Адміністратор Системи',
            role: 'admin',
            is_active: true,
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
          },
          {
            id: 2,
            email: 'lawyer@example.com',
            full_name: 'Юрист Петренко Іван',
            role: 'lawyer',
            is_active: true,
            created_at: '2024-01-02T10:00:00Z',
            updated_at: '2024-01-02T10:00:00Z',
          },
          {
            id: 3,
            email: 'assistant@example.com',
            full_name: 'Помічник Коваленко Марія',
            role: 'assistant',
            is_active: true,
            created_at: '2024-01-03T10:00:00Z',
            updated_at: '2024-01-03T10:00:00Z',
          },
        ];

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedItems = demoUsers.slice(startIndex, endIndex);

        return {
          items: paginatedItems,
          total: demoUsers.length,
          page,
          size,
          pages: Math.ceil(demoUsers.length / size),
        };
      }
      throw error;
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      return await apiService.get<User>(`/users/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        // Шукаємо користувача в демо-даних
        const demoResponse = await this.getUsers(1, 100);
        const user = demoResponse.items.find(u => u.id === id);
        if (!user) {
          throw new Error(`User with id ${id} not found`);
        }
        return user;
      }
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      return await apiService.post<User>('/users', userData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        // Створюємо демо-користувача
        const demoUser: User = {
          id: Date.now(),
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log('🌐 Demo mode: user created', demoUser);
        return demoUser;
      }
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      return await apiService.put<User>(`/users/${id}`, userData);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        // Оновлюємо демо-користувача
        const currentUser = await this.getUser(id);
        const updatedUser: User = {
          ...currentUser,
          ...userData,
          updated_at: new Date().toISOString(),
        };
        console.log('🌐 Demo mode: user updated', updatedUser);
        return updatedUser;
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await apiService.delete(`/users/${id}`);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        console.log('🌐 Demo mode: user deletion simulated for id', id);
        return;
      }
      throw error;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await this.getUsers(1, 50);
      return response.items.filter(user =>
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.full_name.toLowerCase().includes(query.toLowerCase()) ||
        user.role.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const response = await this.getUsers(1, 100);
        return response.items.filter(user =>
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.full_name.toLowerCase().includes(query.toLowerCase()) ||
          user.role.toLowerCase().includes(query.toLowerCase())
        );
      }
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const response = await this.getUsers(1, 100);
      return response.items.filter(user => user.role === role && user.is_active);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const response = await this.getUsers(1, 100);
        return response.items.filter(user => user.role === role && user.is_active);
      }
      throw error;
    }
  }
}

export const userService = new UserService();