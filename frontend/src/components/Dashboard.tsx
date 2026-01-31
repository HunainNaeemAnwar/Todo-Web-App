"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../contexts/TaskContext";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import TaskFilterBar, { FilterType } from "./tasks/TaskFilterBar";
import { LogOut, RefreshCw, Sun, Moon, Sparkles, Plus } from "lucide-react";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, loading, error, fetchTasks, refreshTasks } = useTasks();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [darkMode, setDarkMode] = useState(false);

  // Initialize tasks when component mounts or filter changes
  useEffect(() => {
    if (user) {
      fetchTasks(activeFilter);
    }
  }, [user, activeFilter, fetchTasks]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50'}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${darkMode ? 'opacity-10' : ''}`}></div>
        <div className={`absolute top-40 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${darkMode ? 'opacity-10' : ''}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${darkMode ? 'opacity-10' : ''}`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 backdrop-blur-md border-b transition-all duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent`}>
                  AI Todo Manager
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Welcome back, {user?.name || user?.email}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={signOut}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                }`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
              darkMode
                ? 'bg-white/5 border-gray-700 hover:bg-white/10'
                : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
            }`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
                  <div className="h-6 w-6 font-bold text-sm">{tasks.length}</div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tasks.length}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
              darkMode
                ? 'bg-white/5 border-gray-700 hover:bg-white/10'
                : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
            }`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-600'}`}>
                  <div className="h-6 w-6 font-bold text-sm">{tasks.filter(t => t.completed).length}</div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => t.completed).length}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
              darkMode
                ? 'bg-white/5 border-gray-700 hover:bg-white/10'
                : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
            }`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                  <div className="h-6 w-6 font-bold text-sm">{tasks.filter(t => !t.completed).length}</div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => !t.completed).length}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
              darkMode
                ? 'bg-white/5 border-gray-700 hover:bg-white/10'
                : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
            }`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'}`}>
                  <div className="h-6 w-6 font-bold text-sm">{tasks.filter(t => t.priority === 'high').length}</div>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Priority</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => t.priority === 'high').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Form */}
          <div className={`rounded-2xl backdrop-blur-sm border p-6 transition-all duration-300 hover:shadow-xl ${
            darkMode
              ? 'bg-white/5 border-gray-700 hover:bg-white/10'
              : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Task</h2>
              <div className="flex items-center space-x-2">
                <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                  AI Powered
                </div>
              </div>
            </div>
            <TaskForm />
          </div>

          {/* Task List */}
          <div className={`rounded-2xl backdrop-blur-sm border p-6 transition-all duration-300 hover:shadow-xl ${
            darkMode
              ? 'bg-white/5 border-gray-700 hover:bg-white/10'
              : 'bg-white/70 border-gray-200 hover:bg-white/90 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Tasks ({filteredTasks.length})
              </h2>
              <button
                onClick={() => refreshTasks(activeFilter)}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title="Refresh tasks"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
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
              <div className={`mb-4 p-4 rounded-lg border ${
                darkMode
                  ? 'bg-red-900/20 border-red-700 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <TaskList tasks={filteredTasks} loading={loading} />
          </div>
        </div>
      </div>

      {/* Floating action button for mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={() => document.getElementById('title')?.focus()}
          className={`p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 ${
            darkMode
              ? 'bg-teal-600 hover:bg-teal-500 text-white'
              : 'bg-teal-500 hover:bg-teal-400 text-white'
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}