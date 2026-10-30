import { useEffect, useRef, useState } from 'react';
import { canHover, prefersReduced } from '../hooks/useScroll';

const STATUS = { standby: 'Online, standby', listening: 'Online, listening', speaking: 'Online, speaking' };
const ASKS = [
  { q: 'What does Akash build?', a: 'LLM agent pipelines and backend services with LangGraph, RAG, FastAPI and Azure OpenAI at UBS, plus me, Chikki, on his own.' },
  { q: 'Is he strong with FastAPI?', a: 'FastAPI is a core part of his stack. He built the backends for AgriMentor and for me.' },
  { q: 'Which certifications?', a: 'Azure Fundamentals (AZ-900), Azure AI Fundamentals (AI-900) and Claude Code 101.' },
  { q: 'Is he open to new roles?', a: 'Yes, AI Engineer and Full-Stack AI roles. The quickest way to learn more is to try me live.' },
];

/** Interactive Chikki card. Tap a question and she "listens", then types the answer.
 *  The orange circle is the palm: it travels with the arm tip and waves. */
export default function ChikkiBot() {
  const [state, setState] = useState('standby');
  const [seen, setSeen] = useState(false);
  const [picked, setPicked] = useState(-1);
  const [typed, setTyped] = useState('');
  const root = useRef(null);
  const svg = useRef(null);
  const eyes = useRef(null);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  // Wave hello once, when she scrolls into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // Eyes follow the cursor.
  useEffect(() => {
    if (prefersReduced() || !canHover()) return;
    const on = (e) => {
      const r = svg.current.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 320));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.22)) / 320));
      eyes.current.style.transform = `translate(${(dx * 6).toFixed(1)}px,${(dy * 4).toFixed(1)}px)`;
    };
    addEventListener('mousemove', on, { passive: true });
    return () => removeEventListener('mousemove', on);
  }, []);

  const ask = (i) => {
    clearTimers();
    setPicked(i); setTyped(''); setState('listening');
    timers.current.push(setTimeout(() => {
      const text = ASKS[i].a;
      if (prefersReduced()) { setTyped(text); setState('standby'); return; }
      setState('speaking');
      let n = 0;
      const type = () => {
        n += 2; setTyped(text.slice(0, n));
        if (n < text.length) timers.current.push(setTimeout(type, 22)); else setState('standby');
      };
      type();
    }, 600));
  };

  // Tap Chikki to see her wave again.
  const replayWave = () => { setSeen(false); requestAnimationFrame(() => requestAnimationFrame(() => setSeen(true))); };

  return (
    <div ref={root} className={`bot themed${seen ? ' hi' : ''}`} data-s={state}>
      <svg ref={svg} viewBox="0 0 240 280" aria-hidden="true" onClick={replayWave}>
        <ellipse className="shadow" cx="120" cy="264" rx="46" ry="7" />
        <g className="float">
          <rect className="body" x="94" y="194" width="20" height="56" rx="8" />
          <rect className="body" x="126" y="194" width="20" height="56" rx="8" />
          <rect className="body" x="84" y="108" width="72" height="84" rx="12" />
          <circle className="ring" cx="120" cy="150" r="14" />
          <circle className="ring r2" cx="120" cy="150" r="14" />
          <circle className="core" cx="120" cy="150" r="14" />
          <g className="arm-l"><rect className="limb" x="57" y="122" width="18" height="44" rx="8" /><circle className="hand" cx="66" cy="118" r="16" /></g>
          <g className="arm-r"><rect className="limb" x="165" y="122" width="18" height="44" rx="8" /></g>
          <circle className="hand palm" cx="174" cy="118" r="16" />
          <rect className="head" x="80" y="30" width="80" height="66" rx="16" />
          <g className="eyes" ref={eyes}><circle className="eye" cx="104" cy="58" r="7" /><circle className="eye" cx="136" cy="58" r="7" /></g>
          <rect className="mouth" x="106" y="76" width="28" height="4" rx="2" />
        </g>
      </svg>
      <div className="stat"><i className="dot" /><span>{STATUS[state]}</span></div>
      <div className="msgbox" aria-live="polite">
        <p className="msg">
          {picked < 0 ? (
            <span className="t">Hi, I'm Chikki. Tap a question and I'll answer.</span>
          ) : (
            <>
              <small className="q">You asked: {ASKS[picked].q}</small>
              <span>{typed}</span>
            </>
          )}
        </p>
        <div className="bars" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <b key={i} />)}</div>
      </div>
      <div className="asks" role="group" aria-label="Ask Chikki a question">
        {ASKS.map((a, i) => (
          <button key={a.q} type="button" aria-pressed={picked === i} onClick={() => ask(i)}>{a.q}</button>
        ))}
      </div>
    </div>
  );
}
