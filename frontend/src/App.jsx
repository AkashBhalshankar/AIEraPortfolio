import Navigator from './components/Navigator';
import useResume from './hooks/useResume';
import useTheme from './hooks/useTheme';
import { useMemo, useState } from 'react';
import { useActiveSection, useScroll } from './hooks/useScroll';
import { keywordsFor, readRole } from './lib/role';
import Recommendations from './components/Recommendations';
import Orbs from './components/Orbs';
import Intro from './components/Intro';
import CursorGlow from './components/CursorGlow';
import useSpotlight from './hooks/useSpotlight';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GlanceBar from './components/GlanceBar';
import StackStrip from './components/StackStrip';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import SkillsMatrix from './components/SkillsMatrix';
import EventsSection from './components/events/EventsSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

const SECTIONS = ['about', 'experience', 'projects', 'skills-matrix', 'events', 'more', 'contact'];

/** Every section renders from one resume JSON: the API when reachable, otherwise the bundled copy. */
export default function App() {
  const r = useResume();
  const [theme, setTheme] = useTheme();
  const { y, pct } = useScroll();
  const active = useActiveSection(SECTIONS);
  useSpotlight();
  const [role, setRoleState] = useState(readRole);
  const kws = useMemo(() => keywordsFor(role), [role]);
  const setRole = (next) => {
    setRoleState(next);
    const u = new URL(location.href);
    if (next) u.searchParams.set('role', next); else u.searchParams.delete('role');
    history.replaceState(null, '', u);
  };

  return (
    <>
      <Intro name={r.profile.name} />
      <a className="skip" href="#main">Skip to content</a>
      <Orbs />
      <CursorGlow />
      <Nav name={r.profile.name} theme={theme} setTheme={setTheme} active={active} scrolled={y > 10} pct={pct} />
      <Hero profile={r.profile} role={role} setRole={setRole} />
      <GlanceBar profile={r.profile} experience={r.experience} />
      <StackStrip skills={r.skills} kws={kws} />
      <main id="main" tabIndex={-1}>
        <About profile={r.profile} highlights={r.highlights} />
        <Experience experience={r.experience} kws={kws} />
        <Projects projects={r.projects} kws={kws} />
        <SkillsMatrix skills={r.skills} certifications={r.certifications} education={r.education} leadership={r.leadership} />
        <EventsSection items={(r.events && r.events[0]?.photos) || []} />
        <Recommendations items={r.recommendations || []} />
        <Contact profile={r.profile} />
      </main>
      <Footer profile={r.profile} />
      <BackToTop show={y > 520} pct={pct} />
      <Navigator />
    </>
  );
}
