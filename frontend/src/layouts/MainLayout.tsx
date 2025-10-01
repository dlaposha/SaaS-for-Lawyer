// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import AppHeader from '../components/Layout/Header';
import AppSidebar from '../components/Layout/Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Сайдбар */}
      <AppSidebar collapsed={collapsed} />
      
      <Layout>
        {/* Хедер */}
        <AppHeader 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)}
        />
        
        {/* Контент */}
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          minHeight: 280 
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;