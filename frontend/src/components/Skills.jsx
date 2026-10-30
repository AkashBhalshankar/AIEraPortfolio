import Reveal from './Reveal';
import SplitTitle from './SplitTitle';
import { hits } from '../lib/role';

export default function Skills({ skills, kws }) {
  const score = (g) => g.items.filter((t) => hits(t, kws)).length;
  const ordered = kws.length ? [...skills].sort((a, b) => score(b) - score(a)) : skills;  // matching groups float up
  return (
    <section id="skills">
      <div className="wrap">
        <SplitTitle>Tools I use</SplitTitle>
        <Reveal className="skills">
          {ordered.map((g) => (
            <div className="sk" key={g.group}>
              <h3>{g.group}</h3>
              <div className="tags">{g.items.map((t) => <span className={`tag${hits(t, kws) ? ' hit' : ''}`} key={t}>{t}</span>)}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
