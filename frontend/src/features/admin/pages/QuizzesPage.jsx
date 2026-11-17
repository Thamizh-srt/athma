import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { ChevronRightIcon, ClipboardIcon, HelpIcon } from "@/components/ui/icons";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import StatStrip from "../components/StatStrip";
import SearchFilterBar from "../components/SearchFilterBar";
import { Tag } from "../components/Badge";

const HEADER = <PageHeader title="Questions & Answers" subtitle="How patients respond to each assessment question" />;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function QuizzesPage() {
  const { data, loading, error } = useAsync(adminApi.getQuizzes, []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const quizzes = data ?? [];

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return quizzes.filter(
      (z) => (filter === "all" || z.status === filter) && (!q || `${z.title} ${z.category}`.toLowerCase().includes(q))
    );
  }, [quizzes, deferredQuery, filter]);

  if (loading || error) return <>{HEADER}<PageState loading={loading} error={error} /></>;

  return (
    <>
      {HEADER}
      <StatStrip
        items={[
          { label: "Quizzes", value: quizzes.length },
          { label: "Total questions", value: quizzes.reduce((n, z) => n + z.questions_count, 0) },
          { label: "Active quizzes", value: quizzes.filter((z) => z.status === "active").length },
        ]}
      />

      <SearchFilterBar
        value={query}
        onChange={setQuery}
        placeholder="Search by title or category"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter}
        summary={`${filtered.length} of ${quizzes.length} quizzes`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((z) => (
          <Link
            key={z.id}
            to={`/admin/questions/${z.id}`}
            className="flex flex-col rounded-[18px] border border-peach-line bg-white px-7 py-6 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/10"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-13 place-items-center rounded-[14px] bg-orange-600 text-white"><ClipboardIcon size={22} /></span>
              <Tag>{z.category}</Tag>
            </div>
            <h3 className="mb-2.5 mt-5.5 text-xl font-semibold">{z.title}</h3>
            <p className="mb-5.5 flex-1 text-base leading-normal text-stone-500">{z.description}</p>
            <div className="flex items-center justify-between border-t border-dashed border-orange-200/70 pt-5.5 text-stone-500">
              <span className="inline-flex items-center gap-2"><HelpIcon size={16} /> {z.questions_count} questions</span>
              <b className="inline-flex items-center gap-1 font-semibold text-orange-700">Start <ChevronRightIcon size={14} /></b>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && <div className="px-4 py-12 text-center text-stone-500">No quizzes match your search.</div>}
    </>
  );
}
