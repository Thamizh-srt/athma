import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { assessmentApi } from "../api/assessmentApi";

export default function AssessmentResultPage() {
  const { categoryId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    assessmentApi.getAssessment(categoryId)
      .then((result) => {
        if (active) setAttempt(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Couldn’t load this result.");
      });

    return () => { active = false; };
  }, [categoryId]);

  if (error) {
    return (
      <main className="grid min-h-screen place-content-center gap-4 px-5 text-center">
        <p className="text-danger">{error}</p>
        <Link to="/dashboard" className="font-medium text-brand">Back to assessments</Link>
      </main>
    );
  }

  if (!attempt) return <main className="grid min-h-screen place-items-center text-muted">Loading results…</main>;

  return (
    <main className="min-h-screen bg-cream px-5 py-8 text-navy sm:px-8">
      <section className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm text-emerald-700">Answers submitted</p>
        <h1 className="mt-1 text-2xl font-bold">{attempt.title}</h1>
        {attempt.status !== "completed" ? (
          <p className="mt-5 text-muted">This assessment is still in progress.</p>
        ) : (
          <>
            <div className="mt-6 rounded-xl bg-field p-5">
              <p className="text-sm text-muted">Total score</p>
              <p className="mt-1 text-3xl font-bold">{attempt.results?.total_score ?? "—"}</p>
            </div>
            {!!attempt.results?.dimensions?.length && (
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold">Score details</h2>
                <ul className="divide-y divide-line">
                  {attempt.results.dimensions.map((dimension) => (
                    <li key={dimension.code} className="flex flex-wrap items-start justify-between gap-3 py-4">
                      <div>
                        <h3 className="font-medium">{dimension.title.en ?? dimension.title}</h3>
                        {dimension.interpretation?.label && (
                          <p className="mt-1 text-sm text-muted">
                            {dimension.interpretation.label}
                            {dimension.interpretation.description ? ` — ${dimension.interpretation.description}` : ""}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold">{dimension.score ?? "—"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-5 text-sm text-muted">
              This result is an assessment aid, not a medical diagnosis. Discuss any concerns with a qualified professional.
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to={`/assessments/${categoryId}`} className="font-medium text-brand">
            Edit answers
          </Link>
          <Link to="/dashboard" className="font-medium text-brand">Return to assessments</Link>
        </div>
      </section>
    </main>
  );
}
