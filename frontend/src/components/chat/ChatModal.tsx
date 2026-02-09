"use client";

import React, { memo } from "react";
import { useChat } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper";

const ChatModalComponent = () => {
  const { isOpen } = useChat();

  return (
    <div
      className={`fixed bottom-24 right-4 md:right-8 z-50 transition-all duration-700 ease-cinematic ${
        isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="glass-panel border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative w-[calc(100vw-32px)] md:w-[420px] h-[600px] md:h-[700px] max-h-[80vh] bg-depth-950/80 backdrop-blur-2xl">
        <ChatWrapper />
      </div>
    </div>
  );
};

export default memo(ChatModalComponent);
