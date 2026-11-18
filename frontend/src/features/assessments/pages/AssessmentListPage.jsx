import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { ArrowIcon, ClipboardIcon, HelpIcon, LogoutIcon } from "@/components/ui/icons";
import { assessmentApi } from "../api/assessmentApi";

function errorMessage(error) {
  return error.response?.data?.message || "Couldn’t load assessments. Please try again.";
}

export default function AssessmentListPage() {
  const { logout } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCatalog = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await assessmentApi.getCatalog();
      setCatalog(data.data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  return (
    <main className="min-h-screen bg-peach bg-[radial-gradient(circle_at_100%_0,#fff0e4_0,transparent_35%)] px-5 py-12 text-[#171717] sm:px-8">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fff0d9] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
              <span className="size-1.5 rounded-full bg-orange-500" />
              Assessments
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Take a <span className="text-brand">Quiz</span>
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Choose an assessment below to begin. It only takes a few minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex flex-none items-center gap-2 rounded-xl border border-peach-line bg-white px-3.5 py-2 text-xs font-medium text-stone-600 shadow-sm transition hover:bg-orange-50 hover:text-orange-700"
          >
            <LogoutIcon size={15} />
            Log out
          </button>
        </header>

        {loading && (
          <p className="py-12 text-center text-sm text-stone-500" role="status">
            Loading assessments…
          </p>
        )}
        {error && (
          <div className="rounded-2xl border border-peach-line bg-white px-5 py-10 text-center">
            <p className="mb-4 text-danger">{error}</p>
            <Button onClick={loadCatalog} className="mx-auto w-auto">Try again</Button>
          </div>
        )}
        {!loading && !error && catalog.length === 0 && (
          <p className="rounded-2xl border border-peach-line bg-white px-4 py-10 text-center text-sm text-stone-500">
            No assessments are published yet. Please check back later.
          </p>
        )}

        {!loading && !error && catalog.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((assessment) => {
              const destination = assessment.status === "completed"
                ? `/assessments/results/${assessment.id}`
                : `/assessments/${assessment.id}`;

              return (
                <li key={assessment.id}>
                  <article className="flex h-full min-h-[228px] flex-col rounded-2xl border border-peach-line bg-white p-5 shadow-[0_1px_2px_rgba(70,40,20,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="grid size-9 flex-none place-items-center rounded-xl bg-linear-to-br from-brand-light to-brand text-white shadow-md shadow-brand/25">
                        <ClipboardIcon size={19} />
                      </span>
                      {assessment.domain && (
                        <span className="max-w-[70%] truncate rounded-full border border-orange-100 bg-[#fff8ee] px-3 py-1 text-[10px] font-medium text-orange-700">
                          {assessment.domain}
                        </span>
                      )}
                    </div>
                    <h2 className="text-[15px] font-bold leading-5 text-[#171717]">{assessment.title}</h2>
                    {assessment.description && (
                      <p className="mt-3 text-xs leading-5 text-stone-500">{assessment.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-[#f1e7df] pt-3.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-stone-500">
                        <HelpIcon size={14} />
                        {assessment.questions_count} {assessment.questions_count === 1 ? "question" : "questions"}
                      </span>
                      <Link
                        to={destination}
                        className="inline-flex items-center gap-1 font-semibold text-orange-600 transition hover:text-orange-800"
                      >
                        {assessment.status === "completed"
                          ? "Results"
                          : assessment.status === "in_progress" ? "Continue" : "Start"}
                        <ArrowIcon />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
