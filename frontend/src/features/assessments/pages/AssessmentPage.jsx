import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import { HelpIcon } from "@/components/ui/icons";
import { assessmentApi } from "../api/assessmentApi";

function errorMessage(error) {
  return error.response?.data?.message || "Couldn’t load this assessment. Please try again.";
}

function displayText(pair) {
  return pair?.en || pair?.ta || "";
}

function estimatedDuration(questionCount) {
  const maximum = Math.max(1, Math.ceil(questionCount / 3));
  const minimum = Math.max(1, maximum - 1);
  return `${minimum}–${maximum} mins`;
}

export default function AssessmentPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [nextAssessment, setNextAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [data, catalog] = await Promise.all([
          assessmentApi.getAssessment(categoryId),
          assessmentApi.getCatalog(),
        ]);
        if (!active) return;

        setAssessment(data);
        const saved = Object.fromEntries(
          [
            ...(data.answers ?? []).map((answer) => [answer.question_id, answer.option_id]),
            ...(data.questions ?? [])
              .filter((question) => question.selected_option_id !== null
                && question.selected_option_id !== undefined)
              .map((question) => [question.id, question.selected_option_id]),
          ]
        );
        setAnswers(saved);
        setSavedAnswers(saved);

        const categories = catalog.data ?? [];
        const currentIndex = categories.findIndex((item) => String(item.id) === String(data.id));
        setNextAssessment(currentIndex >= 0 ? categories[currentIndex + 1] ?? null : null);
      } catch (requestError) {
        if (active) setError(errorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [categoryId, navigate]);

  const questions = assessment?.questions ?? [];
  const answeredCount = questions.reduce(
    (count, question) => count + (answers[question.id] !== undefined ? 1 : 0),
    0
  );
  const questionCount = questions.length;
  const progress = questionCount ? Math.round((answeredCount / questionCount) * 100) : 0;
  const allQuestionsAnswered = questionCount > 0 && answeredCount === questionCount;
  const duration = estimatedDuration(questionCount);
  const questionType = questions[0]?.type === "choice"
    ? "Multiple choice"
    : questions[0]?.scale_type || questions[0]?.type || "Assessment";

  const saveAnswer = async (questionId, optionId) => {
    if (savingQuestion !== null || submitting) return;

    const previousAnswer = answers[questionId];
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setSavingQuestion(questionId);
    setError("");

    try {
      await assessmentApi.saveAnswers(categoryId, [{ question_id: questionId, option_id: optionId }]);
      setSavedAnswers((current) => ({ ...current, [questionId]: optionId }));
    } catch (requestError) {
      setAnswers((current) => {
        const next = { ...current };
        if (previousAnswer === undefined) delete next[questionId];
        else next[questionId] = previousAnswer;
        return next;
      });
      setError(errorMessage(requestError));
    } finally {
      setSavingQuestion(null);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await assessmentApi.submitAssessment(categoryId);
      navigate("/questions", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-sm text-stone-500">Loading assessment…</main>;
  }

  if (error && !assessment) {
    return (
      <main className="grid min-h-screen place-content-center gap-4 px-5 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/questions" className="font-medium text-brand">Back to categories</Link>
      </main>
    );
  }

  const questionGroups = [];
  for (let start = 0; start < questionCount; start += 10) {
    const groupQuestions = questions.slice(start, start + 10);
    questionGroups.push({
      number: questionGroups.length + 1,
      start,
      end: start + groupQuestions.length,
      answered: groupQuestions.filter((question) => answers[question.id] !== undefined).length,
    });
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fafafa] text-slate-900 lg:h-screen lg:overflow-hidden">
      <header className="flex min-h-14 flex-none items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">
        <Link
          to="/questions"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 transition hover:text-orange-700"
        >
          <span aria-hidden="true">←</span>
          Back to Categories
        </Link>
        <div className="min-w-0 text-right">
          <p className="truncate text-[11px] font-semibold text-teal-700">{assessment.title}</p>
          <span className="mt-0.5 inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-[9px] font-medium text-stone-600">
            {questionType}
          </span>
        </div>
      </header>

      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[270px_minmax(0,1fr)_260px]">
        <aside className="border-b border-stone-200 bg-white px-4 py-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Assessment info</p>

          <section className="mt-3 rounded-xl border border-teal-300 bg-teal-50/70 p-3.5">
            <span className="grid size-8 place-items-center rounded-lg bg-stone-200 text-slate-600">
              <HelpIcon size={15} />
            </span>
            <h1 className="mt-3 text-[13px] font-extrabold uppercase leading-[1.4]">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="mt-1.5 text-[10px] leading-[1.5] text-slate-600">{assessment.description}</p>
            )}
            {assessment.instructions?.en && (
              <p className="mt-3 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[9px] leading-4 text-slate-600">
                <span className="mr-1 text-emerald-600">✓</span>
                {assessment.instructions.en}
              </p>
            )}
            <div className="mt-2 flex gap-1.5 text-[9px] text-slate-600">
              <span className="flex-1 rounded-md border border-stone-200 bg-white px-2 py-1.5">
                {questionCount} Questions
              </span>
              <span className="flex-1 rounded-md border border-stone-200 bg-white px-2 py-1.5">
                {duration}
              </span>
            </div>
          </section>

          <section className="mt-5 space-y-3 text-[10px]">
            <div>
              <div className="mb-1.5 flex justify-between text-slate-500">
                <span>Overall progress</span>
                <span>{progress}%</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-stone-200"
                role="progressbar"
                aria-label="Assessment progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Answered</span><span>{answeredCount} / {questionCount}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining</span><span className="font-semibold text-orange-600">{questionCount - answeredCount}</span>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-600">Up next</p>
            {nextAssessment ? (
              <Link
                to={`/assessments/${nextAssessment.id}`}
                className="mt-1 block text-[9px] font-medium leading-4 text-slate-700 hover:text-teal-700"
              >
                {nextAssessment.title}
              </Link>
            ) : (
              <p className="mt-1 text-[9px] leading-4 text-slate-600">This is the last assessment.</p>
            )}
          </section>

          <p className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-[9px] text-emerald-700">
            <span className="mr-1">✓</span> Answers are saved automatically
          </p>
          <p className="mt-6 text-center text-[10px] font-medium text-slate-600">
            Take your time, we’re here with you
          </p>
        </aside>

        <section className="min-w-0 overflow-y-auto px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[440px]">
            {error && <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

            {questionCount === 0 ? (
              <p className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
                Questions have not been added yet.
              </p>
            ) : (
              <>
                <ol className="space-y-4">
                  {questions.map((question, index) => (
                    <li
                      id={`question-${index + 1}`}
                      key={question.id}
                      className="relative scroll-mt-5 rounded-xl border border-stone-200 bg-white px-5 pb-5 pt-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-6"
                    >
                      <span className="absolute -top-3 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-linear-to-br from-brand-light to-brand text-[11px] font-bold text-white shadow-md shadow-brand/25">
                        {index + 1}
                      </span>
                      {answers[question.id] !== undefined
                        && savingQuestion !== question.id
                        && Number(savedAnswers[question.id]) === Number(answers[question.id]) && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                            <span aria-hidden="true">✓</span>
                            Saved
                          </span>
                        )}
                      <p className="text-center text-[12px] font-semibold leading-5 text-slate-800">
                        {displayText(question.text)}
                      </p>
                      {question.text.ta && question.text.ta !== question.text.en && (
                        <p lang="ta" className="mt-2 text-center text-[12px] leading-5 text-slate-700">
                          {question.text.ta}
                        </p>
                      )}
                      <div className="my-3 border-t border-stone-100" />
                      <fieldset className="flex flex-wrap justify-center gap-2">
                        <legend className="sr-only">Answer for question {index + 1}</legend>
                        {question.options.map((option) => {
                          const selected = Number(answers[question.id]) === option.id;

                          return (
                            <label key={option.id} className="cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={selected}
                                onChange={() => saveAnswer(question.id, option.id)}
                                disabled={savingQuestion !== null || submitting}
                                className="peer sr-only"
                              />
                              <span className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1.5 text-center text-[10px] font-medium transition ${
                                selected
                                  ? "border-teal-600 bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                                  : "border-stone-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/50"
                              }`}>
                                {displayText(option.label)}
                              </span>
                            </label>
                          );
                        })}
                      </fieldset>
                      {savingQuestion === question.id && (
                        <p className="mt-2 text-center text-[9px] text-slate-400" role="status">Saving answer…</p>
                      )}
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pb-6">
                  <p className="text-xs text-slate-500" aria-live="polite">
                    {answeredCount} of {questionCount} answered
                  </p>
                  <Button
                    onClick={submit}
                    loading={submitting}
                    disabled={!allQuestionsAnswered || savingQuestion !== null}
                    className="w-auto"
                    withArrow
                  >
                    Submit assessment
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="hidden border-l border-stone-200 bg-white px-4 py-5 lg:block lg:overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Question blocks</p>
          <div className="mt-3 space-y-2">
            {questionGroups.map((group) => (
              <button
                key={group.number}
                type="button"
                onClick={() => document.getElementById(`question-${group.start + 1}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })}
                className="flex w-full items-center gap-3 rounded-lg border border-teal-300 bg-teal-50/70 px-3 py-2.5 text-left transition hover:bg-teal-50"
              >
                <span className="text-[9px] font-medium">{group.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold">Q {group.start + 1} - {group.end}</span>
                  <span className="block text-[9px] text-slate-500">{group.end - group.start} questions</span>
                </span>
                <span className="text-[9px] text-slate-500">{group.answered}/{group.end - group.start}</span>
                <span aria-hidden="true" className="text-xs text-slate-500">⌄</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
