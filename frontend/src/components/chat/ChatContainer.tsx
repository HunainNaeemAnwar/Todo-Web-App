"use client";

import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { useTasks } from '@/contexts/TaskContext';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

interface ChatContainerProps {
  className?: string;
  onReady?: () => void;
}

const ChatContainerComponent = ({ className, onReady }: ChatContainerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<'pending' | 'ready' | 'error'>(
    typeof window !== 'undefined' && window.customElements?.get('openai-chatkit') ? 'ready' : 'pending'
  );
  const { session, triggerRefresh, customFetch } = useChat();
  const taskContext = useTasks();
  const refreshTasks = taskContext.refreshTasks;

  // Use refs to track the last refresh time and prevent excessive calls
  const lastRefreshTime = useRef<number>(0);
  const refreshCooldown = 2000; // 2 seconds cooldown between refreshes

  // Memoize configurations to prevent useChatKit from reinitializing
  const apiConfig = useMemo(() => ({
    url: `${process.env.NEXT_PUBLIC_CHATKIT_API_URL || '/api/chatkit'}`,
    domainKey: session?.domain_key || process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || '',
    // Use the custom fetch from ChatContext which handles auth properly
    fetch: customFetch,
  }), [session?.domain_key, customFetch]);

  const themeConfig = useMemo(() => "light" as const, []);

  const startScreenConfig = useMemo(() => ({
    greeting: "Hi! I'm your AI Task Assistant. How can I help?",
    prompts: [
      {
        label: "View Tasks",
        prompt: "Show me my pending tasks",
      },
      {
        label: "Add Task",
        prompt: "Help me add a new task",
      },
      {
        label: "Get Help",
        prompt: "What can you help me with?",
      },
    ],
  }), []);

  const headerConfig = useMemo(() => ({
    enabled: true,
    title: {
      enabled: true,
      text: "AI Task Assistant",
    },
  }), []);

  const composerConfig = useMemo(() => ({
    placeholder: "Ask me to manage your tasks...",
    attachments: {
      enabled: false, // Disabled until backend implements upload endpoint
    },
  }), []);

  const historyConfig = useMemo(() => ({
    enabled: true,
    showDelete: true,
    showRename: true,
  }), []);

  // Extract page context to provide to the AI assistant - memoize to prevent re-renders
  const getPageContext = useCallback(() => {
    if (typeof window === 'undefined') return {};

    const metaDescription = document.querySelector('meta[name="description"]')
      ?.getAttribute('content') || '';

    const mainContent = document.querySelector('article') ||
                       document.querySelector('main') ||
                       document.body;

    const headings = Array.from(mainContent?.querySelectorAll('h1, h2, h3') || [])
      .slice(0, 5)
      .map(h => h.textContent?.trim())
      .filter(Boolean)
      .join(', ');

    return {
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      description: metaDescription,
      headings: headings,
    };
  }, []);

  // Memoize metadata to prevent useChatKit from reinitializing
  const metadata = useMemo(() => ({
    pageContext: getPageContext(),
    userId: session?.user_id,
  }), [getPageContext, session?.user_id]);

  const { control } = useChatKit({
    api: apiConfig,
    theme: themeConfig,
    startScreen: startScreenConfig,
    header: headerConfig,
    composer: composerConfig,
    history: historyConfig,
  });

  const { setRefreshTasks } = useChat(); // Get the function to register refreshTasks with ChatContext

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Register refreshTasks separately to avoid dependency issues
  useEffect(() => {
    if (refreshTasks) {
      setRefreshTasks(refreshTasks);
    }
  }, [setRefreshTasks]); // Only depend on setRefreshTasks, not refreshTasks

  // Check script loading status
  useEffect(() => {
    if (!isClient || scriptStatus !== 'pending') return;

    if (window.customElements?.get('openai-chatkit')) {
      setScriptStatus('ready');
      return;
    }

    const checkElement = setInterval(() => {
      if (window.customElements?.get('openai-chatkit')) {
        setScriptStatus('ready');
        clearInterval(checkElement);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkElement);
      setScriptStatus('error');
    }, 10000);

    return () => clearInterval(checkElement);
  }, [isClient, scriptStatus]);

  // Only trigger chat refresh when the component mounts and control is available
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (control && scriptStatus === 'ready' && !hasTriggeredRef.current) {
      // Trigger refresh of chat messages without triggering task refresh
      triggerRefresh();
      hasTriggeredRef.current = true;
    }
  }, [control, scriptStatus, triggerRefresh]);

  // Call onReady callback when chat is ready
  useEffect(() => {
    if (isClient && control && scriptStatus === 'ready' && onReady) {
      onReady();
    }
  }, [isClient, control, scriptStatus, onReady]);

  // Handle loading state
  if (!isClient) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle script loading state
  if (scriptStatus === 'pending') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  // Handle script loading error
  if (scriptStatus === 'error') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-red-50 p-4 ${className}`}>
        <div className="text-red-600 text-center">
          <div className="font-semibold">Script Loading Error</div>
          <div className="text-sm mt-1">Failed to load AI assistant components</div>
          <button
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {scriptStatus === 'ready' && control && (
          <ChatKit
            control={control}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
};

export default memo(ChatContainerComponent);
