const R = 46;
const C = 2 * Math.PI * R;

export default function DonutChart({ segments, total, label }) {
  let offset = 0;
  return (
    <div className="relative mx-auto my-4.5 w-[190px]">
      <svg viewBox="0 0 120 120" role="img" aria-label={`${label}: ${total}`} className="block w-full">
        <g transform="rotate(-90 60 60)" fill="none" strokeWidth="18">
          {segments.map((s) => {
            const len = (s.value / total) * C;
            const el = <circle key={s.key} cx="60" cy="60" r={R} stroke={s.color} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-2xl font-semibold">{total.toLocaleString("en-IN")}</strong>
        <span className="text-sm text-stone-500">{label}</span>
      </div>
    </div>
  );
}
