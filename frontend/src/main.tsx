import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import uk_UA from 'antd/locale/uk_UA';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './i18n'; // Імпорт i18n на початку
import './index.css';

// Розширена тема Ant Design
const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Card: {
      borderRadius: 12,
    },
    Layout: {
      bodyBg: '#f5f5f5',
      headerBg: '#001529',
    },
  },
};

// Обробка глобальних помилок
const handleGlobalError = (event: ErrorEvent) => {
  console.error('🚨 Global error:', event.error);
  // Тут можна додати відправку помилок на сервер
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  event.preventDefault();
};

// Додавання глобальних обробників помилок
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

const Root: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <ConfigProvider locale={uk_UA} theme={antdTheme}>
          <AppProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AppProvider>
        </ConfigProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

// Безпечний рендеринг з обробкою помилок
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(<Root />);
    
    console.log('✅ Application started successfully');
  } catch (error) {
    console.error('❌ Failed to render application:', error);
    
    // Аварійний рендеринг
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #ff4d4f;">Application Error</h1>
          <p>Sorry, something went wrong. Please refresh the page.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

// Запуск додатку
renderApp();

// Гаряче оновлення модулів (HMR)
if (import.meta.hot) {
  import.meta.hot.accept();
}