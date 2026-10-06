import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogGrid from '../../components/blog/BlogGrid.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useListParams } from '../../hooks/useListParams.js';
import { usePagedBlogs } from '../../hooks/usePagedBlogs.js';
import { listBookmarks } from '../../services/engagementService.js';

export default function Bookmarks() {
  const { page, setPage } = useListParams();
  const [removed, setRemoved] = useState(() => new Set());
  useDocumentTitle('Saved articles | DevVerse');

  const fetcher = useCallback(() => listBookmarks({ page, limit: 9 }), [page]);
  const [state, retry] = usePagedBlogs(fetcher);

  // Un-saving removes the card right away
  const onBookmarkChange = useCallback((blogId, saved) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (saved) next.delete(blogId);
      else next.add(blogId);
      return next;
    });
  }, []);

  const visible = useMemo(
    () => ({ ...state, blogs: state.blogs.filter((b) => !removed.has(b._id)) }),
    [state, removed]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Saved articles</h1>
      <p className="mt-1 text-sm text-ink-500">Articles you bookmarked to read later.</p>
      <div className="mt-6">
        <BlogGrid
          state={visible}
          onRetry={retry}
          page={page}
          onPageChange={setPage}
          onBookmarkChange={onBookmarkChange}
          emptyTitle="Nothing saved yet"
          emptyText="Tap the bookmark icon on any article to keep it here."
          emptyAction={<Link to="/explore" className="btn-primary">Explore articles</Link>}
        />
      </div>
    </div>
  );
}