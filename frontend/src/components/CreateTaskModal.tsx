'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, TaskCategory } from '../types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialTaskForm = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  category: 'personal' as TaskCategory,
  due_date: '',
};

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [isCreating, setIsCreating] = useState(false);
  const { createTask } = useTasks();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      onClose();
      setTaskForm(initialTaskForm);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
        <div className="glass-panel border-white/10 rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm md:max-w-md max-h-[90vh] bg-depth-950/80 backdrop-blur-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Create Directive
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mt-1 font-accent">System Input Entry</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl glass-panel glass-interactive border-white/5 text-secondary hover:text-accent-primary transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] font-accent">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Title</label>
              <input
                id="title"
                type="text"
                required
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full glass-input py-4 px-5 text-sm font-bold"
                placeholder="What needs to be achieved?"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Description</label>
              <textarea
                id="description"
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full glass-input py-4 px-5 resize-none text-sm"
                placeholder="Additional operational details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                  className="w-full glass-input py-4 px-5 text-xs font-bold uppercase tracking-widest bg-depth-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Category</label>
                <select
                  value={taskForm.category}
                  onChange={e => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
                  className="w-full glass-input py-4 px-5 text-xs font-bold uppercase tracking-widest bg-depth-900"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="shopping">Shopping</option>
                  <option value="health">Health</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Target Date</label>
              <input
                id="due_date"
                type="date"
                value={taskForm.due_date}
                onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full glass-input py-4 px-5 text-xs font-bold uppercase tracking-widest bg-depth-900"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full glass-btn glass-btn-primary py-4 font-bold uppercase tracking-[0.2em] text-xs mt-4"
            >
              {isCreating ? 'Processing...' : 'Commit Directive'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
