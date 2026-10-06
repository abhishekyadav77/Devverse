const OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'views', label: 'Most viewed' },
];

export default function SortTabs({ value, onChange }) {
  return (
    <div role="group" aria-label="Sort articles" className="inline-flex rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-900">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.value
              ? 'bg-brand-600 text-white'
              : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}