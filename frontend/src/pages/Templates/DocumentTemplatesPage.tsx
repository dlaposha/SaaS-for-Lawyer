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
  Upload,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
  is_system: boolean;
}

const DocumentTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [form] = Form.useForm();

  const demoCategories = [
    { value: 'contract', label: t('contracts') },
    { value: 'lawsuit', label: t('lawsuits') },
    { value: 'agreement', label: t('agreements') },
    { value: 'motion', label: t('motions') },
    { value: 'letter', label: t('letters') },
    { value: 'report', label: t('reports') }
  ];

  const demoVariables = [
    { value: '{{client_name}}', label: t('clientName') },
    { value: '{{client_address}}', label: t('clientAddress') },
    { value: '{{case_number}}', label: t('caseNumber') },
    { value: '{{case_title}}', label: t('caseTitle') },
    { value: '{{court_name}}', label: t('courtName') },
    { value: '{{judge_name}}', label: t('judgeName') },
    { value: '{{hearing_date}}', label: t('hearingDate') },
    { value: '{{amount}}', label: t('amount') },
    { value: '{{lawyer_name}}', label: t('lawyerName') },
    { value: '{{firm_name}}', label: t('firmName') },
    { value: '{{current_date}}', label: t('currentDate') }
  ];

  const demoTemplates: DocumentTemplate[] = [
    {
      id: '1',
      name: t('standardContract'),
      description: t('standardContractDescription'),
      category: 'contract',
      content: t('standardContractContent'),
      variables: ['{{client_name}}', '{{client_address}}', '{{amount}}', '{{current_date}}'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      is_system: true
    },
    {
      id: '2',
      name: t('lawsuitComplaint'),
      description: t('lawsuitComplaintDescription'),
      category: 'lawsuit',
      content: t('lawsuitComplaintContent'),
      variables: ['{{client_name}}', '{{case_number}}', '{{court_name}}', '{{judge_name}}'],
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-16T10:00:00Z',
      is_system: true
    },
    {
      id: '3',
      name: t('clientAgreement'),
      description: t('clientAgreementDescription'),
      category: 'agreement',
      content: t('clientAgreementContent'),
      variables: ['{{client_name}}', '{{lawyer_name}}', '{{firm_name}}', '{{current_date}}'],
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-17T10:00:00Z',
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
      const newTemplate: DocumentTemplate = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        category: values.category,
        content: values.content,
        variables: values.variables || [],
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

  const handleDuplicateTemplate = async (template: DocumentTemplate) => {
    try {
      const duplicatedTemplate: DocumentTemplate = {
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

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      description: template.description,
      category: template.category,
      content: template.content,
      variables: template.variables
    });
    setIsModalVisible(true);
  };

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    Modal.info({
      title: template.name,
      width: 800,
      content: (
        <div>
          <Text strong>{t('description')}:</Text>
          <p>{template.description}</p>
          <Divider />
          <Text strong>{t('content')}:</Text>
          <div 
            className="bg-gray-50 p-4 rounded mt-2 whitespace-pre-wrap"
            style={{ maxHeight: '400px', overflow: 'auto' }}
          >
            {template.content}
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      contract: 'blue',
      lawsuit: 'red',
      agreement: 'green',
      motion: 'orange',
      letter: 'purple',
      report: 'cyan'
    };
    return colors[category] || 'default';
  };

  const columns: ColumnsType<DocumentTemplate> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <FileTextOutlined />
          <span>{name}</span>
          {record.is_system && (
            <Tag color="blue">{t('system')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
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
      title: t('variables'),
      dataIndex: 'variables',
      key: 'variables',
      render: (variables: string[]) => (
        <Tooltip title={variables.join(', ')}>
          <span>
            {variables.length} {t('variables')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t('preview')}>
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handlePreviewTemplate(record)}
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
        </Space>
      ),
    },
  ];

  const insertVariable = (variable: string) => {
    const currentContent = form.getFieldValue('content') || '';
    form.setFieldsValue({
      content: currentContent + variable
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>{t('documentTemplates')}</Title>
          <Text type="secondary">{t('documentTemplatesDescription')}</Text>
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
            name="content"
            label={t('templateContent')}
            rules={[{ required: true, message: t('templateContentRequired') }]}
          >
            <TextArea 
              rows={12} 
              placeholder={t('enterTemplateContent')}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          
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

export default DocumentTemplatesPage;