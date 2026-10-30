import { useEffect, useRef } from 'react';
import { canHover, prefersReduced } from '../hooks/useScroll';

/** Soft moss glow that eases after the cursor. Only on devices with a real pointer. */
export default function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (!canHover() || prefersReduced()) return;
    const el = ref.current;
    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      el.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => { tx = e.clientX; ty = e.clientY; el.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); };
    const leave = () => el.classList.remove('on');
    addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => { removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
