"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { Task, TaskCreate, TaskUpdate } from "../types/task";
import { apiClient } from "../lib/axiosConfig";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filter?: string) => Promise<void>;
  createTask: (taskData: TaskCreate) => Promise<Task | null>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: (filter?: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Use ref to track the last fetch time and prevent excessive API calls
  const lastFetchTime = useRef<number>(0);
  const fetchCooldown = 2000; // 2 seconds cooldown between fetches
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = useCallback(async (filter?: string) => {
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime.current;

    // Only fetch if cooldown period has passed
    if (timeSinceLastFetch > fetchCooldown) {
      lastFetchTime.current = currentTime;

      try {
        setLoading(true);
        setError(null);
        const endpoint = filter ? `/tasks?status=${encodeURIComponent(filter)}` : "/tasks";
        const response = await apiClient.get(endpoint);
        setTasks(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const createTask = async (taskData: TaskCreate): Promise<Task | null> => {
    try {
      const response = await apiClient.post("/tasks", taskData);
      const newTask = response.data;
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      return null;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate): Promise<Task | null> => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, updates);
      const updatedTask = response.data;
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      return false;
    }
  };

  const refreshTasks = useCallback((filter?: string) => {
    // Clear any existing timeout to debounce the refresh
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    // Set a new timeout to refresh after a delay
    refreshTimeout.current = setTimeout(() => {
      fetchTasks(filter);
    }, 500); // 500ms delay to debounce rapid refresh calls
  }, [fetchTasks]);

  useEffect(() => {
    if (user) {
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
  }, [user, fetchTasks]);

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