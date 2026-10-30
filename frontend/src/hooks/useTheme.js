import { useEffect, useState } from 'react';

/** Moss (green and white) is the default. Clay and Bark are optional trials. */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('pf-theme') || 'moss'; } catch { return 'moss'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pf-theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, setTheme];
}
