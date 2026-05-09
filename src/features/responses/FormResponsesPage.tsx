import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Download, Inbox, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore, selectForm, selectResponses } from "@/lib/store";
import { answerDisplay, downloadCsv, responsesToCsv } from "@/lib/csv";
import { formatDateTime, relativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Field } from "@/lib/types";

export function FormResponsesPage() {
  const { id } = useParams();
  const form = useStore(selectForm(id));
  const responses = useStore(selectResponses(id));
  const deleteResponse = useStore((s) => s.deleteResponse);

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const cols = useMemo(
    () => form?.fields.filter((f) => f.type !== "section_heading" && f.type !== "page_break") ?? [],
    [form]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return responses;
    const q = query.toLowerCase();
    return responses.filter((r) =>
      cols.some((c) => answerDisplay(c, r.answers[c.id]).toLowerCase().includes(q))
    );
  }, [responses, cols, query]);

  if (!form) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <div>
          <h2 className="text-lg font-semibold">Form not found</h2>
          <Button asChild className="mt-4"><Link to="/forms">Back to forms</Link></Button>
        </div>
      </div>
    );
  }

  const opened = openId ? responses.find((r) => r.id === openId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Button asChild size="sm" variant="ghost" className="-ml-2 mb-1 text-muted-foreground">
            <Link to="/forms"><ChevronLeft className="h-3.5 w-3.5" /> All forms</Link>
          </Button>
          <h1 className="text-2xl font-bold">{form.title} — responses</h1>
          <p className="text-sm text-muted-foreground">
            {responses.length} response{responses.length === 1 ? "" : "s"} captured · {cols.length} fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/f/${form.slug}`} target="_blank">View public form</Link>
          </Button>
          <Button
            onClick={() => {
              downloadCsv(`${form.slug}.csv`, responsesToCsv(form, responses));
              toast.success("CSV downloaded");
            }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <Badge variant="secondary">{filtered.length} shown</Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-base font-semibold">No responses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Share the form to start collecting — submissions appear here in real time.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs">
                <tr>
                  <th className="sticky left-0 bg-muted/60 px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Submitted</th>
                  {cols.map((c) => (
                    <th key={c.id} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      {c.label || `(${c.type})`}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-t hover:bg-muted/40"
                    onClick={() => setOpenId(r.id)}
                  >
                    <td className="sticky left-0 bg-card px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{formatDateTime(r.submittedAt)}</div>
                      <div className="text-[11px] text-muted-foreground">{relativeTime(r.submittedAt)}</div>
                    </td>
                    {cols.map((c) => (
                      <td key={c.id} className="max-w-[260px] px-4 py-3">
                        <div className="line-clamp-2 break-words">
                          {answerDisplay(c, r.answers[c.id]) || <span className="text-muted-foreground">—</span>}
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteResponse(r.id); toast.success("Response deleted"); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response details</DialogTitle>
          </DialogHeader>
          {opened && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Submitted {formatDateTime(opened.submittedAt)}</span>
                <span>{opened.durationMs ? `${Math.round(opened.durationMs / 1000)}s to complete` : "—"}</span>
              </div>
              <ul className="space-y-3">
                {cols.map((c) => (
                  <li key={c.id} className="rounded-lg border p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.label || `(${c.type})`}
                    </div>
                    <div className="mt-1 text-sm">
                      {opened.answers[c.id] === undefined ? (
                        <span className="text-muted-foreground">Not answered</span>
                      ) : c.type === "signature" ? (
                        <span className="text-xs text-muted-foreground">[signature captured]</span>
                      ) : (
                        <RichAnswer field={c} value={opened.answers[c.id]} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RichAnswer({ field, value }: { field: Field; value: unknown }) {
  if (field.type === "long_text") {
    return <div className="whitespace-pre-wrap break-words">{String(value)}</div>;
  }
  return <div className="break-words">{answerDisplay(field, value)}</div>;
}
