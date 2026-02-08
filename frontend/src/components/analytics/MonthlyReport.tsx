'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Calendar, Target, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/axiosConfig';

interface ReportSummary {
  tasks_created: number;
  tasks_completed: number;
  completion_rate: number;
  avg_daily_completed: number;
}

interface DailyBreakdown {
  date: string;
  completed: number;
}

interface MonthlyReportData {
  summary: ReportSummary;
  daily_breakdown: DailyBreakdown[];
  generated_at: string;
}

interface MonthlyReportProps {
  userId?: string;
}

export function MonthlyReport({ userId }: MonthlyReportProps) {
  const [report, setReport] = useState<MonthlyReportData | null>(null);
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
    return <div className="glass-panel rounded-2xl p-8 animate-pulse text-neutral-grey text-xs font-black uppercase tracking-[0.2em]">Synthesizing Monthly Data...</div>;
  }

  if (error || !report) {
    return (
      <div className="glass-panel rounded-2xl p-8 border-status-error/30 text-center">
        <p className="text-status-error font-bold uppercase tracking-widest text-xs">Intelligence Retrieval Failed</p>
      </div>
    );
  }

  const { summary, daily_breakdown } = report;

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 glass bg-accent-primary/10 border-accent-primary/20 rounded-xl">
          <BarChart3 className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">Monthly Intelligence</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-0.5">Extended performance review</p>
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
          icon={<Calendar className="w-4 h-4" />}
          label="Temporal Avg"
          value={summary.avg_daily_completed}
          color="text-status-warning"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-grey ml-1">Temporal Trend (30 Days)</h4>
        <div className="h-40 flex items-end gap-1.5 p-4 glass-panel border-white/5 bg-white/5">
          {daily_breakdown?.slice(-14).map((day, index: number) => {
            const maxVal = Math.max(...daily_breakdown.map((d) => d.completed), 1);
            const height = Math.max((day.completed / maxVal) * 100, 4);
            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-accent-primary/40 to-accent-primary rounded-t-sm transition-all duration-500 hover:brightness-125 group relative"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity glass border border-white/10 px-2 py-1 rounded text-[8px] text-text-primary whitespace-nowrap z-10">
                  {day.completed} directives
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-grey/60">{daily_breakdown?.[0]?.date || 'START'}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-grey/60">{daily_breakdown?.[daily_breakdown.length - 1]?.date || 'END'}</span>
        </div>
      </div>

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
