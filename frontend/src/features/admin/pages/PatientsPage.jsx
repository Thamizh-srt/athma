import { useDeferredValue, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { daysSince, formatDate } from "../utils/format";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import StatStrip from "../components/StatStrip";
import SearchFilterBar from "../components/SearchFilterBar";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import { Card } from "../components/Card";

const HEADER = <PageHeader title="Patients" subtitle="Everyone registered on the platform" />;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "signed", label: "Declaration signed" },
  { key: "pending", label: "Declaration pending" },
];

const TH = "bg-orange-50/60 px-7 py-4 text-left text-[13px] font-medium text-stone-500";
const TD = "border-t border-orange-100/60 px-7 py-3.5 align-middle text-[15px]";
const PAGE_SIZE = 5;

export default function PatientsPage() {
  const { data, loading, error } = useAsync(adminApi.getPatients, []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const patientsData = data?.patients;

  const patients = patientsData?.data ?? [];
  const totalPatients = patientsData?.total ?? 0;
  const currentPage = patientsData?.current_page ?? 1;
  const lastPage = patientsData?.last_page ?? 1;
  const perPage = patientsData?.per_page ?? 20;
  
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return patients.filter((p) => {
      if (filter === "signed" && !p.declaration_signed) return false;
      if (filter === "pending" && p.declaration_signed) return false;
      if (!q) return true;
      return [p.full_name, p.phone, p.email, p.city, p.state].join(" ").toLowerCase().includes(q);
    });
  }, [patients, deferredQuery, filter]);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pagePatients = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstPatient = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastPatient = Math.min(page * PAGE_SIZE, filtered.length);

  if (loading || error) return <>{HEADER}<PageState loading={loading} error={error} /></>;

  const signed = patients.filter((p) => p.declaration_signed).length;
  const recent = patients.filter((p) => daysSince(p.created_at) < 7).length;
  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };
  const updateFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <>
      {HEADER}
      <StatStrip
        items={[
          { label: "Registered patients", value: patients.length },
          { label: "Declaration signed", value: signed },
          { label: "Joined in the last 7 days", value: recent },
        ]}
      />

      <SearchFilterBar
        value={query}
        onChange={updateQuery}
        placeholder="Search by name, phone, email or city"
        filters={FILTERS}
        active={filter}
        onFilter={updateFilter}
        summary={`${filtered.length} of ${patients.length} patients`}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>Patient</th><th className={TH}>Contact</th><th className={TH}>Location</th>
                <th className={TH}>Registered</th><th className={TH}>Declaration</th><th className={TH} />
              </tr>
            </thead>
            <tbody>
              {pagePatients.map((p) => (
                <tr key={p.id}>
                  <td className={TD}>
                    <div className="flex items-center gap-3.5">
                      <Avatar name={p.full_name} large />
                      <div className="flex flex-col">
                        <strong className="font-semibold">{p.full_name}</strong>
                        <small className="text-sm text-stone-500">{p.age ? `${p.age} yrs${p.gender ? `, ${p.gender}` : ""}` : "Age not given"}</small>
                      </div>
                    </div>
                  </td>
                  <td className={TD}><div className="flex flex-col"><span>{p.phone}</span><small className="text-sm text-stone-500">{p.email}</small></div></td>
                  <td className={TD}><div className="flex flex-col"><span>{p.city}</span><small className="text-sm text-stone-500">{p.state}</small></div></td>
                  <td className={TD}>{formatDate(p.created_at)}</td>
                  <td className={TD}><Badge tone={p.declaration_signed ? "orange" : "gray"}>{p.declaration_signed ? "Signed" : "Pending"}</Badge></td>
                  {/* TODO: link to /admin/patients/:id when the detail page exists */}
                  <td className={`${TD} text-right text-stone-500`}><ChevronRightIcon size={16} /></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="p-8 text-center text-stone-500">No patients match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-peach-line px-7 py-4">
            <span className="text-sm text-stone-500">
              Showing {firstPatient}–{lastPatient} of {filtered.length} patients
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-xl border border-peach-line px-3 py-2 text-sm text-stone-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeftIcon size={16} /> Previous
              </button>
              <span className="px-1 text-sm text-stone-500" aria-live="polite">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page >= pageCount}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-xl border border-peach-line px-3 py-2 text-sm text-stone-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Next <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
