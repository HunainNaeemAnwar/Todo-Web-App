"use client";

import React, { memo } from "react";
import { useChat } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper";

const ChatModalComponent = () => {
  const { isOpen } = useChat();

  return (
    <div
      className={`fixed bottom-24 right-4 md:right-6 z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative w-80 md:w-[380px] h-[600px] md:h-[600px] max-h-[400px] md:max-h-[600px]">
        <ChatWrapper />
      </div>
    </div>
  );
};

export default memo(ChatModalComponent);
