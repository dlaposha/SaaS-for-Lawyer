import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Input, 
  List, 
  Tag, 
  Space, 
  Button, 
  Collapse,
  Typography,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined,
  QuestionCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Panel } = Collapse;
const { Title, Text } = Typography;

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  last_updated: string;
}

const KnowledgeBasePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: t('allCategories'), count: 25 },
    { key: 'getting-started', label: t('gettingStarted'), count: 8 },
    { key: 'cases', label: t('cases'), count: 6 },
    { key: 'clients', label: t('clients'), count: 5 },
    { key: 'billing', label: t('billing'), count: 4 },
    { key: 'settings', label: t('settings'), count: 2 }
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: t('howToCreateCase'),
      content: t('howToCreateCaseContent'),
      category: 'cases',
      views: 1245,
      last_updated: '2024-01-15'
    },
    {
      id: '2',
      title: t('managingClients'),
      content: t('managingClientsContent'),
      category: 'clients',
      views: 876,
      last_updated: '2024-01-10'
    },
    {
      id: '3',
      title: t('billingAndInvoices'),
      content: t('billingAndInvoicesContent'),
      category: 'billing',
      views: 543,
      last_updated: '2024-01-08'
    },
    {
      id: '4',
      title: t('userPermissions'),
      content: t('userPermissionsContent'),
      category: 'settings',
      views: 321,
      last_updated: '2024-01-05'
    },
    {
      id: '5',
      title: t('timeTracking'),
      content: t('timeTrackingContent'),
      category: 'getting-started',
      views: 654,
      last_updated: '2024-01-12'
    }
  ];

  const faqs = [
    {
      question: t('howToResetPassword'),
      answer: t('howToResetPasswordAnswer')
    },
    {
      question: t('howToExportData'),
      answer: t('howToExportDataAnswer')
    },
    {
      question: t('howToAddTeamMember'),
      answer: t('howToAddTeamMemberAnswer')
    },
    {
      question: t('howToGenerateReports'),
      answer: t('howToGenerateReportsAnswer')
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'getting-started': 'blue',
      'cases': 'green',
      'clients': 'orange',
      'billing': 'red',
      'settings': 'purple'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Title level={2}>
          <BookOutlined className="mr-2" />
          {t('knowledgeBase')}
        </Title>
        <Text type="secondary">{t('knowledgeBaseDescription')}</Text>
      </div>

      {/* Пошук */}
      <Card className="mb-6">
        <Search
          placeholder={t('searchKnowledgeBase')}
          enterButton={<SearchOutlined />}
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Бічна панель з категоріями */}
        <div className="lg:col-span-1">
          <Card title={t('categories')}>
            <Space direction="vertical" className="w-full">
              {categories.map(category => (
                <Button
                  key={category.key}
                  type={selectedCategory === category.key ? 'primary' : 'text'}
                  block
                  className="text-left flex justify-between items-center"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <span>{category.label}</span>
                  <Tag>{category.count}</Tag>
                </Button>
              ))}
            </Space>
          </Card>

          {/* Популярні статті */}
          <Card title={t('popularArticles')} className="mt-6">
            <List
              size="small"
              dataSource={articles.slice(0, 3)}
              renderItem={article => (
                <List.Item>
                  <Button type="link" className="p-0 text-left">
                    <Text ellipsis>{article.title}</Text>
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* Основний контент */}
        <div className="lg:col-span-3">
          {/* Статті */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>{t('articles')}</span>
              </Space>
            }
            className="mb-6"
          >
            <List
              dataSource={filteredArticles}
              renderItem={article => (
                <List.Item
                  actions={[
                    <Text type="secondary" key="views">
                      {article.views} {t('views')}
                    </Text>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Button type="link" className="p-0 font-medium">
                          {article.title}
                        </Button>
                        <Tag color={getCategoryColor(article.category)}>
                          {categories.find(c => c.key === article.category)?.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{article.content}</Text>
                        <Text type="secondary" className="text-sm">
                          {t('lastUpdated')}: {article.last_updated}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: t('noArticlesFound') }}
            />
          </Card>

          {/* FAQ */}
          <Card 
            title={
              <Space>
                <QuestionCircleOutlined />
                <span>{t('frequentlyAskedQuestions')}</span>
              </Space>
            }
          >
            <Collapse ghost>
              {faqs.map((faq, index) => (
                <Panel header={faq.question} key={index.toString()}>
                  <Text>{faq.answer}</Text>
                </Panel>
              ))}
            </Collapse>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;