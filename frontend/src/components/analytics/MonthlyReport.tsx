'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Calendar, Target, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/axiosConfig';

interface MonthlyReportProps {
  userId?: string;
}

export function MonthlyReport({ userId }: MonthlyReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/analytics/report/monthly`);
        setReport(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [userId]);

  if (loading) {
    return <div className="glass-effect rounded-2xl p-6 animate-pulse">Loading...</div>;
  }

  if (error || !report) {
    return <div className="glass-effect rounded-2xl p-6 text-error">Error loading report</div>;
  }

  const { summary, daily_breakdown } = report;

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-accent-primary" />
        <h3 className="text-lg font-display font-bold text-text-primary">Monthly Report</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ReportStat
          icon={<Target className="w-4 h-4" />}
          label="Tasks Created"
          value={summary.tasks_created}
          color="text-accent-primary"
        />
        <ReportStat
          icon={<CheckCircle className="w-4 h-4" />}
          label="Tasks Completed"
          value={summary.tasks_completed}
          color="text-success"
        />
        <ReportStat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Completion Rate"
          value={`${summary.completion_rate}%`}
          color="text-text-primary"
        />
        <ReportStat
          icon={<Calendar className="w-4 h-4" />}
          label="Avg Daily"
          value={summary.avg_daily_completed}
          color="text-warning"
        />
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Daily Trend (Last 30 Days)</h4>
        <div className="h-32 flex items-end gap-1">
          {daily_breakdown?.slice(-14).map((day: any, index: number) => {
            const maxVal = Math.max(...daily_breakdown.map((d: any) => d.completed), 1);
            const height = Math.max((day.completed / maxVal) * 100, 5);
            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-accent-primary to-accent-secondary rounded-t"
                style={{ height: `${height}%` }}
                title={`${day.date}: ${day.completed} completed`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{daily_breakdown?.[0]?.date || 'N/A'}</span>
          <span>{daily_breakdown?.[daily_breakdown.length - 1]?.date || 'N/A'}</span>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Report generated: {new Date(report.generated_at).toLocaleString()}
      </p>
    </div>
  );
}

interface ReportStatProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

function ReportStat({ icon, label, value, color }: ReportStatProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className={`${color} flex justify-center mb-1`}>{icon}</div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}
