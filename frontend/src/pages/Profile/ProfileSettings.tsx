import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
  Space, 
  message,
  Row,
  Col,
  Card
} from 'antd';
import { 
  UserOutlined, 
  CameraOutlined,
  SaveOutlined 
} from '@ant-design/icons';

const ProfileSettings: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const userData = {
    full_name: 'Дмитро Лапоша',
    email: 'dmitro@lawyer-crm.com',
    phone: '+380501234567',
    position: 'Адвокат',
    bio: 'Спеціалізуюсь на цивільних та кримінальних справах'
  };

  const handleSaveProfile = async (values: any) => {
    setLoading(true);
    try {
      // Тут буде API запит
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(t('profileUpdated'));
    } catch (error) {
      message.error(t('errorUpdatingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      const url = URL.createObjectURL(info.file.originFileObj);
      setAvatarUrl(url);
      message.success(t('avatarUpdated'));
    }
  };

  return (
    <div className="max-w-4xl">
      <Row gutter={24}>
        <Col span={8}>
          <Card title={t('profilePicture')}>
            <div className="text-center">
              <Avatar
                size={120}
                src={avatarUrl}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <Upload
                showUploadList={false}
                onChange={handleAvatarChange}
                beforeUpload={() => false}
              >
                <Button icon={<CameraOutlined />}>
                  {t('changeAvatar')}
                </Button>
              </Upload>
              <p className="text-gray-500 text-sm mt-2">
                {t('avatarRecommendations')}
              </p>
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title={t('personalInformation')}>
            <Form
              form={form}
              layout="vertical"
              initialValues={userData}
              onFinish={handleSaveProfile}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="full_name"
                    label={t('fullName')}
                    rules={[{ required: true, message: t('fullNameRequired') }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={t('email')}
                    rules={[
                      { required: true, message: t('emailRequired') },
                      { type: 'email', message: t('invalidEmailFormat') }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label={t('phone')}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="position"
                    label={t('position')}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="bio"
                label={t('bio')}
              >
                <Input.TextArea rows={4} placeholder={t('tellAboutYourself')} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  {t('saveChanges')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileSettings;