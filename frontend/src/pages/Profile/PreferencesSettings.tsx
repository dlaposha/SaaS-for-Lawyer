import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Divider,
  Radio,
  message
} from 'antd';
import { 
  SaveOutlined,
  GlobalOutlined,
  BellOutlined,
  EyeOutlined
} from '@ant-design/icons';

const PreferencesSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const preferencesData = {
    language: 'uk',
    theme: 'light',
    date_format: 'dd.MM.yyyy',
    time_format: '24h',
    week_start: 'monday',
    email_notifications: true,
    push_notifications: true,
    desktop_notifications: false,
    compact_view: false,
    show_tutorials: true
  };

  const handleSavePreferences = async (values: any) => {
    setLoading(true);
    try {
      // Оновлення мови
      if (values.language !== i18n.language) {
        await i18n.changeLanguage(values.language);
      }
      
      // Тут буде API запит
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(t('preferencesSaved'));
    } catch (error) {
      message.error(t('errorSavingPreferences'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Мова та регіон */}
      <Card title={
        <Space>
          <GlobalOutlined />
          <span>{t('languageRegion')}</span>
        </Space>
      }>
        <Form
          form={form}
          layout="vertical"
          initialValues={preferencesData}
          onFinish={handleSavePreferences}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="language" label={t('language')}>
              <Select>
                <Select.Option value="uk">Українська</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="theme" label={t('theme')}>
              <Select>
                <Select.Option value="light">{t('light')}</Select.Option>
                <Select.Option value="dark">{t('dark')}</Select.Option>
                <Select.Option value="auto">{t('auto')}</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="date_format" label={t('dateFormat')}>
              <Select>
                <Select.Option value="dd.MM.yyyy">DD.MM.YYYY</Select.Option>
                <Select.Option value="MM/dd/yyyy">MM/DD/YYYY</Select.Option>
                <Select.Option value="yyyy-MM-dd">YYYY-MM-DD</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="time_format" label={t('timeFormat')}>
              <Radio.Group>
                <Radio value="24h">24 {t('hour')}</Radio>
                <Radio value="12h">12 {t('hour')}</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {/* Сповіщення */}
      <Card title={
        <Space>
          <BellOutlined />
          <span>{t('notifications')}</span>
        </Space>
      }>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('emailNotifications')}</div>
              <div className="text-gray-600 text-sm">{t('emailNotificationsDescription')}</div>
            </div>
            <Form.Item name="email_notifications" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
          
          <Divider className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('pushNotifications')}</div>
              <div className="text-gray-600 text-sm">{t('pushNotificationsDescription')}</div>
            </div>
            <Form.Item name="push_notifications" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
          
          <Divider className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('desktopNotifications')}</div>
              <div className="text-gray-600 text-sm">{t('desktopNotificationsDescription')}</div>
            </div>
            <Form.Item name="desktop_notifications" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </Space>
      </Card>

      {/* Відображення */}
      <Card title={
        <Space>
          <EyeOutlined />
          <span>{t('display')}</span>
        </Space>
      }>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('compactView')}</div>
              <div className="text-gray-600 text-sm">{t('compactViewDescription')}</div>
            </div>
            <Form.Item name="compact_view" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
          
          <Divider className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('showTutorials')}</div>
              <div className="text-gray-600 text-sm">{t('showTutorialsDescription')}</div>
            </div>
            <Form.Item name="show_tutorials" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </Space>
      </Card>

      <div className="text-right">
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={loading}
          onClick={() => form.submit()}
        >
          {t('savePreferences')}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesSettings;