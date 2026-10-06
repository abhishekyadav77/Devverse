import { Link } from 'react-router-dom';
import { brand } from '../../config/brand.js';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label={`${brand.name} home`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-mono text-sm font-medium text-white">
        {'</>'}
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink-900 dark:text-white">{brand.name}</span>
    </Link>
  );
}
