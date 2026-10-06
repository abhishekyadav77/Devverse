import { Link } from 'react-router-dom';
import { plural } from '../../utils/format.js';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="card block p-5 transition-colors hover:border-brand-500 dark:hover:border-brand-500"
    >
      <p className="font-display text-lg font-bold text-ink-900 dark:text-white">{category.name}</p>
      <p className="mt-1 text-sm text-ink-500">{plural(category.postCount ?? 0, 'article')}</p>
    </Link>
  );
}