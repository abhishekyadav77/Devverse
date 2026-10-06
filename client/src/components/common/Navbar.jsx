import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, PenLine, Search, X } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import UserMenu from './UserMenu.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: true },
  { to: '/explore#categories', label: 'Categories' },
  { to: '/about', label: 'About' },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'text-brand-700 dark:text-brand-300'
      : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
  }`;

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const onMobileLogout = async () => {
    setOpen(false);
    navigate('/');
    await logout();
    toast.success('Logged out');
  };

  const getLinkClass = ({ isActive }, link) => {
    const isCategories = link.to === '/explore#categories';
    const isCategoriesHash = window.location.hash === '#categories';

    const active = isCategories
      ? isActive && isCategoriesHash
      : isActive && !isCategoriesHash;

    return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'text-brand-700 dark:text-brand-300'
        : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur dark:border-ink-800 dark:bg-ink-950/85">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.end}
              className={(props) => getLinkClass(props, l)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden w-64 lg:block" role="search">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input !rounded-full !py-2 pl-9"
              placeholder="Search articles"
              aria-label="Search articles"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            to="/dashboard/write"
            className="btn-ghost hidden sm:inline-flex"
          >
            <PenLine size={16} /> Write
          </Link>

          {loading ? (
            <span className="h-8 w-8" aria-hidden="true" />
          ) : user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-ghost hidden sm:inline-flex"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary hidden sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            className="btn-ghost !px-2.5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-200 bg-white px-4 py-4 dark:border-ink-800 dark:bg-ink-950 md:hidden">
          <form onSubmit={onSearch} className="mb-3" role="search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              placeholder="Search articles"
              aria-label="Search articles"
            />
          </form>

          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.end}
                className={(props) => getLinkClass(props, l)}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}

            <NavLink
              to="/dashboard/write"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              Write
            </NavLink>

            {user && (
              <NavLink
                to="/dashboard"
                end
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 dark:border-ink-800">
            <span className="text-sm text-ink-500">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="mt-4 flex gap-2">
            {user ? (
              <button
                className="btn-secondary flex-1"
                onClick={onMobileLogout}
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary flex-1"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="btn-primary flex-1"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}