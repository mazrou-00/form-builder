import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useStore, selectFormBySlug } from "@/lib/store";
import { isFieldVisible, splitPages } from "@/lib/visibility";
import { validatePage, type FieldError } from "@/lib/validation";
import { FieldInput } from "@/features/filler/FieldInput";
import type { Field } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FillerPage({ previewById }: { previewById?: boolean }) {
  const params = useParams();
  const slug = previewById ? undefined : params.slug;
  const id = previewById ? params.id : undefined;
  const formBySlug = useStore(selectFormBySlug(slug));
  const formById = useStore((s) => (id ? s.forms.find((f) => f.id === id) : undefined));
  const form = formBySlug ?? formById;

  const navigate = useNavigate();
  const submitResponse = useStore((s) => s.submitResponse);

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageIdx, setPageIdx] = useState(0);
  const [startedAt] = useState(() => Date.now());

  const pages = useMemo(() => splitPages(form?.fields ?? []), [form]);
  const visibleFields = useMemo(
    () => (pages[pageIdx] ?? []).filter((f) => isFieldVisible(f, answers)),
    [pages, pageIdx, answers]
  );
  const progress = pages.length === 0 ? 0 : Math.round(((pageIdx + 1) / pages.length) * 100);

  // Drop answers belonging to fields that are no longer visible
  useEffect(() => {
    if (!form) return;
    const visibleIds = new Set(form.fields.filter((f) => isFieldVisible(f, answers)).map((f) => f.id));
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const k of Object.keys(answers)) {
      if (visibleIds.has(k)) next[k] = answers[k];
      else changed = true;
    }
    if (changed) setAnswers(next);
    // intentionally not depending on `answers` to avoid loops; visibility is recomputed on every change anyway
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.fields]);

  if (!form) {
    return <FillerShell><Notice title="Form not found" body="This link may be invalid or the form may have been deleted." /></FillerShell>;
  }
  if (form.status === "closed") {
    return (
      <FillerShell theme={form.theme}>
        <Notice
          title={form.title}
          body="This form is no longer accepting responses."
          icon={<Lock className="h-6 w-6" />}
          theme={form.theme}
        />
      </FillerShell>
    );
  }

  function update(fieldId: string, v: unknown) {
    setAnswers((a) => ({ ...a, [fieldId]: v }));
    setErrors((e) => {
      const { [fieldId]: _drop, ...rest } = e;
      return rest;
    });
  }

  function next() {
    const errs = validatePage(visibleFields, answers);
    if (errs.length > 0) {
      setErrors(toErrorMap(errs));
      return;
    }
    setPageIdx((i) => Math.min(pages.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setPageIdx((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!form) return;
    const allVisible = form.fields.filter((f) => isFieldVisible(f, answers));
    const errs = validatePage(allVisible, answers);
    if (errs.length > 0) {
      setErrors(toErrorMap(errs));
      // jump to first page with error
      for (let p = 0; p < pages.length; p++) {
        if (pages[p].some((f) => errs.find((e) => e.fieldId === f.id))) {
          setPageIdx(p);
          break;
        }
      }
      return;
    }
    const r = submitResponse(form.id, answers, Date.now() - startedAt);
    navigate(`/thanks/${form.id}/${r.id}`);
  }

  const isLast = pageIdx === pages.length - 1;
  const noFields = pages.length === 0;

  return (
    <FillerShell theme={form.theme}>
      <div className="mx-auto w-full max-w-2xl">
        {pages.length > 1 && (
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {pageIdx + 1} of {pages.length}</span>
            <span>{progress}%</span>
          </div>
        )}
        {pages.length > 1 && (
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: form.theme.primaryColor }} />
          </div>
        )}

        <header
          className="overflow-hidden rounded-2xl border-t-8 bg-card shadow-sm"
          style={{ borderTopColor: form.theme.headerColor || form.theme.primaryColor }}
        >
          {form.theme.headerImage && (
            <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${form.theme.headerImage})` }} />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>}
          </div>
        </header>

        {noFields ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
            This form doesn't have any fields yet.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {visibleFields.map((field) => (
              <FieldInput
                key={field.id}
                field={field as Field}
                value={answers[field.id]}
                onChange={(v) => update(field.id, v)}
                error={errors[field.id]}
                primaryColor={form.theme.primaryColor}
                buttonShape={form.theme.buttonShape}
              />
            ))}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={back}
                disabled={pageIdx === 0}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition disabled:opacity-40",
                  "rounded-md border bg-background hover:bg-muted"
                )}
                style={{ borderRadius: btnRadius(form.theme.buttonShape) }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white shadow"
                  style={{ background: form.theme.primaryColor, borderRadius: btnRadius(form.theme.buttonShape) }}
                >
                  Submit <CheckCircle2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white shadow"
                  style={{ background: form.theme.primaryColor, borderRadius: btnRadius(form.theme.buttonShape) }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="pt-4 text-center text-[11px] text-muted-foreground">
              Powered by FormCraft · <Link to="/" className="hover:text-foreground">create your own</Link>
            </p>
          </div>
        )}
      </div>
    </FillerShell>
  );
}

function btnRadius(shape: "rounded" | "square" | "pill") {
  return shape === "pill" ? 9999 : shape === "square" ? 4 : 8;
}

function toErrorMap(errs: FieldError[]) {
  const out: Record<string, string> = {};
  for (const e of errs) out[e.fieldId] = e.message;
  return out;
}

export function FillerShell({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: { mode: "light" | "dark"; backgroundColor?: string; fontFamily: string };
}) {
  const isDark = theme?.mode === "dark";
  return (
    <div
      className={cn("min-h-screen px-4 py-10", isDark && "dark")}
      style={{
        background: theme?.backgroundColor ?? (isDark ? "#0F172A" : "#F8FAFC"),
        fontFamily: theme?.fontFamily ?? "Inter",
      }}
    >
      {children}
    </div>
  );
}

function Notice({
  title,
  body,
  icon,
  theme,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
  theme?: { primaryColor: string; headerColor?: string };
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
      {icon && (
        <div
          className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-white"
          style={{ background: theme?.primaryColor ?? "#475569" }}
        >
          {icon}
        </div>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
        Go to dashboard
      </Link>
    </div>
  );
}
