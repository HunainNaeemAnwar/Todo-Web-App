'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Flame, 
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
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
    return (
      <div className="bg-secondary rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-white/5">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
        <p className="text-secondary text-xs font-bold uppercase tracking-widest font-accent">
          Loading Weekly Report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-secondary rounded-2xl p-8 border border-status-error/20 text-center">
        <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
        <p className="text-status-error font-bold uppercase tracking-widest text-xs mb-2 font-accent">
          Report Load Failed
        </p>
        <p className="text-secondary text-xs font-accent">{error}</p>
      </div>
    );
  }

  const { summary, daily_breakdown } = report;

  const weekDays = [
    { key: 'mon', label: 'Mon', short: 'M' },
    { key: 'tue', label: 'Tue', short: 'T' },
    { key: 'wed', label: 'Wed', short: 'W' },
    { key: 'thu', label: 'Thu', short: 'T' },
    { key: 'fri', label: 'Fri', short: 'F' },
    { key: 'sat', label: 'Sat', short: 'S' },
    { key: 'sun', label: 'Sun', short: 'S' },
  ];

  return (
    <div className="bg-secondary rounded-2xl p-4 sm:p-6 md:p-8 border border-white/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
          <Calendar className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-primary tracking-tight">
            Weekly Report
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-0.5 font-accent">
            Last 7 days analysis
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <ReportStat
          icon={Target}
          label="Created"
          value={summary.tasks_created}
          color="text-accent-primary"
          bgColor="bg-accent-primary/10"
        />
        <ReportStat
          icon={CheckCircle}
          label="Completed"
          value={summary.tasks_completed}
          color="text-status-success"
          bgColor="bg-status-success/10"
        />
        <ReportStat
          icon={TrendingUp}
          label="Rate"
          value={`${summary.completion_rate}%`}
          color="text-primary"
          bgColor="bg-white/5"
        />
        <ReportStat
          icon={Flame}
          label="Streak"
          value={summary.streak_current}
          color="text-status-warning"
          bgColor="bg-status-warning/10"
        />
      </div>

      {/* Daily Breakdown */}
      {daily_breakdown && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary font-accent">
            Daily Breakdown
          </h4>
          
          {/* Responsive Grid: Scrollable on mobile, full grid on desktop */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 min-w-[300px] overflow-x-auto pb-2">
            {weekDays.map((day) => {
              const value = (daily_breakdown as Record<string, number>)[day.key] || 0;
              const isToday = new Date().getDay() === ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(day.key);
              
              return (
                <div 
                  key={day.key} 
                  className={`
                    text-center p-3 md:p-4 rounded-xl border transition-all duration-300
                    ${isToday 
                      ? 'bg-accent-primary/10 border-accent-primary/30' 
                      : 'bg-tertiary border-white/5 hover:border-white/10'
                    }
                  `}
                >
                  {/* Day Label */}
                  <p className={`
                    text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 font-accent
                    ${isToday ? 'text-accent-primary' : 'text-secondary'}
                  `}>
                    <span className="hidden md:inline">{day.label}</span>
                    <span className="md:hidden">{day.short}</span>
                  </p>
                  
                  {/* Value */}
                  <p className="text-xl md:text-2xl font-display font-bold text-primary">
                    {value}
                  </p>
                  
                  {/* Mini bar for visual */}
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-[9px] font-bold text-secondary/40 mt-6 uppercase tracking-widest font-accent">
        Generated: {new Date(report.generated_at).toLocaleString()}
      </p>
    </div>
  );
}

interface ReportStatProps {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}

function ReportStat({ icon: Icon, label, value, color, bgColor }: ReportStatProps) {
  return (
    <div className="bg-tertiary rounded-xl p-4 border border-white/5 text-center group hover:border-white/10 transition-all duration-300">
      <div className={`
        w-10 h-10 rounded-lg ${bgColor} 
        flex items-center justify-center mx-auto mb-3
        transition-transform duration-300 group-hover:scale-110
      `}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl md:text-3xl font-display font-bold text-primary">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
        {label}
      </p>
    </div>
  );
}