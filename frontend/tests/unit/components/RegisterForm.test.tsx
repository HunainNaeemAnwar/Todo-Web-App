/**
 * Unit tests for RegisterForm component.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import RegisterForm from '@/components/auth/RegisterForm';

// Mock the router
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  signUp: vi.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterForm />);

    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows password validation requirements', () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    // Expect to see validation requirements
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains number/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains special character/i)).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    // Password should be marked invalid
    // The class 'text-red-600' is on the parent div of the requirement text
    const requirement = screen.getByText(/At least 8 characters/i);
    expect(requirement.parentElement).toHaveClass('text-red-600');
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/^Email$/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    // Fill in required fields to enable logic
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass456@' } });

    fireEvent.click(registerButton);

    // Use findByText to wait for the state update and re-render
    const errorMessage = await screen.findByText(/Passwords do not match/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('submits the form when all validations pass', async () => {
    const { signUp } = await import('@/lib/auth-client');
    (signUp as any).mockResolvedValue({});

    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/^Email$/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123!' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        'test@example.com',
        'ValidPass123!',
        'John Doe'
      );
    });
  });
});
