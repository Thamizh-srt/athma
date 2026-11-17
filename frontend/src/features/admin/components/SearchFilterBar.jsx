import SearchBox from "./SearchBox";

export default function SearchFilterBar({ value, onChange, placeholder, filters, active, onFilter, summary }) {
  return (
    <div className="mb-5.5 flex flex-wrap items-center gap-3.5">
      <SearchBox value={value} onChange={onChange} placeholder={placeholder} className="min-w-60 max-w-105 flex-1" />
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilter(f.key)}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-sm ${
              active === f.key ? "border-orange-600 bg-orange-50 font-semibold text-orange-700" : "border-peach-line bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className="ml-auto text-sm text-stone-500">{summary}</span>
    </div>
  );
}
