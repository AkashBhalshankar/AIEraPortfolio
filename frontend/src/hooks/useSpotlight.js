import { useEffect } from 'react';
import { canHover, prefersReduced } from './useScroll';

/** A faint moss highlight follows the cursor inside cards. One delegated listener for the whole page. */
export default function useSpotlight() {
  useEffect(() => {
    if (!canHover() || prefersReduced()) return;
    let last = null;
    const move = (e) => {
      const c = e.target.closest?.('.proj,.sk,.panel,.glance-bar') ?? null;
      if (last && last !== c) { last.style.removeProperty('--mx'); last.style.removeProperty('--my'); }
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', `${e.clientX - r.left}px`);
        c.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      last = c;
    };
    document.addEventListener('pointermove', move, { passive: true });
    return () => document.removeEventListener('pointermove', move);
  }, []);
}
