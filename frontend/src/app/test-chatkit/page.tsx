"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatTestPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Not authenticated</h2>
          <p className="text-gray-600">Please sign in to use the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ChatKit Test Page</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Chat Container</h2>
          <div className="h-[600px]">
            <ChatContainer className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}