import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import BlogGrid from '../../components/blog/BlogGrid.jsx';
import SortTabs from '../../components/blog/SortTabs.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useSeo } from '../../hooks/useSeo.js';
import { useListParams } from '../../hooks/useListParams.js';
import { usePagedBlogs } from '../../hooks/usePagedBlogs.js';
import { searchBlogs } from '../../services/searchService.js';

const MIN_QUERY = 2;

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const { page, sort, setPage, setSort } = useListParams();
  const [input, setInput] = useState(q);
    useSeo({ title: q ? `${q} - Search` : 'Search', noindex: true });

  // Keep the box in sync when the navbar search changes the URL
  useEffect(() => setInput(q), [q]);

  const fetcher = useCallback(
    () =>
      q.length >= MIN_QUERY
        ? searchBlogs({ q, sort, page, limit: 9 })
        : Promise.resolve({ blogs: [], pagination: null }),
    [q, sort, page]
  );
  const [state, retry] = usePagedBlogs(fetcher);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (input.trim()) next.set('q', input.trim());
    if (sort !== 'latest') next.set('sort', sort);
    setParams(next);
  };

  const total = state.pagination?.total ?? 0;
  const tooShort = q.length < MIN_QUERY;

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-extrabold">Search</h1>

      <form onSubmit={onSubmit} role="search" className="mt-6 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input pl-10"
            placeholder="Search titles, content, tags, categories, authors"
            aria-label="Search articles"
            maxLength={100}
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {tooShort ? (
        <div className="mt-10">
          <EmptyState
            title={q ? 'Search for at least 2 characters' : 'What are you looking for?'}
            text="Search by title, article text, tag, category or author name."
            action={<Link to="/explore" className="btn-secondary">Or browse everything</Link>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold text-ink-900 dark:text-white" aria-live="polite">
              {state.loading ? 'Searching...' : state.error ? '' : `${total} ${total === 1 ? 'result' : 'results'} for "${q}"`}
            </p>
            <SortTabs value={sort} onChange={setSort} />
          </div>

          <div className="mt-6">
            <BlogGrid
              state={state}
              onRetry={retry}
              page={page}
              onPageChange={setPage}
              emptyTitle={`No results for "${q}"`}
              emptyText="Try a different spelling, a shorter term, or browse by category."
              emptyAction={<Link to="/explore" className="btn-primary">Browse articles</Link>}
            />
          </div>
        </>
      )}
    </section>
  );
}