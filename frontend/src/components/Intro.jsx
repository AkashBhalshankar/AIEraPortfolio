import { useEffect, useState } from 'react';

/** About one second: the name rises, then the curtain lifts. Once per session, skipped for reduced motion.
 *  index.html adds the "intro-on" class early so returning visitors never see a flash. */
export default function Intro({ name }) {
  const [phase, setPhase] = useState(() => (document.documentElement.classList.contains('intro-on') ? 'in' : 'off'));
  useEffect(() => {
    if (phase === 'off') return;
    const a = setTimeout(() => { setPhase('out'); document.documentElement.classList.remove('intro-on'); }, 560);
    const b = setTimeout(() => { setPhase('off'); try { sessionStorage.setItem('intro', '1'); } catch { /* ignore */ } }, 1100);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (phase === 'off') return null;
  return (
    <div className={`intro${phase === 'out' ? ' out' : ''}`} aria-hidden="true">
      <span>{name.split(' ').map((w, i) => <span key={w} className="iw"><i style={{ '--i': i }}>{w}</i></span>)}</span>
    </div>
  );
}
