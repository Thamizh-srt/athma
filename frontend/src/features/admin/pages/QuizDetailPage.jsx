import { useDeferredValue, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { LANGS, RISK } from "../constants";
import { formatDate } from "../utils/format";
import { ChevronLeftIcon } from "@/components/ui/icons";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import SearchBox from "../components/SearchBox";
import Badge, { Tag } from "../components/Badge";
import { Card } from "../components/Card";

const HEADER = <PageHeader title="Questions & Answers" subtitle="How patients respond to each assessment question" />;
const TYPE_LABEL = { likert: "Likert", choice: "Multiple choice", text: "Text" };

const DT = "mt-3.5 text-[12.5px] text-stone-500 first:mt-0";
const DD = "mt-1 text-sm";
const SideTitle = ({ children }) => <h4 className="mb-3 text-[15px] font-semibold">{children}</h4>;
const Divider = () => <hr className="my-5.5 border-peach-line" />;

function PatientReport() {
  const [attemptId, setAttemptId] = useState("");
  const [state, setState] = useState({ loading: false, report: null, error: "" });

  const load = async (e) => {
    e.preventDefault();
    const id = attemptId.trim();
    if (!id) return;
    setState({ loading: true, report: null, error: "" });
    try {
      setState({ loading: false, report: await adminApi.getAttemptReport(id), error: "" });
    } catch (err) {
      setState({ loading: false, report: null, error: err.response?.data?.message || "Couldn’t load the report." });
    }
  };

  const { loading, report, error } = state;

  return (
    <>
      <SideTitle>Patient Report</SideTitle>
      <p className="mb-3 text-[12.5px] text-stone-500">Enter an Attempt ID to view the calculated scores.</p>
      <form className="flex gap-2" onSubmit={load}>
        <input
          value={attemptId}
          onChange={(e) => setAttemptId(e.target.value)}
          placeholder="e.g. ATT-1-6"
          aria-label="Attempt ID"
          className="min-w-0 flex-1 rounded-[10px] border border-peach-line px-3 py-2.5 text-[13px] outline-none focus:border-orange-600"
        />
        <button type="submit" disabled={loading} className="cursor-pointer rounded-[10px] bg-orange-600 px-4.5 text-[13px] font-semibold text-white disabled:opacity-70">
          {loading ? "…" : "Load"}
        </button>
      </form>
      {error && <p className="mt-2.5 text-[11.5px] text-danger">{error}</p>}
      {report && (
        <div className="mt-3.5 flex flex-col items-start gap-1.5 rounded-xl bg-orange-50 p-3.5 text-[13px] text-stone-500">
          <span>{report.attempt_id}</span>
          <strong className="text-2xl text-neutral-900">
            {report.total_score}<small className="text-sm font-normal text-stone-500"> / {report.max_score}</small>
          </strong>
          {RISK[report.level] && <Badge tone={report.level}>{RISK[report.level].label}</Badge>}
        </div>
      )}
    </>
  );
}

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const { data: quiz, loading, error } = useAsync(() => adminApi.getQuiz(quizId), [quizId]);
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const questions = useMemo(() => {
    if (!quiz) return [];
    const q = deferredQuery.trim().toLowerCase();
    return quiz.questions.filter((item) => !q || (item.text[lang] ?? item.text.en).toLowerCase().includes(q));
  }, [quiz, deferredQuery, lang]);

  if (loading || error) return <>{HEADER}<PageState loading={loading} error={error} /></>;

  return (
    <>
      {HEADER}
      <Link to="/admin/questions" className="mb-5 inline-flex items-center gap-1.5 rounded-[10px] border border-peach-line bg-white px-3.5 py-2 text-sm">
        <ChevronLeftIcon size={14} /> All quizzes
      </Link>

      <Card className="mb-6 px-7 py-6">
        <Tag>{quiz.category}</Tag>
        <h2 className="mb-1.5 mt-3 text-2xl font-bold">{quiz.title}</h2>
        <p className="text-sm text-stone-500">{quiz.questions_count} questions, added {formatDate(quiz.created_at)}</p>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="p-6">
          <SideTitle>About this quiz</SideTitle>
          <dl><dt className={DT}>Description</dt><dd className={`${DD} font-semibold`}>{quiz.description}</dd></dl>
          <Divider />
          <SideTitle>Details</SideTitle>
          <dl>
            <dt className={DT}>Category</dt><dd className={`${DD} font-semibold`}>{quiz.category}</dd>
            <dt className={DT}>Status</dt><dd className={DD}><Badge tone={quiz.status === "active" ? "orange" : "gray"}>{quiz.status === "active" ? "Active" : "Inactive"}</Badge></dd>
            <dt className={DT}>Questions</dt><dd className={`${DD} font-semibold`}>{quiz.questions_count}</dd>
            <dt className={DT}>Added on</dt><dd className={`${DD} font-semibold`}>{formatDate(quiz.created_at)}</dd>
          </dl>
          <Divider />
          <PatientReport />
        </Card>

        <div>
          <div className="mb-4 flex gap-3.5">
            <SearchBox value={query} onChange={setQuery} placeholder="Search questions" className="flex-1" />
            <div className="flex gap-1 rounded-xl border border-peach-line bg-white p-1" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLang(l.key)}
                  className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-[13px] ${
                    lang === l.key ? "border-orange-600 bg-orange-50 font-semibold text-orange-700" : "border-transparent"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <ol className="divide-y divide-orange-100/60 px-7">
              {questions.map((q) => (
                <li key={q.id} className="flex gap-4 py-5.5">
                  <span className="grid size-7 flex-none place-items-center rounded-lg bg-orange-100 text-xs font-bold text-orange-700">{q.order}</span>
                  <div>
                    <p className="mb-2.5 mt-0.5 text-[14.5px] font-medium">{q.text[lang] ?? q.text.en}</p>
                    <Tag gray>{TYPE_LABEL[q.type] ?? q.type}</Tag>
                    {q.scale_type && <Tag gray>{TYPE_LABEL[q.scale_type] ?? q.scale_type}</Tag>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.options.map((o) => (
                        <span key={o.value} className="inline-flex items-center gap-2 rounded-[10px] border border-peach-line py-1.5 pl-2 pr-3 text-[13px]">
                          <i className="grid size-5 place-items-center rounded-md bg-stone-100 text-[11px] not-italic text-stone-500">{o.value}</i>
                          {o.label[lang] ?? o.label.en}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {!questions.length && <div className="p-8 text-center text-stone-500">No questions to show.</div>}
          </Card>
        </div>
      </div>
    </>
  );
}
