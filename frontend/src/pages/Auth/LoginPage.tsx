import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = (values: any) => {
    // Демо-авторизація
    const demoToken = 'demo-token';
    const demoUser = {
      full_name: 'Дмитро Лапоші',
      role: 'lawyer',
      email: values.email,
      firstName: 'Дмитро',
      lastName: 'Лапоші'
    };

    login(demoToken, demoUser);
    navigate('/dashboard'); // ← це важливо!
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Вхід</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Увійти</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;