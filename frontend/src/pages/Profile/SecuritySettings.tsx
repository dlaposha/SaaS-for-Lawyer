import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  List, 
  Tag, 
  Space, 
  Modal, 
  message,
  Divider,
  Alert
} from 'antd';
import { 
  LockOutlined, 
  SafetyOutlined, 
  HistoryOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';

const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();

  const securityData = {
    two_factor_auth: false,
    session_timeout: 60,
    login_alerts: true
  };

  const loginSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Київ, Україна',
      ip: '192.168.1.1',
      last_active: '2024-01-20 14:30:00',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Київ, Україна',
      ip: '192.168.1.2',
      last_active: '2024-01-19 10:15:00',
      current: false
    }
  ];

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsPasswordModalVisible(false);
      form.resetFields();
      message.success(t('passwordChanged'));
    } catch (error) {
      message.error(t('errorChangingPassword'));
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    message.success(t('sessionTerminated'));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Зміна пароля */}
      <Card title={t('changePassword')}>
        <Button 
          type="primary" 
          icon={<LockOutlined />}
          onClick={() => setIsPasswordModalVisible(true)}
        >
          {t('changePassword')}
        </Button>
      </Card>

      {/* Налаштування безпеки */}
      <Card title={t('securitySettings')}>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('twoFactorAuth')}</div>
              <div className="text-gray-600 text-sm">{t('twoFactorAuthDescription')}</div>
            </div>
            <Switch checked={securityData.two_factor_auth} />
          </div>
          
          <Divider className="my-4" />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{t('loginAlerts')}</div>
              <div className="text-gray-600 text-sm">{t('loginAlertsDescription')}</div>
            </div>
            <Switch checked={securityData.login_alerts} />
          </div>
        </Space>
      </Card>

      {/* Активні сесії */}
      <Card title={t('activeSessions')}>
        <List
          dataSource={loginSessions}
          renderItem={session => (
            <List.Item
              actions={[
                session.current ? (
                  <Tag color="green" icon={<CheckOutlined />}>
                    {t('current')}
                  </Tag>
                ) : (
                  <Button 
                    size="small" 
                    danger
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    {t('terminate')}
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={<SafetyOutlined />}
                title={session.device}
                description={
                  <Space direction="vertical" size={0}>
                    <span>{session.location}</span>
                    <span className="text-gray-500 text-sm">
                      {t('lastActive')}: {session.last_active}
                    </span>
                    <span className="text-gray-500 text-sm">IP: {session.ip}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Модальне вікно зміни пароля */}
      <Modal
        title={t('changePassword')}
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="current_password"
            label={t('currentPassword')}
            rules={[{ required: true, message: t('currentPasswordRequired') }]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="new_password"
            label={t('newPassword')}
            rules={[
              { required: true, message: t('newPasswordRequired') },
              { min: 8, message: t('passwordMinLength') }
            ]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="confirm_password"
            label={t('confirmPassword')}
            dependencies={['new_password']}
            rules={[
              { required: true, message: t('confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwordsDoNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('changePassword')}
              </Button>
              <Button onClick={() => {
                setIsPasswordModalVisible(false);
                form.resetFields();
              }}>
                {t('cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SecuritySettings;