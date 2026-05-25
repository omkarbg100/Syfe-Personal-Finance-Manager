import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data);
        setForm({
          fullName: res.data.fullName || '',
          phoneNumber: res.data.phoneNumber || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/users/profile', form);
      setProfile(res.data);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const msg = err.response?.data?.error
        || Object.values(err.response?.data || {}).join(', ')
        || 'Failed to update profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">View and update your account details</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white">
              {(profile?.fullName || profile?.username || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">{profile?.fullName}</p>
              <p className="truncate text-sm text-gray-400">{profile?.username}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">User ID</span>
              <span className="font-semibold text-gray-800">{profile?.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Phone</span>
              <span className="font-semibold text-gray-800">{profile?.phoneNumber || 'Not set'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Created</span>
              <span className="font-semibold text-gray-800">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <form className="card lg:col-span-2 space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              className="input-field"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              className="input-field"
              type="text"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input className="input-field bg-gray-50" type="email" value={profile?.username || ''} disabled />
            <p className="mt-1 text-xs text-gray-400">Email is used for login and cannot be changed here.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
