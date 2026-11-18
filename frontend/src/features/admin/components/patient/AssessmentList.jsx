import { AlertIcon, ClipboardIcon, FileIcon } from "@/components/ui/icons";
import { Link } from "react-router-dom";
import ProgressRing from "./ProgressRing";

function statusText(item) {
  if (item.status === "not_started") return "Not started";
  const base = `${item.answered_count} of ${item.questions_count} answered`;
  return item.status === "in_progress" ? `${base}, in progress` : base;
}

/** Right-hand column: every assessment with how far the patient got. Click one to load it. */
export default function AssessmentList({ patientId, items, attended, selectedId, onSelect }) {
  return (
    <aside className="a-card pd-assess">
      <div className="pd-assess-head">
        <div>
          <h3><ClipboardIcon size={16} /> Assessments</h3>
          <small>{attended} {attended === 1 ? "quiz" : "quizzes"} attended</small>
        </div>
        <Link to={`/admin/patients/${patientId}/report`} target="_blank" rel="noreferrer" className="btn-orange pd-no-print">
          <FileIcon size={14} /> Report
        </Link>
      </div>

      <ul className="al-list">
        {items.map((item) => {
          const started = item.status !== "not_started";
          return (
            <li key={item.category_id}>
              <button
                type="button"
                className={`al-item ${selectedId === item.category_id ? "sel" : ""}`}
                disabled={!started}
                aria-current={selectedId === item.category_id}
                onClick={() => onSelect(item.category_id)}
              >
                <ProgressRing value={item.progress} />
                <span className="al-text">
                  <strong>{item.title}</strong>
                  <small>{statusText(item)}</small>
                </span>
                {item.has_alert && <span className="al-alert" title="Needs follow-up"><AlertIcon size={16} /></span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
