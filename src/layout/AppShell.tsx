import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layout/Sidebar";
import { Topbar } from "@/layout/Topbar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <div className="lg:pl-[270px]">
        <Topbar />
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
