import Reveal from './Reveal';
import SplitTitle from './SplitTitle';
import CountUp from './CountUp';

export default function About({ profile, highlights }) {
  return (
    <section id="about">
      <div className="wrap about-grid" style={{ gridTemplateColumns: '1fr' }}>
        <Reveal>
          <SplitTitle>From testing software to building agents</SplitTitle>
          {(profile.about || []).map((p) => <p key={p}>{p}</p>)}
          {highlights?.length > 0 && (
            <div className="feat hl">
              {highlights.map((h) => <div key={h.value}><CountUp value={h.value} /><span>{h.label}</span></div>)}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
