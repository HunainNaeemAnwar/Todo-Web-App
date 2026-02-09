import { apiClient } from '../lib/axiosConfig';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}


export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  streak_current: number;
  streak_best: number;
  avg_tasks_per_day: number;
  weekly_activity: WeeklyActivity[];
  created_at: string;
}

export interface WeeklyActivity {
  week: string;
  mon?: number;
  tue?: number;
  wed?: number;
  thu?: number;
  fri?: number;
  sat?: number;
  sun?: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  task_id?: string;
  read: boolean;
  created_at: string;
}

export interface NotificationList {
  notifications: Notification[];
  next_cursor?: string;
  total_count: number;
}

export interface NotificationPreferences {
  notify_due_soon: boolean;
  notify_overdue: boolean;
  notify_streaks: boolean;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/user/profile');
    return response.data;
  },

  async updateProfile(name: string): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/user/profile', {
      name,
    });
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/user/stats');
    return response.data;
  },

  async getNotifications(
    limit: number = 20,
    cursor?: string
  ): Promise<NotificationList> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
      params.append('cursor', cursor);
    }
    const response = await apiClient.get<NotificationList>(
      `/user/notifications?${params.toString()}`
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(
      '/notifications/unread-count'
    );
    return response.data.unread_count;
  },

  async triggerNotificationCheck(): Promise<void> {
    await apiClient.post('/notifications/check', {});
  },

  async markNotificationRead(
    notificationId: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.put<{ success: boolean }>(
      `/user/notifications/${notificationId}/read`
    );
    return response.data;
  },

  async markAllNotificationsRead(): Promise<{
    success: boolean;
    marked_count: number;
  }> {
    const response = await apiClient.put<{
      success: boolean;
      marked_count: number;
    }>('/user/notifications/read-all');
    return response.data;
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>(
      '/user/notifications/preferences'
    );
    return response.data;
  },

  async updateNotificationPreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await apiClient.put<NotificationPreferences>(
      '/user/notifications/preferences',
      prefs
    );
    return response.data;
  },
};

export default userService;
