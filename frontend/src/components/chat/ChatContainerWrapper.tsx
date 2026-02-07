"use client";

import React, { useState, useEffect } from 'react';
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
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Establishing chat session...</p>
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
    <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Preparing AI assistant...</p>
      </div>
    </div>
  );
};

export default ChatContainerWrapper;