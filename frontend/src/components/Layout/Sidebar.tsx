import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined,
  FolderOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/cases',
      icon: <FolderOutlined />,
      label: 'Справи',
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Клієнти',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Календар',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: 'Завдання',
    },
    {
      key: '/kanban',
      icon: <ApartmentOutlined />,
      label: 'Канбан',
    },
    {
      key: '/time-tracker',
      icon: <ClockCircleOutlined />,
      label: 'Таймер',
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: 'Рахунки',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Звіти',
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
      style={{ 
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Лого */}
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {!collapsed && (
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Lawyer CRM</div>
        )}
        {collapsed && (
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>LC</div>
        )}
      </div>

      {/* Меню */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
};

export default AppSidebar;