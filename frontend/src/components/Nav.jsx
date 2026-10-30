import { useEffect, useRef, useState } from 'react';

const LINKS = [
  ['about', 'About'], ['experience', 'Experience'], ['projects', 'Projects'],
  ['skills-matrix', 'Skills'], ['events', 'Events'], ['more', 'Credentials'], ['contact', 'Contact'],
];
const THEMES = [['moss', 'Moss'], ['clay', 'Clay'], ['bark', 'Bark (dark)']];

export default function Nav({ name, theme, setTheme, active, scrolled, pct }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(null);
  const [pill, setPill] = useState({ x: 0, w: 0, o: 0 });
  const ul = useRef(null);

  // Sliding pill: sits behind the hovered link, or the link of the section you are reading.
  const place = () => {
    if (innerWidth <= 820 || !ul.current) return;
    const a = ul.current.querySelector(`a[data-id="${hov ?? active}"]`);
    if (!a) { setPill((p) => ({ ...p, o: 0 })); return; }
    const r = a.getBoundingClientRect(), u = ul.current.getBoundingClientRect();
    setPill({ x: r.left - u.left, w: r.width, o: 1 });
  };
  useEffect(place, [hov, active]);
  useEffect(() => {
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [hov, active]);
  useEffect(() => {
    const close = () => innerWidth > 820 && setOpen(false);
    addEventListener('resize', close);
    return () => removeEventListener('resize', close);
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true"><i style={{ transform: `scaleX(${pct})` }} /></div>
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="wrap nav-in">
          <a className="logo" href="#top">{name}</a>
          <ul ref={ul} className={`links${open ? ' open' : ''}`} id="links" onMouseLeave={() => setHov(null)}>
            <i className="pill-i" aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x}px)`, opacity: pill.o }} />
            {LINKS.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} data-id={id} className={active === id ? 'on' : ''}
                  onMouseEnter={() => setHov(id)} onFocus={() => setHov(id)} onBlur={() => setHov(null)}
                  onClick={() => setOpen(false)}>{label}</a>
              </li>
            ))}
          </ul>
          <div className="swatches" role="group" aria-label="Try a palette">
            {THEMES.map(([t, label]) => (
              <button key={t} className={`sw ${t}`} aria-label={`${label} palette`} title={label}
                aria-pressed={theme === t} onClick={() => setTheme(t)} />
            ))}
          </div>
          <button className="burger" aria-label="Menu" aria-expanded={open} aria-controls="links" onClick={() => setOpen(!open)}>
            <i /><i />
          </button>
        </div>
      </nav>
    </>
  );
}
