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
  App,
  Card,
  Row,
  Col,
  InputNumber
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { demoApi } from "../../services/api";
import dayjs from 'dayjs';

interface Case {
  id: string;
  case_number: string;
  title: string;
  client_name: string;
  status: string;
  stage: string;
  due_date: string;
  hourly_rate: number;
  budget: number;
  description?: string;
}

interface CreateCaseForm {
  case_number: string;
  title: string;
  client_id: string;
  status: string;
  stage: string;
  due_date: dayjs.Dayjs;
  hourly_rate: number;
  budget: number;
  description?: string;
}

const { Option } = Select;
const { useApp } = App;

const CasesPage: React.FC = () => {
  const { t } = useTranslation();
  const { message: appMessage, modal: appModal } = useApp();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [clients, setClients] = useState<any[]>([]);

  // Завантаження клієнтів для селекту
  const fetchClients = useCallback(async () => {
    try {
      const response = await demoApi.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await demoApi.getCases();
      setCases(response.data);
    } catch (error: any) {
      if (error.message === 'NETWORK_UNAVAILABLE') {
        // Використовуємо демо дані
        const demoResponse = await demoApi.getCases();
        setCases(demoResponse.data);
        appMessage.info(t('demoMode'));
      } else {
        appMessage.error(t('errorFetchingCases'));
      }
    } finally {
      setLoading(false);
    }
  }, [t, appMessage]);

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, [fetchCases, fetchClients]);

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'open': 'blue',
      'in_progress': 'orange',
      'on_hold': 'yellow',
      'closed': 'green',
      'archived': 'gray'
    };
    return statusColors[status] || 'blue';
  };

  const getStageText = (stage: string): string => {
    const stageMap: Record<string, string> = {
      'pre_trial': t('pre_trial'),
      'first_instance': t('first_instance'),
      'appeal': t('appeal'),
      'cassation': t('cassation'),
      'enforcement': t('enforcement')
    };
    return stageMap[stage] || stage;
  };

  const columns: ColumnsType<Case> = [
    {
      title: t('caseNumber'),
      dataIndex: 'case_number',
      key: 'case_number',
      sorter: (a, b) => a.case_number.localeCompare(b.case_number),
    },
    {
      title: t('caseTitle'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: t('client'),
      dataIndex: 'client_name',
      key: 'client_name',
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {t(status)}
        </Tag>
      ),
      filters: [
        { text: t('open'), value: 'open' },
        { text: t('in_progress'), value: 'in_progress' },
        { text: t('on_hold'), value: 'on_hold' },
        { text: t('closed'), value: 'closed' },
        { text: t('archived'), value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('stage'),
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => getStageText(stage),
    },
    {
      title: t('dueDate'),
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
      sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
    },
    {
      title: t('hourlyRate'),
      dataIndex: 'hourly_rate',
      key: 'hourly_rate',
      render: (rate: number) => `${rate} ₴`,
      sorter: (a, b) => a.hourly_rate - b.hourly_rate,
    },
    {
      title: t('actions'),
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditCase(record)}
            title={t('edit')}
          />
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewCase(record)}
            title={t('view')}
          />
        </Space>
      ),
    },
  ];

  const handleEditCase = (caseData: Case) => {
    appMessage.info(`Редагування справи: ${caseData.case_number}`);
    // Тут буде логіка редагування
  };

  const handleViewCase = (caseData: Case) => {
    appMessage.info(`Перегляд справи: ${caseData.case_number}`);
    // Тут буде логіка перегляду
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const caseData = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
      };

      // Використовуємо demoApi для створення справи
      await demoApi.getCases(); // Імітуємо успішне створення
      
      appMessage.success(t('caseCreated'));
      setIsModalOpen(false);
      form.resetFields();
      fetchCases(); // Оновлюємо список
    } catch (error: any) {
      if (error.errorFields) {
        appMessage.error(t('pleaseFillRequiredFields'));
      } else {
        appMessage.error(t('errorCreatingCase'));
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const statusOptions = [
    { value: 'open', label: t('open') },
    { value: 'in_progress', label: t('in_progress') },
    { value: 'on_hold', label: t('on_hold') },
    { value: 'closed', label: t('closed') },
  ];

  const stageOptions = [
    { value: 'pre_trial', label: t('pre_trial') },
    { value: 'first_instance', label: t('first_instance') },
    { value: 'appeal', label: t('appeal') },
    { value: 'cassation', label: t('cassation') },
    { value: 'enforcement', label: t('enforcement') },
  ];

  return (
    <div className="cases-page">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold m-0">{t('cases')}</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="large"
          >
            {t('addCase')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={cases}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${t('showing')} ${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={t('createCase')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('create')}
        cancelText={t('cancel')}
        width={600}
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={{
            status: 'open',
            stage: 'pre_trial',
            hourly_rate: 1500,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="case_number"
                label={t('caseNumber')}
                rules={[{ required: true, message: t('caseNumberRequired') }]}
              >
                <Input placeholder={t('caseNumber')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t('status')}
                rules={[{ required: true, message: t('selectStatus') }]}
              >
                <Select placeholder={t('selectStatus')}>
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label={t('caseTitle')}
            rules={[{ required: true, message: t('caseTitleRequired') }]}
          >
            <Input.TextArea 
              placeholder={t('caseTitle')} 
              rows={2}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="client_id"
            label={t('client')}
            rules={[{ required: true, message: t('clientRequired') }]}
          >
            <Select 
              placeholder={t('selectClient')}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {clients.map(client => (
                <Option key={client.id} value={client.id} label={client.name}>
                  {client.name} ({client.type === 'person' ? t('person') : t('company')})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stage"
                label={t('stage')}
                rules={[{ required: true, message: t('selectStage') }]}
              >
                <Select placeholder={t('selectStage')}>
                  {stageOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label={t('dueDate')}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD.MM.YYYY"
                  placeholder={t('selectDate')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hourly_rate"
                label={t('hourlyRate')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('hourlyRate')}
                  min={0}
                  step={100}
                  formatter={value => `${value} ₴`}
                  parser={value => value?.replace(' ₴', '') || ''}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label={t('budget')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('budget')}
                  min={0}
                  step={1000}
                  formatter={value => `${value} ₴`}
                  parser={value => value?.replace(' ₴', '') || ''}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t('description')}
          >
            <Input.TextArea 
              placeholder={t('description')}
              rows={3}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CasesPage;