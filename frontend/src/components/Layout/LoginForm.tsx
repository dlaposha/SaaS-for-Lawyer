import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Alert, Divider, Row, Col } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone,
  GoogleOutlined,
  FacebookOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/token', {
        username: values.email,
        password: values.password,
      });
      
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      message.success(t('loginSuccess'));
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard', { replace: true });
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t('loginError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    const demoAccounts = {
      admin: { email: 'admin@demo.com', password: 'demo123' },
      lawyer: { email: 'lawyer@demo.com', password: 'demo123' },
      assistant: { email: 'assistant@demo.com', password: 'demo123' }
    };
    
    const account = demoAccounts[role as keyof typeof demoAccounts];
    if (account) onFinish(account);
  };

  return (
    <div className="login-form">
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          className="form-alert"
        />
      )}

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={t('email')}
          rules={[
            { required: true, message: t('emailRequired') },
            { type: 'email', message: t('invalidEmailFormat') }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="email@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('password')}
          rules={[{ required: true, message: t('passwordRequired') }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('enterPassword')}
            iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="login-btn"
          >
            {loading ? t('loggingIn') : t('login')}
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>{t('or')}</Divider>

      <Row gutter={16} className="demo-buttons">
        <Col span={8}>
          <Button 
            block 
            onClick={() => handleDemoLogin('admin')}
            className="demo-btn admin-demo"
          >
            Admin
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            block 
            onClick={() => handleDemoLogin('lawyer')}
            className="demo-btn lawyer-demo"
          >
            Lawyer
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            block 
            onClick={() => handleDemoLogin('assistant')}
            className="demo-btn assistant-demo"
          >
            Assistant
          </Button>
        </Col>
      </Row>

      <div className="social-login">
        <Button block icon={<GoogleOutlined />} className="social-btn google-btn">
          {t('continueWithGoogle')}
        </Button>
        <Button block icon={<FacebookOutlined />} className="social-btn facebook-btn">
          {t('continueWithFacebook')}
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;