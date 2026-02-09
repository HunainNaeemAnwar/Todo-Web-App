'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import CreateTaskModal from './CreateTaskModal';
import { Task } from '@/types/task';

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(target === 0 ? 0 : 0);
  
  useEffect(() => {
    if (target === 0) {
      return;
    }
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  
  return count;
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay: number;
  description?: string;
}

function StatCard({ 
  label, 
  value, 
  total, 
  icon: Icon, 
  color, 
  trend, 
  trendValue, 
  delay,
  description 
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value, 1200);
  const percentage = total && total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div
      className="relative group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-secondary rounded-xl p-4 sm:p-5 md:p-6 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden relative h-full">
        
        {/* Background Glow */}
        <div 
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: `var(--${color})` }}
        />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <div style={{ color: `var(--${color})` }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary font-accent truncate">
                {label}
              </p>
              {description && (
                <p className="text-[8px] text-tertiary hidden sm:block">{description}</p>
              )}
            </div>
          </div>
          
          {/* Trend */}
          {trend && trend !== 'neutral' && (
            <div className={`flex items-center gap-0.5 text-[9px] font-bold ${
              trend === 'up' ? 'text-status-success' : 'text-status-error'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="hidden sm:inline">{trendValue}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="relative z-10">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
              {animatedValue}
            </span>
            {total && (
              <span className="text-sm text-tertiary font-accent">
                /{total}
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          {total && total > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[9px] font-accent uppercase tracking-wider">
                <span className="text-tertiary">Progress</span>
                <span className="text-secondary">{percentage}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: `var(--${color})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Line */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
          style={{ backgroundColor: `var(--${color})` }}
        />
      </div>
    </div>
  );
}

// Quick Stat Item
interface QuickStatProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay: number;
}

function QuickStat({ label, value, suffix, icon: Icon, color, delay }: QuickStatProps) {
  return (
    <div 
      className="bg-secondary rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all duration-300 group animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors"
          style={{ color: `var(--${color})` }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-wider text-tertiary font-accent truncate">
            {label}
          </p>
          <p className="text-base sm:text-lg font-display font-bold text-primary">
            {value}{suffix || ''}
          </p>
        </div>
      </div>
    </div>
  );
}

// Task Item Component
interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  index: number;
}

function TaskItem({ task, onToggle, onDelete, index }: TaskItemProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <div
      className="group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={`
        bg-secondary rounded-xl p-3 sm:p-4 border border-white/5 
        transition-all duration-300
        ${task.completed ? 'opacity-50' : 'hover:border-accent-primary/20'}
        ${isOverdue ? 'border-status-error/20' : ''}
      `}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id, task.completed)}
            className={`
              mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all
              ${task.completed 
                ? 'bg-accent-primary border-accent-primary' 
                : 'border-white/20 hover:border-accent-primary'
              }
            `}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${task.completed ? 'text-primary' : 'text-transparent'}`} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`font-medium text-sm sm:text-base truncate ${task.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                {task.title}
              </p>
              
              {/* Priority Badge - Desktop */}
              {!task.completed && (
                <span className={`
                  hidden sm:inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-accent
                  ${task.priority === 'high' ? 'bg-status-error/10 text-status-error border border-status-error/20' :
                    task.priority === 'medium' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' :
                    'bg-status-success/10 text-status-success border border-status-success/20'
                  }
                `}>
                  {task.priority}
                </span>
              )}
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`
                text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-accent
                ${isOverdue ? 'text-status-error' : 'text-secondary'}
              `}>
                {isOverdue && <AlertCircle className="w-3 h-3 inline mr-1" />}
                {formatDate(task.due_date)}
              </span>
              
              {/* Priority - Mobile only */}
              {!task.completed && (
                <span className={`
                  sm:hidden px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-accent
                  ${task.priority === 'high' ? 'text-status-error bg-status-error/10' :
                    task.priority === 'medium' ? 'text-status-warning bg-status-warning/10' :
                    'text-status-success bg-status-success/10'
                  }
                `}>
                  {task.priority[0]}
                </span>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-secondary opacity-0 group-hover:opacity-100 hover:text-status-error hover:bg-status-error/5 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { tasks, loading, error, updateTask, deleteTask, refreshTasks } = useTasks();
  const { loading: authLoading } = useAuth();

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      task =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
    );
  }, [tasks, searchTerm]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const dueToday = tasks.filter(t => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date).toDateString() === new Date().toDateString();
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { 
      total, 
      completed, 
      pending, 
      overdue, 
      highPriority,
      dueToday,
      completionRate
    };
  }, [tasks]);

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    await updateTask(taskId, { completed: !currentStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-secondary border border-status-error/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-status-error text-center sm:text-left">
        <AlertCircle className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wider font-accent mb-1">Sync Error</h3>
          <p className="text-xs text-secondary font-accent">{error}</p>
        </div>
        <button 
          onClick={() => refreshTasks()} 
          className="px-4 py-2 bg-status-error/10 border border-status-error/20 rounded-lg text-xs font-bold uppercase tracking-wider font-accent hover:bg-status-error/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-6">
      
      {/* Stats Section */}
      <section className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-primary tracking-tight">
              Dashboard
            </h1>
            <p className="text-[10px] sm:text-[11px] text-secondary font-accent uppercase tracking-wider mt-0.5">
              Overview & Analytics
            </p>
          </div>
          
          {/* Desktop Summary */}
          <div className="hidden md:flex items-center gap-3 bg-secondary px-4 py-2 rounded-full border border-white/5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-accent-primary" />
              <span className="text-[10px] font-accent text-secondary">
                <span className="text-primary font-bold">{stats.completionRate}%</span> done
              </span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-status-warning" />
              <span className="text-[10px] font-accent text-secondary">
                <span className="text-primary font-bold">{stats.pending}</span> active
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={Target}
            color="accent-primary"
            delay={0}
            description="All tasks"
          />
          <StatCard
            label="Done"
            value={stats.completed}
            total={stats.total}
            icon={CheckCircle}
            color="status-success"
            trend="up"
            trendValue="+8%"
            delay={100}
            description="Completed"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            total={stats.total}
            icon={Clock}
            color="status-warning"
            delay={200}
            description="In progress"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertCircle}
            color="status-error"
            trend="down"
            trendValue="-5%"
            delay={300}
            description="Needs attention"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <QuickStat
            label="High Priority"
            value={stats.highPriority}
            icon={Zap}
            color="status-error"
            delay={400}
          />
          <QuickStat
            label="Due Today"
            value={stats.dueToday}
            icon={Calendar}
            color="accent-cyan"
            delay={450}
          />
          <QuickStat
            label="Efficiency"
            value={stats.completionRate}
            suffix="%"
            icon={TrendingUp}
            color="status-success"
            delay={500}
          />
          <QuickStat
            label="Streak"
            value={5}
            suffix="d"
            icon={Activity}
            color="accent-gold"
            delay={550}
          />
        </div>
      </section>

      {/* Tasks Section */}
      <section className="bg-secondary rounded-2xl border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-primary tracking-tight">
                Tasks
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary font-accent">
                  {filteredTasks.length} total
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="sm:hidden p-2.5 bg-tertiary rounded-lg text-secondary hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Desktop Search */}
              <div className={`
                relative group
                ${showMobileSearch ? 'block absolute left-4 right-4 top-full mt-2 z-20' : 'hidden sm:block'}
              `}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 lg:w-64 pl-9 pr-4 py-2.5 bg-tertiary border border-white/5 rounded-lg text-sm focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-tertiary rounded-lg text-secondary hover:text-primary transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-wider font-accent hover:bg-accent-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 sm:p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-secondary/40" />
              </div>
              <p className="text-secondary font-bold uppercase tracking-wider text-xs font-accent">
                {searchTerm ? 'No matches found' : 'No tasks yet'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-[10px] font-bold uppercase tracking-wider text-accent-primary hover:text-accent-secondary transition-colors font-accent"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredTasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}