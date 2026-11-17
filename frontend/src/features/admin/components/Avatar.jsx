import { initials } from "../utils/format";

/** `large` = 46px; `solid` = orange gradient square (used for the signed-in admin). */
export default function Avatar({ name, large, solid }) {
  const shape = solid
    ? "rounded-[14px] bg-linear-to-br from-orange-400 to-orange-600 text-lg text-white"
    : "rounded-full bg-orange-100 text-[13px] text-orange-700";
  return (
    <span className={`grid flex-none place-items-center font-bold ${large || solid ? "size-[46px]" : "size-10"} ${shape}`}>
      {initials(name)}
    </span>
  );
}
