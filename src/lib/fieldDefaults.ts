import { nanoid } from "nanoid";
import type { Choice, Field, FieldType } from "@/lib/types";

const id = () => nanoid(8);
const opt = (label: string): Choice => ({ id: id(), label });

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; icon: string; group: "input" | "choice" | "advanced" | "layout" }
> = {
  short_text: { label: "Short text", icon: "Type", group: "input" },
  long_text: { label: "Long text", icon: "AlignLeft", group: "input" },
  email: { label: "Email", icon: "AtSign", group: "input" },
  number: { label: "Number", icon: "Hash", group: "input" },
  phone: { label: "Phone", icon: "Phone", group: "input" },
  url: { label: "URL", icon: "Link", group: "input" },
  date: { label: "Date", icon: "Calendar", group: "input" },
  time: { label: "Time", icon: "Clock", group: "input" },
  dropdown: { label: "Dropdown", icon: "ChevronDown", group: "choice" },
  radio: { label: "Multiple choice", icon: "CircleDot", group: "choice" },
  checkbox: { label: "Checkboxes", icon: "ListChecks", group: "choice" },
  ranking: { label: "Ranking", icon: "ArrowDownUp", group: "choice" },
  linear_scale: { label: "Linear scale", icon: "SlidersHorizontal", group: "advanced" },
  star_rating: { label: "Star rating", icon: "Star", group: "advanced" },
  matrix: { label: "Matrix grid", icon: "Grid3x3", group: "advanced" },
  file_upload: { label: "File upload", icon: "Upload", group: "advanced" },
  signature: { label: "Signature", icon: "PenLine", group: "advanced" },
  section_heading: { label: "Section heading", icon: "Heading", group: "layout" },
  page_break: { label: "Page break", icon: "Minus", group: "layout" },
};

export function makeField(type: FieldType): Field {
  const base = { id: id(), required: false } as const;
  switch (type) {
    case "short_text":
      return { ...base, type, label: "Short answer", placeholder: "Your answer" };
    case "long_text":
      return { ...base, type, label: "Long answer", placeholder: "Your answer" };
    case "email":
      return { ...base, type, label: "Email", placeholder: "you@example.com" };
    case "phone":
      return { ...base, type, label: "Phone", placeholder: "+1 555 555 0000" };
    case "url":
      return { ...base, type, label: "Website", placeholder: "https://" };
    case "number":
      return { ...base, type, label: "Number", placeholder: "0" };
    case "date":
      return { ...base, type, label: "Date" };
    case "time":
      return { ...base, type, label: "Time" };
    case "dropdown":
      return {
        ...base,
        type,
        label: "Choose one",
        options: [opt("Option 1"), opt("Option 2"), opt("Option 3")],
      };
    case "radio":
      return {
        ...base,
        type,
        label: "Pick one",
        options: [opt("Option 1"), opt("Option 2"), opt("Option 3")],
      };
    case "checkbox":
      return {
        ...base,
        type,
        label: "Select all that apply",
        options: [opt("Option 1"), opt("Option 2"), opt("Option 3")],
      };
    case "ranking":
      return {
        ...base,
        type,
        label: "Rank the following",
        options: [opt("Item A"), opt("Item B"), opt("Item C")],
      };
    case "linear_scale":
      return {
        ...base,
        type,
        label: "On a scale of 1–10",
        min: 1,
        max: 10,
        minLabel: "Not at all likely",
        maxLabel: "Extremely likely",
      };
    case "star_rating":
      return { ...base, type, label: "Rate this", min: 1, max: 5 };
    case "matrix":
      return {
        ...base,
        type,
        label: "Rate each",
        rows: [opt("Quality"), opt("Speed"), opt("Support")],
        columns: [opt("Poor"), opt("Fair"), opt("Good"), opt("Excellent")],
      };
    case "file_upload":
      return { ...base, type, label: "Upload a file", accept: "*/*" };
    case "signature":
      return { ...base, type, label: "Signature" };
    case "section_heading":
      return {
        ...base,
        type,
        label: "Section heading",
        description: "Add a description for this section.",
      };
    case "page_break":
      return { ...base, type, label: "Next page" };
  }
}
