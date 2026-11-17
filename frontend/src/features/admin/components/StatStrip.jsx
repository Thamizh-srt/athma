export default function StatStrip({ items }) {
  return (
    <section className="mb-6.5 grid divide-y divide-peach-line rounded-[18px] border border-peach-line bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
      {items.map(({ label, value, hint }) => {
        const labelEl = <p className="text-[15px] text-neutral-700">{label}</p>;
        return (
          <div key={label} className="px-7 py-6.5">
            {hint !== undefined && labelEl}
            <strong className="my-2 block text-4xl font-medium leading-tight">{value}</strong>
            {hint !== undefined ? <small className="text-sm text-stone-500">{hint}</small> : labelEl}
          </div>
        );
      })}
    </section>
  );
}
