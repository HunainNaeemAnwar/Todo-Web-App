/**
 * Unit tests for LoginForm component.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import LoginForm from '@/components/auth/LoginForm';

// Mock the router
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

// Mock the auth client
vi.mock('@/lib/better-auth-client', () => ({
  signIn: {
    email: vi.fn(),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the login form', () => {
    render(<LoginForm />);

    expect(screen.getByText(/Login/i, { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('submits the form with valid credentials', async () => {
    const user = userEvent.setup();
    const { signIn } = await import('@/lib/better-auth-client');
    vi.mocked(signIn.email).mockResolvedValue({} as any);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.click(loginButton);

    expect(signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPass123!',
    });

    await vi.waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const { signIn } = await import('@/lib/better-auth-client');
    vi.mocked(signIn.email).mockResolvedValue({
      error: { message: 'Invalid credentials' }
    } as any);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    const errorMessage = await screen.findByText(/Invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('disables button during submission', async () => {
    const user = userEvent.setup();
    const { signIn } = await import('@/lib/better-auth-client');

    // Delay the response to test loading state
    vi.mocked(signIn.email).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({} as any), 100)));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password');

    // Start submission
    user.click(loginButton);

    // Button should show loading state and be disabled
    await vi.waitFor(() => {
        expect(screen.getByText(/Logging in\.\.\./i)).toBeInTheDocument();
        expect(loginButton).toBeDisabled();
    });
  });
});
