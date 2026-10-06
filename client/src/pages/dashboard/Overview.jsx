import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import PostsTable from '../../components/dashboard/PostsTable.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getMyStats } from '../../services/blogService.js';
import { formatCount } from '../../utils/format.js';
import { fetchMe } from '../../services/authService.js';

export default function DashboardOverview() {
    const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const loadStats = useCallback(() => {
    getMyStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

    // Follower counts change while you are away, so refresh them
  useEffect(() => {
    fetchMe().then((u) => u && updateUser(u)).catch(() => {});
  }, [updateUser]);

  const cards = stats && [
    ['Total posts', stats.total],
    ['Published', stats.published],
    ['Drafts', stats.drafts],
    ['Views', stats.views],
    ['Likes', stats.likes],
    ['Comments', stats.comments],
    ['Followers', user.followersCount || 0],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink-500">Here is how your writing is doing.</p>
        </div>
        <Link to="/dashboard/write" className="btn-primary"><PenLine size={16} /> New post</Link>
      </div>

      {error && <p className="mt-6 text-sm text-red-600" role="alert">Could not load stats: {error}</p>}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {(cards || Array.from({ length: 7 })).map((c, i) =>
          c ? (
            <div key={c[0]} className="card p-4">
              <dt className="text-xs text-ink-500">{c[0]}</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900 dark:text-white">{formatCount(c[1])}</dd>
            </div>
          ) : (
            <Skeleton key={i} className="h-[74px]" />
          )
        )}
      </dl>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent posts</h2>
        <Link to="/dashboard/posts" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">View all</Link>
      </div>
      <div className="mt-4">
        <PostsTable limit={5} paginate={false} onChange={loadStats} />
      </div>
    </div>
  );
}