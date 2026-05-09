import type { ChoiceField, Field, Form, FormResponse, MatrixField } from "@/lib/types";

function escapeCsv(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function answerDisplay(field: Field, raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  switch (field.type) {
    case "dropdown":
    case "radio": {
      const f = field as ChoiceField;
      return f.options.find((o) => o.id === raw)?.label ?? "";
    }
    case "checkbox":
    case "ranking": {
      const f = field as ChoiceField;
      const ids = (raw as string[]) ?? [];
      return ids.map((id) => f.options.find((o) => o.id === id)?.label ?? id).join(", ");
    }
    case "matrix": {
      const f = field as MatrixField;
      const map = (raw as Record<string, string>) ?? {};
      return f.rows
        .map((r) => `${r.label}: ${f.columns.find((c) => c.id === map[r.id])?.label ?? "—"}`)
        .join(" | ");
    }
    default:
      if (typeof raw === "string") return raw;
      if (typeof raw === "number") return String(raw);
      return JSON.stringify(raw);
  }
}

export function responsesToCsv(form: Form, responses: FormResponse[]): string {
  const cols = form.fields.filter((f) => f.type !== "section_heading" && f.type !== "page_break");
  const header = ["#", "Submitted at", ...cols.map((c) => c.label || `(${c.type})`)];
  const rows = responses.map((r, i) => [
    String(i + 1),
    new Date(r.submittedAt).toISOString(),
    ...cols.map((c) => answerDisplay(c, r.answers[c.id])),
  ]);
  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
