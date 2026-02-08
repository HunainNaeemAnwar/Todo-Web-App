'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import { SidebarLayout } from '../components/SidebarLayout';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const showLogin = searchParams.get('showLogin') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <SidebarLayout>
        <Dashboard />
      </SidebarLayout>
    );
  }

  return <LandingPage initialShowLogin={showLogin} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen  flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
