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
import { 
  Loader2, 
  TrendingUp, 
  CheckCircle, 
  PlusCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

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
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const stats = useMemo(() => {
    if (data.length === 0) return { 
      totalCreated: 0, 
      totalCompleted: 0, 
      avgCreated: 0, 
      avgCompleted: 0 
    };

    const totalCreated = data.reduce((sum, d) => sum + d.created, 0);
    const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
    const avgCreated = Math.round((totalCreated / data.length) * 10) / 10;
    const avgCompleted = Math.round((totalCompleted / data.length) * 10) / 10;

    return { totalCreated, totalCompleted, avgCreated, avgCompleted };
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-secondary rounded-2xl p-8 flex items-center justify-center h-80 border border-white/5">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary rounded-2xl p-8 text-center border border-status-error/20">
        <AlertCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
        <p className="text-status-error font-bold uppercase tracking-widest text-xs mb-2 font-accent">
          Chart Load Failed
        </p>
        <p className="text-secondary text-xs mb-4 font-accent">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent-primary text-inverse rounded-lg text-xs font-bold uppercase tracking-wider font-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-2xl p-4 sm:p-6 md:p-8 border border-white/5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-primary tracking-tight">
            Productivity Overview
          </h3>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-1 font-accent">
            Task creation vs completion
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider font-accent">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-primary" />
            <span className="text-secondary">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-success" />
            <span className="text-secondary">Completed</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatBadge
          icon={PlusCircle}
          label="Total Created"
          value={stats.totalCreated}
          color="text-accent-primary"
          bgColor="bg-accent-primary/10"
        />
        <StatBadge
          icon={CheckCircle}
          label="Total Completed"
          value={stats.totalCompleted}
          color="text-status-success"
          bgColor="bg-status-success/10"
        />
        <StatBadge
          icon={TrendingUp}
          label="Avg Created/Day"
          value={stats.avgCreated}
          color="text-primary"
          bgColor="bg-white/5"
        />
        <StatBadge
          icon={Calendar}
          label="Avg Completed/Day"
          value={stats.avgCompleted}
          color="text-status-success"
          bgColor="bg-status-success/10"
        />
      </div>

      {/* Chart - Responsive Height */}
      <div className="h-64 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.03)" 
              vertical={false} 
            />
            
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="rgba(255,255,255,0.1)"
              tick={{ 
                fill: 'var(--text-secondary)', 
                fontSize: 10, 
                fontWeight: 600 
              }}
              dy={10}
              interval="preserveStartEnd"
            />
            
            <YAxis
              stroke="rgba(255,255,255,0.1)"
              tick={{ 
                fill: 'var(--text-secondary)', 
                fontSize: 10, 
                fontWeight: 600 
              }}
              dx={-10}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
              itemStyle={{ 
                fontSize: '11px', 
                fontWeight: 600,
                fontFamily: 'var(--font-accent)'
              }}
              labelStyle={{ 
                fontSize: '10px', 
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}
              labelFormatter={(value) => formatDate(value as string)}
            />
            
            <Area
              type="monotone"
              dataKey="created"
              stroke="var(--accent-primary)"
              fill="url(#colorCreated)"
              strokeWidth={2}
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="var(--status-success)"
              fill="url(#colorCompleted)"
              strokeWidth={2}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatBadge({ icon: Icon, label, value, color, bgColor }: StatBadgeProps) {
  return (
    <div className="bg-tertiary rounded-xl p-4 border border-white/5 text-center group hover:border-white/10 transition-all duration-300">
      <div className={`
        w-10 h-10 rounded-lg ${bgColor} 
        flex items-center justify-center mx-auto mb-3
        transition-transform duration-300 group-hover:scale-110
      `}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-display font-bold text-primary">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
        {label}
      </p>
    </div>
  );
}

// Period Selector Component
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
    <div className="flex gap-1 p-1 bg-tertiary rounded-xl border border-white/5 w-fit">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`
            px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 font-accent
            ${value === period.value
              ? 'bg-accent-primary text-inverse shadow-lg'
              : 'text-secondary hover:text-primary hover:bg-white/5'
            }
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}