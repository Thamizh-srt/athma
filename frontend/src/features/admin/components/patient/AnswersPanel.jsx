import { useMemo, useState } from "react";
import { LANGS } from "../../constants";
import { AlertIcon, CheckCircleIcon, ListIcon, MinusCircleIcon } from "@/components/ui/icons";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "answered", label: "Answered" },
  { key: "not_attended", label: "Not attended" },
];

const pick = (pair, lang) => pair?.[lang] ?? pair?.en ?? "";

function Tile({ icon: Icon, tone, value, label }) {
  return (
    <div className="pd-tile">
      <span className={`pd-tile-icon is-${tone}`}><Icon size={16} /></span>
      <div><strong>{value}</strong><small>{label}</small></div>
    </div>
  );
}

/** Every question of the assessment with the option the patient picked and the score it earned. */
export default function AnswersPanel({ detail }) {
  const [filter, setFilter] = useState("all");
  const [lang, setLang] = useState(detail.language === "ta" ? "ta" : "en");

  const { summary, questions, sub_categories: subs, alerts } = detail;
  const subName = useMemo(() => Object.fromEntries(subs.map((s) => [s.id, s.name])), [subs]);
  const shown = questions.filter((q) => filter === "all" || q.status === filter);

  return (
    <section className="a-card pd-answers">
      <div className="pd-answers-head">
        <h3>{detail.category.title}</h3>
      </div>
      <div className="pd-tiles">
        <Tile icon={CheckCircleIcon} tone="green" value={summary.answered} label="Answered" />
        <Tile icon={MinusCircleIcon} tone="gray" value={summary.not_attended} label="Not attended" />
        <Tile icon={ListIcon} tone="blue" value={summary.questions} label="Questions" />
      </div>

      {alerts.length > 0 && (
        <div className="pd-alert" role="alert">
          <AlertIcon size={18} />
          <div>
            <strong>Needs clinical follow-up</strong>
            <ul>
              {alerts.map((a) => (
                <li key={a.question_number}>Q{a.question_number}: {a.question} <b>{a.answer}</b></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="pd-toolbar">
        <div className="chips" role="group" aria-label="Filter questions">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={`chip ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.key} type="button" className={lang === l.key ? "active" : ""} onClick={() => setLang(l.key)}>{l.label}</button>
          ))}
        </div>
      </div>

      <ol className="question-list pd-questions">
        {shown.map((q) => (
          <li key={q.id}>
            <span className="q-num">{q.number}</span>
            <div className="q-body">
              <p className="q-text">{pick(q.text, lang)}</p>
              <div className="q-answer-row">
                {q.selected ? (
                  <span className={`ans ${q.flagged ? "ans-alert" : ""}`}>
                    {q.flagged ? <AlertIcon size={14} /> : <CheckCircleIcon size={14} />}
                    <span>{pick(q.selected.label, lang)}</span>
                    <em>Score {q.selected.score}</em>
                  </span>
                ) : (
                  <span className="ans ans-none"><MinusCircleIcon size={14} /> Not attended</span>
                )}
                {q.sub_category_id && subName[q.sub_category_id] && (
                  <span className="tag tag-gray">{pick(subName[q.sub_category_id], lang)}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {!shown.length && <div className="table-empty">No questions in this view.</div>}
    </section>
  );
}
