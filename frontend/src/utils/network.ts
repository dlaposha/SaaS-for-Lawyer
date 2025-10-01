// Утиліти для роботи з мережею
export const networkUtils = {
  async checkConnectivity(url?: string): Promise<boolean> {
    const testUrl = url || `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/health`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('🌐 Connectivity check failed:', error);
      return false;
    }
  },

  isLocalNetwork(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  },

  getApiBaseUrl(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  },

  // Функція для повторення запиту з експоненційною backoff затримкою
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
};