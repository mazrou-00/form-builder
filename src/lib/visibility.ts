import type { Field, VisibilityRule } from "@/lib/types";

export function evaluateRule(
  rule: VisibilityRule,
  answers: Record<string, unknown>
): boolean {
  const v = answers[rule.fieldId];
  switch (rule.op) {
    case "is_empty":
      return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    case "is_not_empty":
      return !(v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0));
    case "equals":
      if (Array.isArray(v)) return v.includes(rule.value as never);
      return String(v ?? "") === String(rule.value ?? "");
    case "not_equals":
      if (Array.isArray(v)) return !v.includes(rule.value as never);
      return String(v ?? "") !== String(rule.value ?? "");
    case "contains":
      if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(String(rule.value ?? "").toLowerCase()));
      return String(v ?? "").toLowerCase().includes(String(rule.value ?? "").toLowerCase());
    case "gt":
      return Number(v) > Number(rule.value);
    case "lt":
      return Number(v) < Number(rule.value);
  }
}

export function isFieldVisible(
  field: Field,
  answers: Record<string, unknown>
): boolean {
  const rules = field.visibleWhen ?? [];
  if (rules.length === 0) return true;
  const mode = field.visibleWhenMode ?? "all";
  return mode === "all"
    ? rules.every((r) => evaluateRule(r, answers))
    : rules.some((r) => evaluateRule(r, answers));
}

export function splitPages(fields: Field[]): Field[][] {
  const pages: Field[][] = [[]];
  for (const f of fields) {
    if (f.type === "page_break") {
      pages.push([]);
    } else {
      pages[pages.length - 1].push(f);
    }
  }
  return pages.filter((p) => p.length > 0);
}
