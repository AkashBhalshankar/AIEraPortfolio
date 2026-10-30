import { useEffect, useState } from 'react';
import fallback from '../data/resume.fallback.json';
import { API } from '../lib/api';

const CACHE_KEY = 'resume-cache-v7';

/** Renders instantly from the last good copy (cache or bundled JSON), then refreshes from the API. */
export default function useResume() {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || fallback; } catch { return fallback; }
  });

  useEffect(() => {
    if (!API) return;
    const ctrl = new AbortController();
    fetch(`${API}/resume`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        setData(json);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch { /* storage full or blocked */ }
      })
      .catch(() => { /* keep last known good */ });
    return () => ctrl.abort();
  }, []);

  return data;
}
