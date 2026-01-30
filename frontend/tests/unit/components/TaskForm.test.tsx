/**
 * Unit tests for TaskForm component.
 */
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import TaskForm from '@/components/tasks/TaskForm';

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the task form', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
  });

  it('validates title length', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/Title \*/i);

    // Enter a title that's too long
    await user.type(titleInput, 'a'.repeat(256));

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Task/i });
    await user.click(submitButton);

    // Use findByTestId to wait for the validation error
    const error = await screen.findByTestId('title-error');
    expect(error).toHaveTextContent(/Title must be 255 characters or less/i);
    expect(error).toHaveClass('text-red-600');
  });

  it('validates title is not empty', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/Title \*/i);

    // Ensure it's empty
    await user.clear(titleInput);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Task/i });
    await user.click(submitButton);

    // Use findByTestId to wait for the validation error
    const error = await screen.findByTestId('title-error');
    expect(error).toHaveTextContent(/Title is required/i);
    expect(error).toHaveClass('text-red-600');
  });

  it('validates description length', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText(/Description/i);

    // Enter a description that's too long
    fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(2001) } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Task/i });
    await user.click(submitButton);

    // Use findByTestId to wait for the validation error
    const error = await screen.findByTestId('description-error');
    expect(error).toHaveTextContent(/Description must be 2000 characters or less/i);
    expect(error).toHaveClass('text-red-600');
  });

  it('submits the form when all validations pass', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
    });
  });

  it('allows updating an existing task', async () => {
    const user = userEvent.setup();
    const taskToUpdate = {
      title: 'Original Title',
      description: 'Original Description',
    };

    render(<TaskForm task={taskToUpdate as any} isEditing={true} onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Update Task/i });

    // Change the title
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Updated Title',
      description: 'Updated Description',
    });
  });
});

