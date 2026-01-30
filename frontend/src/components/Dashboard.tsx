"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../contexts/TaskContext";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import ChatWrapper from "./chat/ChatWrapper";
import { LogOut, MessageSquare, CheckSquare, Bot, RefreshCw } from "lucide-react";
import Link from "next/link";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, loading, error, refreshTasks } = useTasks();

  // Initialize tasks when component mounts
  useEffect(() => {
    if (user) {
      refreshTasks();
    }
  }, [user]); // Removed refreshTasks from dependency to prevent infinite loop

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms and Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
              <TaskForm />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Tasks ({tasks.length})
                </h2>
                <button
                  onClick={() => refreshTasks()}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Refresh tasks"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <TaskList tasks={tasks} loading={loading} />
            </div>
          </div>

          {/* Right Column - AI Chat Assistant */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 h-full">
              <div className="flex items-center mb-4">
                <Bot className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">AI Task Assistant</h2>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <ChatWrapper className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}