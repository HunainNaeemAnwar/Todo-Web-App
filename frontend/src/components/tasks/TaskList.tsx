import React, { useMemo } from "react";
import { Task } from "@/types/task";
import TaskItem from "./TaskItem";
import { Sparkles } from "lucide-react";

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-6 rounded-2xl mx-auto max-w-sm">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">{emptyMessage}</p>
            <p className="text-gray-500 text-sm mt-2">Add a new task to get started</p>
          </div>
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
