import { useRef, useState } from 'react';
import Reveal from './Reveal';
import Magnet from './Magnet';
import SplitTitle from './SplitTitle';
import { sendContact } from '../lib/api';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Contact({ profile }) {
  const [toast, setToast] = useState('');
  const [status, setStatus] = useState({ text: '', err: false });
  const [busy, setBusy] = useState(false);
  const timer = useRef(0);
  const say = (msg) => { setToast(msg); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 1800); };
  const copy = () => {
    navigator.clipboard?.writeText(profile.email).then(() => say('Email copied'), () => say(profile.email)) ?? say(profile.email);
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    if (f.company) return;                                    // honeypot: real people never fill this
    const name = String(f.name || '').trim(), email = String(f.email || '').trim(), message = String(f.message || '').trim();
    if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
      setStatus({ text: 'Please add your name, a valid email and a message of at least 10 characters.', err: true });
      return;
    }
    setBusy(true); setStatus({ text: '', err: false });
    const res = await sendContact({ name, email, message, company: '' });
    setBusy(false);
    setStatus({ text: res.message, err: !res.ok });
    if (res.ok) form.reset();
  };

  return (
    <section id="contact" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <Reveal className="contact">
          <div className="blob" aria-hidden="true" />
          <div className="ct-grid">
            <div className="ct-left">
              <SplitTitle>Let's build something useful</SplitTitle>
              <p>{profile.contactLine}</p>
              <div className="cta" style={{ opacity: 1, animation: 'none', position: 'relative' }}>
                <Magnet as="button" solid onClick={copy}>Copy email</Magnet>
                {profile.links?.linkedin && <Magnet href={profile.links.linkedin} target="_blank" rel="noopener">LinkedIn</Magnet>}
                {profile.links?.github && <Magnet href={profile.links.github} target="_blank" rel="noopener">GitHub</Magnet>}
              </div>
            </div>
            <form className="ct-form" onSubmit={submit} noValidate>
              <label>Name<input name="name" autoComplete="name" required maxLength={80} /></label>
              <label>Email<input name="email" type="email" autoComplete="email" required maxLength={120} /></label>
              <label>Message<textarea name="message" required minLength={10} maxLength={2000} /></label>
              <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
              <button className="btn solid" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
              <p className={`ct-status${status.err ? ' err' : ''}`} role="status">{status.text}</p>
            </form>
          </div>
        </Reveal>
      </div>
      <div className={`toast${toast ? ' show' : ''}`} role="status">{toast}</div>
    </section>
  );
}
