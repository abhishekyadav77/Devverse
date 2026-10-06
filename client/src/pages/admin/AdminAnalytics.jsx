import { useCallback, useEffect, useState } from 'react';
import { BarList, LineChart } from '../../components/admin/Charts.jsx';
import { PageHeader } from '../../components/admin/AdminUI.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getAdminAnalytics } from '../../services/adminService.js';

const RANGES = [7, 30, 90];
const sum = (rows, key = 'value') => rows.reduce((total, r) => total + r[key], 0);

function ChartCard({ title, summary, children }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {summary && <p className="text-sm text-ink-500">{summary}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useDocumentTitle('Analytics | DevVerse');

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    getAdminAnalytics(days)
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const d = state.data;

  return (
    <div>
      <PageHeader
        title="Analytics"
        text="Daily activity in UTC."
        action={
          <div role="group" aria-label="Date range" className="inline-flex rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={days === r}
                onClick={() => setDays(r)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${days === r ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'}`}
              >
                {r} days
              </button>
            ))}
          </div>
        }
      />

      {state.error ? (
        <EmptyState title="Could not load analytics" text={state.error} action={<button className="btn-primary" onClick={load}>Try again</button>} />
      ) : !d ? (
        <div className="grid gap-6 lg:grid-cols-2" role="status" aria-label="Loading analytics">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : (
        <div className={`grid gap-6 lg:grid-cols-2 ${state.loading ? 'opacity-60' : ''}`}>
          <ChartCard title="Posts published" summary={`${sum(d.posts)} in the last ${d.days} days`}>
            <LineChart data={d.posts} noun="posts" label={`Posts published per day, ${sum(d.posts)} total`} />
          </ChartCard>

          <ChartCard title="User growth" summary={`+${sum(d.users, 'added')} new, ${d.users[d.users.length - 1].value} total`}>
            <LineChart data={d.users} noun="users" label="Total users over time" />
          </ChartCard>

          <ChartCard title="Views over time" summary={`${sum(d.views).toLocaleString()} views`}>
            <LineChart data={d.views} noun="views" label={`Article views per day, ${sum(d.views)} total`} />
            <p className="mt-2 text-xs text-ink-400">Daily view tracking started when this feature was deployed.</p>
          </ChartCard>

          <ChartCard title="Most popular categories" summary="By published posts">
            {d.categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-500">No published posts yet.</p>
            ) : (
              <BarList items={d.categories} />
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
