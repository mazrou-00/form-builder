import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { FillerShell } from "@/features/filler/FillerPage";

export function ThanksPage() {
  const { formId } = useParams();
  const form = useStore((s) => s.forms.find((f) => f.id === formId));

  return (
    <FillerShell theme={form?.theme}>
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div
          className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full text-white"
          style={{ background: form?.theme.primaryColor ?? "#10B981" }}
        >
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold">Thanks for your response!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {form
            ? `Your answers to “${form.title}” have been recorded.`
            : "Your response has been recorded."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {form && (
            <Link
              to={`/f/${form.slug}`}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Submit another response
            </Link>
          )}
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Go to dashboard
          </Link>
        </div>
      </div>
    </FillerShell>
  );
}
