import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/schemas";
import { handleApiError } from "@/utils/apiErrors";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Logo from "@/components/layout/Logo";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminLoginPage() {
  const { admin, login } = useAdminAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  if (admin) return <Navigate to="/admin" replace />;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      navigate("/admin", { replace: true });
    } catch (err) {
      const message = handleApiError(err, setError);
      if (message) setServerError(message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-peach bg-[radial-gradient(circle_at_85%_0,#ffe9d6_0,transparent_40%)] px-4 py-6">
      <section className="w-full max-w-[524px] rounded-[32px] border border-peach-line bg-white px-6 pb-9 pt-11 text-center shadow-2xl shadow-orange-600/10 sm:px-11">
        <Logo height={56} />
        <span className="mb-3.5 mt-5.5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-[13px] font-bold tracking-wide text-orange-700">
          <i className="size-1.5 rounded-full bg-orange-600" /> ADMIN
        </span>
        <h1 className="text-[34px] font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2.5 text-base text-stone-500">Sign in to manage your counselling platform.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 text-left">
          <Alert>{serverError}</Alert>
          <Field size="lg" label="Email" type="email" autoComplete="username" placeholder="admin@example.com" error={errors.email?.message} {...register("email")} />
          <PasswordField size="lg" icon={null} label="Password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">Sign in</Button>
        </form>

        <p className="mt-5.5 text-sm text-stone-500">Authorized personnel only</p>
      </section>
    </main>
  );
}
