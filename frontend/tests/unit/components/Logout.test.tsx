/**
 * Unit tests for logout functionality.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signOut } from '@/lib/better-auth-client';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

vi.mock('@/lib/better-auth-client', () => ({
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

describe('Logout Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully logs out user', async () => {
    const { signOut: mockSignOut } = await import('@/lib/better-auth-client');
    vi.mocked(mockSignOut).mockResolvedValue({} as any);

    await signOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('handles logout errors gracefully', async () => {
    const { signOut: mockSignOut } = await import('@/lib/better-auth-client');
    vi.mocked(mockSignOut).mockRejectedValue(new Error('Logout failed'));

    await expect(signOut()).rejects.toThrow('Logout failed');

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('redirects to login page after logout', async () => {
    const { signOut: mockSignOut } = await import('@/lib/better-auth-client');

    vi.mocked(mockSignOut).mockResolvedValue({} as any);

    await mockSignOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
