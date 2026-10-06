import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      <button className="btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-sm text-ink-500">Page {page} of {pages}</span>
      <button className="btn-secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
}