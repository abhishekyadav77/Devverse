import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, PenLine, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Pagination from '../common/Pagination.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { deleteBlog, listMyBlogs } from '../../services/blogService.js';
import { formatCount, formatDate, isFuture } from '../../utils/format.js';

function StatusBadge({ blog }) {
  const scheduled = blog.status === 'published' && isFuture(blog.publishedAt);
  const label = blog.isHidden ? 'Hidden' : scheduled ? 'Scheduled' : blog.status === 'published' ? 'Published' : blog.status === 'archived' ? 'Archived' : 'Draft';
  const tone =
    label === 'Published' ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
    : label === 'Scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    : label === 'Hidden' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export default function PostsTable({ status, limit = 10, paginate = true, emptyTitle, emptyText, onChange }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, blogs: [], pagination: null, error: '' });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const { blogs, pagination } = await listMyBlogs({ page, limit, ...(status && { status }) });
      setState({ loading: false, blogs, pagination, error: '' });
    } catch (err) {
      setState({ loading: false, blogs: [], pagination: null, error: err.message });
    }
  }, [page, limit, status]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteBlog(toDelete._id);
      toast.success('Post deleted');
      setToDelete(null);
      onChange?.();
      if (state.blogs.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (state.error) {
    return (
      <EmptyState
        title="Could not load your posts"
        text={state.error}
        action={<button className="btn-primary" onClick={load}>Try again</button>}
      />
    );
  }

  if (!state.loading && state.blogs.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No posts yet'}
        text={emptyText || 'Start with a draft. You can publish whenever you are ready.'}
        action={<Link to="/dashboard/write" className="btn-primary"><PenLine size={16} /> Write a post</Link>}
      />
    );
  }

  return (
    <>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-ink-200 text-xs text-ink-500 dark:border-ink-800">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Likes</th>
              <th className="px-4 py-3 font-medium">Comments</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {state.loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><Skeleton className="h-5 w-full" /></td></tr>
                ))
              : state.blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="max-w-[18rem] truncate px-4 py-3 font-medium text-ink-900 dark:text-white">{blog.title || 'Untitled draft'}</td>
                    <td className="px-4 py-3"><StatusBadge blog={blog} /></td>
                    <td className="px-4 py-3">{formatCount(blog.views)}</td>
                    <td className="px-4 py-3">{formatCount(blog.likesCount)}</td>
                    <td className="px-4 py-3">{formatCount(blog.commentsCount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500">{formatDate(blog.publishedAt || blog.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/dashboard/posts/${blog._id}/edit`} className="btn-ghost !p-2" aria-label={`Edit ${blog.title || 'draft'}`}><Pencil size={16} /></Link>
                        <Link to={`/blog/${blog.slug}`} className="btn-ghost !p-2" aria-label={`View ${blog.title || 'draft'}`}><ExternalLink size={16} /></Link>
                        <button className="btn-ghost !p-2 hover:!text-red-600" onClick={() => setToDelete(blog)} aria-label={`Delete ${blog.title || 'draft'}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {paginate && <Pagination page={page} pages={state.pagination?.pages} onChange={setPage} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this post?"
        message={`"${toDelete?.title || 'Untitled draft'}" will be permanently deleted. This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}