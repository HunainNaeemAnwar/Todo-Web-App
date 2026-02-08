'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService, type UserProfile, type UserStats } from '@/services/userService';
import { StatisticsCard, ProductivityOverview } from './StatisticsCard';
import { StreakDisplay } from './StreakDisplay';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Edit2,
  Save,
  X,
  Bell,
  Settings,
  Loader2
} from 'lucide-react';

interface UserProfileCardProps {
  onEditClick: () => void;
}

function UserProfileCard({ onEditClick }: UserProfileCardProps) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        userService.getProfile(),
        userService.getStats()
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="glass-panel rounded-2xl p-12 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border-status-error/30">
        <p className="text-status-error font-bold uppercase tracking-widest text-xs mb-4">Profile Sync Failure</p>
        <p className="text-text-secondary text-sm mb-8">{error}</p>
        <button
          onClick={fetchData}
          className="btn-luxury"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-10">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-accent-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-accent-primary/20 via-accent-primary/5 to-transparent border border-accent-primary/20 rounded-full flex items-center justify-center relative z-10 overflow-hidden shadow-2xl">
              <User className="w-12 h-12 text-accent-primary" />
              <div className="absolute inset-0 bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-display font-bold text-text-primary tracking-tight">{profile.name}</h2>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-neutral-grey text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-accent-primary" />
                {profile.email}
              </p>
              <p className="text-neutral-grey text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                Commissioned {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="p-4 rounded-2xl glass glass-interactive border-white/5 text-neutral-grey hover:text-accent-primary transition-all"
          title="Refine Profile"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      {stats && (
        <div className="mt-12 space-y-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-grey ml-1">Performance Index</h3>
            <StatisticsCard stats={stats} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StreakDisplay
              currentStreak={stats.streak_current}
              bestStreak={stats.streak_best}
            />
            <ProductivityOverview stats={stats} />
          </div>
        </div>
      )}
    </div>
  );
}

interface EditProfileFormProps {
  currentName: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}

function EditProfileForm({ currentName, onSave, onCancel }: EditProfileFormProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Identifier cannot be void');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refinement failure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-10 max-w-2xl mx-auto shadow-2xl">
      <h3 className="text-3xl font-display font-bold text-text-primary tracking-tight mb-8">Refine Identity</h3>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-grey ml-1">Designated Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass glass-input py-5 px-6 text-xl font-semibold focus:ring-accent-primary/20"
            placeholder="Identity identifier"
            disabled={saving}
          />
        </div>

        {error && (
          <div className="glass border-status-error/30 p-4 animate-scale-in">
            <p className="text-sm text-status-error font-medium flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error mr-3 animate-pulse" />
              {error}
            </p>
          </div>
        )}

        <div className="flex gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 glass glass-interactive border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-grey"
            disabled={saving}
          >
            Abort
          </button>
          <button
            type="submit"
            className="flex-[2] btn-luxury disabled:opacity-50 flex items-center justify-center gap-3"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = () => {
    setEditingName(user?.name || '');
    setIsEditing(true);
  };

  const handleSave = async (name: string) => {
    setLoading(true);
    try {
      const updatedProfile = await userService.updateProfile(name);
      setIsEditing(false);
      if (user) {
        updateUser({ ...user, name: updatedProfile.name });
      }
      setRefreshKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {isEditing ? (
        <EditProfileForm
          currentName={editingName}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <UserProfileCard onEditClick={handleEditClick} />
      )}
    </div>
  );
}
