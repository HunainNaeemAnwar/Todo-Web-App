/**
 * Unit tests for logout functionality in ProtectedRoute component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
    replace: replaceMock,
  })),
}));

vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}));

describe('ProtectedRoute - Logout Tests', () => {
  const MockChildComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles logout functionality correctly', async () => {
    const { useSession } = await import('@/hooks/useSession');
    vi.mocked(useSession).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      isPending: false,
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    } as any);

    render(
      <ProtectedRoute>
        <MockChildComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login after logout', async () => {
    const { useSession } = await import('@/hooks/useSession');

    const mockRefreshSession = vi.fn();
    vi.mocked(useSession).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      isPending: false,
      refreshSession: mockRefreshSession,
      signOut: vi.fn(),
    } as any);

    const { rerender } = render(
      <ProtectedRoute>
        <MockChildComponent />
      </ProtectedRoute>
    );

    // Simulate session loss
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: false,
      refreshSession: mockRefreshSession,
      signOut: vi.fn(),
    } as any);

    rerender(
      <ProtectedRoute>
        <MockChildComponent />
      </ProtectedRoute>
    );

    expect(replaceMock).toHaveBeenCalledWith('/login');
  });
});
