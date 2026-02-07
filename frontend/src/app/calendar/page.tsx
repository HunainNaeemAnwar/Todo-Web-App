'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CalendarFilter, DateNavigator } from '@/components/calendar/CalendarFilter';
import { TaskGroupByDay, CalendarView } from '@/components/calendar/TaskGroupByDay';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { SidebarLayout } from '@/components/SidebarLayout';
import { apiClient } from '@/lib/axiosConfig';

interface TaskItemData {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  category?: string;
  due_date: string;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [tasksByDay, setTasksByDay] = useState<Record<string, TaskItemData[]>>({});
  const [days, setDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?showLogin=true');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    document.title = 'Calendar - TaskFlow';
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const dateParam = currentDate.toISOString().split('T')[0];
      const response = await apiClient.get(`/tasks/calendar?period=${period}&date=${dateParam}`);

      const data = response.data;
      setTasksByDay(data.tasks_by_day || {});
      setDays(data.days || []);
    } catch (err) {
      console.error('Failed to fetch calendar tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user, period, currentDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (period === 'today') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (period === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (period === 'today') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (period === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/complete`, { completed });

      setTasksByDay(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(day => {
          updated[day] = updated[day].map(task =>
            task.id === taskId ? { ...task, completed } : task
          );
        });
        return updated;
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="text-center">
          <p className="text-text-primary">Redirecting to login...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
              Calendar View
            </h1>
            <p className="text-text-secondary">
              View and manage your tasks by day, week, or month
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-accent-primary text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-accent-primary text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            
            <CalendarFilter value={period} onPeriodChange={setPeriod} />
          </div>
        </div>

        <div className="mb-6">
          <DateNavigator 
            currentDate={currentDate} 
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
          />
        </div>

        {viewMode === 'list' ? (
          <TaskGroupByDay
            tasksByDay={tasksByDay}
            days={days}
            onTaskToggle={handleTaskToggle}
          />
        ) : (
          <CalendarView
            tasksByDay={tasksByDay}
            days={days}
            onTaskToggle={handleTaskToggle}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
