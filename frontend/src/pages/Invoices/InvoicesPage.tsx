import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import api from '../services/api';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: string;
  due_date: string;
}

const { Option } = Select;

const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      message.error(t('errorFetchingInvoices'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const columns: ColumnsType<Invoice> = [
    {
      title: t('number'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: t('client'),
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span>{amount.toLocaleString()} ₴</span>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'paid') color = 'green';
        if (status === 'overdue') color = 'red';
        if (status === 'draft') color = 'gray';
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t('dueDate'),
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => console.log(`Edit invoice ${record.id}`)}>
            {t('edit')}
          </Button>
          <Button type="link" onClick={() => console.log(`View invoice ${record.id}`)}>
            {t('view')}
          </Button>
        </Space>
      ),
    },
  ];

  const handleOk = async () => {
    try {
      await form.validateFields();
      // Тут буде логіка створення рахунку
      message.success(t('invoiceCreated'));
      setIsModalVisible(false);
      form.resetFields();
      fetchInvoices();
    } catch (error) {
      message.error(t('errorCreatingInvoice'));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('invoices')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t('createInvoice')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={invoices}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Модальне вікно для створення рахунку */}
      <Modal
        title={t('createInvoice')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('create')}
        cancelText={t('cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="number"
            label={t('invoiceNumber')}
            rules={[{ required: true, message: t('invoiceNumberRequired') }]}
          >
            <Input placeholder={t('invoiceNumber')} />
          </Form.Item>
          <Form.Item
            name="client"
            label={t('client')}
            rules={[{ required: true, message: t('clientRequired') }]}
          >
            <Select placeholder={t('selectClient')}>
              <Option value="client1">Петренко Іван</Option>
              <Option value="client2">ТОВ "ЮрФірма"</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label={t('amount')}
            rules={[{ required: true, message: t('amountRequired') }]}
          >
            <Input placeholder={t('amount')} type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label={t('status')}
          >
            <Select placeholder={t('selectStatus')}>
              <Option value="draft">{t('draft')}</Option>
              <Option value="sent">{t('sent')}</Option>
              <Option value="paid">{t('paid')}</Option>
              <Option value="overdue">{t('overdue')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="due_date"
            label={t('dueDate')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoicesPage;