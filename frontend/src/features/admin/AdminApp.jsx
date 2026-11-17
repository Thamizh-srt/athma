import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageLoader from "@/components/ui/PageLoader";
import { AdminAuthProvider } from "./auth/AdminAuthContext";
import AdminGuard from "./auth/AdminGuard";
import AdminLayout from "./components/AdminLayout";

const AdminLoginPage = lazy(() => import("./auth/AdminLoginPage"));
const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const PatientsPage = lazy(() => import("./pages/PatientsPage"));
const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const QuizDetailPage = lazy(() => import("./pages/QuizDetailPage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));

// Mounted at /admin/* – paths below are relative to /admin.
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="questions" element={<QuizzesPage />} />
              <Route path="questions/:quizId" element={<QuizDetailPage />} />
              <Route path="reports" element={<ComingSoonPage title="Reports" subtitle="Assessment reports and exports" />} />
              <Route path="activity" element={<ComingSoonPage title="Activity" subtitle="Everything happening on the platform" />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}
