import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tabs } from 'antd';
import SystemSettingsPage from './SystemSettingsPage';
import RolesPermissionsPage from './RolesPermissionsPage';
import IntegrationsPage from './IntegrationsPage';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: 'system',
      label: t('system'),
      children: <SystemSettingsPage />
    },
    {
      key: 'roles',
      label: t('rolesPermissions'),
      children: <RolesPermissionsPage />
    },
    {
      key: 'integrations',
      label: t('integrations'),
      children: <IntegrationsPage />
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('systemSettings')}</h2>
        <p className="text-gray-600">{t('manageSystemSettings')}</p>
      </div>
      
      <Card>
        <Tabs
          defaultActiveKey="system"
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default SettingsPage;