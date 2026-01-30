import React, { memo, useCallback } from "react";

interface TaskFilterProps {
  currentFilter: "pending" | "completed" | "all";
  onFilterChange: (filter: "pending" | "completed" | "all") => void;
}

const TaskFilter = memo(({ currentFilter, onFilterChange }: TaskFilterProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value as "pending" | "completed" | "all");
  }, [onFilterChange]);

  return (
    <select value={currentFilter} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white">
      <option value="all">All Tasks</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
    </select>
  );
});

TaskFilter.displayName = "TaskFilter";
export default TaskFilter;
