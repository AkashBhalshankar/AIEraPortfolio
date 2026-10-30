import { useEffect, useState } from 'react';

/** 0..1 page progress plus raw scrollY, throttled with requestAnimationFrame. */
export function useScroll() {
  const [s, setS] = useState({ y: 0, pct: 0 });
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - innerHeight;
      setS({ y: scrollY, pct: h > 0 ? Math.min(1, scrollY / h) : 0 });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return s;
}

/** Which section id is currently in the middle of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids.join('|')]);
  return active;
}

export const canHover = () => typeof matchMedia !== 'undefined' && matchMedia('(hover:hover)').matches;
export const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
