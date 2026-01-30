"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useChat } from "../context/ChatContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (title: string, description?: string) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Use ref to track the last fetch time and prevent excessive API calls
  const lastFetchTime = useRef<number>(0);
  const fetchCooldown = 2000; // 2 seconds cooldown between fetches (increased to reduce API calls)
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const makeRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!session?.token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }, [session?.token, apiUrl]);

  const fetchTasks = useCallback(async () => {
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime.current;

    // Only fetch if cooldown period has passed
    if (timeSinceLastFetch > fetchCooldown) {
      lastFetchTime.current = currentTime;

      try {
        setLoading(true);
        setError(null);
        const data = await makeRequest("/api/tasks/");
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }
  }, [makeRequest]);

  const createTask = async (title: string, description?: string): Promise<Task | null> => {
    try {
      const newTask = await makeRequest("/api/tasks/", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'completed'>>): Promise<Task | null> => {
    try {
      const updatedTask = await makeRequest(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      await makeRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      setTasks(prev => prev.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      return false;
    }
  };

  const refreshTasks = useCallback(() => {
    // Clear any existing timeout to debounce the refresh
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    // Set a new timeout to refresh after a delay
    refreshTimeout.current = setTimeout(() => {
      fetchTasks();
    }, 500); // 500ms delay to debounce rapid refresh calls
  }, [fetchTasks]);

  useEffect(() => {
    if (session?.token) {
      fetchTasks();
    } else {
      setTasks([]);
    }

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [session?.token, fetchTasks]);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      refreshTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}