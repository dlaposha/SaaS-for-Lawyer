import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Card, Typography, Space, Button, Dropdown } from 'antd';
import { 
  GlobalOutlined,
  MoonOutlined,
  SunOutlined 
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import './AuthLayout.css';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
  showLanguageSwitcher?: boolean;
  showThemeSwitcher?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  showLanguageSwitcher = true,
  showThemeSwitcher = true 
}) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
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

  const handleThemeChange = (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

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

  return (
    <Layout className="auth-layout">
      {/* Хедер з контролами */}
      <div className="auth-header">
        <Space>
          {showLanguageSwitcher && (
            <Dropdown menu={{ items: languageItems }} placement="bottomRight">
              <Button 
                type="text" 
                icon={<GlobalOutlined />} 
                className="control-btn"
              >
                {i18n.language.toUpperCase()}
              </Button>
            </Dropdown>
          )}
          
          {showThemeSwitcher && (
            <Dropdown menu={{ items: themeItems }} placement="bottomRight">
              <Button 
                type="text" 
                icon={<SunOutlined />} 
                className="control-btn"
              />
            </Dropdown>
          )}
        </Space>
      </div>

      {/* Основной контент */}
      <Content className="auth-content">
        <div className="auth-container">
          <Card className="auth-card">
            {/* Логотип и заголовок */}
            <div className="auth-brand">
              <div className="auth-logo">
                ⚖️
              </div>
              <Title level={2} className="auth-title">
                {t('welcome')}
              </Title>
              <Text type="secondary" className="auth-subtitle">
                {t('loginToContinue')}
              </Text>
            </div>

            {/* Дети (форма логина/регистрации) */}
            {children}

            {/* Футер */}
            <div className="auth-footer">
              <Text type="secondary" className="footer-text">
                © 2025 {t('lawyerCRM')}. {t('allRightsReserved')}
              </Text>
            </div>
          </Card>
        </div>
      </Content>

      {/* Глобальный футер */}
      <Footer className="global-footer">
        <Space direction="vertical" size="small">
          <Text type="secondary">{t('needHelp')}</Text>
          <Text type="secondary">{t('contactSupport')}: support@lawyer-crm.com</Text>
        </Space>
      </Footer>
    </Layout>
  );
};

export default AuthLayout;