import SplitTitle from './SplitTitle';
import Marked from './Marked';
import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import { fmtMonth } from '../lib/api';

function Job({ job, kws }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`job${on ? ' in' : ''}`}>
      <h3>{job.role}</h3>
      <div className="meta">{job.org}{job.location ? `, ${job.location}` : ''}. {fmtMonth(job.start)} to {fmtMonth(job.end)}</div>
      <ul>{job.bullets.map((b) => <li key={b}><Marked text={b} kws={kws} /></li>)}</ul>
    </div>
  );
}

export default function Experience({ experience, kws }) {
  const tl = useRef(null);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const on = () => {
      const r = tl.current.getBoundingClientRect();
      setFill(Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height)));
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <section id="experience">
      <div className="wrap">
        <SplitTitle>Where I've worked</SplitTitle>
        <div className="tl" ref={tl}>
          <div className="tl-line"><i style={{ transform: `scaleY(${fill})` }} /></div>
          {experience.map((j) => <Job key={`${j.org}-${j.start}`} job={j} kws={kws} />)}
        </div>
      </div>
    </section>
  );
}
