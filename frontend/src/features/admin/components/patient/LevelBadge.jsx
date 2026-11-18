import { levelOf } from "../../utils/levels";
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon } from "@/components/ui/icons";

/** Pill with the band label, coloured by level. */
export default function LevelBadge({ level, label, count }) {
  const meta = levelOf(level);
  const Icon = meta.tone === "normal" ? CheckCircleIcon : meta.arrow === "down" ? ArrowDownIcon : meta.arrow === "up" ? ArrowUpIcon : null;
  const text = label ?? meta.name;
  if (!text) return null;
  return (
    <span className={`lv lv-${meta.tone}`}>
      {Icon && <Icon size={13} />}
      {count != null && <b>{count}</b>}
      {text}
    </span>
  );
}
