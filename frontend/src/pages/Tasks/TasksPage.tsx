import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../services/api';

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  status: string;
}

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      message.error(t('errorFetchingTasks'));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: t('taskName'), dataIndex: 'title', key: 'title' },
    {
      title: t('priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green'}>
          {t(priority)}
        </Tag>
      ),
    },
    { title: t('dueDate'), dataIndex: 'due_date', key: 'due_date' },
    { title: t('assignedTo'), dataIndex: 'assigned_to', key: 'assigned_to' },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'done' ? 'green' : 'blue'}>{t(status)}</Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          <Button size="small">{t('view')}</Button>
          <Button size="small">{t('edit')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>{t('tasks')}</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('addTask')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default TasksPage;