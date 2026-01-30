"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    router.push('/login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Task Assistant</h1>
          <p className="text-gray-600">
            Manage your tasks using natural language. Ask me to add, view, complete, or update tasks.
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <ChatContainer className="h-full" />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• "Add buy groceries" - Create a new task</li>
            <li>• "Show me my tasks" - View all tasks</li>
            <li>• "Mark task 1 as complete" - Complete a task</li>
            <li>• "Delete task 2" - Remove a task</li>
            <li>• "Update task 3 to call mom tonight" - Edit a task</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
