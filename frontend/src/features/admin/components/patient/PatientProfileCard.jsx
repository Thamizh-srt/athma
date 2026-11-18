import { BriefcaseIcon, CalendarIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { formatDate } from "../../utils/format";

const Row = ({ label, value }) => (
  <>
    <dt>{label}</dt>
    <dd>{value || "—"}</dd>
  </>
);

function Section({ icon: Icon, title, children }) {
  return (
    <section className="pd-sec">
      <h4><Icon size={15} /> {title}</h4>
      <dl>{children}</dl>
    </section>
  );
}

export default function PatientProfileCard({ patient: p }) {
  const address = [p.address, p.city, p.state].filter(Boolean).join(", ") + (p.pincode ? `, ${p.pincode}` : "");
  return (
    <aside className="a-card pd-profile">
      <Section icon={PhoneIcon} title="Contact">
        <Row label="Phone" value={p.phone} />
        <Row label="Email" value={p.email} />
      </Section>
      <Section icon={BriefcaseIcon} title="Background">
        <Row label="Marital status" value={p.marital_status} />
        <Row label="Education" value={p.education} />
        <Row label="Occupation" value={p.occupation} />
      </Section>
      <Section icon={PinIcon} title="Address">
        <Row label="Full address" value={address} />
      </Section>
      <Section icon={CalendarIcon} title="Registration">
        <Row label="Registered on" value={formatDate(p.created_at)} />
        <Row label="Referred by" value={p.referred_by} />
      </Section>
    </aside>
  );
}
