'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import CreateTaskModal from './CreateTaskModal';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    return { total, completed, pending, overdue, highPriority };
  }, [tasks]);

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    await updateTask(taskId, { completed: !currentStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Due: Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Due: Tomorrow';
    }
    return `Due: ${date.toLocaleDateString()}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 glass-elevated border-status-error/30 rounded-2xl flex items-center gap-6 text-status-error">
        <AlertCircle className="w-8 h-8" />
        <div>
          <h3 className="text-lg font-bold uppercase tracking-widest mb-1">Sync Error</h3>
          <p className="text-sm font-light opacity-80">{error}</p>
        </div>
        <button onClick={() => refreshTasks()} className="ml-auto glass glass-interactive px-6 py-2 text-xs font-bold uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

return (
    <div className="glass space-y-8 md:space-y-12 animate-fade-in">
      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Directives', value: stats.total, icon: CheckCircle, color: 'accent-primary' },
          { label: 'Achieved', value: stats.completed, icon: CheckCircle, color: 'status-success' },
          { label: 'Active', value: stats.pending, icon: Clock, color: 'status-warning' },
          { label: 'Critical', value: stats.overdue, icon: AlertCircle, color: 'status-error' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="glass-elevated p-6 md:p-8 border-white/5 relative group hover:border-accent-primary/20 transition-all duration-500 overflow-hidden"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <p className="text-neutral-grey text-[10px] font-bold uppercase tracking-[0.3em] mb-3">{stat.label}</p>
            <p className="text-4xl md:text-5xl font-display font-bold text-gradient">{stat.value}</p>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-${stat.color}/20 to-transparent blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
          </div>
        ))}
      </div>

      <div className="glass-elevated p-6 md:p-10 border-white/5 shadow-2xl relative overflow-hidden">
        {/* Cinematic Detail Glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-indigo/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient tracking-tight">Active Directives</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-grey">System Online</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[180px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-grey group-hover:text-accent-primary transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 glass glass-input text-sm w-full transition-all duration-500 font-medium"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 md:p-4 glass glass-interactive text-neutral-grey hover:text-accent-primary transition-colors"
              title="Sync"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-3 md:p-4 glass glass-interactive text-neutral-grey hover:text-accent-primary transition-colors"
              title="Add Task"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 md:py-24 glass rounded-3xl border-dashed border-white/5 animate-pulse">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
              <Search className="w-8 h-8 md:w-10 md:h-10 text-neutral-grey/20" />
            </div>
            <p className="text-neutral-grey font-light tracking-[0.1em] text-lg uppercase">
              {searchTerm ? 'No matches found' : 'No tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5">
            {filteredTasks.map((task, i) => (
              <div
                key={task.id}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`glass glass-card-deep p-5 md:p-6 border-white/5 transition-all duration-500 ${
                  task.completed ? 'opacity-40 grayscale-[0.5]' : 'hover:border-accent-primary/20'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className="mt-0.5 w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl border-2 flex items-center justify-center transition-all duration-500 flex-shrink-0"
                      >
                        <CheckCircle className={`w-4 h-4 ${task.completed ? 'text-white' : 'text-transparent'}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-bold tracking-tight truncate ${task.completed ? 'line-through text-neutral-grey' : 'text-text-primary'}`}>
                            {task.title}
                          </p>
                          {!task.completed && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                              task.priority === 'high' ? 'bg-status-error/20 text-status-error' :
                              task.priority === 'medium' ? 'bg-status-warning/20 text-status-warning' :
                              'bg-status-success/20 text-status-success'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-medium text-neutral-grey truncate">{formatDate(task.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-lg text-neutral-grey opacity-0 group-hover:opacity-100 hover:text-status-error hover:bg-status-error/5 transition-all duration-300 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
