import { apiService, apiUtils } from './api';
import { i18nUtils } from '../i18n';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  phone?: string;
  settings?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

class AuthService {
  private isDemo = apiUtils.isDemoMode();
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;
  private isUpdatingUser = false; // Додаємо флаг для запобігання рекурсії

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login...', { email: credentials.email });
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      this.isDemo = false;
      this.storeAuthData(response);
      this.scheduleTokenRefresh(response.expires_in);
      
      console.log('✅ Login successful', { email: response.user.email });
      return response;
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE' || error.code === 'NETWORK_ERROR') {
        console.log('🌐 Using demo mode for login');
        return this.demoLogin(credentials);
      }
      
      const authError: AuthError = {
        code: error.response?.status?.toString() || 'UNKNOWN',
        message: error.message || 'Login failed',
        details: error.response?.data
      };
      
      console.error('❌ Login failed:', authError);
      throw authError;
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration...', { email: userData.email });
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      this.isDemo = false;
      this.storeAuthData(response);
      this.scheduleTokenRefresh(response.expires_in);
      
      console.log('✅ Registration successful', { email: response.user.email });
      return response;
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE' || error.code === 'NETWORK_ERROR') {
        console.log('🌐 Using demo mode for registration');
        return this.demoLogin({ 
          email: userData.email, 
          password: userData.password 
        });
      }
      
      const authError: AuthError = {
        code: error.response?.status?.toString() || 'UNKNOWN',
        message: error.message || 'Registration failed',
        details: error.response?.data
      };
      
      console.error('❌ Registration failed:', authError);
      throw authError;
    }
  }

  private demoLogin(credentials: LoginCredentials): AuthResponse {
    // Створюємо стабільний демо-користувача
    const demoUser: User = {
      id: 1,
      email: credentials.email || 'demo@lawyer.com',
      full_name: 'Демо Користувач',
      role: 'lawyer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar_url: '/demo-avatar.jpg',
      phone: '+380501234567',
      settings: {
        language: 'uk',
        theme: 'light',
        notifications: true
      }
    };

    const demoResponse: AuthResponse = {
      access_token: `demo-token-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600, // 1 година
      user: demoUser,
    };

    this.isDemo = true;
    this.storeAuthData(demoResponse);
    console.log('🎭 Demo login successful', { email: demoUser.email });
    
    return demoResponse;
  }

  private storeAuthData(response: AuthResponse): void {
    try {
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('tokenExpiresAt', (Date.now() + response.expires_in * 1000).toString());
      
      // Оновлюємо мову з налаштувань користувача
      if (response.user.settings?.language) {
        i18nUtils.changeLanguage(response.user.settings.language);
      }
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Плануємо оновлення за 5 хвилин до закінчення терміну
    const refreshTime = (expiresIn - 300) * 1000;
    
    if (refreshTime > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshToken().catch(error => {
          console.warn('⚠️ Token refresh failed:', error);
        });
      }, refreshTime);
    }
  }

  async logout(): Promise<void> {
    // Очищаємо таймер оновлення токена
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }

    if (!this.isDemo) {
      try {
        await apiService.post('/auth/logout', {}, { timeout: 5000 });
        console.log('✅ Server logout successful');
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with local cleanup');
      }
    }
    
    this.clearAuth();
    console.log('🚪 Logout completed');
  }

  async refreshToken(): Promise<string> {
    if (this.isDemo) {
      const newToken = `demo-token-${Date.now()}`;
      localStorage.setItem('authToken', newToken);
      return newToken;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiService.post<{ access_token: string; expires_in: number }>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('tokenExpiresAt', (Date.now() + response.expires_in * 1000).toString());
      
      this.scheduleTokenRefresh(response.expires_in);
      
      console.log('🔄 Token refreshed successfully');
      return response.access_token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // При помилці оновлення токена виходимо
      await this.logout();
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    if (this.isDemo) {
      const user = this.getCurrentUser();
      if (user && user.email) {
        console.log('👤 Returning demo user profile', { email: user.email });
        return user;
      }
      
      // Якщо демо-користувач не знайдений, створюємо нового
      console.log('👤 Creating new demo user profile');
      const demoUser = this.createDemoUser();
      this.updateUser(demoUser);
      return demoUser;
    }

    try {
      const user = await apiService.get<User>('/auth/me');
      // Оновлюємо дані користувача
      this.updateUser(user);
      return user;
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE' || error.code === 'NETWORK_ERROR') {
        console.log('🌐 Falling back to demo profile');
        const user = this.getCurrentUser();
        if (user) {
          this.isDemo = true;
          return user;
        }
        // Створюємо демо-користувача, якщо немає збережених даних
        const demoUser = this.createDemoUser();
        this.isDemo = true;
        this.updateUser(demoUser);
        return demoUser;
      }
      throw error;
    }
  }

  private createDemoUser(): User {
    return {
      id: 1,
      email: 'demo@lawyer.com',
      full_name: 'Демо Користувач',
      role: 'lawyer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar_url: '/demo-avatar.jpg',
      phone: '+380501234567',
      settings: {
        language: 'uk',
        theme: 'light',
        notifications: true
      }
    };
  }

  updateUser(userData: Partial<User>): void {
    // Запобігаємо рекурсивним викликам
    if (this.isUpdatingUser) {
      return;
    }

    try {
      this.isUpdatingUser = true;
      const currentUser = this.getCurrentUser();
      
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          ...userData, 
          updated_at: new Date().toISOString() 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Оновлюємо мову, якщо вона змінилася
        if (userData.settings?.language && userData.settings.language !== currentUser.settings?.language) {
          i18nUtils.changeLanguage(userData.settings.language);
        }
      } else {
        // Якщо користувача немає, зберігаємо нові дані
        const newUser: User = {
          id: userData.id || 1,
          email: userData.email || 'demo@lawyer.com',
          full_name: userData.full_name || 'Демо Користувач',
          role: userData.role || 'lawyer',
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...userData
        };
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('❌ Failed to update user:', error);
    } finally {
      this.isUpdatingUser = false;
    }
  }

  clearAuth(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresAt');
      
      if (this.tokenRefreshTimeout) {
        clearTimeout(this.tokenRefreshTimeout);
        this.tokenRefreshTimeout = null;
      }
      
      this.isDemo = false;
      console.log('🧹 Auth data cleared');
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr) as User;
      
      // Перевіряємо, що email існує, якщо ні - створюємо демо-користувача
      if (!user.email) {
        console.warn('⚠️ User data corrupted, creating demo user');
        const demoUser = this.createDemoUser();
        // Використовуємо пряме збереження без виклику updateUser
        localStorage.setItem('user', JSON.stringify(demoUser));
        return demoUser;
      }
      
      return user;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      // Перевіряємо, чи це демо-токен
      if (token.startsWith('demo-token-')) {
        return true;
      }

      // Перевіряємо термін дії токена для реальних токенів
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        console.warn('⚠️ Token expired');
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  isDemoMode(): boolean {
    return this.isDemo;
  }

  // Перевірка доступності API
  async checkApiHealth(): Promise<{ status: 'online' | 'offline' | 'error'; demoMode: boolean }> {
    try {
      await apiService.get('/health', { timeout: 5000 });
      return { status: 'online', demoMode: false };
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE' || error.code === 'NETWORK_ERROR') {
        return { status: 'offline', demoMode: true };
      }
      return { status: 'error', demoMode: this.isDemo };
    }
  }

  // Додаткові методи
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (this.isDemo) {
      console.log('🎭 Demo mode: password change simulated');
      return;
    }

    await apiService.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    if (this.isDemo) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('No user data');
      
      const updatedUser = { ...currentUser, ...profileData };
      this.updateUser(updatedUser);
      return updatedUser;
    }

    const updatedUser = await apiService.put<User>('/auth/profile', profileData);
    this.updateUser(updatedUser);
    return updatedUser;
  }

  // Перевірка ролей
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.includes(user?.role || '');
  }

  // Отримання інформації про авторизацію
  getAuthInfo() {
    const user = this.getCurrentUser();
    return {
      isAuthenticated: this.isAuthenticated(),
      isDemoMode: this.isDemoMode(),
      user: user,
      roles: user ? [user.role] : [],
      permissions: this.getUserPermissions(),
    };
  }

  private getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const basePermissions = ['view_dashboard'];
    
    switch (user.role) {
      case 'admin':
        return [...basePermissions, 'manage_users', 'manage_cases', 'manage_clients', 'view_reports'];
      case 'lawyer':
        return [...basePermissions, 'manage_cases', 'manage_clients', 'view_reports'];
      case 'assistant':
        return [...basePermissions, 'view_cases', 'view_clients'];
      default:
        return basePermissions;
    }
  }
}

export const authService = new AuthService();

// Експорт утиліт для глобального використання
export const authUtils = {
  // Безпечна перевірка авторизації
  checkAuth: (): boolean => {
    return authService.isAuthenticated();
  },

  // Отримання інформації про користувача
  getUserInfo: () => {
    return authService.getAuthInfo();
  },

  // Швидка перевірка ролей
  isAdmin: (): boolean => authService.hasRole('admin'),
  isLawyer: (): boolean => authService.hasRole('lawyer'),
  isAssistant: (): boolean => authService.hasRole('assistant'),

  // Перевірка дозволів
  hasPermission: (permission: string): boolean => {
    const info = authService.getAuthInfo();
    return info.permissions.includes(permission);
  },

  // Очищення даних (для тестування)
  clearStorage: (): void => {
    authService.clearAuth();
  }
};