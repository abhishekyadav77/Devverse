import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, PageHeader, StatCard } from '../../components/admin/AdminUI.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getAdminStats } from '../../services/adminService.js';
import { formatCount, formatDate } from '../../utils/format.js';

export default function AdminOverview() {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useDocumentTitle('Admin | DevVerse');

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    getAdminStats()
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.error) {
    return <EmptyState title="Could not load statistics" text={state.error} action={<button className="btn-primary" onClick={load}>Try again</button>} />;
  }

  const d = state.data;
  const cards = d && [
    ['Total users', formatCount(d.users.total)],
    ['Active users', formatCount(d.users.active), d.users.suspended ? `${d.users.suspended} suspended` : null],
    ['Total blogs', formatCount(d.blogs.total)],
    ['Published blogs', formatCount(d.blogs.published), d.blogs.hidden ? `${d.blogs.hidden} hidden` : null],
    ['Draft blogs', formatCount(d.blogs.drafts)],
    ['Total comments', formatCount(d.comments)],
    ['Total views', formatCount(d.blogs.views)],
    ['Total likes', formatCount(d.blogs.likes)],
  ];

  return (
    <div>
      <PageHeader title="Admin overview" text="A snapshot of the whole platform." />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(cards || Array.from({ length: 8 })).map((c, i) =>
          c ? <StatCard key={c[0]} label={c[0]} value={c[1]} hint={c[2]} /> : <Skeleton key={i} className="h-[88px]" />
        )}
      </dl>

      {d && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="card p-5" aria-labelledby="recent-users">
            <div className="flex items-center justify-between">
              <h2 id="recent-users" className="text-lg font-bold">New users</h2>
              <Link to="/admin/users" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">Manage</Link>
            </div>
            <ul className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
              {d.recentUsers.map((u) => (
                <li key={u._id} className="flex items-center gap-3 py-3">
                  <Avatar src={u.avatar} name={u.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-ink-500">@{u.username}, joined {formatDate(u.createdAt)}</p>
                  </div>
                  {u.status === 'suspended' && <Badge tone="red">Suspended</Badge>}
                  {u.role === 'admin' && <Badge tone="green">Admin</Badge>}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5" aria-labelledby="recent-posts">
            <div className="flex items-center justify-between">
              <h2 id="recent-posts" className="text-lg font-bold">Latest posts</h2>
              <Link to="/admin/posts" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">Moderate</Link>
            </div>
            {d.recentPosts.length === 0 ? (
              <p className="mt-6 text-sm text-ink-500">Nothing has been published yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-ink-100 dark:divide-ink-800">
                {d.recentPosts.map((p) => (
                  <li key={p._id} className="py-3">
                    <Link to={`/blog/${p.slug}`} className="line-clamp-1 text-sm font-medium text-ink-900 hover:underline dark:text-white">
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {p.author?.name}, {formatDate(p.publishedAt)}, {formatCount(p.views)} views {p.isHidden && '(hidden)'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}