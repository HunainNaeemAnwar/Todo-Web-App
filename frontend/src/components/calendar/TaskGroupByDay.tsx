'use client';

import { useMemo } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

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
        className={`flex items-center gap-4 mb-5 ${isToday ? 'text-accent-primary' : isPast ? 'text-secondary' : 'text-foreground'}`}
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 font-accent">
            {date.toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
          <span className="text-2xl font-display font-bold tracking-tight">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {isToday && (
          <span className="glass-badge glass-badge-success animate-pulse">
            Temporal Origin
          </span>
        )}
        {isPast && !isToday && tasksByDay[dateStr]?.length > 0 && (
          <span className="glass-badge glass-badge-error">
            Overdue
          </span>
        )}
      </div>
    );
  };

  if (days.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-20 text-center animate-pulse border-white/5">
        <p className="text-secondary font-bold tracking-[0.2em] uppercase font-accent">No temporal directives found</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {days.map((day, i) => {
        const tasks = groupedTasks[day] || [];
        const hasTasks = tasks.length > 0;

        return (
          <div
            key={day}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {formatDayHeader(day)}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hasTasks ? (
                tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task.id)}
                    className={`glass-panel glass-card-deep p-5 border-white/5 cursor-pointer group hover-lift ${
                      task.completed ? 'opacity-40 grayscale-[0.5]' : 'hover:border-accent-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onTaskToggle?.(task.id, !task.completed);
                        }}
                        className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-500 ${
                          task.completed
                            ? 'bg-accent-primary border-accent-primary'
                            : 'border-white/10 glass-panel bg-white/5 hover:border-accent-primary/50'
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4 text-depth-950" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`font-bold tracking-tight transition-colors ${
                          task.completed ? 'line-through text-secondary' : 'text-foreground group-hover:text-accent-primary'
                        }`}>
                          {task.title}
                        </p>
                  <div className="flex items-center gap-3 mt-3">
                    {task.priority && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        task.priority === 'high' ? 'bg-status-error' :
                        task.priority === 'medium' ? 'bg-status-warning' : 'bg-status-success'
                      }`} />
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-secondary font-accent">
                      {task.category || 'Standard'} Directive
                    </span>
                  </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel bg-white/5 border-dashed border-white/5 p-8 flex items-center justify-center rounded-2xl lg:col-span-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary opacity-40 font-accent">Zero directives logged</p>
                </div>
              )}
            </div>
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

  return (
    <div className="glass-panel border-white/5 shadow-2xl rounded-[32px] overflow-hidden animate-fade-in">
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
        {daysOfWeek.map(day => (
          <div
            key={day}
            className="p-4 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-secondary border-r border-white/5 last:border-r-0 font-accent"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="divide-y divide-white/5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-white/5">
            {week.map(day => {
              const tasks = tasksByDay[day] || [];
              const isToday = new Date(day).toDateString() === new Date().toDateString();
              const date = new Date(day);

              return (
                <div
                  key={day}
                  className={`min-h-[140px] p-4 transition-all duration-500 relative group overflow-hidden ${
                    isToday ? 'bg-accent-primary/5' : 'hover:bg-white/5'
                  }`}
                >
                  {isToday && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary" />
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-lg font-display font-bold tracking-tight ${
                      isToday ? 'text-accent-primary' : 'text-secondary group-hover:text-foreground'
                    }`}>
                      {date.getDate()}
                    </span>
                    {tasks.length > 0 && (
                      <span className="glass-badge glass-badge-info py-0.5 px-2">
                        {tasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {tasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task.id)}
                        className={`text-[9px] font-bold uppercase tracking-widest p-2 rounded-lg truncate cursor-pointer transition-all duration-300 border font-accent ${
                          task.completed
                            ? 'bg-status-success/5 border-status-success/10 text-status-success/60 line-through'
                            : task.priority === 'high'
                              ? 'glass-panel bg-status-error/10 border-status-error/20 text-status-error animate-pulse'
                              : 'glass-panel bg-white/5 border-white/5 text-secondary hover:text-foreground hover:border-accent-primary/20'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary pl-1 pt-1 font-accent">
                        + {tasks.length - 3} directives
                      </div>
                    )}
                  </div>

                  {/* Subtle corner detail for interactive cells */}
                  <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 border-r border-b border-accent-primary/40 rounded-br-sm" />
                  </div>
                </div>
              );
            })}

            {week.length < 7 &&
              Array(7 - week.length)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[140px] bg-black/10"
                  />
                ))}
          </div>
        ))}
      </div>
    </div>
  );
}
