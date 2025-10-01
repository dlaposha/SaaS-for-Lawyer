import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { App } from 'antd';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth';
import { i18nUtils } from '../i18n';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isDemoMode: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => void;
  checkApiHealth: () => Promise<{ status: 'online' | 'offline' | 'error'; demoMode: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для перевірки ініціалізації i18n
const useI18nReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkI18n = () => {
      // Перевіряємо, чи i18n повністю ініціалізований
      if (i18nUtils.getCurrentLanguage()) {
        setIsReady(true);
        console.log('✅ i18n is ready for auth initialization');
      } else {
        // Чекаємо трохи і перевіряємо знову
        setTimeout(checkI18n, 50);
      }
    };

    // Початкова затримка для гарантії ініціалізації i18n
    setTimeout(checkI18n, 100);
  }, []);

  return isReady;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { message } = App.useApp();
  const isI18nReady = useI18nReady();

  const initializeAuth = useCallback(async () => {
    if (!isI18nReady) {
      console.log('⏳ Waiting for i18n initialization...');
      return;
    }

    try {
      console.log('🔄 Starting authentication initialization...');
      
      // Перевіряємо, чи є збережені дані авторизації
      const authInfo = authService.getAuthInfo();
      
      if (authInfo.isAuthenticated && authInfo.user) {
        console.log('🔐 Found existing authentication');
        
        setUser(authInfo.user);
        setIsAuthenticated(true);
        setIsDemoMode(authInfo.isDemoMode);
        
        console.log(`✅ Auth initialized: ${authInfo.user.email} (${authInfo.isDemoMode ? 'Demo' : 'Real'} mode)`);
        
        // Спроба оновити профіль з сервера (якщо не демо-режим)
        if (!authInfo.isDemoMode) {
          try {
            const freshUser = await authService.getProfile();
            setUser(freshUser);
            console.log('🔄 User profile refreshed from server');
          } catch (error) {
            console.warn('⚠️ Failed to refresh user profile, using cached data');
          }
        }
      } else {
        console.log('ℹ️ No valid authentication found');
        // Очищаємо потенційно невалідні дані
        authService.clearAuth();
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      // Автоматичний вихід при помилці ініціалізації
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
    } finally {
      setIsLoading(false);
      console.log('🏁 Auth initialization completed');
    }
  }, [isI18nReady]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const refreshUser = async (): Promise<void> => {
    try {
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      setIsDemoMode(authService.isDemoMode());
      console.log('🔄 User profile refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      throw error;
    }
  };

  const updateUserProfile = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      authService.updateUser(updatedUser);
      console.log('👤 User profile updated locally');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting login process...');
      
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      setIsDemoMode(authService.isDemoMode());
      
      const modeMessage = authService.isDemoMode() ? ` (${i18nUtils.t('demoMode')})` : '';
      message.success(`${i18nUtils.t('loginSuccess')}${modeMessage}`);
      
      console.log('✅ Login completed successfully');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Деталізовані повідомлення про помилки
      let errorMessage = i18nUtils.t('error');
      if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = i18nUtils.t('networkError');
      } else if (error.code === '401') {
        errorMessage = i18nUtils.t('invalidCredentials');
      } else if (error.code === '429') {
        errorMessage = i18nUtils.t('tooManyAttempts') || 'Too many attempts. Please try again later.';
      } else {
        errorMessage = error.message || i18nUtils.t('error');
      }
      
      message.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('📝 Starting registration process...');
      
      const response = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      setIsDemoMode(authService.isDemoMode());
      
      const modeMessage = authService.isDemoMode() ? ` (${i18nUtils.t('demoMode')})` : '';
      message.success(`${i18nUtils.t('registerSuccess')}${modeMessage}`);
      
      console.log('✅ Registration completed successfully');
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = i18nUtils.t('error');
      if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = i18nUtils.t('networkError');
      } else if (error.code === '409') {
        errorMessage = i18nUtils.t('userExists') || 'User with this email already exists';
      } else if (error.code === '400') {
        errorMessage = i18nUtils.t('invalidData') || 'Invalid registration data';
      }
      
      message.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🚪 Starting logout process...');
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      
      message.success(i18nUtils.t('logoutSuccess'));
      
      console.log('✅ Logout completed successfully');
      
      // Перенаправлення на сторінку логіну
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Навіть при помилці виконуємо локальний вихід
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      message.error(i18nUtils.t('error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkApiHealth = async (): Promise<{ status: 'online' | 'offline' | 'error'; demoMode: boolean }> => {
    return await authService.checkApiHealth();
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    isDemoMode,
    login,
    register,
    logout,
    refreshUser,
    updateUserProfile,
    checkApiHealth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Додатковий хук для спрощеного доступу до авторизації
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isDemoMode,
    isAdmin: user?.role === 'admin',
    isLawyer: user?.role === 'lawyer',
    isAssistant: user?.role === 'assistant',
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
  };
};

// Хук для перевірки дозволів
export const usePermissions = () => {
  const { user } = useAuth();
  
  const permissions = React.useMemo(() => {
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
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    permissions,
    hasPermission,
    canManageUsers: hasPermission('manage_users'),
    canManageCases: hasPermission('manage_cases'),
    canManageClients: hasPermission('manage_clients'),
    canViewReports: hasPermission('view_reports'),
  };
};