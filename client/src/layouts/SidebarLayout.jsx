import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import { useSeo } from '../hooks/useSeo.js';

// Shared shell for the user dashboard and admin panel.
export default function SidebarLayout({ title, items }) {

    useSeo({ noindex: true });
    
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-ink-200 dark:border-ink-800 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="lg:hidden"><ThemeToggle /></div>
        </div>
        <p className="px-4 pb-2 text-xs font-semibold text-ink-400">{title}</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible" aria-label={title}>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="hidden h-16 items-center justify-end border-b border-ink-200 px-6 dark:border-ink-800 lg:flex">
          <ThemeToggle />
        </div>
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
