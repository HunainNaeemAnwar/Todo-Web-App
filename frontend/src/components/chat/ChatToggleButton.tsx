"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export default function ChatToggleButton() {
  const { isOpen, toggleChat } = useChat();
  const { user } = useAuth();

  // Only show the chat button if the user is logged in
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleChat();
        }}
        className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 group relative overflow-hidden ${
          isOpen
            ? "glass-panel bg-white/5 hover:bg-white/10 scale-95 border-white/10"
            : "bg-accent-primary hover:scale-110"
        }`}
        aria-label={isOpen ? "Close AI Chat Assistant" : "Open AI Chat Assistant"}
      >
        {/* Button reflection detail */}
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        )}

        {isOpen ? (
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-foreground relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-depth-950 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 glass-panel bg-depth-950/90 text-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-white/10 backdrop-blur-md translate-x-4 group-hover:translate-x-0 font-accent">
          {isOpen ? "Close Intelligence" : "AI Assistant"}
        </span>
      </button>
    </div>
  );
}
