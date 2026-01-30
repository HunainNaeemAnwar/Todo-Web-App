"use client";

import { useState } from "react";
import { useTasks } from "../contexts/TaskContext";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
}

function TaskItem({ task, onEdit, onDelete, onToggle }: TaskItemProps) {
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggle(task.id, !task.completed)}
              className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {task.completed && <Check className="h-3 w-3" />}
            </button>
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit task"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
}

export function TaskList({ tasks, loading }: TaskListProps) {
  const { updateTask, deleteTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;

    await updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription,
    });
    setEditingTask(null);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await updateTask(id, { completed });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first task above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id}>
          {editingTask?.id === task.id ? (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Task title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Task description"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <TaskItem
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </div>
      ))}
    </div>
  );
}