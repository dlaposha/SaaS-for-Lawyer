import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  List,
  Avatar,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  App,
  Card
} from 'antd';
import { PlusOutlined, TeamOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { demoApi } from "../../services/api";

interface Client {
  id: string;
  type: string;
  name: string;
  edrpou?: string;
  drfo?: string;
  emails: string[];
  phones: string[];
  address?: string;
  kyc_status: string;
  notes?: string;
}

const { Option } = Select;
const { useApp } = App;

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const { message: appMessage, modal: appModal } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await demoApi.getClients();
      setClients(response.data);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        const demoResponse = await demoApi.getClients();
        setClients(demoResponse.data);
        appMessage.info(t('demoMode'));
      } else {
        appMessage.error(t('errorFetchingClients'));
      }
    } finally {
      setLoading(false);
    }
  }, [t, appMessage]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getKycStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'verified': 'green',
      'pending': 'orange',
      'unknown': 'blue',
      'rejected': 'red'
    };
    return statusColors[status] || 'blue';
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Використовуємо demoApi для створення клієнта
      await demoApi.getClients(); // Імітуємо успішне створення
      
      appMessage.success(t('clientCreated'));
      setIsModalOpen(false);
      form.resetFields();
      fetchClients();
    } catch (error: any) {
      if (error.errorFields) {
        appMessage.error(t('pleaseFillRequiredFields'));
      } else {
        appMessage.error(t('errorCreatingClient'));
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleEditClient = (client: Client) => {
    appMessage.info(`Редагування клієнта: ${client.name}`);
  };

  const handleViewClient = (client: Client) => {
    appMessage.info(`Перегляд клієнта: ${client.name}`);
  };

  return (
    <div className="clients-page">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold m-0">{t('clients')}</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            {t('addClient')}
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={clients}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  key="edit" 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => handleEditClient(item)}
                >
                  {t('edit')}
                </Button>,
                <Button 
                  key="view" 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => handleViewClient(item)}
                >
                  {t('view')}
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<TeamOutlined />} />}
                title={<span className="font-semibold">{item.name}</span>}
                description={
                  <Space direction="vertical" size="small">
                    <div>
                      {t('type')}: <Tag>{t(item.type)}</Tag>
                      {t('kycStatus')}: <Tag color={getKycStatusColor(item.kyc_status)}>
                        {t(item.kyc_status)}
                      </Tag>
                    </div>
                    <div>
                      {t('email')}: {item.emails?.join(', ') || t('noEmails')}
                    </div>
                    <div>
                      {t('phone')}: {item.phones?.join(', ') || t('noPhones')}
                    </div>
                    {item.address && (
                      <div>
                        {t('address')}: {item.address}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={t('createClient')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('create')}
        cancelText={t('cancel')}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label={t('clientType')}
            rules={[{ required: true, message: t('clientTypeRequired') }]}
          >
            <Select placeholder={t('selectType')}>
              <Option value="person">{t('person')}</Option>
              <Option value="company">{t('company')}</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="name"
            label={t('fullName')}
            rules={[{ required: true, message: t('fullNameRequired') }]}
          >
            <Input placeholder={t('fullName')} />
          </Form.Item>
          
          <Form.Item
            name="edrpou"
            label={t('edrpou')}
          >
            <Input placeholder={t('edrpou')} />
          </Form.Item>
          
          <Form.Item
            name="drfo"
            label={t('drfo')}
          >
            <Input placeholder={t('drfo')} />
          </Form.Item>
          
          <Form.Item
            name="emails"
            label={t('emails')}
          >
            <Select 
              mode="tags" 
              placeholder={t('enterEmails')}
              tokenSeparators={[',', ';']}
            />
          </Form.Item>
          
          <Form.Item
            name="phones"
            label={t('phones')}
          >
            <Select 
              mode="tags" 
              placeholder={t('enterPhones')}
              tokenSeparators={[',', ';']}
            />
          </Form.Item>
          
          <Form.Item
            name="address"
            label={t('address')}
          >
            <Input.TextArea 
              placeholder={t('address')} 
              rows={2}
            />
          </Form.Item>
          
          <Form.Item
            name="kyc_status"
            label={t('kycStatus')}
          >
            <Select placeholder={t('selectKYCStatus')}>
              <Option value="unknown">{t('unknown')}</Option>
              <Option value="pending">{t('pending')}</Option>
              <Option value="verified">{t('verified')}</Option>
              <Option value="rejected">{t('rejected')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label={t('description')}
          >
            <Input.TextArea 
              placeholder={t('description')}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;