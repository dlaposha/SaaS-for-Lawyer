import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();

  const onFinish = (values: any) => {
    login(values.email, values.password);
  };

  return (
    <div className="login-page">
      <h2>{t('login')}</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: t('emailRequired') }]}
        >
          <Input placeholder={t('email')} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: t('passwordRequired') }]}
        >
          <Input.Password placeholder={t('password')} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            {t('login')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;