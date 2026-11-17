import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { handleApiError } from "@/utils/apiErrors";
import { registerSchema } from "./schemas";
import { GENDER_OPTIONS, MARITAL_OPTIONS } from "./constants";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import StepProgress from "@/components/ui/StepProgress";
import Logo from "@/components/layout/Logo";
import { ShieldIcon } from "@/components/ui/icons";

const Options = ({ items }) => items.map((o) => <option key={o} value={o}>{o}</option>);

const SectionTitle = ({ children }) => (
  <div className="mb-3.5 mt-1.5 flex items-center gap-2.5 text-[10px] font-semibold tracking-widest text-muted after:h-px after:flex-1 after:bg-line">
    <span>{children}</span>
  </div>
);

// Responsive row layouts
const ROW_2 = "grid gap-x-3.5 sm:grid-cols-2";
const ROW_3 = "grid gap-x-3.5 sm:grid-cols-[1.4fr_1fr_1fr]";
const ROW_4 = "grid gap-x-3.5 sm:grid-cols-2 md:grid-cols-4";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { gender: "", maritalStatus: "", consent: false },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await registerUser(values);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = handleApiError(err, setError);
      if (message) setServerError(message);
    }
  };

  return (
    <div className="mx-auto max-w-[650px] px-4 pb-10 pt-6">
      <header className="mb-4 flex justify-center"><Logo height={44} /></header>

      <section className="rounded-[20px] bg-white p-5 shadow-xl shadow-navy/10 sm:px-9 sm:pb-8 sm:pt-7">
        <StepProgress current={1} total={4} />
        <h1 className="mb-1 mt-4 text-[22px] font-bold text-navy">Let’s get you registered</h1>
        <p className="mb-5.5 text-[13px] text-muted">Takes about a minute. Matches you to the right care package.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Alert>{serverError}</Alert>

          <div className={ROW_3}>
            <Field label="Full name" required placeholder="Full Name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
            <Field label="Age" placeholder="Age" inputMode="numeric" maxLength={3} error={errors.age?.message} {...register("age")} />
            <Field as="select" label="Gender" error={errors.gender?.message} {...register("gender")}>
              <option value="">Select</option>
              <Options items={GENDER_OPTIONS} />
            </Field>
          </div>

          <div className={ROW_2}>
            <Field label="Phone" required type="tel" inputMode="numeric" maxLength={10} placeholder="Phone Number" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
            <Field label="Email" required type="email" placeholder="Email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          </div>

          <Field as="textarea" rows={3} label="Full Address" required placeholder="House/Flat No., Street, Area, Landmark" autoComplete="street-address" error={errors.address?.message} {...register("address")} />

          <div className={ROW_4}>
            <Field label="City" required placeholder="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <Field label="State" required placeholder="State" autoComplete="address-level1" error={errors.state?.message} {...register("state")} />
            <Field label="Pincode" required inputMode="numeric" maxLength={6} placeholder="6-digit pincode" autoComplete="postal-code" error={errors.pincode?.message} {...register("pincode")} />
            <Field label="Location" required placeholder="District/Area" error={errors.location?.message} {...register("location")} />
          </div>

          <SectionTitle>ABOUT YOU</SectionTitle>
          <div className={ROW_4}>
            <Field as="select" label="Marital status" error={errors.maritalStatus?.message} {...register("maritalStatus")}>
              <option value="">Select</option>
              <Options items={MARITAL_OPTIONS} />
            </Field>
            <Field label="Education" placeholder="e.g. B.E, B.Sc, M.A" error={errors.education?.message} {...register("education")} />
            <Field label="Occupation" placeholder="e.g. Engineer, Student" error={errors.occupation?.message} {...register("occupation")} />
            <Field label="Referred By" optional placeholder="Doctor/Clinic/Person" error={errors.referredBy?.message} {...register("referredBy")} />
          </div>

          <SectionTitle>ACCOUNT SECURITY</SectionTitle>
          <div className={ROW_2}>
            <PasswordField label="Password" required autoComplete="new-password" placeholder="At least 6 characters" error={errors.password?.message} {...register("password")} />
            <PasswordField label="Confirm password" required autoComplete="new-password" placeholder="Re-enter your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          </div>

          <Checkbox
            label="I confirm that the information provided above is true and accurate to the best of my knowledge, and I consent to Athma Mind Care Hospital using it for my care."
            error={errors.consent?.message}
            {...register("consent")}
          />

          <div className="mx-auto mt-6 max-w-[220px] text-center">
            <Button type="submit" loading={isSubmitting} withArrow>Register</Button>
            <p className="mt-3 text-xs text-muted">
              Already have an account? <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link>
            </p>
          </div>
        </form>
      </section>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
        <span className="text-emerald-600"><ShieldIcon /></span> Your details are shared only with your assigned doctor.
      </p>
    </div>
  );
}
