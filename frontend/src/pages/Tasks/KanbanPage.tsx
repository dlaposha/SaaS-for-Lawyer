import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Col,
  Row,
  Typography
} from 'antd';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from '../components/SortableItem';

const { Title } = Typography;

const KanbanPage: React.FC = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState([
    { id: '1', content: 'Task 1' },
    { id: '2', content: 'Task 2' },
    { id: '3', content: 'Task 3' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div>
      <Title level={2}>{t('kanban')}</Title>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title={t('toDo')}>
                {items.map((item) => (
                  <SortableItem key={item.id} id={item.id}>
                    <div className="mb-4 p-4 bg-white rounded shadow">
                      {item.content}
                    </div>
                  </SortableItem>
                ))}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title={t('inProgress')}>
                {/* Тут будуть завдання в процесі */}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card title={t('done')}>
                {/* Тут будуть завершені завдання */}
              </Card>
            </Col>
          </Row>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default KanbanPage;