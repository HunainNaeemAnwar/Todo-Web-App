'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService, type ProductivityDataPoint } from '@/services/analyticsService';
import { Loader2, TrendingUp, CheckCircle, PlusCircle } from 'lucide-react';

interface ProductivityChartProps {
  period: 'week' | 'month' | 'quarter';
}

export function ProductivityChart({ period }: ProductivityChartProps) {
  const [data, setData] = useState<ProductivityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await analyticsService.getProductivityData(period);
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load productivity data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const stats = useMemo(() => {
    if (data.length === 0) return { totalCreated: 0, totalCompleted: 0, avgCreated: 0, avgCompleted: 0 };

    const totalCreated = data.reduce((sum, d) => sum + d.created, 0);
    const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
    const avgCreated = Math.round(totalCreated / data.length * 10) / 10;
    const avgCompleted = Math.round(totalCompleted / data.length * 10) / 10;

    return { totalCreated, totalCompleted, avgCreated, avgCompleted };
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center border-status-error/30">
        <p className="text-status-error font-bold uppercase tracking-widest text-xs mb-4">Sync Error</p>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-luxury"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Productivity Overview
          </h3>
          <p className="text-xs text-neutral-grey uppercase tracking-[0.2em] mt-1">Temporal task throughput</p>
        </div>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_oklch(0.82_0.12_85/0.4)]" />
            <span className="text-text-secondary">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_oklch(0.72_0.18_150/0.4)]" />
            <span className="text-text-secondary">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatBadge
          icon={<PlusCircle className="w-4 h-4" />}
          label="Total Created"
          value={stats.totalCreated}
          color="text-accent-primary"
        />
        <StatBadge
          icon={<CheckCircle className="w-4 h-4" />}
          label="Total Completed"
          value={stats.totalCompleted}
          color="text-status-success"
        />
        <StatBadge
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Created/Day"
          value={stats.avgCreated}
          color="text-text-primary"
        />
        <StatBadge
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg Completed/Day"
          value={stats.avgCompleted}
          color="text-status-success"
        />
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.82 0.12 85)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="oklch(0.82 0.12 85)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.72 0.18 150)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="oklch(0.72 0.18 150)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'var(--neutral-grey)', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'var(--neutral-grey)', fontSize: 10, fontWeight: 700 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                padding: '12px 16px',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: '700', padding: '4px 0' }}
              labelStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.5 }}
              labelFormatter={(value) => formatDate(value as string)}
              formatter={(value: number, name: string) => [value, name === 'created' ? 'Created' : 'Completed']}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="oklch(0.82 0.12 85)"
              fillOpacity={1}
              fill="url(#colorCreated)"
              strokeWidth={3}
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="oklch(0.72 0.18 150)"
              fillOpacity={1}
              fill="url(#colorCompleted)"
              strokeWidth={3}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatBadge({ icon, label, value, color }: StatBadgeProps) {
  return (
    <div className="glass-panel border-white/5 p-4 text-center group hover:border-accent-primary/20 transition-all duration-500">
      <div className={`${color} flex justify-center mb-2 opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      <p className="text-2xl font-display font-bold text-text-primary tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-1">{label}</p>
    </div>
  );
}

interface PeriodSelectorProps {
  value: 'week' | 'month' | 'quarter';
  onPeriodChange: (period: 'week' | 'month' | 'quarter') => void;
}

export function PeriodSelector({ value, onPeriodChange }: PeriodSelectorProps) {
  const periods: { value: 'week' | 'month' | 'quarter'; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
  ];

  return (
    <div className="flex gap-2 p-1.5 glass-panel border-white/5">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
            value === period.value
              ? 'glass-elevated bg-accent-primary/10 text-accent-primary border-accent-primary/20'
              : 'text-neutral-grey hover:text-neutral-lavender hover:bg-white/5'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
