import React, { useState, useCallback, memo } from "react";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: { id: string; completed: boolean }) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem = memo(({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = useCallback(() => {
    onToggleComplete({ id: task.id, completed: !task.completed });
  }, [task.id, task.completed, onToggleComplete]);

  const handleDelete = useCallback(async () => {
    if (confirm("Delete this task?")) {
      setIsDeleting(true);
      await onDelete(task.id);
    }
  }, [task.id, onDelete]);

  const handleEdit = useCallback(() => onEdit(task), [task, onEdit]);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "";
    }
  }, []);

  return (
    <div className={`rounded-xl border transition-all duration-200 hover:shadow-md p-5 ${
      task.completed
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50'
        : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
    }`}>
      <div className="flex items-start">
        <button
          onClick={handleToggle}
          className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-teal-500 hover:bg-teal-50'
          }`}
        >
          {task.completed && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="ml-4 flex-1 min-w-0">
          <h3 className={`text-lg font-semibold truncate ${
            task.completed
              ? 'text-gray-500 line-through'
              : task.priority === 'high'
                ? 'text-red-600'
                : task.priority === 'medium'
                  ? 'text-orange-600'
                  : 'text-teal-700'
          }`}>
            {task.title}
          </h3>

          {task.description && (
            <p className={`mt-2 text-sm truncate ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {task.priority && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : task.priority === 'medium'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            )}

            {task.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </span>
            )}

            {task.due_date && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                new Date(task.due_date) < new Date() && !task.completed
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
              }`}>
                Due: {formatDate(task.due_date)}
              </span>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span className="ml-3">Updated: {formatDate(task.updated_at)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200"
            title="Edit task"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDeleting
                ? 'text-gray-400'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            title="Delete task"
          >
            {isDeleting ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = "TaskItem";
export default TaskItem;
