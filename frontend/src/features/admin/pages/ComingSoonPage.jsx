import PageHeader from "../components/PageHeader";

export default function ComingSoonPage({ title, subtitle }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="page-state">This section is coming soon.</div>
    </>
  );
}
