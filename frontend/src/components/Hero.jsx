import { useEffect, useRef, useState } from 'react';
import RootNetwork from './RootNetwork';
import Magnet from './Magnet';
import { RESUME_DOWNLOAD_URL } from '../lib/api';
import { ROLES } from '../lib/role';
import { canHover, prefersReduced } from '../hooks/useScroll';

function useTyped(phrases) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!phrases.length) return;
    if (prefersReduced()) {
      let i = 0;
      setText(phrases[0]);
      const t = setInterval(() => setText(phrases[++i % phrases.length]), 2600);
      return () => clearInterval(t);
    }
    let pi = 0, ci = 0, del = false, timer;
    const tick = () => {
      const p = phrases[pi];
      setText(p.slice(0, ci));
      if (!del && ci < p.length) { ci++; timer = setTimeout(tick, 55); }
      else if (!del) { del = true; timer = setTimeout(tick, 1500); }
      else if (ci > 0) { ci--; timer = setTimeout(tick, 28); }
      else { del = false; pi = (pi + 1) % phrases.length; timer = setTimeout(tick, 300); }
    };
    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, [phrases.join('|')]);
  return text;
}

export default function Hero({ profile, role, setRole }) {
  const typed = useTyped(profile.nowBuilding || []);
  const art = useRef(null);
  useEffect(() => {
    if (prefersReduced() || !canHover()) return;
    const on = (e) => {
      art.current.style.transform = `translate(${((e.clientX / innerWidth - 0.5) * 10).toFixed(1)}px,${((e.clientY / innerHeight - 0.5) * 6).toFixed(1)}px)`;
    };
    addEventListener('mousemove', on, { passive: true });
    return () => removeEventListener('mousemove', on);
  }, []);
  const lines = profile.heroLines?.length ? profile.heroLines : ['I build AI', 'agents that', 'do real work.'];

  return (
    <header className="hero" id="top">
      <RootNetwork />
      <div className="wrap hero-grid">
        <div>
          <span className="chip"><i className="dot" />Based in {profile.location?.split(',')[0]}. {profile.tagline}</span>
          <p className="name">{profile.name}</p>
          <h1>{lines.map((l) => <span className="ln" key={l}><span>{l}</span></span>)}</h1>
          <p className="lead">{profile.lead}</p>
          <p className="now">Now building: <b>{typed}</b></p>
          <div className="cta">
            <Magnet solid href="#projects">See my work
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Magnet>
            <Magnet href="/Akash_Bhalshankar_Resume.pdf" download>Download resume</Magnet>
          </div>
          <div className="viewas" role="group" aria-label="Tailor this page to a role">
            <span>View as</span>
            {ROLES.map(([key, label]) => (
              <button key={key} type="button" aria-pressed={role === key} onClick={() => setRole(role === key ? '' : key)}>{label}</button>
            ))}
          </div>
        </div>

        <figure className="hero-art">
          <i className="art-blob" aria-hidden="true" />
          <div className="art-img" ref={art}>
            <div className="art-float">
              <img src={profile.heroArt || '/hero-art.webp'} fetchpriority="high" decoding="async" width="1100" height="696" alt={`Cartoon portrait of ${profile.name} at his laptop in a black hoodie with a brain emblem`} />
              <i className="pulse" aria-hidden="true" />
            </div>
          </div>
        </figure>
      </div>
    </header>
  );
}
