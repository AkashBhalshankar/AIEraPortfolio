import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TAGS = ['All', 'Hackathon', 'Meetup', 'Talk', 'Conference'];

function Backdrop({ src }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img src={src} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,239,230,0.4),rgba(245,239,230,0.9))] dark:bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,0.4),rgba(20,20,20,0.95))]" />
    </div>
  );
}

function Lightbox({ photos, index, onClose, onChange }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, onChange, onClose, photos.length]);
  const p = photos[index];
  if (!p) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={p.src} alt={p.alt || p.title} className="max-w-[90vw] max-h-[90vh] object-contain select-none" />
        <button onClick={() => onChange((index - 1 + photos.length) % photos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl">‹</button>
        <button onClick={() => onChange((index + 1) % photos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl">›</button>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">×</button>
      </motion.div>
    </motion.div>
  );
}

export default function EventsSection({ items = [] }) {
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const [progress, setProgress] = useState(0);
  const data = useMemo(() => items.filter(i => filter === 'All' || i.tag === filter), [items, filter]);
  const photos = data;
  useEffect(() => {
    if (!autoplay || photos.length <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % photos.length), 4000);
    const p = setInterval(() => setProgress(pr => (pr >= 100 ? 0 : pr + 2.5)), 100);
    return () => { clearInterval(t); clearInterval(p); };
  }, [autoplay, photos.length]);
  useEffect(() => { setProgress(0); setActive(0); }, [filter]);
  if (!photos.length) return null;
  return (
    <section id="events" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Events</h2>
        <p className="text-[var(--muted)] mb-6">Actively attending events to connect, learn and explore new things.</p>
        <div className="relative" onMouseEnter={() => setAutoplay(false)} onMouseLeave={() => setAutoplay(true)}>
          <div className="h-1 bg-[var(--line)] rounded mb-4 overflow-hidden">
            <div className="h-full bg-[#B7410E] transition-all" style={{ width: progress + '%' }} />
          </div>
          <div className="relative h-[420px] md:h-[520px] flex items-center justify-center [perspective:1200px]">
            {photos.map((p, i) => {
              const diff = i - active;
              const isCenter = diff === 0;
              return (
                <motion.div key={i} animate={{ x: diff * 320, scale: isCenter ? 1 : 0.75, rotateY: diff * -25, opacity: Math.abs(diff) > 2 ? 0 : isCenter ? 1 : 0.5, zIndex: isCenter ? 10 : 5 - Math.abs(diff) }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="absolute w-[70%] md:w-[60%] aspect-[4/3] cursor-grab active:cursor-grabbing" onClick={() => isCenter ? setLightbox(true) : setActive(i)}>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                    <Backdrop src={p.src} />
                    <img src={p.src} alt={p.alt || p.title} className="relative w-full h-full object-contain" loading="lazy" />
                    {isCenter && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-sm opacity-90">{p.date}{p.location ? ' • ' + p.location : ''}</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <button onClick={() => setActive(a => (a - 1 + photos.length) % photos.length)} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 shadow">‹</button>
          <button onClick={() => setActive(a => (a + 1) % photos.length)} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 shadow">›</button>
          <div className="text-center mt-4 text-sm text-[var(--muted)]">{String(active + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</div>
        </div>
      </div>
      <AnimatePresence>
        {lightbox && <Lightbox photos={photos} index={active} onClose={() => setLightbox(false)} onChange={setActive} />}
      </AnimatePresence>
    </section>
  );
}
