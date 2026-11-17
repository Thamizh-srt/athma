import { forwardRef } from "react";

const Checkbox = forwardRef(function Checkbox({ label, error, ...props }, ref) {
  return (
    <div>
      <label
        className={`flex cursor-pointer items-start gap-2.5 rounded-[10px] border bg-field p-3.5 text-xs text-muted ${
          error ? "border-danger" : "border-line"
        }`}
      >
        <input type="checkbox" ref={ref} aria-invalid={!!error} className="mt-0.5 accent-brand" {...props} />
        <span>{label}</span>
      </label>
      {error && <p role="alert" className="mt-1.5 text-[11.5px] text-danger">{error}</p>}
    </div>
  );
});

export default Checkbox;
