import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data ?? []);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/categories', { name, type });
      setName('');
      await fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add category. It may already exist.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${encodeURIComponent(catName)}`);
      setCategories((prev) => prev.filter((category) => category.name !== catName));
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot delete. It may be a default category or used in transactions.');
    }
  };

  const income = categories.filter((category) => category.type === 'INCOME');
  const expense = categories.filter((category) => category.type === 'EXPENSE');

  const CategoryBadge = ({ category }) => (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all hover:-translate-y-0.5 ${
      category.type === 'INCOME'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200'
    }`}
    >
      {category.name}
      {!category.custom && (
        <span className="text-xs opacity-60 font-normal">default</span>
      )}
      {category.custom && (
        <button
          onClick={() => handleDelete(category.name)}
          className="ml-1 w-4 h-4 rounded-full bg-current/10 hover:bg-current/20 flex items-center justify-center text-xs leading-none opacity-70 hover:opacity-100 transition-all"
          title="Delete category"
        >
          x
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Organise your transactions with categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="card lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Category</h2>

          {formError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
              <input
                className="input-field"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Freelance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['EXPENSE', 'INCOME'].map((categoryType) => (
                  <button
                    key={categoryType}
                    type="button"
                    onClick={() => setType(categoryType)}
                    className={`py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${
                      type === categoryType
                        ? categoryType === 'INCOME'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {categoryType === 'INCOME' ? 'Income' : 'Expense'}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{income.length}</p>
              <p className="text-xs text-gray-500 mt-1">Income</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{expense.length}</p>
              <p className="text-xs text-gray-500 mt-1">Expense</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="card flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600" />
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-700">
                    IN
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Income Categories</h2>
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    {income.length}
                  </span>
                </div>
                {income.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No income categories</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {income.map((category) => <CategoryBadge key={category.id} category={category} />)}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-red-600">
                    EX
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Expense Categories</h2>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {expense.length}
                  </span>
                </div>
                {expense.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No expense categories</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {expense.map((category) => <CategoryBadge key={category.id} category={category} />)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
