import { Fragment, useEffect, useRef, useState } from 'react';

/** Section title that reveals word by word when it scrolls into view. Pass a plain string. */
export default function SplitTitle({ children, as: Tag = 'h2', className = '' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const words = String(children).split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} className={`split${on ? ' in' : ''} ${className}`.trim()}>
      {words.map((w, i) => (
        <Fragment key={i}><span className="wd"><i style={{ '--i': i }}>{w}</i></span>{i < words.length - 1 ? ' ' : ''}</Fragment>
      ))}
    </Tag>
  );
}
