"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ChatWrapper from '@/components/chat/ChatWrapper';
import { SidebarLayout } from '@/components/SidebarLayout';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  if (!loading && !user) {
    router.push('/?showLogin=true');
    return null;
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
            AI Task Assistant
          </h1>
          <p className="text-text-secondary">
            Manage your tasks using natural language. Ask me to add, view, complete, or update tasks.
          </p>
        </div>

        <div className="glass-effect rounded-2xl overflow-hidden">
          <div className="h-[calc(100vh-250px)] min-h-[500px]">
            <ChatWrapper className="h-full" />
          </div>
        </div>

        <div className="mt-6 glass-effect rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Quick Tips:</h3>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• &quot;Add buy groceries&quot; - Create a new task</li>
            <li>• &quot;Show me my tasks&quot; - View all tasks</li>
            <li>• &quot;Mark task 1 as complete&quot; - Complete a task</li>
            <li>• &quot;Delete task 2&quot; - Remove a task</li>
            <li>• &quot;Update task 3 to call mom tonight&quot; - Edit a task</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
}
