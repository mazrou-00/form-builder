export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "date"
  | "time"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "linear_scale"
  | "star_rating"
  | "matrix"
  | "ranking"
  | "file_upload"
  | "signature"
  | "section_heading"
  | "page_break";

export type ComparisonOp =
  | "equals"
  | "not_equals"
  | "contains"
  | "gt"
  | "lt"
  | "is_empty"
  | "is_not_empty";

export interface VisibilityRule {
  fieldId: string;
  op: ComparisonOp;
  value?: string | number;
}

export interface Choice {
  id: string;
  label: string;
}

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required?: boolean;
  visibleWhen?: VisibilityRule[];
  visibleWhenMode?: "all" | "any";
}

export interface TextField extends BaseField {
  type: "short_text" | "long_text" | "email" | "url" | "phone";
  placeholder?: string;
  maxLength?: number;
}

export interface NumberField extends BaseField {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface DateTimeField extends BaseField {
  type: "date" | "time";
}

export interface ChoiceField extends BaseField {
  type: "dropdown" | "radio" | "checkbox" | "ranking";
  options: Choice[];
  allowOther?: boolean;
}

export interface ScaleField extends BaseField {
  type: "linear_scale" | "star_rating";
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface MatrixField extends BaseField {
  type: "matrix";
  rows: Choice[];
  columns: Choice[];
}

export interface FileField extends BaseField {
  type: "file_upload";
  accept?: string;
}

export interface SignatureField extends BaseField {
  type: "signature";
}

export interface DisplayField extends BaseField {
  type: "section_heading" | "page_break";
}

export type Field =
  | TextField
  | NumberField
  | DateTimeField
  | ChoiceField
  | ScaleField
  | MatrixField
  | FileField
  | SignatureField
  | DisplayField;

export type ButtonShape = "rounded" | "square" | "pill";
export type ThemeMode = "light" | "dark";

export interface FormTheme {
  mode: ThemeMode;
  primaryColor: string; // hex
  backgroundColor?: string; // hex
  fontFamily: string;
  buttonShape: ButtonShape;
  headerImage?: string; // data URL or remote
  headerColor?: string; // hex
}

export type FormStatus = "draft" | "published" | "closed";

export interface Form {
  id: string;
  slug: string;
  title: string;
  description?: string;
  fields: Field[];
  theme: FormTheme;
  status: FormStatus;
  createdAt: number;
  updatedAt: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, unknown>;
  submittedAt: number;
  durationMs?: number;
  fromMock?: boolean;
}

export const DEFAULT_THEME: FormTheme = {
  mode: "light",
  primaryColor: "#465FFF",
  backgroundColor: "#F9FAFB",
  fontFamily: "Inter",
  buttonShape: "rounded",
  headerColor: "#465FFF",
};

export const FONT_FAMILIES = [
  { id: "Inter", label: "Inter (sans-serif)" },
  { id: "Poppins", label: "Poppins (sans-serif)" },
  { id: "Lora", label: "Lora (serif)" },
  { id: "Playfair Display", label: "Playfair (display serif)" },
  { id: "Source Code Pro", label: "Source Code Pro (mono)" },
] as const;
