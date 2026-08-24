import { useState, useEffect, useRef } from 'react';

export function useCachedFetch(key, fetcher, fallback = null) {
  const cached = useRef(undefined);
  if (cached.current === undefined) {
    try {
      const raw = localStorage.getItem('mm_cache:' + key);
      cached.current = raw ? JSON.parse(raw) : null;
    } catch { cached.current = null; }
  }

  const [data, setData] = useState(cached.current ?? fallback);
  const [isLoading, setIsLoading] = useState(cached.current === null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then(result => {
        if (cancelled) return;
        setData(result);
        setIsLoading(false);
        try { localStorage.setItem('mm_cache:' + key, JSON.stringify(result)); } catch {}
      })
      .catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, isLoading };
}
