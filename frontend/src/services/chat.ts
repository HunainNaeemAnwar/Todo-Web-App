import axios from 'axios';
import type { ChatRequest, ChatResponse, Conversation, ChatMessage } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/', request);
    return response.data;
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/chat/conversations');
    return response.data;
  },

  async getConversationMessages(conversationId: string): Promise<{ messages: ChatMessage[] }> {
    const response = await api.get<{ messages: ChatMessage[] }>(`/chat/conversations/${conversationId}`);
    return response.data;
  },
};

export default chatService;
