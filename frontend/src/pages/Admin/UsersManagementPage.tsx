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
  Select, 
  App, 
  Card,
  Switch,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { demoApi } from '../../../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

const { Option } = Select;
const { useApp } = App;

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { message: appMessage, modal: appModal } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Демо-дані для користувачів
  const demoUsers: User[] = [
    {
      id: '1',
      email: 'admin@lawyer.com',
      full_name: 'Дмитро Лапоша',
      role: 'admin',
      is_active: true,
      last_login: '2024-01-20T15:30:00Z',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      email: 'lawyer1@lawyer.com',
      full_name: 'Олена Петренко',
      role: 'lawyer',
      is_active: true,
      last_login: '2024-01-20T14:20:00Z',
      created_at: '2024-01-16T09:15:00Z'
    },
    {
      id: '3',
      email: 'assistant@lawyer.com',
      full_name: 'Марія Коваленко',
      role: 'assistant',
      is_active: true,
      last_login: '2024-01-19T11:45:00Z',
      created_at: '2024-01-17T11:20:00Z'
    }
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Тимчасово використовуємо демо-дані
      setUsers(demoUsers);
    } catch (error: any) {
      appMessage.error(t('errorFetchingUsers'));
    } finally {
      setLoading(false);
    }
  }, [t, appMessage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      'admin': 'red',
      'lawyer': 'blue',
      'assistant': 'green',
      'paralegal': 'orange',
      'accountant': 'purple',
      'viewer': 'gray'
    };
    return roleColors[role] || 'blue';
  };

  const handleCreateUser = async (values: any) => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: values.email,
        full_name: values.full_name,
        role: values.role,
        is_active: values.is_active !== false,
        created_at: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUser]);
      setIsModalOpen(false);
      form.resetFields();
      appMessage.success(t('userCreated'));
    } catch (error) {
      appMessage.error(t('errorCreatingUser'));
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;
    
    try {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...values }
          : user
      ));
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
      appMessage.success(t('userUpdated'));
    } catch (error) {
      appMessage.error(t('errorUpdatingUser'));
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== id));
      appMessage.success(t('userDeleted'));
    } catch (error) {
      appMessage.error(t('errorDeletingUser'));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_active: !isActive }
          : user
      ));
      appMessage.success(
        isActive ? t('userDeactivated') : t('userActivated')
      );
    } catch (error) {
      appMessage.error(t('errorUpdatingUser'));
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: t('fullName'),
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {t(role)}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, !checked)}
          size="small"
        />
      ),
    },
    {
      title: t('lastLogin'),
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('confirmDeleteUser')}
            description={t('deleteUserWarning')}
            onConfirm={() => handleDeleteUser(record.id)}
            okText={t('yes')}
            cancelText={t('no')}
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            >
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const roleOptions = [
    { value: 'admin', label: t('admin') },
    { value: 'lawyer', label: t('lawyer') },
    { value: 'assistant', label: t('assistant') },
    { value: 'paralegal', label: t('paralegal') },
    { value: 'accountant', label: t('accountant') },
    { value: 'viewer', label: t('viewer') },
  ];

  return (
    <div className="users-management-page">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold m-0">{t('usersManagement')}</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            size="large"
          >
            {t('addUser')}
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${t('showing')} ${range[0]}-${range[1]} ${t('of')} ${total} ${t('users')}`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? t('editUser') : t('addUser')}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingUser ? handleUpdateUser : handleCreateUser}
          initialValues={{
            is_active: true,
            role: 'lawyer'
          }}
        >
          <Form.Item
            name="email"
            label={t('email')}
            rules={[
              { required: true, message: t('emailRequired') },
              { type: 'email', message: t('invalidEmailFormat') }
            ]}
          >
            <Input placeholder={t('email')} />
          </Form.Item>
          
          <Form.Item
            name="full_name"
            label={t('fullName')}
            rules={[{ required: true, message: t('fullNameRequired') }]}
          >
            <Input placeholder={t('fullName')} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label={t('role')}
            rules={[{ required: true, message: t('roleRequired') }]}
          >
            <Select placeholder={t('selectRole')}>
              {roleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="is_active"
            label={t('status')}
            valuePropName="checked"
          >
            <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? t('update') : t('create')}
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
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

export default UsersManagementPage;