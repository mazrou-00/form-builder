import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: number; // positive = up
  deltaLabel?: string;
  iconClassName?: string;
}

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, iconClassName }: StatCardProps) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl bg-muted", iconClassName)}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}
          >
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold leading-tight">{value}</div>
      {deltaLabel && (
        <div className="mt-1 text-xs text-muted-foreground">{deltaLabel}</div>
      )}
    </div>
  );
}
