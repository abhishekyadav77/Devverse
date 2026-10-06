import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BlogGrid from './BlogGrid.jsx';
import SortTabs from './SortTabs.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Spinner from '../common/Spinner.jsx';
import { useSeo } from '../../hooks/useSeo.js';
import { useListParams } from '../../hooks/useListParams.js';
import { usePagedBlogs } from '../../hooks/usePagedBlogs.js';
import { listBlogs } from '../../services/blogService.js';
import { plural } from '../../utils/format.js';

// kind: 'category' | 'tag'. fetchMeta must be a stable (module-level) function.
export default function TaxonomyListing({ kind, slug, fetchMeta, filterKey }) {
  const { page, sort, setPage, setSort } = useListParams();
  const [meta, setMeta] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;
    setMeta({ loading: true, data: null, error: null });
    fetchMeta(slug)
      .then((data) => active && setMeta({ loading: false, data, error: null }))
      .catch((error) => active && setMeta({ loading: false, data: null, error }));
    return () => {
      active = false;
    };
  }, [slug, fetchMeta]);

  const fetcher = useCallback(
    () => listBlogs({ [filterKey]: slug, sort, page, limit: 9 }),
    [filterKey, slug, sort, page]
  );
  const [state, retry] = usePagedBlogs(fetcher);

  const title = meta.data ? (kind === 'tag' ? `#${meta.data.name}` : meta.data.name) : null;
    useSeo(
    meta.data
      ? {
          title,
          description: meta.data.description || `Articles about ${meta.data.name} on DevVerse.`,
          path: `/${kind}/${slug}`,
        }
      : { noindex: !!meta.error }
  );

  if (meta.loading) return <Spinner className="min-h-[50vh]" />;

  if (meta.error) {
    const notFound = meta.error.response?.status === 404;
    return (
      <div className="container-page py-20">
        <EmptyState
          title={notFound ? `That ${kind} doesn't exist` : `Could not load this ${kind}`}
          text={notFound ? 'Check the link or browse everything instead.' : meta.error.message}
          action={<Link to="/explore" className="btn-primary">Browse articles</Link>}
        />
      </div>
    );
  }

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      {meta.data.description && <p className="mt-2 max-w-2xl text-ink-500">{meta.data.description}</p>}
      <p className="mt-2 text-sm text-ink-500">{plural(meta.data.postCount, 'article')}</p>

      <div className="mt-8 flex justify-end">
        <SortTabs value={sort} onChange={setSort} />
      </div>

      <div className="mt-6">
        <BlogGrid
          state={state}
          onRetry={retry}
          page={page}
          onPageChange={setPage}
          emptyTitle={`No articles in this ${kind} yet`}
          emptyText="Check back soon, or write the first one."
          emptyAction={<Link to="/dashboard/write" className="btn-primary">Start writing</Link>}
        />
      </div>
    </section>
  );
}