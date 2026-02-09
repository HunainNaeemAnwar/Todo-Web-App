'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ProductivityChart,
  PeriodSelector,
} from '@/components/analytics/ProductivityChart';
import { WeeklyReport } from '@/components/analytics/WeeklyReport';
import { MonthlyReport } from '@/components/analytics/MonthlyReport';
import { userService, type UserStats } from '@/services/userService';
import { analyticsService } from '@/services/analyticsService';
import { generateTasksPDF } from '@/utils/pdfGenerator';
import { apiClient } from '@/lib/axiosConfig';
import { Loader2, Download, FileText } from 'lucide-react';
import { SidebarLayout } from '@/components/SidebarLayout';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'monthly'>(
    'overview'
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?showLogin=true');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    document.title = 'Analytics - TaskFlow';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user) {
        try {
          setLoading(true);
          const statsData = await userService.getStats();
          setStats(statsData);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to load analytics'
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [authLoading, user]);

  const handleExportCsv = async () => {
    try {
      const data = await analyticsService.exportToCsv();
      analyticsService.downloadCsv(data.filename, data.content);
    } catch {
      alert('Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    if (!stats) return;
    try {
      const tasksResponse = await apiClient.get('/tasks');
      const tasks = tasksResponse.data;

      await generateTasksPDF(
        tasks,
        {
          total_tasks: stats.total_tasks,
          completed_tasks: stats.completed_tasks,
          completion_rate: stats.completion_rate,
          streak_current: stats.streak_current,
          streak_best: stats.streak_best,
        },
        {
          title: 'My Task Report',
          includeTasks: true,
          includeStats: true,
        }
      );
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (authLoading || loading) {
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
          <p className="text-primary">Redirecting to login...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-luxury-gradient mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-secondary">
              Track your productivity and task completion trends
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 glass glass-interactive text-primary border-white/5 hover:border-accent-primary/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 glass glass-interactive text-primary border-white/5 hover:border-accent-primary/20 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="glass border-status-error/30 p-4 mb-6 animate-scale-in">
            <p className="text-sm text-status-error font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error mr-3 animate-pulse" />
              {error}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'weekly', label: 'Weekly Report' },
              { id: 'monthly', label: 'Monthly Report' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'weekly' | 'monthly')}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'glass-elevated bg-accent-primary/10 text-accent-primary border-accent-primary/20'
                    : 'text-secondary hover:text-tertiary hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <PeriodSelector value={period} onPeriodChange={setPeriod} />
              <ProductivityChart period={period} />
            </div>
          )}

          {activeTab === 'weekly' && <WeeklyReport />}

          {activeTab === 'monthly' && <MonthlyReport />}
        </div>
      </div>
    </SidebarLayout>
  );
}
