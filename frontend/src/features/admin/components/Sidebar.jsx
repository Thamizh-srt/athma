import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/components/layout/Logo";
import { FileIcon, GridIcon, HelpIcon, LogoutIcon, PulseIcon, UsersIcon } from "@/components/ui/icons";
import { useAdminAuth } from "../auth/AdminAuthContext";
import Avatar from "./Avatar";

const NAV = [
  { to: "/admin", label: "Overview", icon: GridIcon, end: true },
  { to: "/admin/patients", label: "Patients", icon: UsersIcon },
  { to: "/admin/questions", label: "Questions & Answers", icon: HelpIcon },
  { to: "/admin/reports", label: "Reports", icon: FileIcon },
  { to: "/admin/activity", label: "Activity", icon: PulseIcon },
];

const ACTIVE = "bg-orange-100 font-bold text-orange-700 before:absolute before:inset-y-3 before:-left-5 before:w-1 before:rounded-r before:bg-orange-600";
const IDLE = "font-medium text-neutral-800 hover:bg-orange-50";

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/35 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[280px] flex-col border-r border-peach-line bg-white px-5 pb-5 pt-7 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5.5 px-1.5"><Logo height={46} /></div>
        <p className="mx-1.5 mb-3 text-[13px] text-stone-500">Menu</p>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `relative flex items-center gap-3.5 rounded-[14px] px-4 py-3.5 text-base ${isActive ? ACTIVE : IDLE}`}>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 rounded-[18px] border border-peach-line bg-orange-50 p-3">
          <Avatar name={admin?.name} solid />
          <div className="flex min-w-0 flex-1 flex-col">
            <strong>{admin?.name}</strong>
            <small className="truncate text-stone-500">{admin?.email}</small>
          </div>
          <button type="button" onClick={handleLogout} aria-label="Log out" className="flex cursor-pointer p-1.5 text-neutral-600 hover:text-orange-700">
            <LogoutIcon />
          </button>
        </div>
      </aside>
    </>
  );
}
