'use client';

import { 
  TrendingUp, 
  CheckCircle, 
  Target, 
  Flame, 
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';

interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  streak_current: number;
  streak_best: number;
  avg_tasks_per_day: number;
  weekly_activity: Array<{
    week: string;
    mon?: number;
    tue?: number;
    wed?: number;
    thu?: number;
    fri?: number;
    sat?: number;
    sun?: number;
  }>;
  created_at: string;
}

interface StatisticsCardProps {
  stats: UserStats;
}

export function StatisticsCard({ stats }: StatisticsCardProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      <StatCard
        icon={Target}
        label="Total Tasks"
        value={stats.total_tasks}
        color="text-primary"
        bgColor="bg-primary/10"
        borderColor="border-primary/20"
      />
      <StatCard
        icon={CheckCircle}
        label="Completed"
        value={stats.completed_tasks}
        color="text-status-success"
        bgColor="bg-status-success/10"
        borderColor="border-status-success/20"
      />
      <StatCard
        icon={TrendingUp}
        label="Completion"
        value={`${stats.completion_rate}%`}
        color="text-accent-primary"
        bgColor="bg-accent-primary/10"
        borderColor="border-accent-primary/20"
      />
      <OverdueCard count={stats.overdue_tasks} />
      <StreakCard currentStreak={stats.streak_current} />
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className: string }>;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor, borderColor }: StatCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 md:p-6
      bg-secondary border ${borderColor}
      transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
      group
    `}>
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-lg ${bgColor} 
        flex items-center justify-center mb-3
        transition-transform duration-300 group-hover:scale-110
      `}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      {/* Value */}
      <p className="text-2xl md:text-3xl font-display font-bold text-primary">
        {value}
      </p>

      {/* Label */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
        {label}
      </p>

      {/* Hover accent line */}
      <div className={`
        absolute bottom-0 left-0 h-0.5 w-0 
        group-hover:w-full transition-all duration-500
        ${color.replace('text-', 'bg-')}
      `} />
    </div>
  );
}

interface OverdueCardProps {
  count: number;
}

function OverdueCard({ count }: OverdueCardProps) {
  const hasOverdue = count > 0;
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 md:p-6
      bg-secondary border transition-all duration-300 hover:-translate-y-1
      ${hasOverdue 
        ? 'border-status-error/30 hover:border-status-error/50' 
        : 'border-white/5 hover:border-white/10'
      }
      group
    `}>
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center mb-3
        transition-transform duration-300 group-hover:scale-110
        ${hasOverdue ? 'bg-status-error/10' : 'bg-white/5'}
      `}>
        <AlertCircle className={`w-5 h-5 ${hasOverdue ? 'text-status-error' : 'text-secondary'}`} />
      </div>

      {/* Value */}
      <p className={`text-2xl md:text-3xl font-display font-bold ${hasOverdue ? 'text-status-error' : 'text-primary'}`}>
        {count}
      </p>

      {/* Label */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
        Overdue
      </p>

      {/* Warning indicator for overdue */}
      {hasOverdue && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-status-error animate-pulse" />
      )}
    </div>
  );
}

interface StreakCardProps {
  currentStreak: number;
}

function StreakCard({ currentStreak }: StreakCardProps) {
  const getStreakIcon = (days: number) => {
    if (days >= 30) return { icon: Trophy, color: 'text-accent-gold', bg: 'bg-accent-gold/10' };
    if (days >= 14) return { icon: Zap, color: 'text-status-warning', bg: 'bg-status-warning/10' };
    if (days >= 7) return { icon: Activity, color: 'text-status-success', bg: 'bg-status-success/10' };
    return { icon: Flame, color: 'text-accent-primary', bg: 'bg-accent-primary/10' };
  };

  const { icon: StreakIcon, color, bg } = getStreakIcon(currentStreak);

  return (
    <div className="
      relative overflow-hidden rounded-xl p-4 md:p-6
      bg-secondary border border-white/5
      transition-all duration-300 hover:-translate-y-1 hover:border-status-warning/20
      group
    ">
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-lg ${bg} 
        flex items-center justify-center mb-3
        transition-transform duration-300 group-hover:scale-110
      `}>
        <StreakIcon className={`w-5 h-5 ${color}`} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <p className="text-2xl md:text-3xl font-display font-bold text-primary">
          {currentStreak}
        </p>
        <span className="text-xs text-tertiary font-accent">days</span>
      </div>

      {/* Label */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
        Current Streak
      </p>

      {/* Fire effect for active streak */}
      {currentStreak > 0 && (
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-status-warning/10 rounded-full blur-xl" />
      )}
    </div>
  );
}

// Trophy icon import karna tha jo missing tha
import { Trophy } from 'lucide-react';

interface ProductivityOverviewProps {
  stats: UserStats;
}

export function ProductivityOverview({ stats }: ProductivityOverviewProps) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentWeek = stats.weekly_activity[0];

  if (!currentWeek) return null;

  const maxActivity = Math.max(
    ...days.map(day => (currentWeek as unknown as Record<string, number | undefined>)[day] || 0),
    1
  );

  return (
    <div className="bg-secondary rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-primary">
          Weekly Activity
        </h3>
        <Activity className="w-4 h-4 text-secondary" />
      </div>

      {/* Mobile: Horizontal scroll, Desktop: Full grid */}
      <div className="flex items-end justify-between gap-2 h-32 md:h-40 overflow-x-auto pb-2">
        {days.map((day, index) => {
          const value = (currentWeek as unknown as Record<string, number | undefined>)[day] || 0;
          const height = Math.max((value / maxActivity) * 100, 4);
          const isToday = index === new Date().getDay() - 1;
          const hasActivity = value > 0;

          return (
            <div key={day} className="flex flex-col items-center flex-1 min-w-[32px] group">
              {/* Bar */}
              <div className="relative w-full flex items-end justify-center h-24 md:h-32 mb-2">
                <div
                  className={`
                    w-full max-w-[24px] rounded-t-md transition-all duration-500
                    ${hasActivity
                      ? 'bg-accent-primary hover:bg-accent-primary/80'
                      : 'bg-white/5'
                    }
                    ${isToday ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-secondary' : ''}
                  `}
                  style={{ height: `${height}%` }}
                />
              </div>

              {/* Label */}
              <span className={`
                text-[10px] font-bold uppercase font-accent
                ${isToday ? 'text-accent-primary' : 'text-secondary'}
              `}>
                {dayLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}