import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  List, 
  Tag, 
  Space, 
  Avatar,
  Divider,
  message,
  Upload,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  PaperClipOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  attachments?: string[];
}

const SupportTicketPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const demoMessages: Message[] = [
    {
      id: '1',
      text: t('ticketInitialMessage'),
      sender: 'user',
      timestamp: '2024-01-20 10:30:00'
    },
    {
      id: '2',
      text: t('supportResponse'),
      sender: 'support',
      timestamp: '2024-01-20 11:15:00'
    }
  ];

  const demoActiveTicket: Ticket = {
    id: '1',
    subject: t('problemWithCaseCreation'),
    description: t('problemWithCaseCreationDescription'),
    status: 'in_progress',
    priority: 'high',
    created_at: '2024-01-20 10:30:00',
    updated_at: '2024-01-20 11:15:00',
    messages: demoMessages
  };

  const demoHistoryTickets: Ticket[] = [
    {
      id: '2',
      subject: t('billingQuestion'),
      description: t('billingQuestionDescription'),
      status: 'resolved',
      priority: 'medium',
      created_at: '2024-01-15 14:20:00',
      updated_at: '2024-01-16 09:45:00',
      messages: []
    },
    {
      id: '3',
      subject: t('featureRequest'),
      description: t('featureRequestDescription'),
      status: 'resolved',
      priority: 'low',
      created_at: '2024-01-10 16:45:00',
      updated_at: '2024-01-12 11:30:00',
      messages: []
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'blue',
      in_progress: 'orange',
      resolved: 'green'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const handleCreateTicket = async (values: any) => {
    setLoading(true);
    try {
      const newTicket: Ticket = {
        id: Date.now().toString(),
        subject: values.subject,
        description: values.description,
        status: 'open',
        priority: values.priority,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [{
          id: '1',
          text: values.description,
          sender: 'user',
          timestamp: new Date().toISOString()
        }]
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setActiveTicket(newTicket);
      form.resetFields();
      message.success(t('ticketCreated'));
    } catch (error) {
      message.error(t('errorCreatingTicket'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (values: any) => {
    if (!activeTicket) return;
    
    try {
      const newMessage: Message = {
        id: (activeTicket.messages.length + 1).toString(),
        text: values.message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      const updatedTicket = {
        ...activeTicket,
        messages: [...activeTicket.messages, newMessage],
        updated_at: new Date().toISOString()
      };
      
      setActiveTicket(updatedTicket);
      setTickets(prev => prev.map(ticket => 
        ticket.id === activeTicket.id ? updatedTicket : ticket
      ));
      
      // Очищаємо форму повідомлення
      values.message = '';
      message.success(t('messageSent'));
    } catch (error) {
      message.error(t('errorSendingMessage'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>{t('supportTickets')}</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setActiveTicket(null)}
        >
          {t('newTicket')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список тікетів */}
        <div className="lg:col-span-1">
          <Card title={t('ticketHistory')}>
            <List
              dataSource={[demoActiveTicket, ...demoHistoryTickets]}
              renderItem={ticket => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 p-3 rounded ${
                    activeTicket?.id === ticket.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveTicket(ticket)}
                >
                  <List.Item.Meta
                    title={
                      <Space direction="vertical" size={2}>
                        <Text strong ellipsis>{ticket.subject}</Text>
                        <Space size={4}>
                          <Tag color={getStatusColor(ticket.status)} size="small">
                            {t(ticket.status)}
                          </Tag>
                          <Tag color={getPriorityColor(ticket.priority)} size="small">
                            {t(ticket.priority)}
                          </Tag>
                        </Space>
                      </Space>
                    }
                    description={
                      <Text type="secondary" className="text-xs">
                        {ticket.created_at}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Перегляд/створення тікета */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <Card
              title={
                <Space direction="vertical" size={2}>
                  <Text strong>{activeTicket.subject}</Text>
                  <Space>
                    <Tag color={getStatusColor(activeTicket.status)}>
                      {t(activeTicket.status)}
                    </Tag>
                    <Tag color={getPriorityColor(activeTicket.priority)}>
                      {t(activeTicket.priority)}
                    </Tag>
                    <Text type="secondary" className="text-sm">
                      {t('created')}: {activeTicket.created_at}
                    </Text>
                  </Space>
                </Space>
              }
            >
              {/* Чат тікета */}
              <div className="mb-6">
                {activeTicket.messages.map(message => (
                  <div
                    key={message.id}
                    className={`mb-4 p-4 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-50 ml-8' 
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                        className={message.sender === 'support' ? 'bg-green-500' : ''}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <Text strong>
                            {message.sender === 'user' ? t('you') : t('supportTeam')}
                          </Text>
                          <Text type="secondary" className="text-xs">
                            {message.timestamp}
                          </Text>
                        </div>
                        <Text>{message.text}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Форма відповіді */}
              <Divider />
              <Form onFinish={handleSendMessage}>
                <Form.Item
                  name="message"
                  rules={[{ required: true, message: t('messageRequired') }]}
                >
                  <TextArea
                    rows={4}
                    placeholder={t('typeYourMessage')}
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Upload>
                      <Button icon={<PaperClipOutlined />}>
                        {t('attachFile')}
                      </Button>
                    </Upload>
                    <Button type="primary" htmlType="submit">
                      {t('sendMessage')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          ) : (
            <Card title={t('createNewTicket')}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateTicket}
              >
                <Form.Item
                  name="subject"
                  label={t('subject')}
                  rules={[{ required: true, message: t('subjectRequired') }]}
                >
                  <Input placeholder={t('enterSubject')} />
                </Form.Item>
                
                <Form.Item
                  name="priority"
                  label={t('priority')}
                  initialValue="medium"
                >
                  <Select>
                    <Option value="low">{t('low')}</Option>
                    <Option value="medium">{t('medium')}</Option>
                    <Option value="high">{t('high')}</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="description"
                  label={t('description')}
                  rules={[{ required: true, message: t('descriptionRequired') }]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder={t('describeYourIssue')}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Space>
                    <Upload>
                      <Button icon={<PaperClipOutlined />}>
                        {t('attachFiles')}
                      </Button>
                    </Upload>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                    >
                      {t('createTicket')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketPage;