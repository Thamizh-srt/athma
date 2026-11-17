import { headerDate } from "../utils/format";

export default function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[17px] text-stone-500">{subtitle}</p>}
      </div>
      <span className="whitespace-nowrap rounded-full border border-peach-line bg-white px-5 py-3 text-sm font-medium">{headerDate()}</span>
    </header>
  );
}
