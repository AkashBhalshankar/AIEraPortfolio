import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection, useScroll } from '../hooks/useScroll';

const SECTIONS = ['top', 'about', 'experience', 'projects', 'skills-matrix', 'events', 'more', 'contact'];
const SECTION_TEXT = {
  about: 'This is the About section, where you learn who Akash is.',
  experience: 'Experience section, his journey from QA to AI engineer.',
  projects: 'Projects, including Chikki, his voice-first AI assistant.',
  'skills-matrix': 'Skills matrix, his technical toolbox.',
  events: 'Events and community involvement.',
  more: 'More about his interests and highlights.',
  contact: 'Contact section, reach out to Akash here.',
};

export default function Navigator() {
  const active = useActiveSection(SECTIONS);
  const { pct } = useScroll();
  const [pos, setPos] = useState({ left: 24, top: 100 });
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showMsg, setShowMsg] = useState(true);
  const [intro, setIntro] = useState(true);
  const spoken = useRef(false);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(active || SECTIONS[0]);
      if (!el) return;
      const target = active === 'contact' ? (el.querySelector('.contact') || el) : (el.querySelector('h1,h2,h3') || el);
      const r = target.getBoundingClientRect();
      const idx = SECTIONS.indexOf(active === '' ? 'top' : active);
      let left, top;
      if (active === 'contact') { left = r.left + 8; top = r.top + 8; }
      else { left = (idx % 2 === 0) ? Math.max(8, r.left - 100) : Math.min(window.innerWidth - 80, r.right + 8); top = Math.max(12, r.top + 4); }
      setPos({ left, top });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [active]);

  const speak = (text) => {
    if (muted || !text || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    speak('Hi, I am Navy, your personal navigator. I will guide you through Akash Bhalshankar\'s portfolio. Click me to stop voice. Click the cross button to close this message box.');
    const t = setTimeout(() => setIntro(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (intro) return;
    // speak only when user navigates, not on scroll
  }, [active, intro]);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    speak(SECTION_TEXT[id] || `Navigating to ${id}`);
    setOpen(false);
  };

  const next = () => {
    const i = Math.max(0, SECTIONS.indexOf(active));
    go(SECTIONS[(i + 1) % SECTIONS.length]);
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1, left: pos.left, top: pos.top }}
      transition={{ type: 'spring', stiffness: 60, damping: 14 }}
      style={{ position: 'fixed', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}
    >
      <AnimatePresence>
        {showMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => speak('Hi, I am Navy, your personal navigator. I will guide you through Akash Bhalshankar\'s portfolio. Click me to stop voice. Click the cross button to close this message box.')}
            style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '8px 10px', maxWidth: 220, fontSize: '.85rem', boxShadow: '0 4px 12px rgba(0,0,0,.15)', display: 'flex', gap: 8, alignItems: 'start', cursor: 'pointer' }}
          >
            <span>Hi, I'm Navy, your personal navigator. I'll guide you through Akash Bhalshankar's portfolio. Click me to stop voice. Click the cross button to close this message box.</span>
            <button onClick={() => setShowMsg(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: '.9rem', padding: 0 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 8, display: 'grid', gap: 4, minWidth: 140, maxWidth: '80vw' }}
          >
            {SECTIONS.map((s) => (
              <button key={s} onClick={() => go(s)} style={{ textAlign: 'left', padding: '6px 10px', borderRadius: 8, border: 'none', background: active === s ? 'var(--accent)' : 'transparent', color: active === s ? 'var(--accent-ink)' : 'var(--ink)', cursor: 'pointer' }}>
                {s.replace('-', ' ')}
              </button>
            ))}
          <button onClick={() => { setMuted((m) => !m); window.speechSynthesis?.cancel(); }} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: muted ? 'var(--hot)' : 'var(--muted)', color: '#fff', cursor: 'pointer' }}>{muted ? 'Voice off' : 'Stop voice'}</button>
          <button onClick={() => setOpen(false)} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'var(--muted)', color: '#fff', cursor: 'pointer' }}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open navigator"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={intro ? { y: [0, -12, 0], rotate: [0, 6, -6, 0] } : { y: 0, rotate: 0 }}
        transition={intro ? { repeat: Infinity, duration: 1.2 } : { duration: 0.4 }}
        style={{ width: window.innerWidth < 640 ? 56 : 84, height: window.innerWidth < 640 ? 56 : 84, border: 'none', padding: 0, cursor: 'pointer', background: 'transparent' }}
      >
        <img src="/NavyNoBG.png" alt="navigator robot" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </motion.button>
    </motion.div>
  );
}
