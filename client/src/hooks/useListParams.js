import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const SORTS = ['latest', 'popular', 'views'];

// Keeps page and sort in the URL so results can be shared, bookmarked and used with the back button.
export function useListParams() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const sort = SORTS.includes(params.get('sort')) ? params.get('sort') : 'latest';

  const update = useCallback(
    (patch) =>
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          const isDefault = (key === 'page' && value === 1) || (key === 'sort' && value === 'latest');
          if (value == null || value === '' || isDefault) next.delete(key);
          else next.set(key, String(value));
        });
        return next;
      }),
    [setParams]
  );

  const setPage = useCallback(
    (p) => {
      update({ page: p });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [update]
  );
  const setSort = useCallback((s) => update({ sort: s, page: 1 }), [update]);

  return { page, sort, setPage, setSort };
}