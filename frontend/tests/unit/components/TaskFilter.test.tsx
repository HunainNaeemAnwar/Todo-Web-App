/**
 * Unit tests for TaskFilter component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import TaskFilter from '@/components/tasks/TaskFilter';

describe('TaskFilter', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter select dropdown', () => {
    render(
      <TaskFilter
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows all filter options', () => {
    render(
      <TaskFilter
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('All Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onFilterChange when value changes', () => {
    render(
      <TaskFilter
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'pending' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith('pending');
  });

  it('displays correct current filter', () => {
    render(
      <TaskFilter
        currentFilter="pending"
        onFilterChange={mockOnFilterChange}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('pending');
  });
});
