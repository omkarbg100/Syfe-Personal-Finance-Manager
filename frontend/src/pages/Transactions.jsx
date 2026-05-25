import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions?page=0&size=50'),
        api.get('/categories'),
      ]);
      const txList = txRes.data?.content ?? [];
      const catList = catRes.data ?? [];
      setTransactions(txList);
      setCategories(catList);
      setCategoryName((current) => current || catList[0]?.name || '');
    } catch (err) {
      setError('Failed to load data. ' + (err.response?.data?.error || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const resetForm = () => {
    setAmount('');
    setDate(today);
    setDescription('');
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        amount: parseFloat(amount),
        category: categoryName,
        description,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post('/transactions', { ...payload, date });
      }

      resetForm();
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error
        || Object.values(err.response?.data || {}).join(', ')
        || `Failed to ${editingId ? 'update' : 'add'} transaction.`;
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setAmount(String(transaction.amount ?? ''));
    setDate(transaction.date || today);
    setCategoryName(transaction.category || '');
    setDescription(transaction.description || '');
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">Track every income and expense</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary py-1.5 px-3 text-sm">
                Cancel
              </button>
            )}
          </div>

          {formError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
              <input
                className="input-field"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                className="input-field"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                disabled={Boolean(editingId)}
                required
              />
              {editingId && (
                <p className="mt-1 text-xs text-gray-400">Transaction dates cannot be edited by the API.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                className="input-field"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name} ({category.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <input
                className="input-field"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly groceries"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting || categories.length === 0}>
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Transaction'}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Transactions
            <span className="ml-2 text-sm font-normal text-gray-400">({transactions.length})</span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first one using the form</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex shrink-0 items-center justify-center text-xs font-bold ${
                      transaction.type === 'INCOME'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                    >
                      {transaction.type === 'INCOME' ? 'IN' : 'EX'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {transaction.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-400">
                        <span className={`font-medium ${
                          transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'
                        }`}
                        >
                          {transaction.category}
                        </span>
                        {' / '}
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className={`text-base font-bold ${
                      transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'
                    }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}{fmt(transaction.amount)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-sm font-semibold text-gray-400 hover:text-brand-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
