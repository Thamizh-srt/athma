import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "@/styles/patient-detail.css";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { ChevronLeftIcon } from "@/components/ui/icons";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import PatientHeader from "../components/patient/PatientHeader";
import PatientProfileCard from "../components/patient/PatientProfileCard";
import AssessmentList from "../components/patient/AssessmentList";
import ScoreSummary from "../components/patient/ScoreSummary";
import AnswersPanel from "../components/patient/AnswersPanel";

const HEADER = <PageHeader title="Patients" subtitle="Everyone registered on the platform" />;
const BACK = <Link to="/admin/patients" className="back-btn"><ChevronLeftIcon size={14} /> All patients</Link>;

function PatientDetail({ patientId }) {
  const patient = useAsync(() => adminApi.getPatient(patientId), [patientId]);
  const list = useAsync(() => adminApi.getPatientAssessments(patientId), [patientId]);
  const [picked, setPicked] = useState(null);

  const items = list.data?.data ?? [];
  // open the first assessment the patient has started until someone picks another
  const selectedId = picked ?? items.find((i) => i.status !== "not_started")?.category_id ?? null;
  const detail = useAsync(
    () => (selectedId ? adminApi.getPatientAssessment(patientId, selectedId) : Promise.resolve(null)),
    [patientId, selectedId]
  );

  const failed = patient.error || list.error;
  if (patient.loading || list.loading || failed) {
    return <>{HEADER}{BACK}<PageState loading={patient.loading || list.loading} error={failed} /></>;
  }

  return (
    <>
      {HEADER}
      {BACK}
      <PatientHeader patient={patient.data} />

      <div className="pd-grid">
        <div className="pd-area-profile"><PatientProfileCard patient={patient.data} /></div>

        <div className="pd-area-main">
          {!selectedId && (
            <section className="a-card"><div className="table-empty">This patient hasn’t started any assessment yet.</div></section>
          )}
          {selectedId && detail.loading && <section className="a-card"><PageState loading /></section>}
          {selectedId && detail.error && <section className="a-card"><PageState error={detail.error} /></section>}
          {detail.data && !detail.loading && (
            <>
              <ScoreSummary detail={detail.data} />
              <AnswersPanel key={detail.data.category.id} detail={detail.data} />
            </>
          )}
        </div>

        <div className="pd-area-list">
          <AssessmentList patientId={patientId} items={items} attended={list.data?.quizzes_attended ?? 0} selectedId={selectedId} onSelect={setPicked} />
        </div>
      </div>
    </>
  );
}

// key = patientId, so moving to another patient resets the selected assessment
export default function PatientDetailPage() {
  const { patientId } = useParams();
  return <PatientDetail key={patientId} patientId={patientId} />;
}
