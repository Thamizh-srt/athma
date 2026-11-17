import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <main className="grid min-h-screen place-content-center justify-items-center gap-3 text-center">
      <h1 className="text-2xl font-bold text-navy">Welcome{user?.full_name ? `, ${user.full_name}` : ""}</h1>
      <p className="text-muted">Your care journey starts here (steps 2–4 coming next).</p>
      <Button onClick={logout} className="max-w-[200px]">Log out</Button>
    </main>
  );
}
