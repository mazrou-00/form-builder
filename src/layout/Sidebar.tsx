import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Inbox,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const PRIMARY: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forms", label: "All forms", icon: FileText },
  { to: "/responses", label: "Responses", icon: Inbox },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const SECONDARY: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & docs", icon: HelpCircle },
];

export function Sidebar({ className }: { className?: string }) {
  const formCount = useStore((s) => s.forms.length);
  const responseCount = useStore((s) => s.responses.length);
  const location = useLocation();

  const items: NavItem[] = [
    PRIMARY[0],
    { ...PRIMARY[1], badge: formCount },
    { ...PRIMARY[2], badge: responseCount },
    PRIMARY[3],
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden w-[270px] border-r bg-card lg:flex flex-col",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold">FormCraft</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mock build</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
        <NavLink
          to="/builder/new"
          className="mb-5 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          <PlusCircle className="h-4 w-4" />
          Create new form
        </NavLink>

        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </div>
        <nav className="space-y-0.5">
          {items.map((item) => (
            <NavItemRow key={item.to} item={item} />
          ))}
        </nav>

        <div className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {SECONDARY.map((item) => (
            <NavItemRow key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-6 rounded-xl border bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
          <div className="text-sm font-semibold">Upgrade to Pro</div>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            Unlock conditional branching across pages, response quotas, and CSV exports.
          </p>
          <button className="mt-3 w-full rounded-md bg-white/15 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/25">
            See plans
          </button>
        </div>
      </div>

      <div className="border-t p-4 text-[10px] text-muted-foreground" key={location.pathname}>
        v0.1 · UI mock · localStorage only
      </div>
    </aside>
  );
}

function NavItemRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground group-aria-[current=page]:bg-brand-100 group-aria-[current=page]:text-brand-700 dark:group-aria-[current=page]:bg-brand-500/20 dark:group-aria-[current=page]:text-brand-200">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}
