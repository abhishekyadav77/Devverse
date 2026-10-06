export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-ink-100 dark:bg-ink-800 ${className}`} aria-hidden="true" />;
}

export function BlogCardSkeleton() {
  return (
    <div className="card overflow-hidden" role="status" aria-label="Loading article">
      <Skeleton className="aspect-[16/9] !rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}