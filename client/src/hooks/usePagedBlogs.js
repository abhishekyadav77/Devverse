import { useEffect, useState } from 'react';

// `fetcher` must be wrapped in useCallback so it only changes when its inputs change.
// Responses from outdated requests are ignored, so fast clicking can't show stale results.
export function usePagedBlogs(fetcher) {
  const [state, setState] = useState({ loading: true, blogs: [], pagination: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((result) => active && setState({ ...result, loading: false, error: '' }))
      .catch((err) => active && setState({ loading: false, blogs: [], pagination: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [fetcher, attempt]);

  return [state, () => setAttempt((n) => n + 1)];
}