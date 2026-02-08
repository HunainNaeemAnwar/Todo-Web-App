'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Calendar, Flame, Target } from 'lucide-react';
import { apiClient } from '@/lib/axiosConfig';

interface WeeklyReportProps {
  userId?: string;
}

interface ReportSummary {
  tasks_created: number;
  tasks_completed: number;
  completion_rate: number;
  streak_current: number;
}

interface DailyBreakdown {
  [key: string]: number;
}

interface WeeklyReportData {
  summary: ReportSummary;
  daily_breakdown: DailyBreakdown;
  generated_at: string;
}

export function WeeklyReport({ userId }: WeeklyReportProps) {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
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
    return <div className="glass-panel rounded-2xl p-8 animate-pulse text-neutral-grey text-xs font-black uppercase tracking-[0.2em]">Initializing Intelligence...</div>;
  }

  if (error || !report) {
    return (
      <div className="glass-panel rounded-2xl p-8 border-status-error/30 text-center">
        <p className="text-status-error font-bold uppercase tracking-widest text-xs">Analysis Failure</p>
      </div>
    );
  }

  const { summary, daily_breakdown } = report;

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 glass bg-accent-primary/10 border-accent-primary/20 rounded-xl">
          <Calendar className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">Weekly Intelligence</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-0.5">Efficiency analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <ReportStat
          icon={<Target className="w-4 h-4" />}
          label="Directives Set"
          value={summary.tasks_created}
          color="text-accent-primary"
        />
        <ReportStat
          icon={<CheckCircle className="w-4 h-4" />}
          label="Objectives Met"
          value={summary.tasks_completed}
          color="text-status-success"
        />
        <ReportStat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Yield Rate"
          value={`${summary.completion_rate}%`}
          color="text-text-primary"
        />
        <ReportStat
          icon={<Flame className="w-4 h-4" />}
          label="Current Streak"
          value={summary.streak_current}
          color="text-status-warning"
        />
      </div>

      {daily_breakdown && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-grey ml-1">Temporal Distribution</h4>
          <div className="grid grid-cols-7 gap-3">
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
              <div key={day} className="text-center p-4 glass-panel border-white/5 group hover:border-accent-primary/20 transition-all duration-500">
                <p className="text-[9px] font-black text-neutral-grey uppercase tracking-widest mb-2 group-hover:text-accent-primary transition-colors">{day}</p>
                <p className="text-xl font-display font-bold text-text-primary">
                  {(daily_breakdown as Record<string, number>)[day] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[9px] font-medium text-neutral-grey/40 mt-8 uppercase tracking-widest">
        Sync Signature: {new Date(report.generated_at).toLocaleString()}
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
    <div className="glass-panel border-white/5 p-4 text-center group hover:border-accent-primary/20 transition-all duration-500">
      <div className={`${color} flex justify-center mb-2 opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      <p className="text-2xl font-display font-bold text-text-primary tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-1">{label}</p>
    </div>
  );
}
