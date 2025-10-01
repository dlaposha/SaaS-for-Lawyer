import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import uk_UA from 'antd/locale/uk_UA';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { createBrowserRouter } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';

// Налаштування future flags для React Router v7
const router = createBrowserRouter(
  [
    {
      path: '*',
      element: <AppRoutes />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App: React.FC = () => {
  return (
    <ConfigProvider locale={uk_UA}>
      <AntdApp>
        <AppProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </AppProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;