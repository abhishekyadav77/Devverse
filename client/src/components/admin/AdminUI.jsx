import { Search } from 'lucide-react';
import Pagination from '../common/Pagination.jsx';
import { Skeleton } from '../common/Skeleton.jsx';

export function PageHeader({ title, text, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {text && <p className="mt-1 text-sm text-ink-500">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="card p-4">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white">{value}</dd>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

const TONES = {
  green: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  gray: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
};

export function Badge({ tone = 'gray', children }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-[14rem] flex-1 sm:max-w-sm">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pl-10"
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
      />
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <select className="input !w-auto" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// columns: [{ label, className? }]. renderRow(item) returns a <tr key=...>.
export function AdminTable({ columns, state, onRetry, renderRow, emptyText = 'Nothing to show.', page, onPage }) {
  const colSpan = columns.length;
  const refreshing = state.loading && state.items.length > 0;

  return (
    <>
      <div className={`card overflow-x-auto transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-ink-200 text-xs text-ink-500 dark:border-ink-800">
            <tr>
              {columns.map((c) => (
                <th key={c.label} className={`px-4 py-3 font-medium ${c.className || ''}`}>
                  {c.srOnly ? <span className="sr-only">{c.label}</span> : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {state.loading && state.items.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={colSpan} className="px-4 py-4"><Skeleton className="h-5 w-full" /></td></tr>
              ))}

            {state.error && (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10 text-center">
                  <p className="text-red-600 dark:text-red-400" role="alert">{state.error}</p>
                  <button className="btn-primary mt-4" onClick={onRetry}>Try again</button>
                </td>
              </tr>
            )}

            {!state.loading && !state.error && state.items.length === 0 && (
              <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-ink-500">{emptyText}</td></tr>
            )}

            {!state.error && state.items.map(renderRow)}
          </tbody>
        </table>
      </div>
      {onPage && <Pagination page={page} pages={state.pagination?.pages} onChange={onPage} />}
    </>
  );
}