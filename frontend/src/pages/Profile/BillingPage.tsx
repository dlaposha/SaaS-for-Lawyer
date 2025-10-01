import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Statistic, 
  Row, 
  Col,
  List,
  Typography,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  message
} from 'antd';
import { 
  DownloadOutlined, 
  PlusOutlined,
  CreditCardOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [form] = Form.useForm();

  const demoInvoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2024-001',
      date: '2024-01-01',
      amount: 2990,
      status: 'paid',
      due_date: '2024-01-31'
    },
    {
      id: '2',
      number: 'INV-2024-002',
      date: '2024-02-01',
      amount: 2990,
      status: 'pending',
      due_date: '2024-02-28'
    }
  ];

  const demoPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      is_default: true
    }
  ];

  const columns = [
    {
      title: t('invoiceNumber'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₴${amount}`,
    },
    {
      title: t('dueDate'),
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'paid' ? 'green' : 
          status === 'pending' ? 'orange' : 'red'
        }>
          {t(status)}
        </Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record: Invoice) => (
        <Space>
          <Button size="small" icon={<DownloadOutlined />}>
            {t('download')}
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small">
              {t('payNow')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleAddPaymentMethod = async (values: any) => {
    try {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: values.card_type,
        last4: values.card_number.slice(-4),
        expiry: values.expiry,
        is_default: false
      };
      
      setPaymentMethods(prev => [...prev, newMethod]);
      setIsPaymentModalVisible(false);
      form.resetFields();
      message.success(t('paymentMethodAdded'));
    } catch (error) {
      message.error(t('errorAddingPaymentMethod'));
    }
  };

  return (
    <div className="max-w-6xl">
      <Row gutter={24} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title={t('currentBalance')}
              value={0}
              precision={2}
              prefix="₴"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('nextBillingDate')}
              value={1}
              suffix={t('February 2024')}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('plan')}
              value={t('professional')}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={16}>
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>{t('invoiceHistory')}</span>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={demoInvoices}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        
        <Col span={8}>
          {/* Способи оплати */}
          <Card 
            title={
              <Space>
                <CreditCardOutlined />
                <span>{t('paymentMethods')}</span>
              </Space}
            extra={
              <Button 
                type="link" 
                icon={<PlusOutlined />}
                onClick={() => setIsPaymentModalVisible(true)}
              >
                {t('add')}
              </Button>
            }
          >
            <List
              dataSource={demoPaymentMethods}
              renderItem={method => (
                <List.Item
                  actions={[
                    method.is_default ? (
                      <Tag color="blue">{t('default')}</Tag>
                    ) : (
                      <Button type="link" size="small">
                        {t('setDefault')}
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    title={`${method.type.toUpperCase()} •••• ${method.last4}`}
                    description={`${t('expires')} ${method.expiry}`}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title={t('billingInformation')} className="mt-6">
            <Space direction="vertical">
              <Text strong>Адвокатська фірма Дмитра Лапоші</Text>
              <Text>вул. Юридична, 123</Text>
              <Text>Київ, 01001</Text>
              <Text>Україна</Text>
              <Button type="link" size="small">
                {t('edit')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Модальне вікно додавання картки */}
      <Modal
        title={t('addPaymentMethod')}
        open={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPaymentMethod}
        >
          <Form.Item
            name="card_type"
            label={t('cardType')}
            rules={[{ required: true, message: t('cardTypeRequired') }]}
          >
            <Select>
              <Select.Option value="visa">Visa</Select.Option>
              <Select.Option value="mastercard">MasterCard</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="card_number"
            label={t('cardNumber')}
            rules={[
              { required: true, message: t('cardNumberRequired') },
              { len: 16, message: t('cardNumberLength') }
            ]}
          >
            <Input placeholder="1234 5678 9012 3456" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expiry"
                label={t('expiryDate')}
                rules={[{ required: true, message: t('expiryDateRequired') }]}
              >
                <Input placeholder="MM/YY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cvc"
                label="CVC"
                rules={[{ required: true, message: t('cvcRequired') }]}
              >
                <Input placeholder="123" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {t('addCard')}
              </Button>
              <Button onClick={() => {
                setIsPaymentModalVisible(false);
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

export default BillingPage;