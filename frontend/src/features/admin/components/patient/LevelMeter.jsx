import { inBand, levelOf } from "../../utils/levels";

/**
 * One segment per score band (Low / Normal / High…), the band the score falls in is lit.
 * Scales without bands (e.g. MHI-38 sub-scales) fall back to a plain bar across the possible range.
 */
export default function LevelMeter({ bands = [], score, min, max }) {
  if (bands.length) {
    return (
      <div className="meter">
        <div className="meter-bars">
          {bands.map((b, i) => (
            <i key={i} className={`seg seg-${levelOf(b.level).tone} ${inBand(b, score) ? "on" : ""}`} />
          ))}
        </div>
        <div className="meter-labels">
          {bands.map((b, i) => (
            <span key={i} className={inBand(b, score) ? "on" : ""}>{b.label}</span>
          ))}
        </div>
      </div>
    );
  }

  const span = max != null && min != null ? max - min : 0;
  const pct = score == null || !span ? 0 : Math.round(((score - min) / span) * 100);
  return (
    <div className="meter">
      <div className="meter-track"><i style={{ width: `${pct}%` }} /></div>
      {span > 0 && <div className="meter-labels range"><span>{min}</span><span>{max}</span></div>}
    </div>
  );
}
