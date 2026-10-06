import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../../context/BookmarksContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';

export default function BookmarkButton({ blogId, label = false, onChange }) {
  const { has, toggle } = useBookmarks();
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const saved = has(blogId);

  const onClick = async () => {
    if (pending) return;
    if (!requireAuth('Log in to save articles')) return;
    setPending(true);
    try {
      const nowSaved = await toggle(blogId);
      toast.success(nowSaved ? 'Saved to your bookmarks' : 'Removed from your bookmarks');
      onChange?.(blogId, nowSaved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Save for later'}
      className={`btn-ghost ${label ? '' : '!p-2'} ${saved ? '!text-brand-700 dark:!text-brand-300' : ''}`}
    >
      <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
      {label && (saved ? 'Saved' : 'Save')}
    </button>
  );
}