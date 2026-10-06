import { Link } from 'react-router-dom';

export default function TagBadge({ tag, count }) {
  return (
    <Link
      to={`/tag/${tag.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
    >
      #{tag.name}
      {count != null && <span className="text-ink-400">{count}</span>}
    </Link>
  );
}