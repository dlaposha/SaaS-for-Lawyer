import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Button, 
  Switch, 
  List, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message,
  Divider,
  Typography,
  Alert
} from 'antd';
import { 
  LinkOutlined, 
  CheckOutlined, 
  CloseOutlined,
  SettingOutlined,
  DisconnectOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  is_connected: boolean;
  api_key?: string;
  webhook_url?: string;
  last_sync?: string;
}

const IntegrationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [form] = Form.useForm();

  const demoIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Google Calendar',
      description: 'Синхронізація засідань та подій',
      category: 'calendar',
      is_connected: true,
      last_sync: '2024-01-20 14:30:00'
    },
    {
      id: '2',
      name: 'Microsoft Office 365',
      description: 'Інтеграція з Word, Excel та Outlook',
      category: 'office',
      is_connected: false
    },
    {
      id: '3',
      name: 'Dropbox',
      description: 'Зберігання та синхронізація документів',
      category: 'storage',
      is_connected: true,
      last_sync: '2024-01-20 12:15:00'
    },
    {
      id: '4',
      name: 'Slack',
      description: 'Сповіщення та комунікація',
      category: 'communication',
      is_connected: false
    },
    {
      id: '5',
      name: 'Zoom',
      description: 'Відеоконференції та зустрічі',
      category: 'video',
      is_connected: true
    },
    {
      id: '6',
      name: 'E-signature',
      description: 'Електронний підпис документів',
      category: 'documents',
      is_connected: false
    }
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      setIntegrations(demoIntegrations);
    } catch (error) {
      message.error(t('errorFetchingIntegrations'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      setIntegrations(prev => 
        prev.map(item => 
          item.id === integration.id 
            ? { ...item, is_connected: !item.is_connected }
            : item
        )
      );
      
      message.success(
        integration.is_connected 
          ? t('integrationDisconnected') 
          : t('integrationConnected')
      );
    } catch (error) {
      message.error(t('errorTogglingIntegration'));
    }
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    form.setFieldsValue({
      api_key: integration.api_key || '',
      webhook_url: integration.webhook_url || ''
    });
    setIsConfigModalVisible(true);
  };

  const handleSaveConfiguration = async (values: any) => {
    try {
      if (selectedIntegration) {
        setIntegrations(prev => 
          prev.map(item => 
            item.id === selectedIntegration.id 
              ? { ...item, ...values }
              : item
          )
        );
        setIsConfigModalVisible(false);
        setSelectedIntegration(null);
        form.resetFields();
        message.success(t('configurationSaved'));
      }
    } catch (error) {
      message.error(t('errorSavingConfiguration'));
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      calendar: 'blue',
      office: 'green',
      storage: 'orange',
      communication: 'purple',
      video: 'red',
      documents: 'cyan'
    };
    return colors[category] || 'default';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('integrations')}</h2>
          <Text type="secondary">{t('integrationsDescription')}</Text>
        </div>
      </div>

      <Alert
        message={t('integrationsWarning')}
        type="info"
        showIcon
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <Card
            key={integration.id}
            loading={loading}
            actions={[
              <Switch
                key="toggle"
                checked={integration.is_connected}
                onChange={() => handleToggleIntegration(integration)}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
              />,
              <Button
                key="configure"
                type="link"
                icon={<SettingOutlined />}
                onClick={() => handleConfigure(integration)}
                disabled={!integration.is_connected}
              >
                {t('configure')}
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<LinkOutlined className="text-2xl" />}
              title={
                <Space>
                  {integration.name}
                  <Tag color={getCategoryColor(integration.category)}>
                    {t(integration.category)}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <Text>{integration.description}</Text>
                  {integration.is_connected && integration.last_sync && (
                    <div className="mt-2">
                      <Text type="secondary" className="text-xs">
                        {t('lastSync')}: {integration.last_sync}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        ))}
      </div>

      {/* Модальне вікно конфігурації */}
      <Modal
        title={`${t('configure')} ${selectedIntegration?.name}`}
        open={isConfigModalVisible}
        onCancel={() => {
          setIsConfigModalVisible(false);
          setSelectedIntegration(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveConfiguration}
        >
          <Form.Item
            name="api_key"
            label={t('apiKey')}
          >
            <Input.Password placeholder={t('enterApiKey')} />
          </Form.Item>
          
          <Form.Item
            name="webhook_url"
            label={t('webhookUrl')}
          >
            <Input placeholder={t('enterWebhookUrl')} />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {t('save')}
              </Button>
              <Button onClick={() => {
                setIsConfigModalVisible(false);
                setSelectedIntegration(null);
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

export default IntegrationsPage;