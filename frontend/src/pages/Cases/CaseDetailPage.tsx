import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Descriptions, Tag, Timeline, message, Spin, Row, Col } from 'antd';
import { ArrowLeftOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

interface CaseDetail {
  id: string;
  number: string;
  title: string;
  client: string;
  status: string;
  stage: string;
  description: string;
  hourly_rate: number;
  budget: number;
  created_at: string;
  updated_at: string;
}

const CaseDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const fetchCaseDetail = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);
    } catch (error) {
      message.error(t('errorFetchingCase'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" className="center-spin" />;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cases')} className="mb-4">
        {t('backToList')}
      </Button>

      <Row gutter={16}>
        <Col span={16}>
          <Card>
            <Title level={2}>{caseData?.title}</Title>
            <Text type="secondary">#{caseData?.number}</Text>

            <Descriptions column={2} className="mt-6">
              <Descriptions.Item label={t('client')}>{caseData?.client}</Descriptions.Item>
              <Descriptions.Item label={t('status')}>
                <Tag color={caseData?.status === 'pending' ? 'blue' : 'green'}>{t(caseData?.status || '')}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('stage')}>{t(caseData?.stage || '')}</Descriptions.Item>
              <Descriptions.Item label={t('hourlyRate')}>${caseData?.hourly_rate}/h</Descriptions.Item>
              <Descriptions.Item label={t('budget')}>${caseData?.budget}</Descriptions.Item>
            </Descriptions>

            <div className="mt-6">
              <Title level={4}>{t('description')}</Title>
              <Text>{caseData?.description || t('noDescription')}</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title={t('actions')}>
            <Button type="primary" icon={<EditOutlined />} block className="mb-2">
              {t('editCase')}
            </Button>
            <Button icon={<FileTextOutlined />} block>
              {t('viewDocuments')}
            </Button>
          </Card>

          <Card title={t('recentActivity')} className="mt-4">
            <Timeline>
              <Timeline.Item>{t('caseCreated')}</Timeline.Item>
              <Timeline.Item>{t('lastUpdated')}</Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CaseDetailPage;