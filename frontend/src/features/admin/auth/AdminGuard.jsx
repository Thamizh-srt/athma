import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminGuard() {
  const { admin } = useAdminAuth();
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
