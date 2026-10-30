/** Tokens are CSS variables (see src/styles.css) so the Moss / Clay / Bark palettes swap live.
 *  Preflight is off because styles.css carries its own reset; Tailwind is used for utilities. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', card: 'var(--card)', ink: 'var(--ink)',
        muted: 'var(--muted)', line: 'var(--line)', accent: 'var(--accent)', hot: 'var(--hot)', ochre: 'var(--ochre)',
      },
      fontFamily: { display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'], body: ['"Instrument Sans"', 'system-ui', 'sans-serif'] },
    },
  },
};
