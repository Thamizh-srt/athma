import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { MenuIcon } from "@/components/ui/icons";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-peach text-neutral-900 lg:grid lg:grid-cols-[290px_1fr]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="m-4 mb-0 inline-flex cursor-pointer rounded-[10px] border border-peach-line bg-white p-2 lg:hidden">
          <MenuIcon />
        </button>
        <main className="mx-auto max-w-[1560px] px-4 pb-12 pt-5 lg:px-12 lg:pb-16 lg:pt-11">
          <Suspense fallback={<div className="px-4 py-12 text-center text-stone-500">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
