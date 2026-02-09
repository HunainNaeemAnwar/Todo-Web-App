"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ChatContainer from './ChatContainer';

interface ChatContainerWrapperProps {
  className?: string;
  onReady?: () => void;
}

const ChatContainerWrapper: React.FC<ChatContainerWrapperProps> = ({ className, onReady }) => {
  const { session, startConversation, loading } = useChat();
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  // Attempt to initialize session when component mounts
  useEffect(() => {
    if (!hasAttemptedInit && !session) {
      startConversation();
      setHasAttemptedInit(true);
    }
  }, [hasAttemptedInit, session, startConversation]);

  // Render loading state while establishing session
  if (!session && loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center glass-panel border-white/5 bg-background ${className}`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto mb-4" />
          <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] font-accent">Establishing Intelligence...</p>
        </div>
      </div>
    );
  }

  // Only render the actual ChatContainer when session is available
  if (session) {
    return <ChatContainer className={className} onReady={onReady} />;
  }

  // Fallback for when no session is available
  return (
    <div className={`w-full h-full flex items-center justify-center glass-panel border-white/5 bg-background ${className}`}>
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto mb-4" />
        <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] font-accent">Preparing Neural Interface...</p>
      </div>
    </div>
  );
};

export default ChatContainerWrapper;