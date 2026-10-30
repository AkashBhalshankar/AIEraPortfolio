/** Appears after scrolling. The ring fills as you read down the page. */
export default function BackToTop({ show, pct }) {
  return (
    <div className={`dock${show ? ' show' : ''}`}>
      <a className="up" href="#top" aria-label="Back to top">
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
          <circle className="trk" cx="22" cy="22" r="18" />
          <circle className="rg" cx="22" cy="22" r="18" transform="rotate(-90 22 22)" style={{ strokeDashoffset: (113.1 * (1 - pct)).toFixed(1) }} />
          <path d="M22 28V16M16 21.5l6-6 6 6" />
        </svg>
      </a>
    </div>
  );
}
