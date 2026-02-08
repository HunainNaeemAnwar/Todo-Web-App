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
    <div className="glass-panel border-white/5 p-4 text-center group hover:border-accent-primary/20 transition-all duration-500 hover:-translate-y-1">
      <div className={`${color} flex justify-center mb-2 opacity-50 group-hover:opacity-100 transition-opacity`}>
        {icon}
      </div>
      <p className="text-2xl font-display font-bold text-text-primary tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-1">{label}</p>
    </div>
  );
}

interface OverdueCardProps {
  count: number;
}

function OverdueCard({ count }: OverdueCardProps) {
  return (
    <div className={`glass-panel p-4 text-center group transition-all duration-500 hover:-translate-y-1 ${count > 0 ? 'border-status-error/30' : 'border-white/5 hover:border-accent-primary/20'}`}>
      <div className={`${count > 0 ? 'text-status-error' : 'text-neutral-grey opacity-50 group-hover:opacity-100'} flex justify-center mb-2 transition-opacity`}>
        <AlertCircle className="w-5 h-5" />
      </div>
      <p className={`text-2xl font-display font-bold tracking-tight ${count > 0 ? 'text-status-error' : 'text-text-primary'}`}>{count}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-1">Overdue</p>
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
    <div className="glass-panel border-white/5 p-4 text-center group hover:border-accent-primary/20 transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-center mb-2 text-status-warning opacity-50 group-hover:opacity-100 transition-opacity">
        <Flame className="w-5 h-5" />
      </div>
      <p className="text-2xl font-display font-bold text-text-primary tracking-tight flex items-center justify-center gap-2">
        {currentStreak}
        <span className="text-lg">{getStreakEmoji(currentStreak)}</span>
      </p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-grey mt-1">Current Streak</p>
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
    <div className="glass-panel p-6">
      <h3 className="text-lg font-display font-bold text-text-primary tracking-tight mb-6">
        Temporal Activity
      </h3>
      <div className="flex items-end justify-between gap-3 h-32">
          {days.map((day, index) => {
          const value = (currentWeek as unknown as Record<string, number | undefined>)[day] || 0;
          const height = Math.max((value / maxActivity) * 100, 4);
          const isToday = index === new Date().getDay() - 1;

          return (
            <div key={day} className="flex flex-col items-center flex-1 group">
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  value > 0
                    ? 'bg-gradient-to-t from-accent-primary/40 to-accent-primary group-hover:brightness-125'
                    : 'bg-white/5'
                } ${isToday ? 'ring-1 ring-accent-primary ring-offset-4 ring-offset-black' : ''}`}
                style={{ height: `${height}%` }}
              />
              <span className={`text-[8px] font-black uppercase tracking-widest mt-3 transition-colors ${isToday ? 'text-accent-primary' : 'text-neutral-grey group-hover:text-text-primary'}`}>
                {dayLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
