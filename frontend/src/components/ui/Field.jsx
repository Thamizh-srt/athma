import { forwardRef, useId } from "react";

// Two sizes: "md" (register/login forms) and "lg" (admin login).
const SIZES = {
  md: {
    label: "text-xs text-navy",
    box: "rounded-[10px] py-2.5 text-[13px]",
    idle: "border-line bg-field",
  },
  lg: {
    label: "text-sm text-neutral-900",
    box: "rounded-2xl py-4 text-base",
    idle: "border-peach-line bg-white",
  },
};

/**
 * One reusable field for <input>, <select> and <textarea>.
 * Works with react-hook-form's `register()` (forwards the ref).
 */
const Field = forwardRef(function Field(
  { label, as: Tag = "input", size = "md", required, optional, error, icon, trailing, className = "", children, ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const s = SIZES[size];

  const input = [
    "w-full border text-ink outline-none transition placeholder:text-slate-400",
    "focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15",
    s.box,
    icon ? "pl-9.5" : size === "lg" ? "pl-4.5" : "pl-3",
    trailing ? "pr-10" : size === "lg" ? "pr-4.5" : "pr-3",
    Tag === "textarea" ? "min-h-19 resize-y" : "",
    error ? "border-danger bg-red-50" : s.idle,
  ].join(" ");

  return (
    <div className={`mb-4 flex min-w-0 flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className={`font-semibold ${s.label}`}>
          {label}
          {required && <span className="text-brand"> *</span>}
          {optional && <span className="text-[11px] font-normal text-muted"> (optional)</span>}
        </label>
      )}

      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted">{icon}</span>}
        <Tag id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} className={input} {...props}>
          {children}
        </Tag>
        {trailing && <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export default Field;
