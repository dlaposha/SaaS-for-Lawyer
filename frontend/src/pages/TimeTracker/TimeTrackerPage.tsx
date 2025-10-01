import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Space,
  Typography,
  Input,
  message,
  Form
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { demoApi } from "../../services/api";

const { Title } = Typography;

const TimeTrackerPage: React.FC = () => {
  const { t } = useTranslation();
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [description, setDescription] = useState<string>('');

  const startTimer = () => {
    setIsRunning(true);
    message.success(t('timerStarted'));
    const id = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    setIntervalId(id);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    message.warning(t('timerPaused'));
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimer(0);
    message.info(t('timerStopped'));
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async () => {
    if (timer === 0) {
      message.warning(t('timerNotStarted'));
      return;
    }

    try {
      await api.post('/time-tracker', {
        description,
        duration: timer,
      });
      message.success(t('timeTracked'));
      setTimer(0);
      setDescription('');
    } catch (error) {
      message.error(t('errorTrackingTime'));
    }
  };

  return (
    <div>
      <Title level={2}>{t('timeTracker')}</Title>
      <Card className="mb-6">
        <div className="flex justify-center items-center mb-4">
          <Title level={3} className="mr-4">
            {Math.floor(timer / 3600).toString().padStart(2, '0')}:
            {Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:
            {(timer % 60).toString().padStart(2, '0')}
          </Title>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startTimer}
              disabled={isRunning}
            >
              {t('startTimer')}
            </Button>
            <Button
              type="primary"
              icon={<PauseCircleOutlined />}
              onClick={pauseTimer}
              disabled={!isRunning}
            >
              {t('pauseTimer')}
            </Button>
            <Button
              danger // ✅ Замінено type="danger" на danger
              icon={<StopOutlined />}
              onClick={stopTimer}
              disabled={isRunning}
            >
              {t('stopTimer')}
            </Button>
          </Space>
        </div>
        <Form layout="vertical">
          <Form.Item
            label={t('description')}
          >
            <Input
              value={description}
              onChange={handleDescriptionChange}
              placeholder={t('enterDescription')}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSubmit}
              block
              disabled={timer === 0}
            >
              {t('trackTime')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TimeTrackerPage;