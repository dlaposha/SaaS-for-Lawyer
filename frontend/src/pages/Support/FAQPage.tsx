import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Collapse, Typography } from 'antd';

const { Panel } = Collapse;
const { Title } = Typography;

const FAQPage: React.FC = () => {
  const { t } = useTranslation();

  const faqData = [
    {
      question: t('faqHowToCreateCase'),
      answer: t('faqHowToCreateCaseAnswer'),
    },
    {
      question: t('faqHowToTrackTime'),
      answer: t('faqHowToTrackTimeAnswer'),
    },
    {
      question: t('faqHowToCreateInvoice'),
      answer: t('faqHowToCreateInvoiceAnswer'),
    },
  ];

  return (
    <div>
      <Title level={2}>{t('faq')}</Title>
      <Card>
        <Collapse accordion>
          {faqData.map((item, index) => (
            <Panel header={item.question} key={index.toString()}>
              <p>{item.answer}</p>
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
};

export default FAQPage;