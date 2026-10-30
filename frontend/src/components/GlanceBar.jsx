import { fmtMonth } from '../lib/api';

/** Five quick facts for recruiters, derived from the resume JSON. */
export default function GlanceBar({ profile, experience }) {
  const latest = experience[0];
  return (
    <div className="wrap glance-wrap">
      <div className="glance glance-bar themed">
        <dl>
          <div><dt>Role</dt><dd>{profile.title}{latest ? ` at ${latest.org}, since ${fmtMonth(latest.start)}` : ''}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
          <div><dt>Location</dt><dd>{profile.location}</dd></div>
          <div><dt>Open to</dt><dd>{profile.openTo}</dd></div>
        </dl>
      </div>
    </div>
  );
}
