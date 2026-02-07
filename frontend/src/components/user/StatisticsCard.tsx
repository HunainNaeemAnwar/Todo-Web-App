'use client';

import { TrendingUp, CheckCircle, Target, Flame, AlertCircle } from 'lucide-react';

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
  if (!stats) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Total Tasks"
        value={stats.total_tasks}
        color="text-text-primary"
        bgColor="bg-slate-800/50"
      />
      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        label="Completed"
        value={stats.completed_tasks}
        color="text-success"
        bgColor="bg-success/10"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Completion Rate"
        value={`${stats.completion_rate}%`}
        color="text-accent-primary"
        bgColor="bg-accent-primary/10"
      />
      <OverdueCard count={stats.overdue_tasks} />
      <StreakCard
        currentStreak={stats.streak_current}
        bestStreak={stats.streak_best}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
      <div className={`${color} flex justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

interface OverdueCardProps {
  count: number;
}

function OverdueCard({ count }: OverdueCardProps) {
  return (
    <div className={`${count > 0 ? 'bg-error/20' : 'bg-slate-800/50'} rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}>
      <div className={`${count > 0 ? 'text-error' : 'text-text-muted'} flex justify-center mb-2`}>
        <AlertCircle className="w-5 h-5" />
      </div>
      <p className={`text-2xl font-bold ${count > 0 ? 'text-error' : 'text-text-primary'}`}>{count}</p>
      <p className="text-xs text-text-secondary">Overdue</p>
      {count > 0 && (
        <p className="text-xs text-error mt-1">Needs attention!</p>
      )}
    </div>
  );
}

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

function StreakCard({ currentStreak, bestStreak }: StreakCardProps) {
  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '🌟';
    if (days >= 7) return '💪';
    if (days >= 3) return '📈';
    return '🌱';
  };

  return (
    <div className="bg-warning/10 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105">
      <div className="flex justify-center mb-2 text-warning">
        <Flame className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-text-primary flex items-center justify-center gap-1">
        {currentStreak}
        <span className="text-lg">{getStreakEmoji(currentStreak)}</span>
      </p>
      <p className="text-xs text-text-secondary">Current Streak</p>
      {bestStreak > 0 && bestStreak !== currentStreak && (
        <p className="text-xs text-text-muted mt-1">
          Best: {bestStreak} days
        </p>
      )}
    </div>
  );
}

interface ProductivityOverviewProps {
  stats: UserStats;
}

export function ProductivityOverview({ stats }: ProductivityOverviewProps) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentWeek = stats.weekly_activity[0];

  if (!currentWeek) return null;

  const maxActivity = Math.max(
    ...days.map(day => (currentWeek as unknown as Record<string, number | undefined>)[day] || 0),
    1
  );

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-display font-bold text-text-primary mb-4">
        This Week's Activity
      </h3>
      <div className="flex items-end justify-between gap-2 h-32">
          {days.map((day, index) => {
          const value = (currentWeek as unknown as Record<string, number | undefined>)[day] || 0;
          const height = Math.max((value / maxActivity) * 100, 5);
          const isToday = index === new Date().getDay() - 1;

          return (
            <div key={day} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  value > 0
                    ? 'bg-gradient-to-t from-accent-primary to-accent-secondary'
                    : 'bg-slate-700/50'
                } ${isToday ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-slate-900' : ''}`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <span className={`text-xs mt-2 ${isToday ? 'text-accent-primary font-bold' : 'text-text-secondary'}`}>
                {dayLabels[index]}
              </span>
              <span className="text-xs text-text-muted">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
