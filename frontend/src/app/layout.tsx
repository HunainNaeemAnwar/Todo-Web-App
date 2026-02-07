import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ChatLayoutClient from "@/components/chat/ChatLayoutClient";

export const metadata: Metadata = {
  title: "AI Conversational Todo",
  description: "Manage tasks with AI-powered conversations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          async
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <ChatLayoutClient>
                {children}
              </ChatLayoutClient>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


