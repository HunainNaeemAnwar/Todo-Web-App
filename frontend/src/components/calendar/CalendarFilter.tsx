'use client';

import { Calendar, Clock, Target, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarFilterProps {
  value: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
}

export function CalendarFilter({ value, onPeriodChange }: CalendarFilterProps) {
  const periods: { value: 'today' | 'week' | 'month'; label: string; icon: React.ReactNode }[] = [
    { value: 'today', label: 'Today', icon: <Target className="w-4 h-4" /> },
    { value: 'week', label: 'Week', icon: <Calendar className="w-4 h-4" /> },
    { value: 'month', label: 'Month', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              value === period.value
                ? 'bg-accent-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {period.icon}
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface DateNavigatorProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateNavigator({ currentDate, onPrevious, onNext, onToday }: DateNavigatorProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrevious}
        className="p-2 rounded-lg glass-effect text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={onToday}
        className="px-4 py-2 rounded-lg bg-accent-primary/20 text-accent-primary font-medium hover:bg-accent-primary/30 transition-colors"
      >
        Today
      </button>
      
      <span className="text-lg font-medium text-text-primary min-w-[200px] text-center">
        {formatDate(currentDate)}
      </span>
      
      <button
        onClick={onNext}
        className="p-2 rounded-lg glass-effect text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
