import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card,
  Popconfirm,
  Tooltip,
  Switch,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  EyeOutlined,
  MailOutlined,
  RocketOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

const EmailTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [form] = Form.useForm();

  const demoCategories = [
    { value: 'client_communication', label: t('clientCommunication') },
    { value: 'case_updates', label: t('caseUpdates') },
    { value: 'billing', label: t('billing') },
    { value: 'meeting_reminders', label: t('meetingReminders') },
    { value: 'marketing', label: t('marketing') },
    { value: 'system', label: t('system') }
  ];

  const demoVariables = [
    { value: '{{client_name}}', label: t('clientName') },
    { value: '{{client_email}}', label: t('clientEmail') },
    { value: '{{case_number}}', label: t('caseNumber') },
    { value: '{{case_title}}', label: t('caseTitle') },
    { value: '{{hearing_date}}', label: t('hearingDate') },
    { value: '{{hearing_time}}', label: t('hearingTime') },
    { value: '{{court_name}}', label: t('courtName') },
    { value: '{{amount}}', label: t('amount') },
    { value: '{{due_date}}', label: t('dueDate') },
    { value: '{{lawyer_name}}', label: t('lawyerName') },
    { value: '{{firm_name}}', label: t('firmName') },
    { value: '{{firm_phone}}', label: t('firmPhone') },
    { value: '{{firm_address}}', label: t('firmAddress') },
    { value: '{{current_date}}', label: t('currentDate') }
  ];

  const demoTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: t('welcomeEmail'),
      subject: t('welcomeEmailSubject'),
      description: t('welcomeEmailDescription'),
      category: 'client_communication',
      body: t('welcomeEmailBody'),
      variables: ['{{client_name}}', '{{lawyer_name}}', '{{firm_name}}'],
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      is_system: true
    },
    {
      id: '2',
      name: t('caseUpdateEmail'),
      subject: t('caseUpdateEmailSubject'),
      description: t('caseUpdateEmailDescription'),
      category: 'case_updates',
      body: t('caseUpdateEmailBody'),
      variables: ['{{client_name}}', '{{case_number}}', '{{case_title}}'],
      is_active: true,
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-16T10:00:00Z',
      is_system: true
    },
    {
      id: '3',
      name: t('invoiceReminderEmail'),
      subject: t('invoiceReminderEmailSubject'),
      description: t('invoiceReminderEmailDescription'),
      category: 'billing',
      body: t('invoiceReminderEmailBody'),
      variables: ['{{client_name}}', '{{amount}}', '{{due_date}}'],
      is_active: false,
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-17T10:00:00Z',
      is_system: false
    },
    {
      id: '4',
      name: t('hearingReminderEmail'),
      subject: t('hearingReminderEmailSubject'),
      description: t('hearingReminderEmailDescription'),
      category: 'meeting_reminders',
      body: t('hearingReminderEmailBody'),
      variables: ['{{client_name}}', '{{hearing_date}}', '{{hearing_time}}', '{{court_name}}'],
      is_active: true,
      created_at: '2024-01-18T10:00:00Z',
      updated_at: '2024-01-18T10:00:00Z',
      is_system: false
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      setTemplates(demoTemplates);
    } catch (error) {
      message.error(t('errorFetchingTemplates'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (values: any) => {
    try {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: values.name,
        subject: values.subject,
        description: values.description,
        category: values.category,
        body: values.body,
        variables: values.variables || [],
        is_active: values.is_active || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_system: false
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setIsModalVisible(false);
      form.resetFields();
      message.success(t('templateCreated'));
    } catch (error) {
      message.error(t('errorCreatingTemplate'));
    }
  };

  const handleUpdateTemplate = async (values: any) => {
    if (!editingTemplate) return;
    
    try {
      setTemplates(prev => prev.map(template => 
        template.id === editingTemplate.id 
          ? { 
              ...template, 
              ...values,
              updated_at: new Date().toISOString()
            }
          : template
      ));
      setIsModalVisible(false);
      setEditingTemplate(null);
      form.resetFields();
      message.success(t('templateUpdated'));
    } catch (error) {
      message.error(t('errorUpdatingTemplate'));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
      message.success(t('templateDeleted'));
    } catch (error) {
      message.error(t('errorDeletingTemplate'));
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const duplicatedTemplate: EmailTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (${t('copy')})`,
        is_system: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTemplates(prev => [...prev, duplicatedTemplate]);
      message.success(t('templateDuplicated'));
    } catch (error) {
      message.error(t('errorDuplicatingTemplate'));
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      setTemplates(prev => 
        prev.map(item => 
          item.id === template.id 
            ? { ...item, is_active: !item.is_active }
            : item
        )
      );
      message.success(
        template.is_active 
          ? t('templateDeactivated') 
          : t('templateActivated')
      );
    } catch (error) {
      message.error(t('errorTogglingTemplate'));
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      subject: template.subject,
      description: template.description,
      category: template.category,
      body: template.body,
      variables: template.variables,
      is_active: template.is_active
    });
    setIsModalVisible(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewContent(template.body);
    Modal.info({
      title: (
        <Space>
          <MailOutlined />
          <span>{template.name}</span>
        </Space>
      ),
      width: 600,
      content: (
        <div>
          <Text strong>{t('subject')}:</Text>
          <p className="font-semibold">{template.subject}</p>
          <Divider />
          <Text strong>{t('preview')}:</Text>
          <div 
            className="bg-gray-50 p-4 rounded mt-2 whitespace-pre-wrap border"
            style={{ maxHeight: '400px', overflow: 'auto' }}
          >
            {template.body}
          </div>
          {template.variables.length > 0 && (
            <>
              <Divider />
              <Text strong>{t('availableVariables')}:</Text>
              <div className="mt-2">
                {template.variables.map(variable => (
                  <Tag key={variable} className="mb-1">
                    {variable}
                  </Tag>
                ))}
              </div>
            </>
          )}
        </div>
      )
    });
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    try {
      // Тут буде логіка відправки тестового email
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(t('testEmailSent'));
    } catch (error) {
      message.error(t('errorSendingTestEmail'));
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      client_communication: 'blue',
      case_updates: 'green',
      billing: 'orange',
      meeting_reminders: 'purple',
      marketing: 'cyan',
      system: 'red'
    };
    return colors[category] || 'default';
  };

  const columns: ColumnsType<EmailTemplate> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <MailOutlined />
          <span>{name}</span>
          {record.is_system && (
            <Tag color="blue">{t('system')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('subject'),
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {demoCategories.find(c => c.value === category)?.label}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('preview')}>
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handlePreviewTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={t('sendTest')}>
            <Button 
              icon={<RocketOutlined />} 
              size="small"
              onClick={() => handleSendTestEmail(record)}
            />
          </Tooltip>
          <Tooltip title={t('duplicate')}>
            <Button 
              icon={<CopyOutlined />} 
              size="small"
              onClick={() => handleDuplicateTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={t('edit')}>
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditTemplate(record)}
              disabled={record.is_system}
            />
          </Tooltip>
          <Popconfirm
            title={t('confirmDeleteTemplate')}
            description={t('deleteTemplateWarning')}
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText={t('yes')}
            cancelText={t('no')}
            disabled={record.is_system}
          >
            <Tooltip title={record.is_system ? t('systemTemplateCannotDelete') : t('delete')}>
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                disabled={record.is_system}
              />
            </Tooltip>
          </Popconfirm>
          <Switch
            size="small"
            checked={record.is_active}
            onChange={() => handleToggleActive(record)}
            disabled={record.is_system}
          />
        </Space>
      ),
    },
  ];

  const insertVariable = (variable: string) => {
    const currentBody = form.getFieldValue('body') || '';
    form.setFieldsValue({
      body: currentBody + variable
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>{t('emailTemplates')}</Title>
          <Text type="secondary">{t('emailTemplatesDescription')}</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTemplate(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          {t('addTemplate')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={templates}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Модальне вікно для створення/редагування шаблону */}
      <Modal
        title={editingTemplate ? t('editTemplate') : t('addTemplate')}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label={t('templateName')}
              rules={[{ required: true, message: t('templateNameRequired') }]}
            >
              <Input placeholder={t('enterTemplateName')} />
            </Form.Item>
            
            <Form.Item
              name="category"
              label={t('category')}
              rules={[{ required: true, message: t('categoryRequired') }]}
            >
              <Select 
                placeholder={t('selectCategory')}
                options={demoCategories}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="subject"
            label={t('emailSubject')}
            rules={[{ required: true, message: t('emailSubjectRequired') }]}
          >
            <Input placeholder={t('enterEmailSubject')} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={t('description')}
            rules={[{ required: true, message: t('descriptionRequired') }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder={t('enterTemplateDescription')}
            />
          </Form.Item>

          {/* Доступні змінні */}
          <Card 
            size="small" 
            title={t('availableVariables')}
            className="mb-4"
          >
            <Space wrap>
              {demoVariables.map(variable => (
                <Tooltip key={variable.value} title={variable.label}>
                  <Tag 
                    className="cursor-pointer"
                    onClick={() => insertVariable(variable.value)}
                  >
                    {variable.value}
                  </Tag>
                </Tooltip>
              ))}
            </Space>
          </Card>
          
          <Form.Item
            name="body"
            label={t('emailBody')}
            rules={[{ required: true, message: t('emailBodyRequired') }]}
          >
            <TextArea 
              rows={10} 
              placeholder={t('enterEmailBody')}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          {!editingTemplate?.is_system && (
            <Form.Item
              name="is_active"
              label={t('status')}
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
            </Form.Item>
          )}
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTemplate ? t('update') : t('create')}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingTemplate(null);
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

export default EmailTemplatesPage;