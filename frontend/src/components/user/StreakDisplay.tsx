'use client';

import { Flame, Trophy, Calendar, Zap } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
}

export function StreakDisplay({ currentStreak, bestStreak, lastCompletedDate }: StreakDisplayProps) {
  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'Master', color: 'from-purple-500 to-pink-500', icon: '👑' };
    if (days >= 14) return { level: 'Expert', color: 'from-yellow-500 to-orange-500', icon: '🌟' };
    if (days >= 7) return { level: 'Strong', color: 'from-green-500 to-emerald-500', icon: '💪' };
    if (days >= 3) return { level: 'Building', color: 'from-blue-500 to-cyan-500', icon: '📈' };
    return { level: 'Starting', color: 'from-slate-500 to-slate-600', icon: '🌱' };
  };

  const streak = getStreakLevel(currentStreak);

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
          <Flame className="w-5 h-5 text-warning" />
          Your Streak
        </h3>
        {currentStreak > 0 && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${streak.color} text-white`}>
            {streak.icon} {streak.level}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1 text-center">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${streak.color} shadow-lg shadow-${streak.color.replace('from-', '').replace(' to-', '/30')} transition-all duration-500 ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
              <span className="text-4xl">{streak.icon}</span>
            </div>
            {currentStreak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full px-2 py-1 shadow-lg">
                <span className="text-lg font-bold text-warning">{currentStreak}</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-text-secondary">Current Streak</p>
          <p className="text-xs text-text-tertiary">{currentStreak === 1 ? 'day' : 'days'} in a row</p>
        </div>

        <div className="w-px h-24 bg-slate-700" />

        <div className="flex-1 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-800/50 mx-auto">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">{bestStreak}</p>
          <p className="text-sm text-text-secondary">Best Streak</p>
        </div>
      </div>

      {lastCompletedDate && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-text-tertiary flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Last task completed: {new Date(lastCompletedDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {currentStreak === 0 && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-text-secondary text-center">
            <Zap className="w-4 h-4 inline mr-1 text-accent-primary" />
            Complete a task today to start your streak!
          </p>
        </div>
      )}
    </div>
  );
}

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

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const getCompletionStatus = (day: number) => {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = streakData.find(d => d.date === dateStr);
    return dayData?.completed || false;
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-display font-bold text-text-primary mb-4">
        {monthNames[today.getMonth()]} {today.getFullYear()}
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div key={day} className="text-center text-xs text-text-tertiary py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday = day === today.getDate();
          const isCompleted = getCompletionStatus(day);

          return (
            <div
              key={day}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isCompleted
                  ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white'
                  : 'bg-slate-800/50 text-text-secondary'
                }
                ${isToday && !isCompleted ? 'ring-2 ring-accent-primary' : ''}
                ${day > today.getDate() ? 'opacity-30' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-accent-primary to-accent-secondary" />
          <span className="text-xs text-text-tertiary">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-800/50 ring-2 ring-accent-primary" />
          <span className="text-xs text-text-tertiary">Today</span>
        </div>
      </div>
    </div>
  );
}
