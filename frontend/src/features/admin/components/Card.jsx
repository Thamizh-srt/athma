export function Card({ className = "", children }) {
  return <section className={`overflow-hidden rounded-[18px] border border-peach-line bg-white ${className}`}>{children}</section>;
}

export function CardHeader({ title, right }) {
  return (
    <div className="flex items-center justify-between border-b border-peach-line px-7 py-5">
      <h3 className="text-[17px] font-bold">{title}</h3>
      {typeof right === "string" ? <span className="text-[13px] text-stone-500">{right}</span> : right}
    </div>
  );
}
