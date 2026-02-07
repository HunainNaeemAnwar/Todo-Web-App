'use client';

import { useMemo } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface TaskItemData {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  category?: string;
  due_date: string;
}

interface TaskGroupByDayProps {
  tasksByDay: Record<string, TaskItemData[]>;
  days: string[];
  onTaskClick?: (taskId: string) => void;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export function TaskGroupByDay({
  tasksByDay = {},
  days = [],
  onTaskClick,
  onTaskToggle,
}: TaskGroupByDayProps) {
  const groupedTasks = useMemo(() => {
    const result: Record<string, TaskItemData[]> = {};
    (days || []).forEach(day => {
      result[day] = tasksByDay[day] || [];
    });
    return result;
  }, [tasksByDay, days]);

  const formatDayHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;

    return (
      <div
        className={`flex items-center gap-2 mb-3 ${isToday ? 'text-accent-primary' : isPast ? 'text-text-muted' : 'text-text-primary'}`}
      >
        <span className="font-medium">
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        {isToday && (
          <span className="text-xs px-2 py-0.5 bg-accent-primary/20 rounded-full">
            Today
          </span>
        )}
        {isPast && !isToday && tasksByDay[dateStr]?.length > 0 && (
          <span className="text-xs text-error">Overdue</span>
        )}
      </div>
    );
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-error border-error/30 bg-error/10';
      case 'medium':
        return 'text-warning border-warning/30 bg-warning/10';
      case 'low':
        return 'text-success border-success/30 bg-success/10';
      default:
        return 'text-text-secondary border-border';
    }
  };

  if (days.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-text-secondary">No tasks found for this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {days.map(day => {
        const tasks = groupedTasks[day] || [];
        const hasTasks = tasks.length > 0;

        return (
          <div key={day} className="glass-effect rounded-2xl p-4">
            {formatDayHeader(day)}

            {hasTasks ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${getPriorityColor(task.priority)} ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onTaskToggle?.(task.id, !task.completed);
                      }}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-secondary" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}
                      >
                        {task.title}
                      </p>
                      {task.category && (
                        <p className="text-xs text-text-muted capitalize">
                          {task.category}
                        </p>
                      )}
                    </div>
                    {task.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${
                          task.priority === 'high'
                            ? 'bg-error/20 text-error'
                            : task.priority === 'medium'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-success/20 text-success'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No tasks</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CalendarViewProps {
  tasksByDay: Record<string, TaskItemData[]>;
  days: string[];
  onTaskClick?: (taskId: string) => void;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export function CalendarView({
  tasksByDay,
  days,
  onTaskClick,
}: CalendarViewProps) {
  const weeks = useMemo(() => {
    const result: string[][] = [];
    let currentWeek: string[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === days.length - 1) {
        result.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return result;
  }, [days]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCompletionStats = (dayTasks: TaskItemData[]) => {
    if (dayTasks.length === 0) return null;
    const completed = dayTasks.filter(t => t.completed).length;
    return {
      completed,
      total: dayTasks.length,
      percentage: Math.round((completed / dayTasks.length) * 100),
    };
  };

  return (
    <div className="glass-effect rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {daysOfWeek.map(day => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="divide-y divide-border">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map(day => {
              const tasks = tasksByDay[day] || [];
              const stats = getCompletionStats(tasks);
              const isToday =
                new Date(day).toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`min-h-[100px] p-2 border-r border-border last:border-r-0 ${
                    isToday ? 'bg-accent-primary/5' : ''
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${isToday ? 'text-accent-primary' : 'text-text-secondary'}`}
                  >
                    {new Date(day).getDate()}
                  </div>

                  {stats && stats.total > 0 && (
                    <div className="space-y-1">
                      {tasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${
                            task.completed
                              ? 'bg-success/20 text-success line-through'
                              : task.priority === 'high'
                                ? 'bg-error/20 text-error'
                                : 'bg-slate-700/50 text-text-secondary'
                          }`}
                          onClick={() => onTaskClick?.(task.id)}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasks.length > 3 && (
                        <div className="text-xs text-text-muted">
                          +{tasks.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  {!stats && (
                    <div className="text-xs text-text-muted/50">No tasks</div>
                  )}
                </div>
              );
            })}

            {week.length < 7 &&
              Array(7 - week.length)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[100px] bg-slate-800/20"
                  />
                ))}
          </div>
        ))}
      </div>
    </div>
  );
}
