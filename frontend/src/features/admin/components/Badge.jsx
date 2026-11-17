const TONES = {
  orange: "bg-orange-100 text-orange-700",
  gray: "bg-stone-100 text-stone-500",
  low: "bg-[#fff1e0] text-amber-700",
  moderate: "bg-[#ffe0c7] text-orange-700",
  high: "bg-[#fbdccc] text-[#9a3412]",
};

export default function Badge({ tone = "orange", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${TONES[tone]}`}>
      <i className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Tag({ gray, children }) {
  return gray ? (
    <span className="inline-block rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">{children}</span>
  ) : (
    <span className="inline-block rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-[13px] font-medium text-orange-700">{children}</span>
  );
}
