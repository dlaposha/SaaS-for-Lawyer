import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Layout, 
  Button, 
  Dropdown, 
  Avatar, 
  Space, 
  Typography,
  Badge,
  MenuProps 
} from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  GlobalOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notificationCount] = useState(3);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  const languageMenuItems: MenuProps['items'] = [
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

  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="toggle-btn"
        />
        <Text strong className="header-title">
          {t('welcome')}, {userData.full_name || t('user')}
        </Text>
      </div>

      <div className="header-right">
        <Space size="middle">
          {/* Перемикач мов */}
          <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight">
            <Button icon={<GlobalOutlined />} type="text">
              {i18n.language.toUpperCase()}
            </Button>
          </Dropdown>

          {/* Сповіщення */}
          <Dropdown 
            menu={{ 
              items: [
                { key: '1', label: t('newCaseAssigned') },
                { key: '2', label: t('hearingReminder') },
                { key: '3', label: t('invoiceDue') },
              ] 
            }} 
            placement="bottomRight"
          >
            <Badge count={notificationCount} size="small">
              <Button icon={<BellOutlined />} type="text" />
            </Badge>
          </Dropdown>

          {/* Профіль користувача */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="user-profile">
              <Avatar 
                icon={<UserOutlined />} 
                size="default"
                className="user-avatar"
              />
              <div className="user-info">
                <Text strong>{userData.full_name || t('user')}</Text>
                <Text type="secondary" className="user-role">
                  {t(userData.role || 'user')}
                </Text>
              </div>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default AppHeader;