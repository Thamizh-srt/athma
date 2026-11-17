import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { handleApiError } from "@/utils/apiErrors";
import { loginSchema } from "./schemas";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import Button, { buttonClasses } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Logo from "@/components/layout/Logo";
import { MailIcon, ShieldIcon } from "@/components/ui/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = handleApiError(err, setError);
      if (message) setServerError(message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-6">
      <section className="grid min-h-[530px] w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-navy/15 md:grid-cols-[360px_1fr]">
        <aside className="hidden flex-col justify-between gap-6 bg-navy-deep p-8 text-white md:flex">
          <div className="inline-flex self-start rounded-2xl bg-white px-3.5 py-2.5">
            <Logo height={48} />
          </div>
          <div>
            <h2 className="mb-2.5 text-3xl font-bold leading-tight">Good to see you again</h2>
            <p className="text-sm leading-normal text-blue-200">Pick up right where you left off, at your own pace.</p>
          </div>
          <div className="flex gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
            <span className="grid size-[34px] flex-none place-items-center rounded-[9px] bg-brand"><ShieldIcon /></span>
            <div>
              <strong>Private and confidential</strong>
              <p className="mt-0.5 text-[12.5px] text-blue-200">Your details are only used for your care.</p>
            </div>
          </div>
        </aside>

        <div className="flex flex-col justify-center px-6 py-7 md:px-12 md:pb-10">
          <p className="mb-8 self-end text-[13px] text-muted">
            New here? <Link to="/register" className="font-semibold text-brand hover:underline">Create account</Link>
          </p>

          <h1 className="text-[32px] font-bold text-navy">Welcome back</h1>
          <p className="mb-6 mt-1.5 text-[15px] text-muted">Log in with your registered email and password.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col">
            <Alert>{serverError}</Alert>

            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" icon={<MailIcon />} error={errors.email?.message} {...register("email")} />
            <PasswordField label="Password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />

            <Button type="submit" loading={isSubmitting} withArrow className="mt-2">Log in</Button>

            <div className="my-4 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
              <span>or</span>
            </div>

            <Link to="/register" className={buttonClasses("secondary")}>Create a new account</Link>
          </form>
        </div>
      </section>
    </div>
  );
}
