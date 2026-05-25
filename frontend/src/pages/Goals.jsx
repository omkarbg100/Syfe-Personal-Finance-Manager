import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goalName: '',
    targetAmount: '',
    targetDate: '',
  });

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewGoal({ goalName: '', targetAmount: '', targetDate: '' });
    setError('');
  };

  const openCreateForm = () => {
    setEditingId(null);
    setNewGoal({ goalName: '', targetAmount: '', targetDate: '' });
    setShowForm(true);
    setError('');
  };

  const openEditForm = (goal) => {
    setEditingId(goal.id);
    setNewGoal({
      goalName: goal.goalName,
      targetAmount: String(goal.targetAmount ?? ''),
      targetDate: goal.targetDate || '',
    });
    setShowForm(true);
    setError('');
  };

  const openGoalDetails = async (id) => {
    setDetailLoadingId(id);
    setError('');
    try {
      const res = await api.get(`/goals/${id}`);
      setSelectedGoal(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load goal details.');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        targetAmount: Number(newGoal.targetAmount),
        targetDate: newGoal.targetDate,
      };

      if (editingId) {
        const res = await api.put(`/goals/${editingId}`, payload);
        setGoals((prev) => prev.map((goal) => (goal.id === editingId ? res.data : goal)));
      } else {
        const res = await api.post('/goals', { ...payload, goalName: newGoal.goalName });
        setGoals((prev) => [...prev, res.data]);
      }

      resetForm();
    } catch (err) {
      const msg = err.response?.data?.error
        || Object.values(err.response?.data || {}).join(', ')
        || `Failed to ${editingId ? 'update' : 'create'} goal.`;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;

    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete goal.');
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
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">
            Progress is calculated from net savings after each goal start date
          </p>
        </div>
        <button className="btn-primary" onClick={showForm ? resetForm : openCreateForm}>
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form className="card space-y-4 max-w-xl" onSubmit={handleSubmitGoal}>
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal Name</label>
            <input
              className="input-field"
              type="text"
              value={newGoal.goalName}
              onChange={(e) => setNewGoal({ ...newGoal, goalName: e.target.value })}
              disabled={Boolean(editingId)}
              required
            />
            {editingId && (
              <p className="mt-1 text-xs text-gray-400">Goal names cannot be edited by the API.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Amount</label>
            <input
              className="input-field"
              type="number"
              min="0.01"
              step="0.01"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Date</label>
            <input
              className="input-field"
              type="date"
              value={newGoal.targetDate}
              min={tomorrow}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Goal'}
          </button>
        </form>
      )}

      {selectedGoal && (
        <div className="card border-l-4 border-l-brand-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedGoal.goalName}</h2>
              <p className="text-sm text-gray-400">
                Started {selectedGoal.startDate} / Target date {selectedGoal.targetDate}
              </p>
            </div>
            <button className="btn-secondary py-2 px-3 text-sm" onClick={() => setSelectedGoal(null)}>
              Close
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-lg font-bold text-gray-900">{fmt(selectedGoal.targetAmount)}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-lg font-bold text-emerald-600">{fmt(selectedGoal.currentProgress)}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="text-lg font-bold text-red-500">{fmt(selectedGoal.remainingAmount)}</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs text-gray-500">Complete</p>
              <p className="text-lg font-bold text-brand-600">
                {(Number(selectedGoal.progressPercentage) || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 font-medium">No goals yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add one to start tracking your savings progress.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.id} className="card">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <span className="text-base font-semibold text-gray-800">{goal.goalName}</span>
                  <p className="text-xs text-gray-400 mt-1">Target date: {goal.targetDate}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {((Number(goal.progressPercentage) || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(Number(goal.progressPercentage) || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {fmt(goal.currentProgress)} of {fmt(goal.targetAmount)} / {fmt(goal.remainingAmount)} remaining
              </p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openGoalDetails(goal.id)} className="btn-secondary py-2 px-3 text-sm">
                  {detailLoadingId === goal.id ? 'Loading...' : 'Details'}
                </button>
                <button onClick={() => openEditForm(goal)} className="btn-secondary py-2 px-3 text-sm">
                  Edit
                </button>
                <button onClick={() => handleDeleteGoal(goal.id)} className="btn-danger py-2 px-3 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
