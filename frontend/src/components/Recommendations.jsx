import Reveal from './Reveal';
import SplitTitle from './SplitTitle';

/** Renders only when resume.recommendations has entries, so nothing invented ever shows. */
export default function Recommendations({ items }) {
  if (!items?.length) return null;
  return (
    <section id="recommendations">
      <div className="wrap">
        <SplitTitle>What colleagues say</SplitTitle>
        <Reveal className="skills">
          {items.map((r) => (
            <figure className="sk" key={r.name} style={{ margin: 0 }}>
              <blockquote style={{ margin: '0 0 14px' }}>{r.quote}</blockquote>
              <figcaption><b>{r.name}</b><br /><small>{[r.role, r.relation].filter(Boolean).join(', ')}</small></figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
