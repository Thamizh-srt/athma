import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import { assessmentApi } from "../api/assessmentApi";

function errorMessage(error) {
  return error.response?.data?.message || "Couldn’t load this assessment. Please try again.";
}

export default function AssessmentPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await assessmentApi.getAssessment(categoryId);
        if (!active) return;
        setAssessment(data);

        if (data.status === "completed") {
          navigate(`/assessments/results/${categoryId}`, { replace: true });
          return;
        }

        if (data.status === "in_progress") {
          setAttempt({ id: data.attempt_id });
          setAnswers(Object.fromEntries(data.answers.map((answer) => [answer.question_id, answer.option_id])));
        }
      } catch (requestError) {
        if (active) setError(errorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [categoryId, navigate]);

  const start = async () => {
    setStarting(true);
    setError("");
    try {
      await assessmentApi.saveAnswers(categoryId, []);
      setAttempt({});
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setStarting(false);
    }
  };

  const saveAnswer = async (questionId, optionId) => {
    if (!attempt || savingQuestion !== null) return;

    const previousAnswer = answers[questionId];
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setSavingQuestion(questionId);
    setError("");

    try {
      await assessmentApi.saveAnswers(categoryId, [{ question_id: questionId, option_id: optionId }]);
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
      navigate(`/assessments/results/${categoryId}`, { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-muted">Loading assessment…</main>;
  }

  if (error && !assessment) {
    return (
      <main className="grid min-h-screen place-content-center gap-4 px-5 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/dashboard" className="font-medium text-brand">Back to assessments</Link>
      </main>
    );
  }

  const requiredQuestions = assessment.questions.filter((question) => question.required);
  const allRequiredAnswered = requiredQuestions.every((question) => answers[question.id]);
  const instruction = assessment.instructions?.en;

  return (
    <main className="min-h-screen bg-cream px-5 py-8 text-navy sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="mb-5 inline-block text-sm font-medium text-brand">← All assessments</Link>
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
          <h1 className="mt-1 text-2xl font-bold">{assessment.title}</h1>
          {assessment.description && <p className="mt-2 text-sm text-muted">{assessment.description}</p>}

          {!attempt && (
            <div className="mt-6">
              {instruction && <p className="mb-5 whitespace-pre-line text-sm leading-6">{instruction}</p>}
              {error && <p className="mb-3 text-sm text-danger">{error}</p>}
              <Button
                onClick={start}
                loading={starting}
                disabled={!assessment.questions.length}
                className="w-auto"
              >
                Begin assessment
              </Button>
            </div>
          )}

          {attempt && (
            <>
              {instruction && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted">{instruction}</p>}
              <ol className="mt-6 space-y-6">
                {assessment.questions.map((question, index) => (
                  <li key={question.id} className="rounded-xl border border-line p-4">
                    <p className="font-medium">
                      <span className="mr-2 text-muted">{index + 1}.</span>{question.text.en}
                      {question.required && <span className="ml-1 text-danger" aria-label="required">*</span>}
                    </p>
                    <fieldset className="mt-3 grid gap-2">
                      <legend className="sr-only">Answer for question {index + 1}</legend>
                      {question.options.map((option) => (
                        <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-lg bg-field p-3 text-sm">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={Number(answers[question.id]) === option.id}
                            onChange={() => saveAnswer(question.id, option.id)}
                            disabled={savingQuestion !== null || submitting}
                            className="mt-0.5 accent-brand"
                          />
                          <span>{option.label.en}</span>
                        </label>
                      ))}
                    </fieldset>
                    {savingQuestion === question.id && <p className="mt-2 text-xs text-muted">Saving answer…</p>}
                  </li>
                ))}
              </ol>
              {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted" aria-live="polite">
                  {Object.keys(answers).length} of {assessment.questions.length} answered
                </p>
                <Button
                  onClick={submit}
                  loading={submitting}
                  disabled={!allRequiredAnswered || savingQuestion !== null}
                  className="w-auto"
                >
                  Submit assessment
                </Button>
              </div>
            </>
          )}

          {!assessment.questions.length && <p className="mt-6 text-sm text-muted">Questions have not been added yet.</p>}
        </section>
      </div>
    </main>
  );
}
