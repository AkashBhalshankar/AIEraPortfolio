import Reveal from './Reveal';
import { useEffect, useRef, useState } from 'react';

function Carousel({ photos = [] }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir * w, behavior: 'smooth' });
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth || 1;
      setIdx(Math.round(el.scrollLeft / w));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  if (!photos || photos.length === 0) return null;
  return (
    <div className="ev-car" style={{ maxWidth: '720px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}>
      <button className="ev-arr left" onClick={() => scroll(-1)} aria-label="Previous">‹</button>
      <div className="ev-track" ref={ref} style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {photos.map((p, i) => (
          <div className="ev-slide" key={i} style={{ flex: '0 0 100%', minWidth: '100%', aspectRatio: '4/3', overflow: 'hidden', scrollSnapAlign: 'center' }}>
            <img src={p.src} alt={p.alt || ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
        ))}
      </div>
      <button className="ev-arr right" onClick={() => scroll(1)} aria-label="Next">›</button>
      <div className="ev-dots">
        {photos.map((_, i) => (
          <span key={i} className={`ev-dot ${i === idx ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default function Events({ events = [] }) {
  if (!events || events.length === 0) return null;
  const allPhotos = events[0]?.photos || events.flatMap((e) => e.photos || []);
  return (
    <section id="events">
      <div className="wrap">
        <Reveal as="h2">Events</Reveal>
        <Reveal>
          <p style={{ color: 'var(--muted)', marginTop: -6 }}>Actively attending events to connect, learn and explore new things.</p>
        </Reveal>
        <Reveal className="ev-wrap">
          <Carousel photos={allPhotos} />
        </Reveal>
      </div>
    </section>
  );
}
