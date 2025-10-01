import { caseService } from './cases';
import { authService } from './auth';
import { demoApi } from './api';

// Тестова функція для перевірки всіх сервісів
export const testAllServices = async () => {
  console.log('🧪 Starting services test...');
  
  try {
    // Тест сервісу cases
    console.log('📋 Testing cases service...');
    const cases = await caseService.getCases({ page: 1, limit: 10 });
    console.log('✅ Cases service works:', {
      totalCases: cases.total,
      itemsCount: cases.items.length,
      items: cases.items.map(c => ({ id: c.id, title: c.title }))
    });

    // Тест демо API
    console.log('🎭 Testing demo API...');
    const demoCases = await demoApi.getCases();
    const demoClients = await demoApi.getClients();
    console.log('✅ Demo API works:', {
      demoCases: demoCases.data.length,
      demoClients: demoClients.data.length
    });

    // Тест авторизації (демо режим)
    console.log('🔐 Testing auth service...');
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    console.log('✅ Auth service works:', {
      isAuthenticated,
      currentUser: currentUser ? currentUser.email : 'No user'
    });

    // Тест статистики cases
    console.log('📊 Testing case statistics...');
    const stats = await caseService.getCaseStatusStats();
    console.log('✅ Case stats work:', stats);

    // Тест пошуку cases
    console.log('🔍 Testing case search...');
    const searchResults = await caseService.searchCases('цивільна');
    console.log('✅ Case search works:', {
      found: searchResults.length,
      results: searchResults.map(c => c.title)
    });

    console.log('🎉 All services are working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Service test failed:', error);
    return false;
  }
};

// Функція для тестування окремих сервісів
export const testService = {
  cases: async () => {
    try {
      const result = await caseService.getCases({ page: 1, limit: 5 });
      console.log('📋 Cases service test:', {
        success: true,
        total: result.total,
        items: result.items.length
      });
      return result;
    } catch (error) {
      console.error('📋 Cases service test failed:', error);
      throw error;
    }
  },

  demoData: async () => {
    try {
      const [cases, clients, tasks, invoices] = await Promise.all([
        demoApi.getCases(),
        demoApi.getClients(),
        demoApi.getTasks(),
        demoApi.getInvoices()
      ]);
      
      console.log('🎭 Demo data test:', {
        success: true,
        cases: cases.data.length,
        clients: clients.data.length,
        tasks: tasks.data.length,
        invoices: invoices.data.length
      });
      
      return { cases, clients, tasks, invoices };
    } catch (error) {
      console.error('🎭 Demo data test failed:', error);
      throw error;
    }
  },

  auth: async () => {
    try {
      const isAuth = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      const isDemo = authService.isDemoMode();
      
      console.log('🔐 Auth service test:', {
        success: true,
        isAuthenticated: isAuth,
        isDemoMode: isDemo,
        user: user ? user.email : 'No user'
      });
      
      return { isAuthenticated: isAuth, user, isDemoMode: isDemo };
    } catch (error) {
      console.error('🔐 Auth service test failed:', error);
      throw error;
    }
  }
};