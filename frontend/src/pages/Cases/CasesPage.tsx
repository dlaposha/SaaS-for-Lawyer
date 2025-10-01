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
import { demoApi } from "../../services/api";

interface Case {
  id: string;
  number: string;
  title: string;
  client: string;
  status: string;
  stage: string;
  due_date: string;
  hourly_rate: number;
  budget: number;
}

const { Option } = Select;

const CasesPage: React.FC = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cases');
      setCases(response.data);
    } catch (error) {
      message.error(t('errorFetchingCases'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const columns: ColumnsType<Case> = [
    {
      title: t('number'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('client'),
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'closed') color = 'green';
        if (status === 'on_hold') color = 'orange';
        if (status === 'archived') color = 'gray';
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t('stage'),
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: t('dueDate'),
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => console.log(`Edit case ${record.id}`)}>
            {t('edit')}
          </Button>
          <Button type="link" onClick={() => console.log(`View case ${record.id}`)}>
            {t('view')}
          </Button>
        </Space>
      ),
    },
  ];

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Логіка створення справи
      await api.post('/cases', values);
      message.success(t('caseCreated'));
      setIsModalVisible(false);
      form.resetFields();
      fetchCases();
    } catch (error) {
      message.error(t('errorCreatingCase'));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('cases')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          {t('addCase')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cases}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t('createCase')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('create')}
        cancelText={t('cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="number"
            label={t('caseNumber')}
            rules={[{ required: true, message: t('caseNumberRequired') }]}
          >
            <Input placeholder={t('caseNumber')} />
          </Form.Item>
          <Form.Item
            name="title"
            label={t('caseTitle')}
            rules={[{ required: true, message: t('caseTitleRequired') }]}
          >
            <Input placeholder={t('caseTitle')} />
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
            name="status"
            label={t('status')}
          >
            <Select placeholder={t('selectStatus')}>
              <Option value="pending">{t('pending')}</Option>
              <Option value="in_progress">{t('in_progress')}</Option>
              <Option value="completed">{t('completed')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="stage"
            label={t('stage')}
          >
            <Select placeholder={t('selectStage')}>
              <Option value="pending">{t('pending')}</Option>
              <Option value="in_progress">{t('in_progress')}</Option>
              <Option value="completed">{t('completed')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="due_date"
            label={t('dueDate')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="hourly_rate"
            label={t('hourlyRate')}
          >
            <Input placeholder={t('hourlyRate')} type="number" />
          </Form.Item>
          <Form.Item
            name="budget"
            label={t('budget')}
          >
            <Input placeholder={t('budget')} type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CasesPage;