import { useEffect, useState } from 'react';
import api from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const escapeCsv = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const downloadCsv = (filename, headers, rows) => {
  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function MiniBar({ label, value, max, colorClass, formatValue }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{formatValue(value)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.max((Number(value) / max) * 100, 3)}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [now] = useState(() => new Date());
  const [report, setReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recent, setRecent] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [repRes, yearlyRes, goalsRes, txRes] = await Promise.all([
          api.get(`/reports/monthly/${now.getFullYear()}/${now.getMonth() + 1}`),
          api.get(`/reports/yearly/${now.getFullYear()}`),
          api.get('/goals'),
          api.get('/transactions?page=0&size=50'),
        ]);
        setReport(repRes.data);
        setYearlyReport(yearlyRes.data);
        setGoals(goalsRes.data ?? []);
        setAllTransactions(txRes.data?.content ?? []);
        setRecent((txRes.data?.content ?? []).slice(0, 5));
      } catch {
        setError('Failed to load dashboard data. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [now]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;
  const categories = Object.entries(report?.expenseByCategory ?? {});
  const incomeCategories = Object.entries(report?.incomeByCategory ?? {});
  const highestExpense = categories.reduce(
    (best, current) => (Number(current[1]) > Number(best?.[1] || 0) ? current : best),
    null,
  );
  const income = Number(report?.totalIncome) || 0;
  const expenses = Number(report?.totalExpenses) || 0;
  const cashflowMax = Math.max(income, expenses, 1);
  const categoryMax = Math.max(...categories.map(([, amount]) => Number(amount) || 0), 1);
  const recentChartItems = [...allTransactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10);
  const activityMax = Math.max(...recentChartItems.map((item) => Number(item.amount) || 0), 1);

  const downloadMonthlyReport = () => {
    const categoryRows = [
      ...Object.entries(report?.incomeByCategory ?? {}).map(([category, amount]) => ({
        section: 'incomeByCategory',
        category,
        amount,
      })),
      ...Object.entries(report?.expenseByCategory ?? {}).map(([category, amount]) => ({
        section: 'expenseByCategory',
        category,
        amount,
      })),
    ];

    downloadCsv(
      `monthly-report-${report.year}-${String(report.month).padStart(2, '0')}.csv`,
      ['section', 'category', 'amount'],
      [
        { section: 'summary', category: 'Total Income', amount: report.totalIncome },
        { section: 'summary', category: 'Total Expenses', amount: report.totalExpenses },
        { section: 'summary', category: 'Net Savings', amount: report.netSavings },
        ...categoryRows,
      ],
    );
  };

  const downloadYearlyReport = () => {
    downloadCsv(
      `yearly-report-${yearlyReport.year}.csv`,
      ['year', 'totalIncome', 'totalExpenses', 'netSavings'],
      [yearlyReport],
    );
  };

  const downloadTransactionsReport = () => {
    downloadCsv(
      `transactions-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`,
      ['id', 'date', 'type', 'category', 'description', 'amount'],
      allTransactions.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
        amount: transaction.amount,
      })),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{MONTHS[now.getMonth()]} {now.getFullYear()} - Your financial overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary text-sm" onClick={downloadMonthlyReport} disabled={!report}>
            Download Monthly CSV
          </button>
          <button className="btn-secondary text-sm" onClick={downloadYearlyReport} disabled={!yearlyReport}>
            Download Yearly CSV
          </button>
          <button className="btn-secondary text-sm" onClick={downloadTransactionsReport} disabled={allTransactions.length === 0}>
            Download Transactions CSV
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card border-l-4 border-l-emerald-500">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Income</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{fmt(report.totalIncome)}</p>
          </div>
          <div className="card border-l-4 border-l-red-400">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Expenses</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">{fmt(report.totalExpenses)}</p>
          </div>
          <div className="card border-l-4 border-l-brand-500">
            <p className="text-sm text-gray-500 font-medium mb-1">Net Savings</p>
            <p className={`text-2xl sm:text-3xl font-bold ${Number(report.netSavings) >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
              {fmt(report.netSavings)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500 font-medium mb-1">Yearly Savings</p>
          <p className={`text-2xl font-bold ${Number(yearlyReport?.netSavings) >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
            {fmt(yearlyReport?.netSavings)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium mb-1">Goals</p>
          <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium mb-1">Recent Entries</p>
          <p className="text-2xl font-bold text-gray-900">{allTransactions.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 font-medium mb-1">Top Expense</p>
          <p className="text-lg font-bold text-gray-900 truncate">
            {highestExpense ? `${highestExpense[0]} ${fmt(highestExpense[1])}` : 'No expenses'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Cashflow</h2>
            <p className="text-sm text-gray-400">Income compared with expenses this month</p>
          </div>
          <div className="space-y-4">
            <MiniBar label="Income" value={income} max={cashflowMax} colorClass="bg-emerald-500" formatValue={fmt} />
            <MiniBar label="Expenses" value={expenses} max={cashflowMax} colorClass="bg-red-500" formatValue={fmt} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {incomeCategories.slice(0, 2).map(([category, amount]) => (
              <div key={category} className="rounded-lg bg-emerald-50 p-3">
                <p className="truncate text-xs font-medium text-emerald-700">{category}</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">{fmt(amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Expense Mix</h2>
            <p className="text-sm text-gray-400">Category share for the selected month</p>
          </div>
          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No expense data yet</p>
          ) : (
            <div className="space-y-3">
              {categories.map(([category, amount]) => {
                const percentage = Math.round(((Number(amount) || 0) / categoryMax) * 100);

                return (
                  <div key={category} className="grid grid-cols-[minmax(90px,140px)_1fr_auto] items-center gap-3">
                    <span className="truncate text-sm font-medium text-gray-600">{category}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{fmt(amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-400">Last {recentChartItems.length} transactions by amount</p>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <span className="text-emerald-600">Income</span>
            <span className="text-red-500">Expense</span>
          </div>
        </div>
        {recentChartItems.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No activity to chart yet</p>
        ) : (
          <div className="flex h-56 items-end gap-2 overflow-x-auto border-b border-gray-100 pb-2">
            {recentChartItems.map((transaction) => {
              const height = Math.max((Number(transaction.amount) / activityMax) * 100, 8);

              return (
                <div key={transaction.id} className="flex min-w-14 flex-1 flex-col items-center justify-end gap-2">
                  <div className="text-xs font-semibold text-gray-500">{fmt(transaction.amount)}</div>
                  <div
                    className={`w-full rounded-t-lg ${transaction.type === 'INCOME' ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ height: `${height}%` }}
                    title={`${transaction.category}: ${fmt(transaction.amount)}`}
                  />
                  <div className="w-full truncate text-center text-xs text-gray-400">
                    {transaction.date?.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recent.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {transaction.description || transaction.category}
                    </p>
                    <p className="text-xs text-gray-400">{transaction.category} / {transaction.date}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{fmt(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h2>
          {goals.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No goals set yet</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{goal.goalName}</span>
                    <span className="text-xs text-gray-500">{(Number(goal.progressPercentage) || 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(Number(goal.progressPercentage) || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{fmt(goal.currentProgress)} of {fmt(goal.targetAmount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map(([category, amount]) => (
              <div key={category} className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 font-medium truncate">{category}</p>
                <p className="text-lg font-bold text-red-500 mt-1">{fmt(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
