export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`} role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600 dark:border-ink-700 dark:border-t-brand-400" />
    </div>
  );
}
