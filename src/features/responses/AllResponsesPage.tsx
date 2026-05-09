import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Filter, Search, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { formatDateTime, relativeTime } from "@/lib/utils";
import { answerDisplay } from "@/lib/csv";

export function AllResponsesPage() {
  const forms = useStore((s) => s.forms);
  const responses = useStore((s) => s.responses);

  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState<string | "all">("all");

  const formMap = useMemo(() => {
    const m = new Map(forms.map((f) => [f.id, f]));
    return m;
  }, [forms]);

  const filtered = useMemo(() => {
    return responses.filter((r) => {
      if (formFilter !== "all" && r.formId !== formFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const f = formMap.get(r.formId);
      if (!f) return false;
      return f.fields.some((field) => answerDisplay(field, r.answers[field.id]).toLowerCase().includes(q));
    });
  }, [responses, formFilter, query, formMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inbox</div>
          <h1 className="text-2xl font-bold">All responses</h1>
          <p className="text-sm text-muted-foreground">
            {responses.length} total · {forms.length} forms
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="h-4 w-4" />
              {formFilter === "all" ? "All forms" : formMap.get(formFilter)?.title ?? "—"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-72 overflow-y-auto">
            <DropdownMenuLabel>Filter by form</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setFormFilter("all")}>All forms</DropdownMenuItem>
            {forms.map((f) => (
              <DropdownMenuItem key={f.id} onSelect={() => setFormFilter(f.id)}>
                <span className="h-2 w-2 rounded-full" style={{ background: f.theme.primaryColor }} />
                {f.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Badge variant="secondary">{filtered.length} shown</Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-base font-semibold">Nothing here yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Adjust filters or share a form to start collecting.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Form</th>
                <th className="px-5 py-3 text-left font-medium">Preview</th>
                <th className="px-5 py-3 text-left font-medium">Submitted</th>
                <th className="px-5 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((r) => {
                const f = formMap.get(r.formId);
                if (!f) return null;
                const firstField = f.fields.find(
                  (x) => x.type !== "section_heading" && x.type !== "page_break" && r.answers[x.id]
                );
                const preview = firstField ? answerDisplay(firstField, r.answers[firstField.id]) : "—";
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: f.theme.primaryColor }} />
                        <span className="font-medium">{f.title}</span>
                      </div>
                    </td>
                    <td className="max-w-md px-5 py-3 text-muted-foreground">
                      <div className="line-clamp-1">{preview}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div>{formatDateTime(r.submittedAt)}</div>
                      <div className="text-[11px] text-muted-foreground">{relativeTime(r.submittedAt)}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button asChild size="xs" variant="ghost">
                        <Link to={`/forms/${f.id}/responses`}>Open <ArrowRight className="h-3.5 w-3.5" /></Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
