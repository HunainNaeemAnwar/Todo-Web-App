'use client';

import { 
  Flame, 
  Trophy, 
  Calendar, 
  Zap, 
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
}

export function StreakDisplay({ currentStreak, bestStreak, lastCompletedDate }: StreakDisplayProps) {
  const getStreakLevel = (days: number) => {
    if (days >= 30) return { 
      level: 'Master', 
      icon: Trophy, 
      color: 'text-accent-gold',
      bg: 'bg-accent-gold/10',
      border: 'border-accent-gold/20'
    };
    if (days >= 14) return { 
      level: 'Expert', 
      icon: Award, 
      color: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/20'
    };
    if (days >= 7) return { 
      level: 'Strong', 
      icon: TrendingUp, 
      color: 'text-status-success',
      bg: 'bg-status-success/10',
      border: 'border-status-success/20'
    };
    if (days >= 3) return { 
      level: 'Building', 
      icon: Target, 
      color: 'text-accent-primary',
      bg: 'bg-accent-primary/10',
      border: 'border-accent-primary/20'
    };
    return { 
      level: 'Starting', 
      icon: Zap, 
      color: 'text-secondary',
      bg: 'bg-white/5',
      border: 'border-white/10'
    };
  };

  const streak = getStreakLevel(currentStreak);
  const StreakIcon = streak.icon;

  return (
    <div className="bg-secondary rounded-xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-status-warning/10">
            <Flame className="w-5 h-5 text-status-warning" />
          </div>
          <h3 className="text-lg font-display font-bold text-primary">
            Streak
          </h3>
        </div>
        
        {currentStreak > 0 && (
          <span className={`
            px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-accent
            ${streak.bg} ${streak.color} border ${streak.border}
          `}>
            {streak.level}
          </span>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="relative p-4 rounded-xl bg-tertiary border border-white/5">
          <div className={`
            w-12 h-12 rounded-full ${streak.bg} 
            flex items-center justify-center mb-3
            ${currentStreak > 0 ? 'animate-pulse' : ''}
          `}>
            <StreakIcon className={`w-6 h-6 ${streak.color}`} />
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold text-primary">
              {currentStreak}
            </span>
            <span className="text-xs text-tertiary font-accent">days</span>
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
            Current
          </p>

          {/* Decorative flame for active streak */}
          {currentStreak > 0 && (
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-status-warning/5 rounded-full blur-2xl" />
          )}
        </div>

        {/* Best Streak */}
        <div className="p-4 rounded-xl bg-tertiary border border-white/5">
          <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-accent-primary" />
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold text-primary">
              {bestStreak}
            </span>
            <span className="text-xs text-tertiary font-accent">days</span>
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1 font-accent">
            Personal Best
          </p>
        </div>
      </div>

      {/* Last Activity */}
      {lastCompletedDate && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-secondary font-accent">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last completed: {new Date(lastCompletedDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentStreak === 0 && (
        <div className="mt-4 p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/10">
          <div className="flex items-center gap-2 text-xs text-secondary font-accent">
            <Zap className="w-4 h-4 text-accent-primary" />
            <span>Complete a task to start your streak</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar Component - Simplified
interface StreakCalendarProps {
  streakData: Array<{
    date: string;
    completed: boolean;
  }>;
}

export function StreakCalendar({ streakData }: StreakCalendarProps) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getCompletionStatus = (day: number) => {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = streakData.find(d => d.date === dateStr);
    return dayData?.completed || false;
  };

  return (
    <div className="bg-secondary rounded-xl p-6 border border-white/5">
      <h3 className="text-lg font-display font-bold text-primary mb-4">
        {monthNames[today.getMonth()]} {today.getFullYear()}
      </h3>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-secondary py-2 font-accent">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday = day === today.getDate();
          const isCompleted = getCompletionStatus(day);
          const isFuture = day > today.getDate();

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-bold font-accent
                transition-all duration-200
                ${isCompleted
                  ? 'bg-accent-primary text-depth-950'
                  : 'bg-tertiary text-secondary'
                }
                ${isToday && !isCompleted ? 'ring-2 ring-accent-primary bg-transparent' : ''}
                ${isFuture ? 'opacity-30' : 'hover:scale-110 cursor-pointer'}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent-primary" />
          <span className="text-[10px] font-bold text-secondary font-accent uppercase">Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded ring-2 ring-accent-primary" />
          <span className="text-[10px] font-bold text-secondary font-accent uppercase">Today</span>
        </div>
      </div>
    </div>
  );
}