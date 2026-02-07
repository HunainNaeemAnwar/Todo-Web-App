'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Calendar, Flame, Target } from 'lucide-react';
import { apiClient } from '@/lib/axiosConfig';

interface WeeklyReportProps {
  userId?: string;
}

export function WeeklyReport({ userId }: WeeklyReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/analytics/report/weekly`);
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
        <Calendar className="w-5 h-5 text-accent-primary" />
        <h3 className="text-lg font-display font-bold text-text-primary">Weekly Report</h3>
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
          icon={<Flame className="w-4 h-4" />}
          label="Current Streak"
          value={summary.streak_current}
          color="text-warning"
        />
      </div>

      {daily_breakdown && (
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Daily Breakdown</h4>
          <div className="grid grid-cols-7 gap-2">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
              <div key={day} className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-text-secondary uppercase">{day.slice(0, 2)}</p>
                <p className="text-lg font-bold text-text-primary">
                  {(daily_breakdown as Record<string, number>)[day] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">
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
