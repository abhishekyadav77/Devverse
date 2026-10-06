import { Link } from 'react-router-dom';

export default function SectionHeading({ title, to, linkLabel = 'View all' }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {to && (
        <Link to={to} className="shrink-0 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}