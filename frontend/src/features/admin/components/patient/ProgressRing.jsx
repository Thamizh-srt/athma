const R = 18;
const C = 2 * Math.PI * R;

/** Circular "% answered" indicator. */
export default function ProgressRing({ value, size = 46 }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const dash = (pct / 100) * C;
  return (
    <span className="ring" style={{ width: size, height: size }} role="img" aria-label={`${pct}% answered`}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={R} className="ring-track" />
        <circle cx="22" cy="22" r={R} className="ring-fill" strokeDasharray={`${dash} ${C - dash}`} transform="rotate(-90 22 22)" />
      </svg>
      <b>{pct}%</b>
    </span>
  );
}
