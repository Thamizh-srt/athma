import { useDeferredValue, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { daysSince, formatDate } from "../utils/format";
import { ChevronRightIcon } from "@/components/ui/icons";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import StatStrip from "../components/StatStrip";
import SearchFilterBar from "../components/SearchFilterBar";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";

const HEADER = <PageHeader title="Patients" subtitle="Everyone registered on the platform" />;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "signed", label: "Declaration signed" },
  { key: "pending", label: "Declaration pending" },
];

export default function PatientsPage() {
  const { data, loading, error } = useAsync(adminApi.getPatients, []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);
  const navigate = useNavigate();

  const patientsData = data ?? [];
  const patients = patientsData.patients?.data ?? [];
  console.log(patients);
  

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return patients.filter((p) => {
      if (filter === "signed" && !p.declaration_signed) return false;
      if (filter === "pending" && p.declaration_signed) return false;
      if (!q) return true;
      return [p.full_name, p.phone, p.email, p.city, p.state].join(" ").toLowerCase().includes(q);
    });
  }, [patients, deferredQuery, filter]);

  if (loading || error) return <>{HEADER}<PageState loading={loading} error={error} /></>;

  const signed = patients.filter((p) => p.declaration_signed).length;
  const recent = patients.filter((p) => daysSince(p.created_at) < 7).length;

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
        onChange={setQuery}
        placeholder="Search by name, phone, email or city"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter}
        summary={`${filtered.length} of ${patients.length} patients`}
      />

      <div className="a-card table-wrap">
        <table className="a-table">
          <thead>
            <tr><th>Patient</th><th>Contact</th><th>Location</th><th>Registered</th><th>Declaration</th><th /></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="row-link" onClick={() => navigate(`/admin/patients/${p.id}`)}>
                <td>
                  <div className="cell-person">
                    <Avatar name={p.full_name} large />
                    <div>
                      <Link to={`/admin/patients/${p.id}`} className="person-link" onClick={(e) => e.stopPropagation()}><strong>{p.full_name}</strong></Link>
                      <small>{p.age ? `${p.age} yrs${p.gender ? `, ${p.gender}` : ""}` : "Age not given"}</small>
                    </div>
                  </div>
                </td>
                <td><div className="cell-stack"><span>{p.phone}</span><small>{p.email}</small></div></td>
                <td><div className="cell-stack"><span>{p.city}</span><small>{p.state}</small></div></td>
                <td>{formatDate(p.created_at)}</td>
                <td><Badge tone={p.declaration_signed ? "orange" : "gray"}>{p.declaration_signed ? "Signed" : "Pending"}</Badge></td>
                <td className="cell-chevron"><ChevronRightIcon size={16} /></td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="table-empty">No patients match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
