import React from 'react';
import { Result, Button, Card } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReset = () => {
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <Result
          status="error"
          title={t('errorOccurred')}
          subTitle={t('errorPleaseTryAgain')}
          extra={[
            <Button
              key="reload"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className="mb-2"
            >
              {t('tryAgain')}
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
            >
              {t('goToHomepage')}
            </Button>,
          ]}
        />
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-red-50 rounded">
            <h4 className="text-sm font-semibold text-red-800">Error Details:</h4>
            <pre className="text-xs text-red-600 mt-2 overflow-auto">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ErrorFallback;