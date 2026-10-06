import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  createComment, deleteComment, likeComment, listComments, unlikeComment, updateComment,
} from '../../services/commentService.js';

// Applies `fn` to the comment (top-level or reply) with the given id
const mapComment = (comments, id, fn) =>
  comments.map((c) => {
    if (c._id === id) return fn(c);
    if (c.replies?.some((r) => r._id === id)) {
      return { ...c, replies: c.replies.map((r) => (r._id === id ? fn(r) : r)) };
    }
    return c;
  });

export default function CommentSection({ blogId, initialCount = 0 }) {
  const { user } = useAuth();
  const userId = user?._id;
  const toast = useToast();
  const location = useLocation();

  const [state, setState] = useState({ loading: true, comments: [], pagination: null, error: '' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(initialCount);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const { comments, pagination } = await listComments(blogId, { page: 1, limit: 10 });
      setState({ loading: false, comments, pagination, error: '' });
    } catch (err) {
      setState({ loading: false, comments: [], pagination: null, error: err.message });
    }
  }, [blogId]);

  // Reload on login/logout so each comment's "liked" state is correct for this viewer
  useEffect(() => {
    load();
  }, [load, userId]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = (state.pagination?.page || 1) + 1;
      const { comments, pagination } = await listComments(blogId, { page: next, limit: 10 });
      setState((s) => {
        const seen = new Set(s.comments.map((c) => c._id)); // avoid duplicates if new comments shifted the pages
        return { ...s, comments: [...s.comments, ...comments.filter((c) => !seen.has(c._id))], pagination };
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handlers throw on failure so the form can show the message
  const handlers = {
    onReply: async (target, text) => {
      const created = await createComment(blogId, { content: text, parentId: target._id });
      setState((s) => ({
        ...s,
        comments: s.comments.map((c) =>
          c._id === created.parent ? { ...c, replies: [...(c.replies || []), created] } : c
        ),
      }));
      setTotal((t) => t + 1);
    },

    onEdit: async (comment, text) => {
      const updated = await updateComment(comment._id, text);
      setState((s) => ({
        ...s,
        comments: mapComment(s.comments, comment._id, (c) => ({
          ...c, content: updated.content, editedAt: updated.editedAt,
        })),
      }));
    },

    onLike: async (comment) => {
      const next = !comment.liked;
      const patch = (liked, likesCount) =>
        setState((s) => ({ ...s, comments: mapComment(s.comments, comment._id, (c) => ({ ...c, liked, likesCount })) }));

      patch(next, Math.max(0, comment.likesCount + (next ? 1 : -1))); // optimistic
      try {
        const result = next ? await likeComment(comment._id) : await unlikeComment(comment._id);
        patch(result.liked, result.likesCount);
      } catch (err) {
        patch(comment.liked, comment.likesCount);
        toast.error(err.message);
      }
    },

    onDelete: (comment, topId) => setToDelete({ comment, topId }),
  };

  const addTopLevel = async (text) => {
    const created = await createComment(blogId, { content: text });
    setState((s) => ({ ...s, comments: [created, ...s.comments] }));
    setTotal((t) => t + 1);
  };

  const confirmDelete = async () => {
    const { comment, topId } = toDelete;
    setDeleting(true);
    try {
      await deleteComment(comment._id);
      const isTop = topId === comment._id;
      const removed = isTop ? 1 + (comment.replies?.length || 0) : 1;
      setState((s) => ({
        ...s,
        comments: isTop
          ? s.comments.filter((c) => c._id !== comment._id)
          : s.comments.map((c) =>
              c._id === topId ? { ...c, replies: c.replies.filter((r) => r._id !== comment._id) } : c
            ),
      }));
      setTotal((t) => Math.max(0, t - removed));
      setToDelete(null);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasMore = state.pagination && state.pagination.page < state.pagination.pages;

  return (
    <section id="comments" className="mt-10 scroll-mt-24" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-2xl font-bold">Comments ({total})</h2>

      <div className="mt-5">
        {user ? (
          <CommentForm onSubmit={addTopLevel} />
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-ink-600 dark:text-ink-300">Log in to join the discussion.</p>
            <Link to="/login" state={{ from: location }} className="btn-primary">Log in</Link>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-7">
        {state.loading &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3" role="status" aria-label="Loading comments">
              <Skeleton className="h-10 w-10 !rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-full" /></div>
            </div>
          ))}

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            Could not load comments: {state.error}{' '}
            <button className="font-medium underline" onClick={load}>Try again</button>
          </p>
        )}

        {!state.loading && !state.error && state.comments.length === 0 && (
          <p className="text-sm text-ink-500">No comments yet. Start the conversation.</p>
        )}

        {state.comments.map((c) => (
          <Comment key={c._id} comment={c} topId={c._id} handlers={handlers} />
        ))}
      </div>

      {hasMore && (
        <button className="btn-secondary mt-8" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load more comments'}
        </button>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this comment?"
        message={
          toDelete?.comment.replies?.length
            ? `This will also delete its ${toDelete.comment.replies.length} ${toDelete.comment.replies.length === 1 ? 'reply' : 'replies'}. This cannot be undone.`
            : 'This cannot be undone.'
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}