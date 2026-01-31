import React, { useMemo } from "react";
import { Task } from "@/types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: { id: string; completed: boolean }) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  loading?: boolean;
}

export default function TaskList({ tasks, onToggleComplete, onDelete, onEdit, loading = false }: TaskListProps) {
  const emptyMessage = useMemo(() => {
    if (tasks.length === 0 && !loading) return 'No tasks yet. Create your first task!';
    if (loading) return 'Loading tasks...';
    return 'No tasks match the current filter.';
  }, [tasks.length, loading]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
