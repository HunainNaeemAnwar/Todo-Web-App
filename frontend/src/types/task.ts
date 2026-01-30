export type TaskPriority = "high" | "medium" | "low";
export type TaskCategory = "work" | "personal" | "study" | "health" | "finance";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string;
}