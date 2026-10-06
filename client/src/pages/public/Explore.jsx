import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BlogGrid from '../../components/blog/BlogGrid.jsx';
import SortTabs from '../../components/blog/SortTabs.jsx';
import TagBadge from '../../components/blog/TagBadge.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useListParams } from '../../hooks/useListParams.js';
import { usePagedBlogs } from '../../hooks/usePagedBlogs.js';
import { listBlogs } from '../../services/blogService.js';
import { getCategories, getPopularTags } from '../../services/taxonomyService.js';

export default function Explore() {
  const { page, sort, setPage, setSort } = useListParams();
  const { hash } = useLocation();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  useDocumentTitle('Explore | DevVerse');

  const fetcher = useCallback(() => listBlogs({ page, sort, limit: 9 }), [page, sort]);
  const [state, retry] = usePagedBlogs(fetcher);

  useEffect(() => {
    getCategories({ sort: 'popular' }).then(setCategories).catch(() => {});
    getPopularTags().then(setTags).catch(() => {});
  }, []);

  // The navbar "Categories" link is /explore#categories
  useEffect(() => {
    if (hash === '#categories') document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, categories.length]);

  return (
    <section className="container-page py-12">
      <h1 className="text-4xl font-extrabold">Explore</h1>
      <p className="mt-2 text-ink-500">The newest articles from writers on DevVerse.</p>

      {categories.length > 0 && (
        <div id="categories" className="mt-8 scroll-mt-24">
          <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Browse by category</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c._id}>
                <Link
                  to={`/category/${c.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-1.5 text-sm font-medium hover:border-brand-500 hover:text-brand-700 dark:border-ink-700 dark:hover:text-brand-300"
                >
                  {c.name} <span className="text-ink-400">{c.postCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Popular tags</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => <li key={t._id}><TagBadge tag={t} count={t.count} /></li>)}
          </ul>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <SortTabs value={sort} onChange={setSort} />
      </div>

      <div className="mt-6">
        <BlogGrid
          state={state}
          onRetry={retry}
          page={page}
          onPageChange={setPage}
          emptyTitle="No articles published yet"
          emptyText="Be the first to share something."
          emptyAction={<Link to="/dashboard/write" className="btn-primary">Start writing</Link>}
        />
      </div>
    </section>
  );
}