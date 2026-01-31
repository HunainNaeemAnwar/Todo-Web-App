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
          inline-flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105
          ${isActive
            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
          }
        `}
        title={filter.label}
      >
        {filter.icon}
        <span className="ml-2">{filter.label}</span>
        {count !== undefined && count > 0 && (
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-sm">
      {/* Status Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
          Status
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.status.map(renderFilterButton)}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
          Priority
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.priority.map(renderFilterButton)}
        </div>
      </div>

      {/* Date Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Due Date
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.date.map(renderFilterButton)}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          Category
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.category.map(renderFilterButton)}
        </div>
      </div>
    </div>
  );
}
