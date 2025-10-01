import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/Common/ErrorFallback';

// Функція для обробки критичних помилок
const logError = (error: Error, info: { componentStack: string }) => {
  console.error('Application error:', error, info);
  // Тут можна додати відправку помилок на сервер (Sentry, etc.)
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => window.location.reload()}
    >
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Видаліть блок HMR або замініть на умову для Vite
if (import.meta.hot) {
  import.meta.hot.accept();
}