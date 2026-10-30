import SplitTitle from './SplitTitle';
import { useRef, useState } from 'react';
import Reveal from './Reveal';
import Magnet from './Magnet';
import ChikkiBot from './ChikkiBot';
import { canHover, prefersReduced } from '../hooks/useScroll';
import { hits } from '../lib/role';
import Marked from './Marked';

function Card({ p, kws }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const live = canHover() && !prefersReduced();
  const tilt = (e) => {
    if (!live) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg) translateY(-4px)`;
  };
  return (
    <article ref={ref} className={`proj${open ? ' open' : ''}`} onMouseMove={tilt} onMouseLeave={() => { if (ref.current) ref.current.style.transform = ''; }}>
      <button className="head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <h3><Marked text={p.title} kws={kws} /><span className="plus" aria-hidden="true" /></h3>
        <p className="s"><Marked text={p.summary} kws={kws} /></p>
      </button>
      <div className="more">
        <div><div className="in">
          {p.bullets?.length > 0 && <ul>{p.bullets.map((b) => <li key={b}><Marked text={b} kws={kws} /></li>)}</ul>}
          <div className="tags">{(p.stack || []).map((t) => <span className={`tag${hits(t, kws) ? ' hit' : ''}`} key={t}>{t}</span>)}</div>
        </div></div>
      </div>
    </article>
  );
}

function Flagship({ p, kws }) {
  return (
    <>
      <Reveal as="h2" className="split in">{`Flagship project: ${String(p.title).replace(/\*\*/g, '')}`}</Reveal>
      <Reveal className="flag">
        {p.mascot === 'chikki' && <ChikkiBot />}
        {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', maxWidth: 320, borderRadius: 12, objectFit: 'cover' }} />}
        <div className="flag-r" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(p.description || [p.summary]).map((t, idx) => <p key={idx} style={{ margin: 0, fontSize: '0.95rem' }}><Marked text={t} kws={kws} /></p>)}
          {p.bullets?.length > 0 && (
            <ul className="ck-points" style={{ margin: '6px 0', paddingLeft: '18px', fontSize: '0.9rem', color: 'var(--muted)', display: 'grid', gap: '6px' }}>
              {p.bullets.map((b, i) => <li key={i}><Marked text={b} kws={kws} /></li>)}
            </ul>
          )}
            {p.liveUrl && (
              <>
                <div className="ck-foot">
                  <Magnet solid href={p.liveUrl} target="_blank" rel="noopener">Try {String(p.title).replace(/\*\*/g, '')} live</Magnet>
                </div>
                {p.mascot === 'chikki' && <p className="note">Voice mode needs mic access. No mic, or a noisy room? Switch to text mode.</p>}
              </>
            )}
        </div>
      </Reveal>
    </>
  );
}

export default function Projects({ projects, kws }) {
  const visible = projects.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured);
  const groups = visible.filter((p) => !p.featured).reduce((acc, p) => {
    const k = p.section || 'More projects';
    (acc[k] = acc[k] || []).push(p);
    return acc;
  }, {});
  return (
    <section id="projects">
      <div className="wrap">
        {featured.map((p) => <Flagship key={p.id || p.title} p={p} kws={kws} />)}
        {Object.entries(groups).map(([title, list]) => (
          <div key={title}>
            <Reveal as="h3" className="sub">{title}</Reveal>
            <Reveal className="grid">{list.map((p) => <Card key={p.id || p.title} p={p} kws={kws} />)}</Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
