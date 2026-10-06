import { useEffect, useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { followUser, getFollowState, unfollowUser } from '../../services/userService.js';

// Pass `initialFollowing` when the parent already knows it; otherwise the button looks it up.
export default function FollowButton({ userId, initialFollowing, onChange }) {
  const { user } = useAuth();
  const viewerId = user?._id;
  const requireAuth = useRequireAuth();
  const toast = useToast();
  const [following, setFollowing] = useState(!!initialFollowing);
  const [ready, setReady] = useState(initialFollowing !== undefined);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (initialFollowing !== undefined) {
      setFollowing(initialFollowing);
      setReady(true);
      return undefined;
    }
    if (!viewerId) {
      setFollowing(false);
      setReady(true);
      return undefined;
    }
    let active = true;
    setReady(false);
    getFollowState(userId)
      .then((value) => {
        if (!active) return;
        setFollowing(value);
        setReady(true);
      })
      .catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [userId, viewerId, initialFollowing]);

  if (viewerId && viewerId === userId) return null; // no button on your own profile

  const onClick = async () => {
    if (pending) return;
    if (!requireAuth('Log in to follow authors')) return;

    const next = !following;
    setPending(true);
    setFollowing(next); // optimistic
    try {
      const result = next ? await followUser(userId) : await unfollowUser(userId);
      setFollowing(result.following);
      onChange?.(result.followersCount, result.following);
    } catch (err) {
      setFollowing(!next);
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready || pending}
      aria-pressed={following}
      className={following ? 'btn-secondary' : 'btn-primary'}
    >
      {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {following ? 'Following' : 'Follow'}
    </button>
  );
}