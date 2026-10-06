import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import NotificationItem from './NotificationItem.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { useNotifications } from '../../context/NotificationsContext.jsx';
import { listNotifications, markAllRead, markRead } from '../../services/notificationService.js';

export default function NotificationBell() {
  const { unread, setUnread } = useNotifications();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: false, items: [], error: '' });
  const ref = useRef(null);

  // Load fresh items each time the panel opens
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    listNotifications({ page: 1, limit: 8 })
      .then((r) => {
        if (!active) return;
        setState({ loading: false, items: r.notifications, error: '' });
        setUnread(r.unreadCount);
      })
      .catch((err) => active && setState({ loading: false, items: [], error: err.message }));
    return () => {
      active = false;
    };
  }, [open, setUnread]);

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

  const onOpenItem = (n) => {
    setOpen(false);
    if (n.read) return;
    setUnread((u) => Math.max(0, u - 1));
    markRead(n._id).then(setUnread).catch(() => {});
  };

  const onMarkAll = async () => {
    try {
      setUnread(await markAllRead());
      setState((s) => ({ ...s, items: s.items.map((i) => ({ ...i, read: true })) }));
    } catch {
      /* ignore: the next poll corrects the badge */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative !px-2.5"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[1.1rem] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
            <p className="font-semibold text-ink-900 dark:text-white">Notifications</p>
            <button
              type="button"
              onClick={onMarkAll}
              disabled={unread === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline disabled:opacity-40 dark:text-brand-300"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto divide-y divide-ink-100 dark:divide-ink-800">
            {state.loading && state.items.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3" role="status" aria-label="Loading notifications">
                  <Skeleton className="h-10 w-10 !rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-16" /></div>
                </div>
              ))}
            {state.error && <p className="px-4 py-6 text-center text-sm text-red-600" role="alert">{state.error}</p>}
            {!state.loading && !state.error && state.items.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-ink-500">You're all caught up.</p>
            )}
            {state.items.map((n) => <NotificationItem key={n._id} notification={n} onOpen={onOpenItem} />)}
          </div>

          <Link
            to="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-ink-100 px-4 py-3 text-center text-sm font-medium text-brand-700 hover:bg-ink-50 dark:border-ink-800 dark:text-brand-300 dark:hover:bg-ink-800"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}