"use client";

import React, { memo, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import ChatContainer from './ChatContainer';

interface ChatWrapperProps {
  className?: string;
  onReady?: () => void;
}

const ChatWrapperComponent = ({ className, onReady }: ChatWrapperProps) => {
  const { session: chatSession, loading: chatLoading, error: chatError, startConversation } = useChat();
  const { user, loading: authLoading } = useAuth();

  // Auto-start conversation when auth is ready
  useEffect(() => {
    if (!authLoading && user && !chatSession && !chatLoading && !chatError) {
      startConversation().catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[ChatWrapper] Failed to start conversation:', err);
        }
      });
    }
  }, [user, authLoading, chatSession, chatLoading, chatError, startConversation]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel p-8 bg-background ${className}`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto mb-4" />
          <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] font-accent">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel p-8 bg-background ${className}`}>
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-secondary/40" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Auth Required</h3>
          <p className="text-xs text-secondary font-accent uppercase tracking-widest leading-relaxed">Identity verification required to access intelligence protocols</p>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel p-8 bg-background ${className}`}>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-display font-bold text-status-error mb-2">Signal Interrupted</h3>
          <p className="text-xs text-secondary mb-8 font-accent uppercase tracking-widest">{chatError}</p>
          <div className="flex gap-4">
            <button
              className="flex-1 glass-btn glass-btn-primary py-3 text-[10px] font-bold uppercase tracking-widest font-accent"
              onClick={() => startConversation()}
            >
              Retry Link
            </button>
            <button
              className="flex-1 glass-btn py-3 text-[10px] font-bold uppercase tracking-widest font-accent"
              onClick={() => window.location.reload()}
            >
              Hard Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (chatLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel p-8 bg-background ${className}`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto mb-4" />
          <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] font-accent">Initializing Assistant...</p>
          <p className="text-[9px] text-secondary/40 mt-2 uppercase tracking-tighter font-accent">Syncing with neural core</p>
        </div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel p-8 bg-background ${className}`}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent-primary animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Synchronizing</h3>
          <p className="text-xs text-secondary font-accent uppercase tracking-widest">Establishing secure session</p>
        </div>
      </div>
    );
  }

  return (
    <ChatContainer
      className={className}
      onReady={onReady}
    />
  );
};

export default memo(ChatWrapperComponent);