import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/locale/uk_UA';

import { PrivateRoute } from '@components/common/PrivateRoute';
import { AppLayout } from '@components/layout/AppLayout';
import { Login } from '@pages/Login';
import { Dashboard } from '@pages/Dashboard';
import { Cases } from '@pages/Cases';
import { CaseDetail } from '@pages/CaseDetail';
import { Clients } from '@pages/Clients';
import { NotFound } from '@pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 хвилин
      cacheTime: 1000 * 60 * 10, // 10 хвилин
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ukUA} theme={antdTheme}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<div>Доступ заборонено</div>} />
            <Route path="/404" element={<NotFound />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <AppLayout>
                  <Navigate to="/dashboard" />
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/cases" element={
              <PrivateRoute>
                <AppLayout>
                  <Cases />
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/cases/new" element={
              <PrivateRoute>
                <AppLayout>
                  <div>Нова справа</div>
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/cases/:id" element={
              <PrivateRoute>
                <AppLayout>
                  <CaseDetail />
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/cases/:id/edit" element={
              <PrivateRoute>
                <AppLayout>
                  <div>Редагування справи</div>
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="/clients" element={
              <PrivateRoute>
                <AppLayout>
                  <Clients />
                </AppLayout>
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Router>
      </ConfigProvider>
      
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;