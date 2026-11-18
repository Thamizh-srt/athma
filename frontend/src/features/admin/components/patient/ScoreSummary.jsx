import { BoltIcon, ClipboardIcon, SlidersIcon, TargetIcon, UserIcon, UsersIcon } from "@/components/ui/icons";
import { LEVEL_ORDER, levelOf } from "../../utils/levels";
import LevelBadge from "./LevelBadge";
import LevelMeter from "./LevelMeter";

const SUB_ICONS = [UserIcon, UsersIcon, SlidersIcon, SlidersIcon, BoltIcon];

function TotalBox({ detail }) {
  const { total, scores_available: ready, status } = detail;
  if (total) {
    return (
      <div className="pd-total">
        <span className="pd-total-icon"><TargetIcon size={20} /></span>
        <div>
          <small>{status === "completed" ? "Total score" : "Current score"}</small>
          <strong>{total.score}<em> of {total.max_score}</em></strong>
        </div>
        <LevelBadge level={total.level} label={total.label} />
      </div>
    );
  }
  return (
    <p className="pd-total-note">
      {ready
        ? status === "completed" ? "This scale reports sub-scale scores only." : "Current sub-scale scores; no overall total is reported."
        : "Scores appear once the patient answers at least one question."}
    </p>
  );
}

function SubScaleCard({ sub, index, isComplete }) {
  const Icon = SUB_ICONS[index % SUB_ICONS.length];
  const tone = levelOf(sub.level).tone;
  return (
    <article className={`sub-card tone-${tone}`}>
      <header>
        <span className="sub-icon"><Icon size={16} /></span>
        <h4>{sub.name.en}</h4>
      </header>
      <div className="sub-score">
        <strong>{sub.score ?? "—"}</strong>
        <LevelBadge level={sub.level} label={sub.label} />
      </div>
      <LevelMeter
        bands={sub.bands}
        score={isComplete || !sub.bands?.length ? sub.score : null}
        min={sub.min_score}
        max={sub.max_score}
      />
      {sub.interpretation && <p className="sub-note">{sub.interpretation}</p>}
    </article>
  );
}

export default function ScoreSummary({ detail }) {
  const { category, sub_categories: subs, level_counts: counts } = detail;
  const isComplete = detail.status === "completed";
  const chips = LEVEL_ORDER.filter((l) => counts?.[l]);

  return (
    <section className="a-card pd-summary">
      <div className="pd-summary-body">
        <div className="pd-summary-top">
          <div className="pd-summary-title">
            <span className="pd-doc-icon"><ClipboardIcon size={18} /></span>
            <div>
              <h3>Score Summary</h3>
              <small>{category.title}</small>
            </div>
          </div>
          <TotalBox detail={detail} />
        </div>

        {chips.length > 0 && (
          <div className="pd-subscales-row">
            <span>Sub-scales</span>
            {chips.map((l) => <LevelBadge key={l} level={l} label={levelOf(l).name} count={counts[l]} />)}
          </div>
        )}

        {subs.length > 0 && (
          <div className="sub-grid">
            {subs.map((s, i) => <SubScaleCard key={s.id} sub={s} index={i} isComplete={isComplete} />)}
          </div>
        )}
      </div>
    </section>
  );
}
