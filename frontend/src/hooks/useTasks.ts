import { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../types/task';
import { tasksService } from '../services/tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (filter?: string) => {
    try {
      setLoading(true);
      const data = await tasksService.getTasks(filter);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await tasksService.createTask(taskData);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
      throw err;
    }
  };

  const updateTask = async (id: string, taskData: TaskUpdate) => {
    try {
      const updatedTask = await tasksService.updateTask(id, taskData);
      if (updatedTask) {
        setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      }
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
      throw err;
    }
  };

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await tasksService.toggleTaskCompletion(id, completed);
      if (updatedTask) {
        setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      }
      return updatedTask;
    } catch (err) {
      setError('Failed to toggle task completion');
      console.error(err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};