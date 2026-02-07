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
      <div className="glass-effect rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-error">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg"
        >
          Retry
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
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">{profile.name}</h2>
            <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" />
              {profile.email}
            </p>
            <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              Joined {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary glass-effect transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <div className="mt-6 space-y-4">
          <StatisticsCard stats={stats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      setError('Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-display font-bold text-text-primary mb-4">Edit Profile</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 glass-effect text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            placeholder="Your name"
            disabled={saving}
          />
        </div>

        {error && (
          <p className="text-error text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 glass-effect text-text-primary rounded-lg hover:bg-accent-light-orange transition-colors flex items-center justify-center gap-2"
            disabled={saving}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:from-accent-secondary hover:to-accent-primary transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
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
