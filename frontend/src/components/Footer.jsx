export default function Footer({ profile }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-row">
          <div className="foot-name">{profile.name}<small>{profile.title}, {profile.location?.split(',')[0]}</small></div>
          <ul className="foot-links">
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href={`mailto:${profile.email}`}>Email</a></li>
            {profile.links?.linkedin && <li><a href={profile.links.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>}
            {profile.links?.github && <li><a href={profile.links.github} target="_blank" rel="noopener">GitHub</a></li>}
            <li><a href="/Akash_Bhalshankar_Resume.pdf" download>Download resume</a></li>
          </ul>
        </div>
        <div className="foot-bot"><span>&copy; {new Date().getFullYear()} {profile.name}</span></div>
      </div>
    </footer>
  );
}
