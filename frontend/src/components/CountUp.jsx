import { useEffect, useRef, useState } from 'react';
import { prefersReduced } from '../hooks/useScroll';

/** Counts the numbers inside a string (like "30 to 40%") up from zero when it scrolls into view. */
export default function CountUp({ value }) {
  const ref = useRef(null);
  const [k, setK] = useState(() => (prefersReduced() ? 1 : 0));
  useEffect(() => {
    if (prefersReduced()) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / 1100);
        setK(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const text = String(value).replace(/\d+(\.\d+)?/g, (m) => String(Math.round(parseFloat(m) * k)));
  return <b ref={ref} aria-label={value}>{text}</b>;
}
