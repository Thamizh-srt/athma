import { SearchIcon } from "@/components/ui/icons";

export default function SearchBox({ value, onChange, placeholder, className = "" }) {
  return (
    <label
      className={`flex items-center gap-2.5 rounded-[14px] border border-peach-line bg-white px-4 text-stone-500 focus-within:border-orange-600 focus-within:ring-3 focus-within:ring-orange-600/15 ${className}`}
    >
      <SearchIcon size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 bg-transparent py-3.5 text-[15px] text-neutral-900 outline-none"
      />
    </label>
  );
}
