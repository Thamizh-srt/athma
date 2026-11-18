import { useEffect } from "react";
import { useParams } from "react-router-dom";
import "@/styles/patient-detail.css";
import "@/styles/patient-report.css";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { formatDate } from "../utils/format";
import PageState from "../components/PageState";
import PatientHeader from "../components/patient/PatientHeader";
import PatientProfileCard from "../components/patient/PatientProfileCard";
import ScoreSummary from "../components/patient/ScoreSummary";
import AnswersPanel from "../components/patient/AnswersPanel";

export default function PatientReportPage() {
  const { patientId } = useParams();
  const patient = useAsync(() => adminApi.getPatient(patientId), [patientId]);
  const assessments = useAsync(() => adminApi.getPatientAssessments(patientId), [patientId]);
  const loading = patient.loading || assessments.loading;
  const error = patient.error || assessments.error;

  useEffect(() => {
    if (loading || error || !patient.data || !assessments.data) return undefined;
    const timer = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(timer);
  }, [loading, error, patient.data, assessments.data]);

  if (loading || error) {
    return <main className="assessment-report-page"><PageState loading={loading} error={error} /></main>;
  }

  const items = assessments.data.data ?? [];
  const started = items.filter((item) => item.detail);

  return (
    <main className="assessment-report-page">
      <header className="report-heading">
        <h1>{patient.data.full_name}</h1>
        <p>Assessment report - Generated on {formatDate(new Date())}</p>
      </header>

      <section className="report-patient">
        <h2>Patient details</h2>
        <PatientHeader patient={patient.data} />
        <PatientProfileCard patient={patient.data} />
      </section>

      <section className="report-assessments">
        <h2>Assessments</h2>
        {started.length ? started.map((item) => (
          <article className="report-assessment" key={item.category_id}>
            <header>
              <h3>{item.title}</h3>
              <p>
                {item.answered_count} of {item.questions_count} answered
                {item.completed_at ? ` - Completed on ${formatDate(item.completed_at)}` : ""}
              </p>
            </header>
            {/* <ScoreSummary detail={item.detail} /> */}
            <AnswersPanel detail={item.detail} />
          </article>
        )) : (
          <p className="report-empty">This patient has not started an assessment yet.</p>
        )}
      </section>
    </main>
  );
}
