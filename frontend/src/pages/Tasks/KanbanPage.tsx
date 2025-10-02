import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Col,
  Row,
  Typography,
  Button,
  Dropdown,
  MenuProps,
  Space,
  Tag
} from 'antd';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PlusOutlined, 
  MoreOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { demoApi } from "../../services/api";

const { Title } = Typography;

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inProgress' | 'done';
  due_date?: string;
  assigned_to?: string;
  case_id?: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Sortable Item Component
const SortableItem: React.FC<{ id: string; task: Task }> = ({ id, task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Редагувати',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Видалити',
      danger: true,
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2">
            <Tag color={getPriorityColor(task.priority)} size="small">
              {task.priority}
            </Tag>
            {task.due_date && (
              <span className="text-xs text-gray-500">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.assigned_to && (
            <div className="text-xs text-gray-500 mt-1">
              {task.assigned_to}
            </div>
          )}
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );
};

// Sortable Column Component
const SortableColumn: React.FC<{ column: Column }> = ({ column }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-full"
    >
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{column.title}</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {column.tasks.length}
            </span>
          </div>
        }
        className="h-full"
        extra={
          <Button 
            type="text" 
            icon={<PlusOutlined />} 
            size="small"
          />
        }
      >
        <div className="min-h-[200px]">
          <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <SortableItem key={task.id} id={task.id} task={task} />
            ))}
          </SortableContext>
          {column.tasks.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Немає завдань
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const KanbanPage: React.FC = () => {
  const { t } = useTranslation();
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await demoApi.getTasks();
      const tasks = response.data;

      // Групуємо задачі по статусах
      const todoTasks = tasks.filter((task: Task) => task.status === 'todo');
      const inProgressTasks = tasks.filter((task: Task) => task.status === 'inProgress');
      const doneTasks = tasks.filter((task: Task) => task.status === 'done');

      setColumns([
        {
          id: 'todo',
          title: t('toDo'),
          tasks: todoTasks,
        },
        {
          id: 'inProgress',
          title: t('inProgress'),
          tasks: inProgressTasks,
        },
        {
          id: 'done',
          title: t('done'),
          tasks: doneTasks,
        },
      ]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Демо дані
      setColumns([
        {
          id: 'todo',
          title: t('toDo'),
          tasks: [
            {
              id: '1',
              title: 'Підготувати позовну заяву',
              description: 'По справі CASE-001',
              priority: 'high',
              status: 'todo',
              due_date: '2024-02-01',
              assigned_to: 'Дмитро Лапоша',
              case_id: 1,
            },
          ],
        },
        {
          id: 'inProgress',
          title: t('inProgress'),
          tasks: [
            {
              id: '2',
              title: 'Аналіз судової практики',
              description: 'По аналогічних справах',
              priority: 'medium',
              status: 'inProgress',
              assigned_to: 'Дмитро Лапоша',
              case_id: 1,
            },
          ],
        },
        {
          id: 'done',
          title: t('done'),
          tasks: [
            {
              id: '3',
              title: 'Консультація з клієнтом',
              description: 'Первинна консультація',
              priority: 'low',
              status: 'done',
              assigned_to: 'Дмитро Лапоша',
              case_id: 1,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const taskId = active.id;
    
    // Знаходимо задачу
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Знаходимо початкову колонку
    let activeColumn: Column | undefined;
    let activeIndex: number = -1;

    for (const column of columns) {
      const taskIndex = column.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        activeColumn = column;
        activeIndex = taskIndex;
        break;
      }
    }

    if (!activeColumn) return;

    // Якщо перетягуємо на колонку
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      if (activeColumn.id === overColumn.id) return;

      // Переміщуємо задачу між колонками
      const task = activeColumn.tasks[activeIndex];
      const updatedTask = { ...task, status: overColumn.id as Task['status'] };
      
      const newActiveColumnTasks = activeColumn.tasks.filter(t => t.id !== taskId);
      const newOverColumnTasks = [...overColumn.tasks, updatedTask];

      setColumns(columns.map(col => {
        if (col.id === activeColumn!.id) {
          return { ...col, tasks: newActiveColumnTasks };
        }
        if (col.id === overColumn.id) {
          return { ...col, tasks: newOverColumnTasks };
        }
        return col;
      }));

      return;
    }

    // Якщо перетягуємо в межах однієї колонки
    const overTaskIndex = activeColumn.tasks.findIndex(task => task.id === overId);
    if (overTaskIndex === -1) return;

    if (activeIndex !== overTaskIndex) {
      const newTasks = arrayMove(activeColumn.tasks, activeIndex, overTaskIndex);
      setColumns(columns.map(col => 
        col.id === activeColumn!.id ? { ...col, tasks: newTasks } : col
      ));
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">{t('kanban')}</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('addTask')}
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Row gutter={[16, 16]}>
          <SortableContext items={columns.map(col => col.id)}>
            {columns.map(column => (
              <Col key={column.id} xs={24} sm={12} md={8} lg={8}>
                <SortableColumn column={column} />
              </Col>
            ))}
          </SortableContext>
        </Row>

        <DragOverlay>
          {activeTask ? (
            <div className="p-3 bg-white rounded-lg shadow-lg border border-blue-200 opacity-90">
              <h4 className="font-medium text-gray-900 mb-1">{activeTask.title}</h4>
              {activeTask.description && (
                <p className="text-sm text-gray-600">{activeTask.description}</p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanPage;