import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Typography,
  Spin,
  message
} from 'antd';
import {
  DollarCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { BarChart, Bar } from 'recharts'; // ✅ Додано BarChart, Bar
import api from '../services/api';

const { Title } = Typography;

interface IncomeData {
  month: string;
  income: number;
}

interface TimeData {
  month: string;
  hours: number;
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await api.get('/reports');
        setIncomeData(response.data.income);
        setTimeData(response.data.time);
      } catch (error) {
        message.error(t('errorFetchingReports'));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [t]); // ✅ Видалено 'api' з залежностей

  const columnsIncome: ColumnsType<IncomeData> = [
    {
      title: t('month'),
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: t('income'),
      dataIndex: 'income',
      key: 'income',
      render: (income: number) => (
        <span>{income.toLocaleString()} ₴</span>
      ),
    },
  ];

  const columnsTime: ColumnsType<TimeData> = [
    {
      title: t('month'),
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: t('hoursTracked'),
      dataIndex: 'hours',
      key: 'hours',
    },
  ];

  return (
    <div>
      <Title level={2}>{t('reports')}</Title>

      {loading ? (
        <Spin className="block mx-auto my-10" />
      ) : (
        <>
          {/* Фінансові звіти */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title={t('totalIncome')}
                  value={incomeData.reduce((acc, curr) => acc + curr.income, 0)}
                  prefix={<DollarCircleOutlined />}
                  suffix="₴"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title={t('averageIncome')}
                  value={incomeData.reduce((acc, curr) => acc + curr.income, 0) / incomeData.length}
                  prefix={<DollarCircleOutlined />}
                  suffix="₴"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title={t('hoursTracked')}
                  value={timeData.reduce((acc, curr) => acc + curr.hours, 0)}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title={t('averageHourlyRate')}
                  value={(incomeData.reduce((acc, curr) => acc + curr.income, 0) / timeData.reduce((acc, curr) => acc + curr.hours, 0)).toFixed(2)}
                  prefix={<DollarCircleOutlined />}
                  suffix="₴"
                />
              </Card>
            </Col>
          </Row>

          {/* Бар-графік доходів */}
          <Card title={t('incomeChart')} className="mb-6">
            <BarChart
              width={500}
              height={300}
              data={incomeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <Bar dataKey="income" fill="#8884d8" />
            </BarChart>
          </Card>

          {/* Таблиця доходів за місяцями */}
          <Card title={t('incomeTable')} className="mb-6">
            <Table
              columns={columnsIncome}
              dataSource={incomeData}
              pagination={false}
            />
          </Card>

          {/* Бар-графік відпрацьованих годин */}
          <Card title={t('timeChart')} className="mb-6">
            <BarChart
              width={500}
              height={300}
              data={timeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <Bar dataKey="hours" fill="#82ca9d" />
            </BarChart>
          </Card>

          {/* Таблиця відпрацьованих годин за місяцями */}
          <Card title={t('timeTable')}>
            <Table
              columns={columnsTime}
              dataSource={timeData}
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;