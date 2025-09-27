import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Select, Alert, Steps } from 'antd';
import { 
  MailOutlined, 
  UserOutlined, 
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  TeamOutlined 
} from '@ant-design/icons';
import api from '../services/api';

const { Option } = Select;
const { Step } = Steps;

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const steps = [
    { title: t('personalInfo'), icon: <UserOutlined /> },
    { title: t('accountDetails'), icon: <TeamOutlined /> },
    { title: t('security'), icon: <LockOutlined /> }
  ];

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', {
        email: values.email,
        full_name: values.full_name,
        role: values.role,
        password: values.password
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t('registerError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields(steps[currentStep].fields as any[])
      .then(() => setCurrentStep(currentStep + 1))
      .catch(() => {});
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validatePassword = (_: any, value: string) => {
    if (!value) return Promise.reject(new Error(t('passwordRequired')));
    if (value.length < 8) return Promise.reject(new Error(t('passwordMinLength')));
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(new Error(t('passwordComplexity')));
    }
    return Promise.resolve();
  };

  return (
    <div className="register-form">
      <Steps current={currentStep} className="register-steps">
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>

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
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        {currentStep === 0 && (
          <>
            <Form.Item
              name="email"
              label={t('email')}
              rules={[
                { required: true, message: t('emailRequired') },
                { type: 'email', message: t('invalidEmailFormat') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="full_name"
              label={t('fullName')}
              rules={[{ required: true, message: t('fullNameRequired') }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('enterFullName')}
                autoComplete="name"
              />
            </Form.Item>
          </>
        )}

        {currentStep === 1 && (
          <Form.Item
            name="role"
            label={t('role')}
            rules={[{ required: true, message: t('roleRequired') }]}
          >
            <Select placeholder={t('selectRole')}>
              <Option value="lawyer">{t('lawyer')}</Option>
              <Option value="assistant">{t('assistant')}</Option>
              <Option value="paralegal">{t('paralegal')}</Option>
              <Option value="accountant">{t('accountant')}</Option>
              <Option value="viewer">{t('viewer')}</Option>
            </Select>
          </Form.Item>
        )}

        {currentStep === 2 && (
          <>
            <Form.Item
              name="password"
              label={t('password')}
              rules={[{ validator: validatePassword }]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('enterPassword')}
                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('confirmPassword')}
              dependencies={['password']}
              rules={[
                { required: true, message: t('confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('passwordsDoNotMatch')));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('confirmPassword')}
                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
              />
            </Form.Item>
          </>
        )}

        <div className="form-actions">
          {currentStep > 0 && (
            <Button onClick={prevStep} className="prev-btn">
              {t('previous')}
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={nextStep} className="next-btn">
              {t('next')}
            </Button>
          ) : (
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="submit-btn"
            >
              {t('completeRegistration')}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;