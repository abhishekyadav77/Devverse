import { useEffect, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import NotificationItem from '../../components/notifications/NotificationItem.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { useNotifications } from '../../context/NotificationsContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { listNotifications, markAllRead, markRead } from '../../services/notificationService.js';

export default function Notifications() {
  const { unread, setUnread } = useNotifications();
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, items: [], pagination: null, error: '' });
  useDocumentTitle('Notifications | DevVerse');

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    listNotifications({ page, limit: 15 })
      .then((r) => {
        if (!active) return;
        setState({ loading: false, items: r.notifications, pagination: r.pagination, error: '' });
        setUnread(r.unreadCount);
      })
      .catch((err) => active && setState({ loading: false, items: [], pagination: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [page, attempt, setUnread]);

  const onOpen = (n) => {
    if (n.read) return;
    setState((s) => ({ ...s, items: s.items.map((i) => (i._id === n._id ? { ...i, read: true } : i)) }));
    setUnread((u) => Math.max(0, u - 1));
    markRead(n._id).then(setUnread).catch(() => {});
  };

  const onMarkAll = async () => {
    try {
      setUnread(await markAllRead());
      setState((s) => ({ ...s, items: s.items.map((i) => ({ ...i, read: true })) }));
    } catch {
      /* the next poll corrects the badge */
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">Follows, likes, comments and replies.</p>
        </div>
        <button className="btn-secondary" onClick={onMarkAll} disabled={unread === 0}>
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="mt-6">
        {state.error ? (
          <EmptyState title="Could not load notifications" text={state.error} action={<button className="btn-primary" onClick={() => setAttempt((a) => a + 1)}>Try again</button>} />
        ) : state.loading ? (
          <div className="card divide-y divide-ink-100 dark:divide-ink-800" role="status" aria-label="Loading notifications">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 !rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-16" /></div>
              </div>
            ))}
          </div>
        ) : state.items.length === 0 ? (
          <EmptyState
            title={page > 1 ? 'That page is empty' : 'No notifications yet'}
            text={page > 1 ? undefined : 'When someone follows you, or likes or comments on your writing, it shows up here.'}
            action={page > 1 ? <button className="btn-primary" onClick={() => setPage(1)}>Back to page 1</button> : undefined}
          />
        ) : (
          <>
            <div className="card divide-y divide-ink-100 overflow-hidden dark:divide-ink-800">
              {state.items.map((n) => <NotificationItem key={n._id} notification={n} onOpen={onOpen} />)}
            </div>
            <Pagination page={page} pages={state.pagination?.pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}