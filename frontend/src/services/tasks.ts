import api from './api';
import { Task, TaskCreate, TaskUpdate } from '../types/task';

const pendingRequests = new Map<string, Promise<Task[]>>();

export const tasksService = {
  async getTasks(filter?: string): Promise<Task[]> {
    const url = filter ? `/api/tasks/?status=${encodeURIComponent(filter)}` : '/api/tasks/';

    if (pendingRequests.has(url)) {
      return pendingRequests.get(url)!;
    }

    const promise = api.get<Task[]>(url).then((result) => {
      pendingRequests.delete(url);
      return result || [];
    });

    pendingRequests.set(url, promise);
    return promise;
  },

  async createTask(taskData: TaskCreate): Promise<Task> {
    const result = await api.post<Task>('/api/tasks/', taskData);
    if (!result) throw new Error('Failed to create task');
    return result;
  },

  async getTaskById(id: string): Promise<Task | null> {
    return api.get<Task>(`/api/tasks/${id}/`);
  },

  async updateTask(id: string, taskData: TaskUpdate): Promise<Task | null> {
    return api.put<Task>(`/api/tasks/${id}/`, taskData);
  },

  async deleteTask(id: string): Promise<boolean> {
    const result = await api.delete<{ success: boolean }>(`/api/tasks/${id}/`);
    return !!result;
  },

  async toggleTaskCompletion(id: string, completed: boolean): Promise<Task | null> {
    return api.patch<Task>(`/api/tasks/${id}/complete`, { completed });
  },
};
