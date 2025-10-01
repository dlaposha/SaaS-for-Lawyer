import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tabs } from 'antd';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import PreferencesSettings from './PreferencesSettings';
import BillingPage from './BillingPage';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  const tabItems = [
    {
      key: 'profile',
      label: t('profile'),
      children: <ProfileSettings />
    },
    {
      key: 'security',
      label: t('security'),
      children: <SecuritySettings />
    },
    {
      key: 'preferences',
      label: t('preferences'),
      children: <PreferencesSettings />
    },
    {
      key: 'billing',
      label: t('billing'),
      children: <BillingPage />
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t('profileSettings')}</h2>
        <p className="text-gray-600">{t('manageYourAccountSettings')}</p>
      </div>
      
      <Card>
        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          tabPosition="left"
          size="large"
        />
      </Card>
    </div>
  );
};

export default ProfilePage;