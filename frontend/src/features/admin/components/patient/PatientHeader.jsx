import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import Avatar from "../Avatar";

export default function PatientHeader({ patient: p }) {
  const active = p.status === "active";
  return (
    <section className="a-card pd-head">
      <div className="pd-who">
        <span className="pd-avatar"><Avatar name={p.full_name} large /></span>
        <div>
          <h2>{p.full_name}</h2>
          <div className="pd-chips">
            <span className="pd-chip">Patient ID {p.id}</span>
            {p.age ? <span className="pd-chip">{p.age} yrs</span> : null}
            {p.gender ? <span className="pd-chip">{p.gender}</span> : null}
            {p.city ? <span className="pd-chip">{p.city}</span> : null}
            <span className={`pd-chip ${p.declaration_signed ? "is-orange" : ""}`}>
              {p.declaration_signed ? "Declaration signed" : "Declaration pending"}
            </span>
            {p.status && <span className={`pd-chip ${active ? "is-orange" : ""}`}>{active ? "Active" : "Inactive"}</span>}
          </div>
        </div>
      </div>
      {/* <div className="pd-actions">
        <a className="btn-orange" href={`tel:${p.phone}`}><PhoneIcon size={15} /> Call</a>
        <a className="btn-ghost" href={`mailto:${p.email}`}><MailIcon size={15} /> Email</a>
      </div> */}
    </section>
  );
}
