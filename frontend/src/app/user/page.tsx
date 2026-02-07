'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import UserProfile from '@/components/user/UserProfile';
import { SidebarLayout } from '@/components/SidebarLayout';
import { Loader2 } from 'lucide-react';

export default function UserPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = 'Profile - TaskFlow';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?showLogin=true');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="text-center">
          <p className="text-text-primary">Redirecting to login...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          Profile & Settings
        </h1>
        <p className="text-text-secondary mb-8">
          Manage your account information and view your productivity stats
        </p>

        <UserProfile />
      </div>
    </SidebarLayout>
  );
}
