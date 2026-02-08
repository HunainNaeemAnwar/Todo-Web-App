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
        <div className="glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm md:max-w-md max-h-[90vh]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-[oklch(0.92_0.01_260)]">
              Create Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-neutral-grey hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div>
              <input
                id="title"
                type="text"
                required
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full glass-input py-3 px-4"
                placeholder="Task title"
                autoFocus
              />
            </div>

            <div>
              <textarea
                id="description"
                value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full glass-input py-3 px-4 resize-none"
                placeholder="Description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-grey mb-2">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                  className="w-full glass-input py-3 px-4"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-grey mb-2">Category</label>
                <select
                  value={taskForm.category}
                  onChange={e => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
                  className="w-full glass-input py-3 px-4"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="shopping">Shopping</option>
                  <option value="health">Health</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-grey mb-2">Due Date</label>
              <input
                id="due_date"
                type="date"
                value={taskForm.due_date}
                onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full glass-input py-3 px-4"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 glass glass-interactive border-accent-primary/30 hover:border-accent-primary/60 disabled:opacity-50 font-medium text-[oklch(0.92_0.01_260)] mt-4"
            >
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
