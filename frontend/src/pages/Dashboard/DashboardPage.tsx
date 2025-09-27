import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Col,
  Row,
  Statistic,
  Button,
  Typography
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Title level={2}>{t('dashboard')}</Title>

      {/* Статистика */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('cases')}
              value={12}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('clients')}
              value={8}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('hoursTracked')}
              value={42.5}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title={t('income')}
              value={12450}
              prefix={<DollarCircleOutlined />}
              suffix="₴"
            />
          </Card>
        </Col>
      </Row>

      {/* Швидкі дії */}
      <Card title={t('quickActions')} className="mb-6">
        <Row gutter={[16, 16]}>
          <Col>
            <Button type="primary" icon={<FileTextOutlined />}>
              {t('addCase')}
            </Button>
          </Col>
          <Col>
            <Button icon={<TeamOutlined />}>
              {t('addClient')}
            </Button>
          </Col>
          <Col>
            <Button icon={<DollarCircleOutlined />}>
              {t('createInvoice')}
            </Button>
          </Col>
          <Col>
            <Button icon={<ClockCircleOutlined />}>
              {t('startTimer')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Найближчі події */}
      <Card title={t('upcomingHearings')} className="mb-6">
        <ul>
          <li>🔹 19.09.2025 — Case #123 — Kyiv District Court</li>
          <li>🔹 21.09.2025 — Case #456 — Appeal Court</li>
        </ul>
      </Card>

      {/* Останні зміни */}
      <Card title={t('recentActivity')}>
        <ul>
          <li>🕒 18.09.2025 — Updated case #789</li>
          <li>🕒 17.09.2025 — Created new client</li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;