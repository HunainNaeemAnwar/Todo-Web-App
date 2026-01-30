/**
 * Unit tests for TaskList component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import TaskList from '@/components/tasks/TaskList';
import { Task } from '@/types/task';

// Mock the child components
vi.mock('@/components/tasks/TaskItem', () => ({
  __esModule: true,
  default: ({ task }: { task: Task }) => (
    <div data-testid={`task-item-${task.id}`}>{task.title}</div>
  ),
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tasks when no filter is applied', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-2')).toBeInTheDocument();
  });

  it('shows empty state when no tasks exist', () => {
    render(
      <TaskList
        tasks={[]}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText(/No tasks yet\. Create your first task!/i)).toBeInTheDocument();
  });

  it('passes props correctly to TaskItem components', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});
