import React, { useState } from 'react';
import { Table, Button, Tag, Space, Input, Row, Col, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCases } from '@hooks/useCases';
import { Case } from '@types';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Search } = Input;

export const Cases: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { cases, pagination, isLoading, updateParams } = useCases({
    page: 1,
    limit: 10,
    search: '',
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    updateParams({ search: value, page: 1 });
  };

  const handleTableChange = (pagination: any) => {
    updateParams({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'blue',
      in_progress: 'orange',
      review: 'purple',
      completed: 'green',
      closed: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      new: 'Нова',
      in_progress: 'В процесі',
      review: 'На перевірці',
      completed: 'Завершено',
      closed: 'Закрито',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Назва',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Клієнт',
      dataIndex: ['client', 'firstName'],
      key: 'client',
      render: (text: string, record: Case) => 
        `${record.client?.firstName} ${record.client?.lastName}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Нова', value: 'new' },
        { text: 'В процесі', value: 'in_progress' },
        { text: 'На перевірці', value: 'review' },
        { text: 'Завершено', value: 'completed' },
        { text: 'Закрито', value: 'closed' },
      ],
    },
    {
      title: 'Пріоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          urgent: 'magenta',
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      },
    },
    {
      title: 'Дата створення',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Дії',
      key: 'actions',
      render: (text: string, record: Case) => (
        <Space size="middle">
          <Link to={`/cases/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
          <Link to={`/cases/${record.id}/edit`}>
            <Button type="text" icon={<EditOutlined />} />
          </Link>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    // Логіка видалення
    console.log('Delete case:', id);
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Search
            placeholder="Пошук справ..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Link to="/cases/new">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Нова справа
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={cases}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.limit || 10,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Всього ${total} справ`,
          }}
        />
      </Card>
    </div>
  );
};