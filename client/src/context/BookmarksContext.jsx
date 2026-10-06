import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { bookmarkBlog, getBookmarkIds, unbookmarkBlog } from '../services/engagementService.js';

const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;
  const [ids, setIds] = useState(() => new Set());
  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  // Load the viewer's bookmarked ids once per login
  useEffect(() => {
    if (!userId) {
      setIds(new Set());
      return undefined;
    }
    let active = true;
    getBookmarkIds()
      .then((list) => active && setIds(new Set(list.map(String))))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);

  const has = useCallback((blogId) => ids.has(String(blogId)), [ids]);

  // Optimistic: flips immediately, rolls back if the request fails. Resolves to the new saved state.
  const toggle = useCallback(async (blogId) => {
    const key = String(blogId);
    const wasSaved = idsRef.current.has(key);
    const apply = (saved) =>
      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.add(key);
        else next.delete(key);
        return next;
      });

    apply(!wasSaved);
    try {
      if (wasSaved) await unbookmarkBlog(blogId);
      else await bookmarkBlog(blogId);
      return !wasSaved;
    } catch (err) {
      apply(wasSaved);
      throw err;
    }
  }, []);

  const value = useMemo(() => ({ has, toggle }), [has, toggle]);
  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used inside BookmarksProvider');
  return ctx;
};