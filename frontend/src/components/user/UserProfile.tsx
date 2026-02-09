'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService, type UserProfile, type UserStats } from '@/services/userService';
import { StatisticsCard, ProductivityOverview } from './StatisticsCard';
import { StreakDisplay, StreakCalendar } from './StreakDisplay';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit2,
  Save,
  Loader2,
  MapPin,
  Clock,
  Award,
  Target
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
      <div className="bg-secondary rounded-2xl p-12 flex items-center justify-center min-h-[300px] border border-white/5">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary rounded-2xl p-12 text-center border border-status-error/20">
        <p className="text-status-error font-bold uppercase tracking-widest text-xs mb-4 font-accent">
          Profile Sync Failed
        </p>
        <p className="text-secondary text-xs mb-8 font-accent">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-accent-primary text-inverse rounded-lg text-xs font-bold uppercase tracking-widest font-accent hover:bg-accent-secondary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-secondary rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-primary/10 border-2 border-accent-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 md:w-12 md:h-12 text-accent-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-status-success rounded-full border-2 border-secondary flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">
                {profile.name}
              </h2>
              
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center justify-center md:justify-start gap-2 text-secondary text-xs font-accent">
                  <Mail className="w-4 h-4 text-accent-primary" />
                  {profile.email}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-secondary text-xs font-accent">
                  <Calendar className="w-4 h-4 text-accent-primary" />
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={onEditClick}
            className="p-3 rounded-xl bg-tertiary border border-white/5 text-secondary hover:text-accent-primary hover:border-accent-primary/20 transition-all"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="space-y-6">
          <StatisticsCard stats={stats} />
          
          {/* Responsive Grid for Streak & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreakDisplay
              currentStreak={stats.streak_current}
              bestStreak={stats.streak_best}
            />
            <ProductivityOverview stats={stats} />
          </div>

          {/* Optional: Full Width Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StreakCalendar 
              streakData={[]} // Pass actual data here
            />
            <div className="bg-secondary rounded-xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-accent-gold" />
                <h3 className="text-lg font-display font-bold text-primary">Achievements</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Target, label: 'First Task', desc: 'Completed your first task', color: 'text-accent-primary' },
                  { icon: Clock, label: 'Early Bird', desc: 'Completed 5 tasks before 9am', color: 'text-status-warning' },
                  { icon: MapPin, label: 'Consistent', desc: '7 day streak achieved', color: 'text-status-success' },
                ].map((achievement, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-tertiary border border-white/5">
                    <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                    <div>
                      <p className="text-sm font-medium text-primary">{achievement.label}</p>
                      <p className="text-xs text-secondary font-accent">{achievement.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-secondary rounded-2xl p-6 md:p-8 max-w-xl mx-auto border border-white/5">
      <h3 className="text-2xl font-display font-bold text-primary mb-6">
        Edit Profile
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2 font-accent">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-tertiary border border-white/10 rounded-lg text-primary focus:outline-none focus:border-accent-primary transition-colors"
            placeholder="Enter your name"
            disabled={saving}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20">
            <p className="text-xs text-status-error font-accent">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-tertiary border border-white/10 rounded-lg text-secondary text-xs font-bold uppercase tracking-wider font-accent hover:bg-white/5 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] px-4 py-3 bg-accent-primary text-inverse rounded-lg text-xs font-bold uppercase tracking-wider font-accent hover:bg-accent-secondary transition-colors flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
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
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = () => {
    setEditingName(user?.name || '');
    setIsEditing(true);
  };

  const handleSave = async (name: string) => {
    try {
      const updatedProfile = await userService.updateProfile(name);
      setIsEditing(false);
      if (user) {
        updateUser({ ...user, name: updatedProfile.name });
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8" key={refreshKey}>
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