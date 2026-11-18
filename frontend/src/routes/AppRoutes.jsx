import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/ui/PageLoader";

const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AssessmentPage = lazy(() => import("@/features/assessments/pages/AssessmentPage"));
// The whole admin module is one lazy chunk: patients never download it.
const AdminApp = lazy(() => import("@/features/admin/AdminApp"));

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/questions" replace /> : <Outlet />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/questions" element={<DashboardPage />} />
          <Route path="/assessments/:categoryId" element={<AssessmentPage />} />
        </Route>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
