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
    <div className={`p-4 border rounded-lg shadow-sm ${task.completed ? 'bg-green-50' : 'bg-white'}`}>
      <div className="flex items-start">
        <input type="checkbox" checked={task.completed} onChange={handleToggle} className="mt-1 h-5 w-5 text-indigo-600 rounded" />
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h3>
          {task.description && <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>}
          <div className="mt-2 text-xs text-gray-500">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && <span className="ml-2">Updated: {formatDate(task.updated_at)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEdit} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
          <button onClick={handleDelete} disabled={isDeleting} className={`${isDeleting ? 'text-gray-400' : 'text-red-600 hover:text-red-900'} text-sm font-medium`}>
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
});

TaskItem.displayName = "TaskItem";
export default TaskItem;
