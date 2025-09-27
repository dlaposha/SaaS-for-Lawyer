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
  message
} from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../services/api';

interface Client {
  id: string;
  type: string;
  name: string;
  edrpou: string;
  drfo: string;
  emails: string[];
  phones: string[];
  address: string;
  kyc_status: string;
}

const { Option } = Select;

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      message.error(t('errorFetchingClients'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOk = async () => {
    try {
      await form.validateFields();
      // Тут буде логіка створення клієнта
      message.success(t('clientCreated'));
      setIsModalVisible(false);
      form.resetFields();
      fetchClients();
    } catch (error) {
      message.error(t('errorCreatingClient'));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('clients')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t('addClient')}
        </Button>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={clients}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<TeamOutlined />} />}
              title={<span>{item.name}</span>}
              description={
                <Space direction="vertical">
                  <div>
                    {t('type')}: <Tag>{t(item.type)}</Tag>
                  </div>
                  <div>
                    {t('kycStatus')}: <Tag>{t(item.kyc_status)}</Tag>
                  </div>
                  <div>
                    {t('email')}: {item.emails?.join(', ') || t('noEmails')}
                  </div>
                  <div>
                    {t('phone')}: {item.phones?.join(', ') || t('noPhones')}
                  </div>
                </Space>
              }
            />
            <Space size="middle">
              <Button type="link" onClick={() => console.log(`Edit client ${item.id}`)}>
                {t('edit')}
              </Button>
              <Button type="link" onClick={() => console.log(`View client ${item.id}`)}>
                {t('view')}
              </Button>
            </Space>
          </List.Item>
        )}
      />

      {/* Модальне вікно для створення клієнта */}
      <Modal
        title={t('createClient')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('create')}
        cancelText={t('cancel')}
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
            <Select mode="tags" placeholder={t('enterEmails')} />
          </Form.Item>
          <Form.Item
            name="phones"
            label={t('phones')}
          >
            <Select mode="tags" placeholder={t('enterPhones')} />
          </Form.Item>
          <Form.Item
            name="address"
            label={t('address')}
          >
            <Input.TextArea placeholder={t('address')} />
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
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;