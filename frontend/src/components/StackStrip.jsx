import { hits } from '../lib/role';

/** Endless tech strip. Two copies of the list so the loop is seamless; pauses on hover. */
export default function StackStrip({ skills, kws }) {
  const items = [...new Set(skills.flatMap((g) => g.items))].slice(0, 16);
  const cls = (t) => `tag${hits(t, kws) ? ' hit' : ''}`;
  return (
    <div className="strip" aria-label="Tech stack">
      <div className="strip-track">
        {items.map((t) => <span className={cls(t)} key={t}>{t}</span>)}
        {items.map((t) => <span className={cls(t)} key={`${t}-2`} aria-hidden="true">{t}</span>)}
      </div>
    </div>
  );
}
