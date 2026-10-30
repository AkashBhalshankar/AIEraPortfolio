import { useRef } from 'react';
import { canHover, prefersReduced } from '../hooks/useScroll';

/** Button or link that leans slightly toward the cursor. */
export default function Magnet({ as: Tag = 'a', className = '', solid = false, children, ...rest }) {
  const ref = useRef(null);
  const live = canHover() && !prefersReduced();
  const move = (e) => {
    if (!live) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <Tag ref={ref} className={`btn ${solid ? 'solid' : ''} ${className}`} onMouseMove={move} onMouseLeave={leave} {...rest}>
      {children}
    </Tag>
  );
}
