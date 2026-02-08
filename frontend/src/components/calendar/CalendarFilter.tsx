'use client';

import React from 'react';
import { Calendar, Clock, Target, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarFilterProps {
  value: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
}

export function CalendarFilter({ value, onPeriodChange }: CalendarFilterProps) {
  const periods: { value: 'today' | 'week' | 'month'; label: string; icon: React.ReactNode }[] = [
    { value: 'today', label: 'Today', icon: <Target className="w-3.5 h-3.5" /> },
    { value: 'week', label: 'Week', icon: <Calendar className="w-3.5 h-3.5" /> },
    { value: 'month', label: 'Month', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex p-1.5 glass bg-white/5 border-white/5 rounded-2xl shadow-inner">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 relative group ${
              value === period.value
                ? 'glass-elevated bg-accent-primary/10 text-accent-primary border-accent-primary/20 shadow-[0_0_20px_oklch(0.82_0.12_85/0.15)]'
                : 'text-neutral-grey hover:text-neutral-lavender hover:bg-white/5'
            }`}
          >
            <span className={`transition-transform duration-500 ${value === period.value ? 'scale-110' : 'group-hover:scale-110'}`}>
              {period.icon}
            </span>
            {period.label}
            {value === period.value && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary" />
            )}
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
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          className="p-3 rounded-xl glass glass-interactive border-white/5 text-neutral-grey hover:text-accent-primary group"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        </button>

        <button
          onClick={onToday}
          className="px-6 py-3 rounded-xl glass glass-interactive border-accent-primary/20 text-accent-primary font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_oklch(0.82_0.12_85/0.1)] hover:border-accent-primary"
        >
          Temporal Sync
        </button>

        <button
          onClick={onNext}
          className="p-3 rounded-xl glass glass-interactive border-white/5 text-neutral-grey hover:text-accent-primary group"
        >
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="h-12 w-px bg-white/10" />

      <span className="text-xl font-display font-bold text-text-primary tracking-tight">
        {formatDate(currentDate)}
      </span>
    </div>
  );
}
