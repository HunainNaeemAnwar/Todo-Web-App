/**
 * Unit tests for TaskItem component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import TaskItem from '@/components/tasks/TaskItem';
import { Task } from '@/types/task';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    user_id: 'user1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global confirm
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders task title and description', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('toggles completion status when checkbox is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggleComplete).toHaveBeenCalledWith({
      id: '1',
      completed: true,
    });
  });

  it('shows task as completed when completed prop is true', () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const taskElement = screen.getByText('Test Task');
    expect(taskElement).toHaveClass('line-through');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Verify that the confirm function was called
    expect(global.confirm).toHaveBeenCalledWith('Delete this task?');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('formats dates correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    // Check if the date label is displayed
    expect(screen.getByText(/Created:/i)).toBeInTheDocument();
  });
});
