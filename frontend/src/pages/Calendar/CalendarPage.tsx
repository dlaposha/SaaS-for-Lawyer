// frontend/src/pages/CalendarPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Card } from 'antd';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import dayjs from 'dayjs';

const { Title } = Typography;

interface Event {
  title: string;
  start: string;
  end: string;
  extendedProps: {
    description: string;
  };
}

const CalendarPage: React.FC = () => {
  const { t } = useTranslation();

  const events: Event[] = [
    {
      title: 'Case Hearing',
      start: dayjs('2025-09-19T10:00:00').toISOString(),
      end: dayjs('2025-09-19T12:00:00').toISOString(),
      extendedProps: {
        description: 'Kyiv District Court',
      },
    },
    {
      title: 'Appeal Deadline',
      start: dayjs('2025-09-21T09:00:00').toISOString(),
      end: dayjs('2025-09-21T11:00:00').toISOString(),
      extendedProps: {
        description: 'Appeal Court',
      },
    },
  ];

  return (
    <div>
      <Title level={2}>{t('calendar')}</Title>
      <Card className="mb-6">
        <Calendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={(arg: any) => (
            <div>
              <strong>{arg.event.title}</strong>
              <div>{arg.event.extendedProps.description}</div>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

export default CalendarPage;