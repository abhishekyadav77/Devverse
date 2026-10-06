import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, LayoutDashboard, LogOut, PenLine, Shield, UserRound } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    navigate('/'); // leave protected pages first so we don't bounce to /login
    await logout();
    toast.success('Logged out');
  };

  const item = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="rounded-full" aria-haspopup="menu" aria-expanded={open} aria-label="Open account menu">
        <Avatar src={user.avatar} name={user.name} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-ink-200 bg-white p-2 shadow-lg dark:border-ink-700 dark:bg-ink-900">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{user.name}</p>
            <p className="truncate text-xs text-ink-500">@{user.username}</p>
          </div>
          <div className="my-1 border-t border-ink-100 dark:border-ink-800" />
          <Link to="/dashboard" className={item} onClick={() => setOpen(false)}><LayoutDashboard size={16} /> Dashboard</Link>
          <Link to="/dashboard/write" className={item} onClick={() => setOpen(false)}><PenLine size={16} /> Write</Link>
          <Link to="/dashboard/bookmarks" className={item} onClick={() => setOpen(false)}><Bookmark size={16} /> Saved</Link>
          <Link to="/dashboard/profile" className={item} onClick={() => setOpen(false)}><UserRound size={16} /> Profile</Link>
          {isAdmin && <Link to="/admin" className={item} onClick={() => setOpen(false)}><Shield size={16} /> Admin</Link>}
          <div className="my-1 border-t border-ink-100 dark:border-ink-800" />
          <button onClick={handleLogout} className={`${item} w-full`}><LogOut size={16} /> Log out</button>
        </div>
      )}
    </div>
  );
}