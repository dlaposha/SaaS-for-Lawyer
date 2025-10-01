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
  Switch,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SecurityScanOutlined,
  LockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  user_count: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

const RolesPermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // Демо-дані для ролей та дозволів
  const demoRoles: Role[] = [
    {
      id: '1',
      name: 'admin',
      description: 'Повний доступ до всіх функцій системи',
      permissions: ['users.read', 'users.write', 'cases.read', 'cases.write', 'settings.write'],
      is_system: true,
      user_count: 1,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'lawyer',
      description: 'Доступ до справ, клієнтів та документів',
      permissions: ['cases.read', 'cases.write', 'clients.read', 'clients.write', 'documents.write'],
      is_system: false,
      user_count: 3,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '3',
      name: 'assistant',
      description: 'Обмежений доступ для допоміжних функцій',
      permissions: ['cases.read', 'clients.read', 'documents.read'],
      is_system: false,
      user_count: 2,
      created_at: '2024-01-16T10:00:00Z'
    }
  ];

  const demoPermissions: Permission[] = [
    { id: '1', name: 'users.read', category: 'users', description: 'Перегляд користувачів' },
    { id: '2', name: 'users.write', category: 'users', description: 'Редагування користувачів' },
    { id: '3', name: 'cases.read', category: 'cases', description: 'Перегляд справ' },
    { id: '4', name: 'cases.write', category: 'cases', description: 'Редагування справ' },
    { id: '5', name: 'clients.read', category: 'clients', description: 'Перегляд клієнтів' },
    { id: '6', name: 'clients.write', category: 'clients', description: 'Редагування клієнтів' },
    { id: '7', name: 'documents.read', category: 'documents', description: 'Перегляд документів' },
    { id: '8', name: 'documents.write', category: 'documents', description: 'Редагування документів' },
    { id: '9', name: 'settings.read', category: 'settings', description: 'Перегляд налаштувань' },
    { id: '10', name: 'settings.write', category: 'settings', description: 'Зміна налаштувань' }
  ];

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      // Тимчасово використовуємо демо-дані
      setRoles(demoRoles);
      setPermissions(demoPermissions);
    } catch (error) {
      message.error(t('errorFetchingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (values: any) => {
    try {
      const newRole: Role = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        permissions: values.permissions || [],
        is_system: false,
        user_count: 0,
        created_at: new Date().toISOString()
      };
      
      setRoles(prev => [...prev, newRole]);
      setIsRoleModalVisible(false);
      form.resetFields();
      message.success(t('roleCreated'));
    } catch (error) {
      message.error(t('errorCreatingRole'));
    }
  };

  const handleUpdateRole = async (values: any) => {
    if (!editingRole) return;
    
    try {
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...values }
          : role
      ));
      setIsRoleModalVisible(false);
      setEditingRole(null);
      form.resetFields();
      message.success(t('roleUpdated'));
    } catch (error) {
      message.error(t('errorUpdatingRole'));
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      setRoles(prev => prev.filter(role => role.id !== id));
      message.success(t('roleDeleted'));
    } catch (error) {
      message.error(t('errorDeletingRole'));
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsRoleModalVisible(true);
  };

  const columns: ColumnsType<Role> = [
    {
      title: t('roleName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <SecurityScanOutlined />
          <span>{t(name)}</span>
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
    },
    {
      title: t('permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 3).map(permission => (
            <Tag key={permission} size="small">
              {permission}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tooltip title={permissions.slice(3).join(', ')}>
              <Tag>+{permissions.length - 3}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: t('users'),
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count} {t('users')}
        </Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditRole(record)}
            disabled={record.is_system}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('confirmDeleteRole')}
            description={t('deleteRoleWarning')}
            onConfirm={() => handleDeleteRole(record.id)}
            okText={t('yes')}
            cancelText={t('no')}
            disabled={record.is_system}
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              disabled={record.is_system || record.user_count > 0}
            >
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const permissionColumns: ColumnsType<Permission> = [
    {
      title: t('permissionName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{t(category)}</Tag>,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('rolesAndPermissions')}</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRole(null);
            form.resetFields();
            setIsRoleModalVisible(true);
          }}
        >
          {t('addRole')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ролі */}
        <Card 
          title={
            <Space>
              <SecurityScanOutlined />
              <span>{t('roles')}</span>
            </Space>
          }
          loading={loading}
        >
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>

        {/* Дозволи */}
        <Card 
          title={
            <Space>
              <LockOutlined />
              <span>{t('permissions')}</span>
            </Space>
          }
          loading={loading}
        >
          <Table
            columns={permissionColumns}
            dataSource={permissions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      </div>

      {/* Модальне вікно для створення/редагування ролі */}
      <Modal
        title={editingRole ? t('editRole') : t('addRole')}
        open={isRoleModalVisible}
        onCancel={() => {
          setIsRoleModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingRole ? handleUpdateRole : handleCreateRole}
        >
          <Form.Item
            name="name"
            label={t('roleName')}
            rules={[{ required: true, message: t('roleNameRequired') }]}
          >
            <Input placeholder={t('enterRoleName')} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={t('description')}
            rules={[{ required: true, message: t('descriptionRequired') }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder={t('enterRoleDescription')}
            />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label={t('permissions')}
          >
            <Select
              mode="multiple"
              placeholder={t('selectPermissions')}
              options={permissions.map(p => ({
                label: `${p.name} (${p.category})`,
                value: p.name
              }))}
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRole ? t('update') : t('create')}
              </Button>
              <Button onClick={() => {
                setIsRoleModalVisible(false);
                setEditingRole(null);
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

export default RolesPermissionsPage;