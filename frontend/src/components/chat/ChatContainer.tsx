"use client";

import React, { useState, useEffect, useCallback, useRef, memo, useSyncExternalStore } from 'react';
import { useChat } from '@/context/ChatContext';
import { useTasks } from '@/context/TaskContext';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const subscribe = () => () => {};

interface ChatContainerProps {
  className?: string;
  onReady?: () => void;
}

const ChatContainerComponent = ({ className, onReady }: ChatContainerProps) => {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [scriptStatus, setScriptStatus] = useState<'pending' | 'ready' | 'error'>(
    typeof window !== 'undefined' && window.customElements?.get('openai-chatkit') ? 'ready' : 'pending'
  );
  const { session, triggerRefresh, customFetch, startConversation, setRefreshTasks } = useChat();
  const taskContext = useTasks();
  const refreshTasks = taskContext.refreshTasks;

  const apiConfig = React.useMemo(() => ({
    url: `${process.env.NEXT_PUBLIC_CHATKIT_API_URL || '/api/chatkit'}`,
    domainKey: session?.domain_key || process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
    fetch: customFetch,
    uploadStrategy: {
      type: "direct" as const,
      uploadUrl: `${process.env.NEXT_PUBLIC_CHATKIT_API_URL || '/api/chatkit'}/upload`,
    },
  }), [session?.domain_key, customFetch]);

  const themeConfig = React.useMemo(() => "light" as const, []);

  const startScreenConfig = React.useMemo(() => ({
    greeting: "Hi! I'm your AI Task Assistant. How can I help?",
    prompts: [
      { label: "View Tasks", prompt: "Show me my pending tasks" },
      { label: "Add Task", prompt: "Help me add a new task" },
      { label: "Get Help", prompt: "What can you help me with?" },
    ],
  }), []);

  const headerConfig = React.useMemo(() => ({
    enabled: true,
    title: { enabled: true, text: "AI Task Assistant" },
  }), []);

  const composerConfig = React.useMemo(() => ({
    placeholder: "Ask me to manage your tasks...",
    attachments: { enabled: false },
  }), []);

  const historyConfig = React.useMemo(() => ({
    enabled: true,
    showDelete: true,
    showRename: true,
  }), []);

  const getPageContext = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const mainContent = document.querySelector('article') || document.querySelector('main') || document.body;
    const headings = Array.from(mainContent?.querySelectorAll('h1, h2, h3') || []).slice(0, 5).map(h => h.textContent?.trim()).filter(Boolean).join(', ');
    return { url: window.location.href, title: document.title, path: window.location.pathname, description: metaDescription, headings };
  }, []);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!hasInitializedRef.current && isClient && scriptStatus === 'ready' && session?.user_id) {
      console.log('[ChatContainer] Initializing chat session...');
      startConversation().catch(error => {
        console.error('Failed to start conversation:', error);
      });
      hasInitializedRef.current = true;
    }
  }, [startConversation, isClient, scriptStatus, session?.user_id]);

  useEffect(() => {
    if (!isClient || scriptStatus !== 'pending') return;

    if (window.customElements?.get('openai-chatkit')) {
      console.log('[ChatContainer] ChatKit already loaded');
      queueMicrotask(() => setScriptStatus('ready'));
      return;
    }

    const loadChatKitScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector('script[src*="chatkit"]')) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
        script.async = true;
        script.onload = () => {
          console.log('[ChatContainer] ChatKit script loaded successfully');
          resolve();
        };
        script.onerror = (error) => {
          console.error('[ChatContainer] Failed to load ChatKit script:', error);
          reject(new Error('Failed to load ChatKit script'));
        };
        document.head.appendChild(script);
      });
    };

    const checkAndLoad = async () => {
      try {
        await loadChatKitScript();
        let attempts = 0;
        const maxAttempts = 100;
        while (!window.customElements?.get('openai-chatkit') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (window.customElements?.get('openai-chatkit')) {
          queueMicrotask(() => setScriptStatus('ready'));
        } else {
          console.warn('[ChatContainer] ChatKit custom element not registered');
          queueMicrotask(() => setScriptStatus('error'));
        }
      } catch (error) {
        console.error('[ChatContainer] Error loading ChatKit:', error);
        queueMicrotask(() => setScriptStatus('error'));
      }
    };

    checkAndLoad();
  }, [isClient, scriptStatus]);

  useEffect(() => {
    if (refreshTasks && setRefreshTasks) {
      setRefreshTasks(refreshTasks);
    }
  }, [setRefreshTasks, refreshTasks]);

  if (!isClient) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  if (scriptStatus === 'error') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-red-50 p-4 ${className}`}>
        <div className="text-red-600 text-center">
          <div className="font-semibold text-lg">AI Assistant Unavailable</div>
          <div className="text-sm mt-2 mb-4">Unable to load ChatKit. Please check backend server.</div>
          <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {scriptStatus === 'ready' && session?.id ? (
          <ChatKitInner
            apiConfig={apiConfig}
            themeConfig={themeConfig}
            startScreenConfig={startScreenConfig}
            headerConfig={headerConfig}
            composerConfig={composerConfig}
            historyConfig={historyConfig}
            triggerRefresh={triggerRefresh}
            onReady={onReady}
            session={session}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
            {!session ? (
              <p className="text-gray-600">Establishing chat session...</p>
            ) : (
              <p className="text-gray-600">Loading AI assistant...</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Please ensure you're logged in</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatKitInnerProps {
  apiConfig: any;
  themeConfig: any;
  startScreenConfig: any;
  headerConfig: any;
  composerConfig: any;
  historyConfig: any;
  triggerRefresh: () => void;
  onReady?: () => void;
  session: any;
}

const ChatKitInner = ({
  apiConfig,
  themeConfig,
  startScreenConfig,
  headerConfig,
  composerConfig,
  historyConfig,
  triggerRefresh,
  onReady,
  session
}: ChatKitInnerProps) => {
  const { control } = useChatKit({
    api: apiConfig,
    theme: themeConfig,
    startScreen: startScreenConfig,
    header: headerConfig,
    composer: composerConfig,
    history: historyConfig,
  });

  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (control && !hasTriggeredRef.current) {
      triggerRefresh();
      hasTriggeredRef.current = true;
    }
  }, [control, triggerRefresh]);

  useEffect(() => {
    if (control && onReady) {
      onReady();
    }
  }, [control, onReady]);

  return <ChatKit control={control} className="h-full w-full" key={`chatkit-${session.id}`} />;
};

export default memo(ChatContainerComponent);
