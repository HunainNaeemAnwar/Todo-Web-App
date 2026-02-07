import { apiClient } from '../lib/axiosConfig';

export interface ProductivityDataPoint {
  date: string;
  created: number;
  completed: number;
}

export interface WeeklyActivityDataPoint {
  week: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface ProductivityResponse {
  period: string;
  data: ProductivityDataPoint[];
}

export interface WeeklyActivityResponse {
  weeks: number;
  activity: WeeklyActivityDataPoint[];
}

export const analyticsService = {
  async getProductivityData(period: 'week' | 'month' | 'quarter' = 'week'): Promise<ProductivityResponse> {
    const response = await apiClient.get<ProductivityResponse>(`/analytics/productivity?period=${period}`);
    return response.data;
  },

  async getWeeklyActivity(weeks: number = 8): Promise<WeeklyActivityResponse> {
    const response = await apiClient.get<WeeklyActivityResponse>(`/analytics/weekly-activity?weeks=${weeks}`);
    return response.data;
  },

  async exportToCsv(): Promise<{ filename: string; content: string }> {
    const response = await apiClient.get<{ filename: string; content: string }>('/analytics/export/csv');
    return response.data;
  },

  downloadCsv(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};

export default analyticsService;
