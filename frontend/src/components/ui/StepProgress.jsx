export default function StepProgress({ current, total }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current} of ${total}`}>
      <span className="whitespace-nowrap text-[10px] font-bold tracking-wider text-brand">STEP {current} OF {total}</span>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-[3px] flex-1 rounded ${i < current ? "bg-brand" : "bg-line"}`} />
      ))}
    </div>
  );
}
