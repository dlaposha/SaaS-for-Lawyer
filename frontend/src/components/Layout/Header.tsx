// src/components/Layout/Header.tsx
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профіль',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Вийти',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader style={{ 
      padding: '0 16px', 
      background: '#fff', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        <Text strong style={{ fontSize: '18px', marginLeft: 8 }}>
          Lawyer CRM
        </Text>
      </div>

      <div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 6 }}>
            <Avatar icon={<UserOutlined />} size="default" />
            <div>
              <Text strong>{user?.full_name || 'Користувач'}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user?.role === 'lawyer' ? 'Адвокат' : 'Користувач'}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default AppHeader;