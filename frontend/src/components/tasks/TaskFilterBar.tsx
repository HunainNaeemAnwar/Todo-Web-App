"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Calendar,
  Briefcase,
  User,
  GraduationCap,
  Heart,
  DollarSign,
  Filter
} from "lucide-react";

export type FilterType =
  | "all"
  | "active"
  | "completed"
  | "high"
  | "medium"
  | "low"
  | "today"
  | "tomorrow"
  | "week"
  | "overdue"
  | "no due date"
  | "work"
  | "personal"
  | "study"
  | "health"
  | "finance";

interface FilterOption {
  id: FilterType;
  label: string;
  icon: React.ReactNode;
  category: "status" | "priority" | "date" | "category";
}

interface TaskFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  taskCounts?: Record<FilterType, number>;
}

const filterOptions: FilterOption[] = [
  // Status filters
  { id: "all", label: "All", icon: <Filter className="h-4 w-4" />, category: "status" },
  { id: "active", label: "Active", icon: <Circle className="h-4 w-4" />, category: "status" },
  { id: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, category: "status" },

  // Priority filters
  { id: "high", label: "High Priority", icon: <AlertCircle className="h-4 w-4 text-red-500" />, category: "priority" },
  { id: "medium", label: "Medium Priority", icon: <AlertCircle className="h-4 w-4 text-yellow-500" />, category: "priority" },
  { id: "low", label: "Low Priority", icon: <AlertCircle className="h-4 w-4 text-green-500" />, category: "priority" },

  // Date filters
  { id: "today", label: "Today", icon: <Clock className="h-4 w-4" />, category: "date" },
  { id: "tomorrow", label: "Tomorrow", icon: <Calendar className="h-4 w-4" />, category: "date" },
  { id: "week", label: "This Week", icon: <Calendar className="h-4 w-4" />, category: "date" },
  { id: "overdue", label: "Overdue", icon: <AlertCircle className="h-4 w-4 text-red-600" />, category: "date" },
  { id: "no due date", label: "No Due Date", icon: <Calendar className="h-4 w-4" />, category: "date" },

  // Category filters
  { id: "work", label: "Work", icon: <Briefcase className="h-4 w-4" />, category: "category" },
  { id: "personal", label: "Personal", icon: <User className="h-4 w-4" />, category: "category" },
  { id: "study", label: "Study", icon: <GraduationCap className="h-4 w-4" />, category: "category" },
  { id: "health", label: "Health", icon: <Heart className="h-4 w-4" />, category: "category" },
  { id: "finance", label: "Finance", icon: <DollarSign className="h-4 w-4" />, category: "category" },
];

export default function TaskFilterBar({ activeFilter, onFilterChange, taskCounts }: TaskFilterBarProps) {
  const categories = {
    status: filterOptions.filter(f => f.category === "status"),
    priority: filterOptions.filter(f => f.category === "priority"),
    date: filterOptions.filter(f => f.category === "date"),
    category: filterOptions.filter(f => f.category === "category"),
  };

  const renderFilterButton = (filter: FilterOption) => {
    const isActive = activeFilter === filter.id;
    const count = taskCounts?.[filter.id];

    return (
      <button
        key={filter.id}
        onClick={() => onFilterChange(filter.id)}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }
        `}
        title={filter.label}
      >
        {filter.icon}
        <span className="ml-2">{filter.label}</span>
        {count !== undefined && count > 0 && (
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            isActive ? 'bg-indigo-500' : 'bg-gray-200'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      {/* Status Filters */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.status.map(renderFilterButton)}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Priority
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.priority.map(renderFilterButton)}
        </div>
      </div>

      {/* Date Filters */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Due Date
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.date.map(renderFilterButton)}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.category.map(renderFilterButton)}
        </div>
      </div>
    </div>
  );
}
