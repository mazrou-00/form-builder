import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, FileText, Inbox, MousePointerClick, Timer } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";

export function DashboardPage() {
  const forms = useStore((s) => s.forms);
  const responses = useStore((s) => s.responses);

  const stats = useMemo(() => {
    const total = responses.length;
    const last30 = responses.filter((r) => r.submittedAt > Date.now() - 30 * 86400000).length;
    const prev30 = responses.filter(
      (r) =>
        r.submittedAt > Date.now() - 60 * 86400000 &&
        r.submittedAt <= Date.now() - 30 * 86400000
    ).length;
    const avgTime =
      responses.length === 0
        ? 0
        : Math.round(
            responses.reduce((s, r) => s + (r.durationMs ?? 0), 0) / responses.length / 1000
          );
    const completionRate = forms.length === 0 ? 0 : Math.round((last30 / Math.max(1, forms.length * 30)) * 100);
    const delta = prev30 === 0 ? 100 : ((last30 - prev30) / prev30) * 100;
    return { total, last30, avgTime, completionRate, delta };
  }, [responses, forms.length]);

  const series = useMemo(() => {
    const days: { date: string; ts: number; responses: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        ts: d.getTime(),
        responses: 0,
      });
    }
    for (const r of responses) {
      const d = new Date(r.submittedAt);
      d.setHours(0, 0, 0, 0);
      const ts = d.getTime();
      const day = days.find((x) => x.ts === ts);
      if (day) day.responses += 1;
    }
    return days;
  }, [responses]);

  const byForm = useMemo(() => {
    return forms
      .map((f) => ({
        id: f.id,
        title: f.title,
        responses: responses.filter((r) => r.formId === f.id).length,
        color: f.theme.primaryColor,
      }))
      .sort((a, b) => b.responses - a.responses);
  }, [forms, responses]);

  const fieldUsage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of forms) for (const fld of f.fields) counts.set(fld.type, (counts.get(fld.type) ?? 0) + 1);
    return [...counts.entries()]
      .map(([type, count]) => ({ type: type.replace(/_/g, " "), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [forms]);

  const recent = responses.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </div>
          <h1 className="text-2xl font-bold">Welcome back, Mohammad</h1>
          <p className="text-sm text-muted-foreground">
            Here's what's been happening across your forms in the last 30 days.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/forms">All forms</Link>
          </Button>
          <Button asChild>
            <Link to="/builder/new">Create form</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total responses"
          value={stats.total.toLocaleString()}
          icon={Inbox}
          delta={stats.delta}
          deltaLabel="vs previous 30 days"
          iconClassName="bg-brand-100 text-brand-700 dark:bg-brand-500/15"
        />
        <StatCard
          label="Active forms"
          value={forms.filter((f) => f.status === "published").length}
          icon={FileText}
          deltaLabel={`${forms.length} total`}
          iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15"
        />
        <StatCard
          label="Last 30 days"
          value={stats.last30.toLocaleString()}
          icon={MousePointerClick}
          delta={stats.delta}
          deltaLabel="vs previous period"
          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-500/15"
        />
        <StatCard
          label="Avg completion time"
          value={`${Math.floor(stats.avgTime / 60)}m ${stats.avgTime % 60}s`}
          icon={Timer}
          deltaLabel="across all responses"
          iconClassName="bg-rose-100 text-rose-700 dark:bg-rose-500/15"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Responses over time
              </div>
              <h2 className="text-base font-semibold">Last 30 days</h2>
            </div>
            <Badge variant="secondary">Daily</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#465FFF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#465FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="responses" stroke="#465FFF" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Responses by form
          </div>
          <h2 className="text-base font-semibold">Distribution</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byForm} dataKey="responses" nameKey="title" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {byForm.map((b) => (
                    <Cell key={b.id} fill={b.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2">
            {byForm.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                <span className="flex-1 truncate text-muted-foreground">{b.title}</span>
                <span className="font-semibold tabular-nums">{b.responses}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-card shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent activity
              </div>
              <h2 className="text-base font-semibold">Latest responses</h2>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/responses">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-5 py-3 text-left font-medium">Form</th>
                  <th className="px-5 py-3 text-left font-medium">Submitted</th>
                  <th className="px-5 py-3 text-left font-medium">Time taken</th>
                  <th className="px-5 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No responses yet.</td></tr>
                ) : recent.map((r) => {
                  const f = forms.find((x) => x.id === r.formId);
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: f?.theme.primaryColor }} />
                          <span className="font-medium">{f?.title ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{relativeTime(r.submittedAt)}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.durationMs ? `${Math.round(r.durationMs / 1000)}s` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {f && (
                          <Button asChild size="xs" variant="ghost">
                            <Link to={`/forms/${f.id}/responses`}>Open</Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Field types in use
          </div>
          <h2 className="text-base font-semibold">Most used</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={fieldUsage} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" radius={[4, 4, 4, 4]} fill="#465FFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
