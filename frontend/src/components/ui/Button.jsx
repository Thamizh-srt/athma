import { ArrowIcon } from "./icons";

const BASE =
  "flex w-full cursor-pointer items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70";
const VARIANTS = {
  primary: "bg-linear-to-r from-brand-light to-brand text-white shadow-lg shadow-brand/30 enabled:hover:-translate-y-px",
  secondary: "border border-line bg-field text-navy hover:bg-slate-100",
};
const SIZES = {
  md: "rounded-xl px-4.5 py-3 text-sm",
  lg: "rounded-2xl px-4.5 py-4.5 text-[17px]",
};

// Exported so <Link> can look like a button too.
export const buttonClasses = (variant = "primary", size = "md", extra = "") =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export default function Button({ children, loading, withArrow, variant = "primary", size = "md", className = "", ...props }) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span aria-label="Loading" className="size-4.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <>
          {children}
          {withArrow && <ArrowIcon />}
        </>
      )}
    </button>
  );
}
