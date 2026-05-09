import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Copy,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { FormStatus } from "@/lib/types";

const STATUS_VARIANT: Record<FormStatus, "success" | "secondary" | "warning"> = {
  published: "success",
  draft: "secondary",
  closed: "warning",
};

export function FormsListPage() {
  const forms = useStore((s) => s.forms);
  const responses = useStore((s) => s.responses);
  const createForm = useStore((s) => s.createForm);
  const duplicateForm = useStore((s) => s.duplicateForm);
  const deleteForm = useStore((s) => s.deleteForm);
  const renameForm = useStore((s) => s.renameForm);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FormStatus>("all");
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      const matchesQ = query.trim() === "" || f.title.toLowerCase().includes(query.toLowerCase());
      const matchesS = statusFilter === "all" || f.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [forms, query, statusFilter]);

  const responseCount = (formId: string) => responses.filter((r) => r.formId === formId).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
          <h1 className="text-2xl font-bold">All forms</h1>
          <p className="text-sm text-muted-foreground">
            {forms.length} form{forms.length === 1 ? "" : "s"} · {responses.length} responses captured
          </p>
        </div>
        <Button
          onClick={() => {
            const f = createForm();
            navigate(`/builder/${f.id}`);
          }}
        >
          <Plus className="h-4 w-4" />
          New form
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="h-4 w-4" />
              {statusFilter === "all" ? "All statuses" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["all", "published", "draft", "closed"] as const).map((s) => (
              <DropdownMenuItem key={s} onSelect={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-base font-semibold">No forms match</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or create a new one.</p>
          <Button className="mt-4" onClick={() => {
            const f = createForm();
            navigate(`/builder/${f.id}`);
          }}>
            <Plus className="h-4 w-4" /> Create form
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((f) => {
            const count = responseCount(f.id);
            return (
              <div
                key={f.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="h-1.5 w-full" style={{ background: f.theme.primaryColor }} />
                <div className="flex items-start justify-between p-5">
                  <Link to={`/builder/${f.id}`} className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[f.status]} className="capitalize">{f.status}</Badge>
                      <span className="text-xs text-muted-foreground">{f.fields.length} fields</span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">{f.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {f.description || "No description."}
                    </p>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to={`/builder/${f.id}`}><Pencil className="h-4 w-4" /> Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/forms/${f.id}/responses`}><ExternalLink className="h-4 w-4" /> View responses</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const url = `${location.origin}/f/${f.slug}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Share link copied");
                        }}
                      >
                        <Share2 className="h-4 w-4" /> Copy share link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const c = duplicateForm(f.id);
                        if (c) toast.success("Duplicated");
                      }}>
                        <Copy className="h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRenameTarget({ id: f.id, title: f.title })}>
                        <Pencil className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(f.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-auto flex items-center justify-between border-t px-5 py-3 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{count} response{count === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>Updated {relativeTime(f.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button asChild size="xs" variant="ghost">
                      <Link to={`/f/${f.slug}`} target="_blank"><ExternalLink className="h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename form</DialogTitle>
            <DialogDescription>Choose a new title — visible to your team and respondents.</DialogDescription>
          </DialogHeader>
          {renameTarget && (
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={renameTarget.title}
                onChange={(e) => setRenameTarget({ ...renameTarget, title: e.target.value })}
                autoFocus
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={() => {
              if (renameTarget) {
                renameForm(renameTarget.id, renameTarget.title.trim() || "Untitled form");
                toast.success("Renamed");
                setRenameTarget(null);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this form?</DialogTitle>
            <DialogDescription>
              This will also remove all collected responses. This can't be undone (in this mock, it just clears localStorage for that form).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteTarget) {
                deleteForm(deleteTarget);
                toast.success("Form deleted");
                setDeleteTarget(null);
              }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
