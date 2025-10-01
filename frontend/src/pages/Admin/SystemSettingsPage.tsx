import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Switch, 
  Button, 
  Select, 
  Divider, 
  message, 
  Row, 
  Col,
  InputNumber,
  Upload,
  Tag,
  Space,
  List,
  Typography
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  UploadOutlined,
  GlobalOutlined,
  NotificationOutlined,
  SecurityScanOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface SystemSettings {
  general: {
    company_name: string;
    timezone: string;
    date_format: string;
    language: string;
    currency: string;
  };
  notifications: {
    email_notifications: boolean;
    push_notifications: boolean;
    case_updates: boolean;
    hearing_reminders: boolean;
    invoice_due: boolean;
  };
  security: {
    two_factor_auth: boolean;
    session_timeout: number;
    password_policy: string;
    login_attempts: number;
  };
  backup: {
    auto_backup: boolean;
    backup_frequency: string;
    backup_retention: number;
    last_backup: string;
  };
}

const SystemSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Демо-налаштування
  const defaultSettings: SystemSettings = {
    general: {
      company_name: 'Адвокатська фірма Дмитра Лапоші',
      timezone: 'Europe/Kiev',
      date_format: 'dd.MM.yyyy',
      language: 'uk',
      currency: 'UAH'
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      case_updates: true,
      hearing_reminders: true,
      invoice_due: true
    },
    security: {
      two_factor_auth: false,
      session_timeout: 60,
      password_policy: 'strong',
      login_attempts: 5
    },
    backup: {
      auto_backup: true,
      backup_frequency: 'daily',
      backup_retention: 30,
      last_backup: '2024-01-20 03:00:00'
    }
  };

  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Тимчасово використовуємо демо-дані
      setTimeout(() => {
        setSettings(defaultSettings);
        form.setFieldsValue(defaultSettings);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error(t('errorFetchingSettings'));
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values: any) => {
    setSaving(true);
    try {
      // Тимчасово зберігаємо в стані
      setSettings(values);
      
      // Оновлюємо мову, якщо вона змінилася
      if (values.general.language !== i18n.language) {
        await i18n.changeLanguage(values.general.language);
      }
      
      message.success(t('settingsSaved'));
    } catch (error) {
      message.error(t('errorSavingSettings'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    form.setFieldsValue(defaultSettings);
    message.info(t('settingsReset'));
  };

  const handleBackupNow = async () => {
    try {
      // Імітація створення бекапу
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSettings(prev => ({
        ...prev,
        backup: {
          ...prev.backup,
          last_backup: new Date().toLocaleString()
        }
      }));
      
      message.success(t('backupCreated'));
    } catch (error) {
      message.error(t('errorCreatingBackup'));
    } finally {
      setSaving(false);
    }
  };

  const systemInfo = [
    { label: t('version'), value: '1.0.0' },
    { label: t('lastUpdate'), value: '2024-01-20' },
    { label: t('databaseSize'), value: '45.2 MB' },
    { label: t('activeUsers'), value: '6' },
    { label: t('totalCases'), value: '24' },
    { label: t('serverTime'), value: new Date().toLocaleString() }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('systemSettings')}</h2>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleResetSettings}
            disabled={saving}
          >
            {t('reset')}
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            loading={saving}
            onClick={() => form.submit()}
          >
            {t('saveSettings')}
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        initialValues={defaultSettings}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основна колонка з налаштуваннями */}
          <div className="lg:col-span-2 space-y-6">
            {/* Загальні налаштування */}
            <Card 
              title={
                <Space>
                  <GlobalOutlined />
                  <span>{t('generalSettings')}</span>
                </Space>
              }
              loading={loading}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['general', 'company_name']}
                    label={t('companyName')}
                    rules={[{ required: true, message: t('companyNameRequired') }]}
                  >
                    <Input placeholder={t('enterCompanyName')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['general', 'timezone']}
                    label={t('timezone')}
                  >
                    <Select>
                      <Option value="Europe/Kiev">Kyiv (UTC+2)</Option>
                      <Option value="Europe/London">London (UTC+0)</Option>
                      <Option value="America/New_York">New York (UTC-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['general', 'language']}
                    label={t('language')}
                  >
                    <Select>
                      <Option value="uk">Українська</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['general', 'currency']}
                    label={t('currency')}
                  >
                    <Select>
                      <Option value="UAH">UAH (₴)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Налаштування сповіщень */}
            <Card 
              title={
                <Space>
                  <NotificationOutlined />
                  <span>{t('notificationSettings')}</span>
                </Space>
              }
              loading={loading}
            >
              <Form.Item
                name={['notifications', 'email_notifications']}
                valuePropName="checked"
                label={t('emailNotifications')}
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name={['notifications', 'push_notifications']}
                valuePropName="checked"
                label={t('pushNotifications')}
              >
                <Switch />
              </Form.Item>
              
              <Divider orientation="left" plain>{t('notificationTypes')}</Divider>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name={['notifications', 'case_updates']}
                    valuePropName="checked"
                    label={t('caseUpdates')}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={['notifications', 'hearing_reminders']}
                    valuePropName="checked"
                    label={t('hearingReminders')}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={['notifications', 'invoice_due']}
                    valuePropName="checked"
                    label={t('invoiceDue')}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Налаштування безпеки */}
            <Card 
              title={
                <Space>
                  <SecurityScanOutlined />
                  <span>{t('securitySettings')}</span>
                </Space>
              }
              loading={loading}
            >
              <Form.Item
                name={['security', 'two_factor_auth']}
                valuePropName="checked"
                label={t('twoFactorAuth')}
              >
                <Switch />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['security', 'session_timeout']}
                    label={t('sessionTimeout')}
                  >
                    <InputNumber 
                      min={5} 
                      max={480} 
                      addonAfter={t('minutes')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['security', 'login_attempts']}
                    label={t('loginAttempts')}
                  >
                    <InputNumber min={1} max={10} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name={['security', 'password_policy']}
                label={t('passwordPolicy')}
              >
                <Select>
                  <Option value="weak">{t('weak')}</Option>
                  <Option value="medium">{t('medium')}</Option>
                  <Option value="strong">{t('strong')}</Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Налаштування резервного копіювання */}
            <Card 
              title={
                <Space>
                  <DatabaseOutlined />
                  <span>{t('backupSettings')}</span>
                </Space>
              }
              loading={loading}
            >
              <Form.Item
                name={['backup', 'auto_backup']}
                valuePropName="checked"
                label={t('autoBackup')}
              >
                <Switch />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['backup', 'backup_frequency']}
                    label={t('backupFrequency')}
                  >
                    <Select>
                      <Option value="hourly">{t('hourly')}</Option>
                      <Option value="daily">{t('daily')}</Option>
                      <Option value="weekly">{t('weekly')}</Option>
                      <Option value="monthly">{t('monthly')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['backup', 'backup_retention']}
                    label={t('backupRetention')}
                  >
                    <InputNumber 
                      min={1} 
                      max={365} 
                      addonAfter={t('days')}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Space>
                <Text type="secondary">
                  {t('lastBackup')}: {settings.backup.last_backup}
                </Text>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={handleBackupNow}
                  loading={saving}
                >
                  {t('backupNow')}
                </Button>
              </Space>
            </Card>
          </div>

          {/* Бічна колонка з інформацією */}
          <div className="space-y-6">
            {/* Інформація про систему */}
            <Card title={t('systemInfo')}>
              <List
                dataSource={systemInfo}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text type="secondary">{item.label}</Text>}
                      description={<Text strong>{item.value}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Статус системи */}
            <Card title={t('systemStatus')}>
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text>{t('database')}</Text>
                  <Tag color="green">{t('online')}</Tag>
                </div>
                <div className="flex justify-between">
                  <Text>{t('api')}</Text>
                  <Tag color="green">{t('online')}</Tag>
                </div>
                <div className="flex justify-between">
                  <Text>{t('storage')}</Text>
                  <Tag color="orange">65%</Tag>
                </div>
                <div className="flex justify-between">
                  <Text>{t('memory')}</Text>
                  <Tag color="blue">42%</Tag>
                </div>
              </Space>
            </Card>

            {/* Швидкі дії */}
            <Card title={t('quickActions')}>
              <Space direction="vertical" className="w-full">
                <Button block icon={<ReloadOutlined />}>
                  {t('clearCache')}
                </Button>
                <Button block icon={<DatabaseOutlined />}>
                  {t('optimizeDatabase')}
                </Button>
                <Button block icon={<SecurityScanOutlined />}>
                  {t('securityScan')}
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SystemSettingsPage;