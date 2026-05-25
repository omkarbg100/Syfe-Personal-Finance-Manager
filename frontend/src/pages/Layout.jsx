import { useContext } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'D', end: true },
  { to: '/transactions', label: 'Transactions', icon: 'T' },
  { to: '/categories', label: 'Categories', icon: 'C' },
  { to: '/goals', label: 'Goals', icon: 'G' },
  { to: '/profile', label: 'Profile', icon: 'P' },
];

export default function Layout() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm fixed inset-y-0 left-0">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Syfe</h1>
              <p className="text-xs text-gray-400">Finance Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-current/10 text-xs font-bold">
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-red-100 text-xs font-bold">
              L
            </span>
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black">
              S
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Syfe</h1>
              <p className="text-xs text-gray-400">Finance Manager</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary py-2 text-sm">
            Logout
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="min-h-screen lg:ml-64 lg:flex-1">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
