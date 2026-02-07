'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
      <div className="glass-effect rounded-2xl p-8 flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-error">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-text-primary">
          Productivity Overview
        </h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-accent-primary" />
            <span className="text-text-secondary">Created</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-text-secondary">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
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
          color="text-success"
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
          color="text-success"
        />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(249, 115, 22)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(249, 115, 22)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelFormatter={(value) => formatDate(value as string)}
              formatter={(value: number, name: string) => [value, name === 'created' ? 'Created' : 'Completed']}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="rgb(249, 115, 22)"
              fillOpacity={1}
              fill="url(#colorCreated)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="rgb(34, 197, 94)"
              fillOpacity={1}
              fill="url(#colorCompleted)"
              strokeWidth={2}
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
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className={`${color} flex justify-center mb-1`}>{icon}</div>
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
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
    <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            value === period.value
              ? 'bg-accent-primary text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
