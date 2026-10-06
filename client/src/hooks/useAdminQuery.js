import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce.js';

// Search box (debounced), filters and page for an admin table.
// Changing the search or any filter jumps back to page 1.
export function useAdminQuery(defaults = {}) {
  const [filters, setFilters] = useState(defaults);
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(input.trim(), 400);

  useEffect(() => setPage(1), [q]);

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const params = useMemo(() => ({ ...filters, q, page, limit: 15 }), [filters, q, page]);
  return { input, setInput, page, setPage, filters, setFilter, params };
}