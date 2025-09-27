import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Dropdown, Space, Typography, Button } from 'antd';
import type { MenuProps } from 'antd';
import { 
  GlobalOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import AppHeader from '../components/Header';
import AppSidebar from '../components/Sidebar';
import './MainLayout.css';

const { Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setIsDarkMode(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const languageItems: MenuProps['items'] = [
    {
      key: 'uk',
      label: 'Українська',
      onClick: () => handleLanguageChange('uk'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => handleLanguageChange('en'),
    },
  ];

  const themeItems: MenuProps['items'] = [
    {
      key: 'light',
      label: t('lightTheme'),
      icon: <SunOutlined />,
      onClick: () => handleThemeChange('light'),
    },
    {
      key: 'dark',
      label: t('darkTheme'),
      icon: <MoonOutlined />,
      onClick: () => handleThemeChange('dark'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: handleLogout,
    },
  ];

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout className="main-layout" data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Сайдбар */}
      <AppSidebar collapsed={collapsed} />
      
      <Layout>
        {/* Хедер */}
        <AppHeader 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)}
        />
        
        {/* Контент */}
        <Content className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;