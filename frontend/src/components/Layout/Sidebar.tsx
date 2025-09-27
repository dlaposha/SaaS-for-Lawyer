import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, MenuProps, Typography } from 'antd';
import { 
  DashboardOutlined,
  FolderOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: '/cases',
      icon: <FolderOutlined />,
      label: t('cases'),
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: t('clients'),
    },
    {
      key: '/hearings',
      icon: <CalendarOutlined />,
      label: t('hearings'),
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: t('tasks'),
    },
    {
      key: '/kanban',
      icon: <ApartmentOutlined />,
      label: t('kanban'),
    },
    {
      key: '/time-tracker',
      icon: <ClockCircleOutlined />,
      label: t('timeTracker'),
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: t('invoices'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('reports'),
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className="app-sidebar"
    >
      {/* Лого та назва */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FileTextOutlined />
        </div>
        {!collapsed && (
          <Text strong className="sidebar-title">
            Lawyer CRM
          </Text>
        )}
      </div>

      {/* Навігаційне меню */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />

      {/* Інформація про версію */}
      {!collapsed && (
        <div className="sidebar-footer">
          <Text type="secondary" className="version-text">
            v1.0.0
          </Text>
        </div>
      )}
    </Sider>
  );
};

export default AppSidebar;