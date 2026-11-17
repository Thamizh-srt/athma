/** Lightweight CSS bar chart – no chart library needed. */
export default function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const peak = data.findIndex((d) => d.value === max);
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round((max * i) / 4));

  return (
    <div className="pt-6" role="img" aria-label="Assessments by day">
      <div className="relative ml-11 h-[280px]">
        {ticks.map((t, i) => (
          <div key={i} className="absolute inset-x-0 border-t border-stone-200/70" style={{ bottom: `${i * 25}%` }}>
            <span className="absolute -left-11 -top-2 w-8 text-right text-xs text-stone-500">{t}</span>
          </div>
        ))}
        <div className="absolute inset-0 grid grid-cols-7">
          {data.map((d, i) => (
            <div key={d.label} className="flex h-full flex-col items-center justify-end">
              <span className="mb-1 text-[13px] font-semibold">{d.value}</span>
              <div
                className={`min-h-0.5 w-[min(42px,60%)] rounded-t ${i === peak ? "bg-orange-600" : "bg-slate-300"}`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-11 mt-3 grid grid-cols-7 text-center text-sm text-stone-500">
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}
