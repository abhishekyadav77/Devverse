import { useEffect, useState } from 'react';

// `fetcher` must be a stable, module-level function returning { items, pagination }.
// Responses from outdated requests are ignored.
export function useAdminList(fetcher, params) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ loading: true, items: [], pagination: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher(JSON.parse(key))
      .then((r) => active && setState({ loading: false, items: r.items, pagination: r.pagination, error: '' }))
      .catch((err) => active && setState({ loading: false, items: [], pagination: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [fetcher, key, attempt]);

  return [state, () => setAttempt((n) => n + 1)];
}