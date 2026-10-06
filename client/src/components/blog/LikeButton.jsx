import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getLikeState, likeBlog, unlikeBlog } from '../../services/engagementService.js';
import { formatCount } from '../../utils/format.js';

export default function LikeButton({ blogId, initialCount = 0 }) {
  const { user } = useAuth();
  const userId = user?._id;
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  // Whether THIS viewer already liked the post
  useEffect(() => {
    if (!userId) {
      setLiked(false);
      return undefined;
    }
    let active = true;
    getLikeState(blogId)
      .then((value) => active && setLiked(value))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [blogId, userId]);

  const onClick = async () => {
    if (pending) return;
    if (!requireAuth('Log in to like articles')) return;

    const next = !liked;
    setPending(true);
    setLiked(next); // optimistic
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const result = next ? await likeBlog(blogId) : await unlikeBlog(blogId);
      setLiked(result.liked); // the server is the source of truth
      setCount(result.likesCount);
    } catch (err) {
      setLiked(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this article' : 'Like this article'}
      className={`btn-ghost ${liked ? '!text-red-600 dark:!text-red-400' : ''}`}
    >
      <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {formatCount(count)}
    </button>
  );
}