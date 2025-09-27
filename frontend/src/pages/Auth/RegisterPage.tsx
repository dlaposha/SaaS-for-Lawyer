import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { useAuth } from '../../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();

  const onFinish = (values: any) => {
    register(values.email, values.password);
  };

  return (
    <div className="register-page">
      <h2>{t('register')}</h2>
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
          <Button type="primary" htmlType="submit" className="register-form-button">
            {t('register')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;