import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('pageNotFound', 'Сторінку не знайдено')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('backHome', 'На головну')}
        </Button>
      }
    />
  );
};

export default NotFoundPage;