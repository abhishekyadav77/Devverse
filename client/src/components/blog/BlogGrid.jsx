import BlogCard from './BlogCard.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Pagination from '../common/Pagination.jsx';
import { BlogCardSkeleton } from '../common/Skeleton.jsx';

const GRID = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

export default function BlogGrid({
  state, onRetry, page, onPageChange, onBookmarkChange,
  emptyTitle = 'No articles found', emptyText, emptyAction, count = 9,
}) {
  if (state.error) {
    return (
      <EmptyState
        title="Could not load articles"
        text={state.error}
        action={<button className="btn-primary" onClick={onRetry}>Try again</button>}
      />
    );
  }

  if (state.loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: count }).map((_, i) => <BlogCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!state.blogs.length) {
    const pastTheEnd = page > 1;
    return (
      <EmptyState
        title={pastTheEnd ? 'That page is empty' : emptyTitle}
        text={pastTheEnd ? 'There are no articles this far down the list.' : emptyText}
        action={
          pastTheEnd ? (
            <button className="btn-primary" onClick={() => onPageChange(1)}>Back to page 1</button>
          ) : (
            emptyAction
          )
        }
      />
    );
  }

  return (
    <>
      <div className={GRID}>
        {state.blogs.map((b) => <BlogCard key={b._id} blog={b} onBookmarkChange={onBookmarkChange} />)}
      </div>
      <Pagination page={page} pages={state.pagination?.pages} onChange={onPageChange} />
    </>
  );
}