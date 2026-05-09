import type { Field } from "@/lib/types";
import { isFieldVisible } from "@/lib/visibility";

export interface FieldError {
  fieldId: string;
  message: string;
}

const isEmpty = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && v !== null && Object.keys(v as object).length === 0);

export function validateField(
  field: Field,
  answers: Record<string, unknown>
): FieldError | null {
  if (!isFieldVisible(field, answers)) return null;
  if (field.type === "section_heading" || field.type === "page_break") return null;
  const value = answers[field.id];
  if (field.required && isEmpty(value)) {
    return { fieldId: field.id, message: "This field is required" };
  }
  if (!isEmpty(value)) {
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return { fieldId: field.id, message: "Enter a valid email" };
    }
    if (field.type === "url" && !/^https?:\/\//i.test(String(value))) {
      return { fieldId: field.id, message: "URL must start with http:// or https://" };
    }
    if (field.type === "number") {
      const n = Number(value);
      if (Number.isNaN(n)) return { fieldId: field.id, message: "Enter a valid number" };
      if (field.min !== undefined && n < field.min)
        return { fieldId: field.id, message: `Min ${field.min}` };
      if (field.max !== undefined && n > field.max)
        return { fieldId: field.id, message: `Max ${field.max}` };
    }
  }
  return null;
}

export function validatePage(
  fields: Field[],
  answers: Record<string, unknown>
): FieldError[] {
  const errs: FieldError[] = [];
  for (const f of fields) {
    const e = validateField(f, answers);
    if (e) errs.push(e);
  }
  return errs;
}
