import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthorCard from '../../components/blog/AuthorCard.jsx';
import BlogCard from '../../components/blog/BlogCard.jsx';
import CategoryCard from '../../components/blog/CategoryCard.jsx';
import FeaturedBlog from '../../components/blog/FeaturedBlog.jsx';
import NewsletterSection from '../../components/blog/NewsletterSection.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SectionHeading from '../../components/common/SectionHeading.jsx';
import { Skeleton, BlogCardSkeleton } from '../../components/common/Skeleton.jsx';
import { getHome } from '../../services/homeService.js';
import { formatDate } from '../../utils/format.js';
import { useSeo } from '../../hooks/useSeo.js';

function Hero() {
  return (
    <section className="container-page pt-12 pb-8 sm:pt-16 sm:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
          Ideas worth reading. Stories worth sharing.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-ink-600 dark:text-ink-300">
          DevVerse is where developers publish what they learn, build in public, and find writing that makes them better at the craft.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard/write" className="btn-primary">
            Start writing
          </Link>

          <Link to="/explore" className="btn-secondary">
            Explore blogs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function TrendingList({ blogs }) {
  return (
    <ol className="grid gap-x-12 gap-y-7 md:grid-cols-2">
      {blogs.map((b, i) => (
        <li key={b._id} className="flex gap-4">
          <span
            className="w-8 shrink-0 font-display text-4xl font-extrabold text-ink-200 dark:text-ink-700"
            aria-hidden="true"
          >
            {i + 1}
          </span>

          <div className="min-w-0">
            {b.category && (
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                {b.category.name}
              </span>
            )}

            <h3 className="mt-1 text-lg font-bold leading-snug">
              <Link
                to={`/blog/${b.slug}`}
                className="hover:text-brand-700 dark:hover:text-brand-300"
              >
                {b.title}
              </Link>
            </h3>

            <p className="mt-1 text-sm text-ink-500">
              {b.author?.name} &middot; {formatDate(b.publishedAt)} &middot;{' '}
              {b.readingTime} min read
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function HomeSkeleton() {
  return (
    <div className="container-page" role="status" aria-label="Loading">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[16/10] !rounded-3xl" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  useSeo({
    description:
      'DevVerse is where developers publish what they learn, build in public, and find writing that makes them better at the craft.',
    path: '/',
  });

  const [state, setState] = useState({
    loading: true,
    data: null,
    error: '',
  });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));

    getHome()
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch((err) =>
        setState({
          loading: false,
          data: null,
          error: err.message,
        })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { data } = state;
  const hasPosts = !!data?.featured;

  return (
    <>
      <Hero />

      {state.loading && <HomeSkeleton />}

      {state.error && (
        <div className="container-page">
          <EmptyState
            title="Could not load the latest articles"
            text={state.error}
            action={
              <button className="btn-primary" onClick={load}>
                Try again
              </button>
            }
          />
        </div>
      )}

      {data && !hasPosts && (
        <div className="container-page">
          <EmptyState
            title="No articles published yet"
            text="Be the first to share something with the community."
            action={
              <Link to="/dashboard/write" className="btn-primary">
                Start writing
              </Link>
            }
          />
        </div>
      )}

      {hasPosts && (
        <div className="container-page space-y-20">
          <FeaturedBlog blog={data.featured} />

          {data.trending.length > 0 && (
            <section aria-labelledby="trending">
              <SectionHeading
                title="Trending now"
                to="/explore?sort=views"
              />

              <span id="trending" className="sr-only">
                Trending articles
              </span>

              <TrendingList blogs={data.trending} />
            </section>
          )}

          {data.latest.length > 0 && (
            <section>
              <SectionHeading title="Latest posts" to="/explore" />

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.latest.map((b) => (
                  <BlogCard key={b._id} blog={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {data && data.categories.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading
            title="Popular categories"
            to="/explore#categories"
            linkLabel="All categories"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((c) => (
              <CategoryCard key={c._id} category={c} />
            ))}
          </div>
        </section>
      )}

      {data && data.authors.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading title="Popular authors" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.authors.map((a) => (
              <AuthorCard key={a._id} author={a} />
            ))}
          </div>
        </section>
      )}

      <div className="container-page mt-20">
        <NewsletterSection />
      </div>
    </>
  );
}