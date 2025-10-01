import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<Props> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  return (
    <Result
      status="500"
      title={t('errorOccurred', 'Помилка')}
      subTitle={error.message}
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          {t('tryAgain', 'Спробувати знову')}
        </Button>
      }
    />
  );
};

export default ErrorFallback;