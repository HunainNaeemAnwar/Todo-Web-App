'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  Calendar, 
  Target, 
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
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
    return (
      <div className="bg-secondary rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-white/5">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-4" />
        <p className="text-secondary text-xs font-bold uppercase tracking-widest font-accent">
          Loading Monthly Report...
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

  return (
    <div className="bg-secondary rounded-2xl p-4 sm:p-6 md:p-8 border border-white/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
          <BarChart3 className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-primary tracking-tight">
            Monthly Report
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-0.5 font-accent">
            Last 30 days performance
          </p>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <ReportStat
          icon={Target}
          label="Tasks Created"
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
          label="Completion Rate"
          value={`${summary.completion_rate}%`}
          color="text-primary"
          bgColor="bg-white/5"
        />
        <ReportStat
          icon={Calendar}
          label="Daily Average"
          value={summary.avg_daily_completed}
          color="text-status-warning"
          bgColor="bg-status-warning/10"
        />
      </div>

      {/* Chart Section */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary font-accent">
          Activity Trend (Last 14 Days)
        </h4>
        
        {/* Responsive Chart Container */}
        <div className="h-48 md:h-56 w-full overflow-x-auto overflow-y-hidden">
          <div className="h-full min-w-[500px] md:min-w-0 flex items-end gap-1.5 p-4 bg-tertiary rounded-xl border border-white/5">
            {daily_breakdown?.slice(-14).map((day, index) => {
              const maxVal = Math.max(...daily_breakdown.map((d) => d.completed), 1);
              const height = Math.max((day.completed / maxVal) * 100, 4);
              
              return (
                <div
                  key={index}
                  className="flex-1 min-w-[30px] flex flex-col items-center group"
                >
                  {/* Tooltip */}
                  <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary border border-white/10 px-2 py-1 rounded text-[8px] text-primary font-accent whitespace-nowrap z-10">
                    {day.completed} tasks
                  </div>
                  
                  {/* Bar */}
                  <div
                    className="w-full bg-accent-primary rounded-t-sm transition-all duration-500 hover:bg-accent-primary/80"
                    style={{ height: `${height}%` }}
                  />
                  
                  {/* Date Label - Hidden on mobile, show on hover */}
                  <span className="text-[8px] text-secondary mt-1 font-accent hidden md:block">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Date Range */}
        <div className="flex justify-between px-1">
          <span className="text-[9px] font-bold text-secondary/60 font-accent">
            {daily_breakdown?.[0]?.date ? new Date(daily_breakdown[0].date).toLocaleDateString() : 'Start'}
          </span>
          <span className="text-[9px] font-bold text-secondary/60 font-accent">
            {daily_breakdown?.[daily_breakdown.length - 1]?.date 
              ? new Date(daily_breakdown[daily_breakdown.length - 1].date).toLocaleDateString() 
              : 'End'}
          </span>
        </div>
      </div>

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