import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getUnreadCount } from '../services/notificationService.js';

const NotificationsContext = createContext(null);
const POLL_MS = 30000;

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setUnread(await getUnreadCount());
    } catch {
      /* the badge simply keeps its last value */
    }
  }, []);

  // Poll while the tab is visible, and refresh as soon as the tab regains focus
  useEffect(() => {
    if (!userId) {
      setUnread(0);
      return undefined;
    }
    refresh();
    const tick = () => document.visibilityState === 'visible' && refresh();
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [userId, refresh]);

  const value = useMemo(() => ({ unread, setUnread, refresh }), [unread, refresh]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};