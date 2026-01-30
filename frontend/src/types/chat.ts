export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatInvocation {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  conversation_id?: string;
  message: string;
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
  messages: ChatMessage[];
  tool_calls?: string[];
}

export interface ChatKitConfig {
  api: {
    url: string;
    domainKey: string;
  };
  theme?: {
    colorScheme?: 'light' | 'dark';
    radius?: 'none' | 'small' | 'medium' | 'round' | 'large';
    color?: {
      accent?: {
        primary?: string;
        level?: number;
      };
    };
  };
  header?: {
    enabled?: boolean;
    title?: string;
  };
  history?: {
    enabled?: boolean;
    showDelete?: boolean;
  };
  startScreen?: {
    greeting?: string;
    prompts?: { label: string; prompt: string; icon?: string }[];
  };
  composer?: {
    placeholder?: string;
  };
  onClientTool?: (invocation: ChatInvocation) => Promise<{ success: boolean }>;
  onError?: (error: { error: unknown }) => void;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
  message?: string;
}

export interface TaskOperationResponse {
  success: boolean;
  task?: Task;
  message: string;
}
