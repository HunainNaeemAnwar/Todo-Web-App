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
import { TaskPriority, TaskCategory } from '../types/task';

interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string;
}

const initialTaskForm: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'personal',
  due_date: '',
};

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormData>(initialTaskForm);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { tasks, loading, error, createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const { user, loading: authLoading } = useAuth();

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setIsCreating(true);
    try {
      await createTask({
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        category: taskForm.category,
        due_date: taskForm.due_date || undefined,
      });
      setShowCreateModal(false);
      setTaskForm(initialTaskForm);
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityLabel = (priority?: TaskPriority) => {
    if (!priority) return 'No priority';
    return `${priority} priority`;
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

  const isOverdue = (task: typeof tasks[0]) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setTimeout(() => setIsRefreshing(false), 500); // Minimum spin time for visual feedback
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 glass-effect border border-error/30 rounded-xl flex items-center gap-3 text-error">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
        <button onClick={() => refreshTasks()} className="ml-auto text-sm underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total Tasks</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="glass-effect rounded-xl p-4">
          <p className="text-text-secondary text-sm">Completed</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.completed}</p>
        </div>
        <div className="glass-effect rounded-xl p-4">
          <p className="text-text-secondary text-sm">Pending</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.pending}</p>
        </div>
        <div className="glass-effect rounded-xl p-4">
          <p className="text-text-secondary text-sm">Overdue</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.overdue}</p>
        </div>
      </div>

      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-text-primary">Your Tasks</h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
              title="Refresh tasks"
            >
              <RefreshCw className={`w-4 h-4 text-text-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-2 px-4 rounded-lg hover:from-accent-secondary hover:to-accent-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 glass-effect text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary w-64"
          />
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">
              {searchTerm ? 'No tasks match your search' : 'No tasks yet. Create your first task!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border ${
                  task.completed
                    ? 'glass-effect border-success/30'
                    : isOverdue(task)
                      ? 'glass-effect border-error/30'
                      : task.priority === 'high'
                        ? 'glass-effect border-error/30'
                        : task.priority === 'medium'
                          ? 'glass-effect border-warning/30'
                          : 'glass-effect'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-success border-success'
                          : 'border-border glass-effect hover:border-accent-primary'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? 'text-text-secondary/60' : 'text-text-secondary'}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {task.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-error/20 text-error border border-error/30'
                              : task.priority === 'medium'
                                ? 'bg-warning/20 text-warning border border-warning/30'
                                : 'bg-success/20 text-success border border-success/30'
                          }`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        )}
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </span>
                        {isOverdue(task) && (
                          <span className="text-xs px-2 py-1 rounded-full bg-error/20 text-error border border-error/30">Overdue</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-error glass-effect"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-effect rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-text-primary">Create New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 glass-effect text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-4 py-2 glass-effect text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-4 py-2 glass-effect text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={e => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
                    className="w-full px-4 py-2 glass-effect text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full px-4 py-2 glass-effect text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 glass-effect text-text-primary rounded-lg hover:bg-accent-light-orange">Cancel</button>
                <button type="submit" disabled={isCreating || !taskForm.title.trim()} className="flex-1 bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-2 px-4 rounded-lg hover:from-accent-secondary hover:to-accent-primary disabled:opacity-50 flex items-center justify-center">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
