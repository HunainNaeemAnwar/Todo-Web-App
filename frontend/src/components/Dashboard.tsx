"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../contexts/TaskContext";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import TaskFilterBar, { FilterType } from "./tasks/TaskFilterBar";
import { LogOut, RefreshCw } from "lucide-react";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, loading, error, fetchTasks, refreshTasks } = useTasks();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Initialize tasks when component mounts or filter changes
  useEffect(() => {
    if (user) {
      fetchTasks(activeFilter);
    }
  }, [user, activeFilter, fetchTasks]); // Added fetchTasks to dependency array

  // No need to filter tasks client-side anymore since backend handles it
  const filteredTasks = tasks;

  // Calculate task counts for each filter type to display in the filter bar
  const calculateTaskCounts = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      all: tasks.length,
      active: tasks.filter(task => !task.completed).length,
      completed: tasks.filter(task => task.completed).length,
      high: tasks.filter(task => task.priority === "high").length,
      medium: tasks.filter(task => task.priority === "medium").length,
      low: tasks.filter(task => task.priority === "low").length,
      today: tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate >= today && dueDate < tomorrow;
      }).length,
      tomorrow: tasks.filter(task => {
        if (!task.due_date) return false;
        const dueTomorrow = new Date(task.due_date);
        return dueTomorrow >= tomorrow && dueTomorrow < new Date(tomorrow.getTime() + 86400000);
      }).length,
      week: tasks.filter(task => {
        if (!task.due_date) return false;
        const dueWeek = new Date(task.due_date);
        return dueWeek >= today && dueWeek < weekEnd;
      }).length,
      overdue: tasks.filter(task => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < now && !task.completed;
      }).length,
      "no due date": tasks.filter(task => !task.due_date).length,
      work: tasks.filter(task => task.category === "work").length,
      personal: tasks.filter(task => task.category === "personal").length,
      study: tasks.filter(task => task.category === "study").length,
      health: tasks.filter(task => task.category === "health").length,
      finance: tasks.filter(task => task.category === "finance").length,
    };
  };

  const taskCounts = calculateTaskCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Todo Manager</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name || user?.email}!</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Task Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
            <TaskForm />
          </div>

          {/* Task List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Your Tasks ({filteredTasks.length})
              </h2>
              <button
                onClick={() => refreshTasks(activeFilter)}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Refresh tasks"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
              <TaskFilterBar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                taskCounts={taskCounts}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <TaskList tasks={filteredTasks} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}