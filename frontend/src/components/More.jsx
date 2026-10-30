import Reveal from './Reveal';

const seal = (text = '') => text.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** Credentials and education on the left; leadership and achievements on the right. */
export default function More({ certifications, education, leadership, achievements }) {
  const right = [...leadership.map((l) => ({ t: l.title, d: l.detail })), ...achievements.map((a) => ({ t: a.title, d: a.detail }))];
  return (
    <section id="more">
      <Reveal className="wrap two">
        <div className="panel themed">
          <h3>Education and credentials</h3>
          {certifications.map((c) => (
            <div className="cert" key={c.name}><span className="seal">{c.code || seal(c.name)}</span><div><b>{c.name}</b><br /><small>{c.issuer}</small></div></div>
          ))}
          {education.map((e) => (
            <div className="cert" key={e.degree}><span className="seal">{e.code || seal(e.degree)}</span><div><b>{e.degree}</b><br /><small>{e.school}. {e.year}{e.score ? `, ${e.score}` : ''}</small></div></div>
          ))}
        </div>
        {right.length > 0 && (
          <div className="panel themed">
            <h3>{achievements.length ? 'Leadership and achievements' : 'Leadership'}</h3>
            {right.map((r) => <div className="out" key={r.t}><b>{r.t}</b><span>{r.d}</span></div>)}
          </div>
        )}
      </Reveal>
    </section>
  );
}
