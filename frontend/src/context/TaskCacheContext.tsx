"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import { Task } from "@/types/task";
import { tasksService } from "@/services/tasks";

interface TaskCacheContextType {
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  getTask: (taskId: string) => Task | undefined;
}

const TaskCacheContext = createContext<TaskCacheContextType | null>(null);

const CACHE_DURATION = 5 * 60 * 1000;

export function TaskCacheProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const initializedRef = useRef(false);

  const refreshTasks = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const taskData = await tasksService.getTasks();
        if (taskData !== null) {
          setTasks(taskData);
          setLastFetched(Date.now());
        }
      } finally {
        setLoading(false);
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = fetchTasks();
    return refreshPromiseRef.current;
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const getTask = useCallback((taskId: string) => 
    tasks.find((task) => task.id === taskId),
    [tasks]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const shouldRefresh = !lastFetched || Date.now() - lastFetched > CACHE_DURATION;
    if (shouldRefresh) {
      refreshTasks();
    }
  }, [lastFetched, refreshTasks]);

  const value = useMemo(() => ({
    tasks,
    loading,
    refreshTasks,
    addTask,
    updateTask,
    removeTask,
    getTask,
  }), [tasks, loading, refreshTasks, addTask, updateTask, removeTask, getTask]);

  return <TaskCacheContext.Provider value={value}>{children}</TaskCacheContext.Provider>;
}

export function useTaskCache() {
  const context = useContext(TaskCacheContext);
  if (!context) {
    throw new Error("useTaskCache must be used within a TaskCacheProvider");
  }
  return context;
}
