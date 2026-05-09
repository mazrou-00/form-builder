import { useMemo } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChoiceField, ComparisonOp, Field, Form, MatrixField, ScaleField, VisibilityRule } from "@/lib/types";
import { FIELD_TYPE_META } from "@/lib/fieldDefaults";

interface Props {
  form: Form;
  field: Field | null;
  onChange: (field: Field) => void;
}

const OPS: { id: ComparisonOp; label: string; needsValue: boolean }[] = [
  { id: "equals", label: "equals", needsValue: true },
  { id: "not_equals", label: "does not equal", needsValue: true },
  { id: "contains", label: "contains", needsValue: true },
  { id: "gt", label: "is greater than", needsValue: true },
  { id: "lt", label: "is less than", needsValue: true },
  { id: "is_empty", label: "is empty", needsValue: false },
  { id: "is_not_empty", label: "is not empty", needsValue: false },
];

export function PropertiesPanel({ form, field, onChange }: Props) {
  if (!field) {
    return (
      <aside className="hidden border-l bg-card xl:flex xl:w-80 xl:flex-col">
        <div className="border-b px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Properties
          </div>
        </div>
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <div className="text-sm font-medium">No field selected</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Click a field in the canvas to edit its label, options, and visibility rules.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden border-l bg-card xl:flex xl:w-80 xl:flex-col">
      <div className="border-b px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Properties
        </div>
        <div className="mt-1 text-xs font-medium">{FIELD_TYPE_META[field.type].label}</div>
      </div>
      <Tabs defaultValue="field" className="flex flex-1 flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="field" className="flex-1">Field</TabsTrigger>
            <TabsTrigger value="logic" className="flex-1">Visibility</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="field" className="flex-1 overflow-y-auto px-4 pb-6 pt-3 scrollbar-thin">
          <FieldEditor field={field} onChange={onChange} />
        </TabsContent>
        <TabsContent value="logic" className="flex-1 overflow-y-auto px-4 pb-6 pt-3 scrollbar-thin">
          <LogicEditor form={form} field={field} onChange={onChange} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function FieldEditor({ field, onChange }: { field: Field; onChange: (f: Field) => void }) {
  const update = (patch: Partial<Field>) => onChange({ ...field, ...patch } as Field);

  if (field.type === "page_break") {
    return (
      <div className="space-y-4">
        <div>
          <Label>Next button label</Label>
          <Input
            className="mt-1.5"
            value={field.label}
            placeholder="Continue"
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (field.type === "section_heading") {
    return (
      <div className="space-y-4">
        <div>
          <Label>Heading</Label>
          <Input
            className="mt-1.5"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            className="mt-1.5"
            rows={3}
            value={field.description ?? ""}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Label</Label>
        <Input
          className="mt-1.5"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          className="mt-1.5"
          rows={2}
          value={field.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Helper text shown to respondents"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div>
          <Label>Required</Label>
          <p className="text-xs text-muted-foreground">Filler can't submit without an answer.</p>
        </div>
        <Switch
          checked={!!field.required}
          onCheckedChange={(v) => update({ required: v })}
        />
      </div>

      {("placeholder" in field) && (
        <div>
          <Label>Placeholder</Label>
          <Input
            className="mt-1.5"
            value={field.placeholder ?? ""}
            onChange={(e) => update({ placeholder: e.target.value } as Partial<Field>)}
          />
        </div>
      )}

      {field.type === "number" && (
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Min</Label><Input type="number" className="mt-1.5" value={field.min ?? ""} onChange={(e) => update({ min: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
          <div><Label>Max</Label><Input type="number" className="mt-1.5" value={field.max ?? ""} onChange={(e) => update({ max: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
          <div><Label>Step</Label><Input type="number" className="mt-1.5" value={field.step ?? ""} onChange={(e) => update({ step: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
        </div>
      )}

      {(field.type === "dropdown" || field.type === "radio" || field.type === "checkbox" || field.type === "ranking") && (
        <ChoicesEditor field={field as ChoiceField} onChange={onChange} />
      )}

      {(field.type === "linear_scale" || field.type === "star_rating") && (
        <ScaleEditor field={field as ScaleField} onChange={onChange} />
      )}

      {field.type === "matrix" && <MatrixEditor field={field as MatrixField} onChange={onChange} />}
    </div>
  );
}

function ChoicesEditor({ field, onChange }: { field: ChoiceField; onChange: (f: Field) => void }) {
  return (
    <div>
      <Label>Options</Label>
      <div className="mt-1.5 space-y-1.5">
        {field.options.map((o, i) => (
          <div key={o.id} className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded bg-muted text-[10px] font-medium text-muted-foreground">{i + 1}</span>
            <Input
              value={o.label}
              onChange={(e) => onChange({
                ...field,
                options: field.options.map((x) => x.id === o.id ? { ...x, label: e.target.value } : x),
              })}
              className="h-8"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={field.options.length <= 1}
              onClick={() => onChange({ ...field, options: field.options.filter((x) => x.id !== o.id) })}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={() => onChange({ ...field, options: [...field.options, { id: nanoid(8), label: `Option ${field.options.length + 1}` }] })}
      >
        <Plus className="h-3.5 w-3.5" /> Add option
      </Button>
    </div>
  );
}

function ScaleEditor({ field, onChange }: { field: ScaleField; onChange: (f: Field) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Min</Label><Input type="number" className="mt-1.5" value={field.min} onChange={(e) => onChange({ ...field, min: Number(e.target.value) })} /></div>
        <div><Label>Max</Label><Input type="number" className="mt-1.5" value={field.max} onChange={(e) => onChange({ ...field, max: Number(e.target.value) })} /></div>
      </div>
      {field.type === "linear_scale" && (
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Min label</Label><Input className="mt-1.5" value={field.minLabel ?? ""} onChange={(e) => onChange({ ...field, minLabel: e.target.value })} /></div>
          <div><Label>Max label</Label><Input className="mt-1.5" value={field.maxLabel ?? ""} onChange={(e) => onChange({ ...field, maxLabel: e.target.value })} /></div>
        </div>
      )}
    </>
  );
}

function MatrixEditor({ field, onChange }: { field: MatrixField; onChange: (f: Field) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Rows</Label>
        <div className="mt-1.5 space-y-1.5">
          {field.rows.map((r) => (
            <div key={r.id} className="flex items-center gap-1.5">
              <Input
                className="h-8"
                value={r.label}
                onChange={(e) => onChange({ ...field, rows: field.rows.map((x) => x.id === r.id ? { ...x, label: e.target.value } : x) })}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onChange({ ...field, rows: field.rows.filter((x) => x.id !== r.id) })}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => onChange({ ...field, rows: [...field.rows, { id: nanoid(8), label: `Row ${field.rows.length + 1}` }] })}>
          <Plus className="h-3.5 w-3.5" /> Add row
        </Button>
      </div>
      <div>
        <Label>Columns</Label>
        <div className="mt-1.5 space-y-1.5">
          {field.columns.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <Input
                className="h-8"
                value={c.label}
                onChange={(e) => onChange({ ...field, columns: field.columns.map((x) => x.id === c.id ? { ...x, label: e.target.value } : x) })}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onChange({ ...field, columns: field.columns.filter((x) => x.id !== c.id) })}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => onChange({ ...field, columns: [...field.columns, { id: nanoid(8), label: `Col ${field.columns.length + 1}` }] })}>
          <Plus className="h-3.5 w-3.5" /> Add column
        </Button>
      </div>
    </div>
  );
}

function LogicEditor({ form, field, onChange }: { form: Form; field: Field; onChange: (f: Field) => void }) {
  const eligibleFields = useMemo(
    () => form.fields.filter((f) => f.id !== field.id && f.type !== "section_heading" && f.type !== "page_break"),
    [form.fields, field.id]
  );
  const rules = field.visibleWhen ?? [];
  const mode = field.visibleWhenMode ?? "all";

  function update(rs: VisibilityRule[]) {
    onChange({ ...field, visibleWhen: rs });
  }

  function ruleValueOptions(r: VisibilityRule) {
    const f = form.fields.find((x) => x.id === r.fieldId);
    if (!f) return null;
    if (f.type === "dropdown" || f.type === "radio" || f.type === "checkbox") {
      return (f as ChoiceField).options;
    }
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        Show this field only when other answers match — useful for branching surveys.
      </div>

      {rules.length > 1 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Match</Label>
          <Select value={mode} onValueChange={(v) => onChange({ ...field, visibleWhenMode: v as "all" | "any" })}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules</SelectItem>
              <SelectItem value="any">Any rule</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-card/50 px-3 py-6 text-center text-xs text-muted-foreground">
          No rules — this field is always visible.
        </div>
      ) : (
        rules.map((r, i) => {
          const op = OPS.find((o) => o.id === r.op)!;
          const choices = ruleValueOptions(r);
          return (
            <div key={i} className="space-y-1.5 rounded-lg border bg-background p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rule {i + 1}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => update(rules.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Select value={r.fieldId} onValueChange={(v) => update(rules.map((x, j) => j === i ? { ...x, fieldId: v, value: undefined } : x))}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  {eligibleFields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.label || "(untitled)"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={r.op} onValueChange={(v) => update(rules.map((x, j) => j === i ? { ...x, op: v as ComparisonOp } : x))}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {op.needsValue && (
                choices ? (
                  <Select value={String(r.value ?? "")} onValueChange={(v) => update(rules.map((x, j) => j === i ? { ...x, value: v } : x))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Value" /></SelectTrigger>
                    <SelectContent>
                      {choices.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-8"
                    placeholder="Value"
                    value={String(r.value ?? "")}
                    onChange={(e) => update(rules.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  />
                )
              )}
            </div>
          );
        })
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={eligibleFields.length === 0}
        onClick={() => update([...rules, { fieldId: eligibleFields[0]?.id ?? "", op: "equals", value: "" }])}
      >
        <Plus className="h-3.5 w-3.5" /> Add rule
      </Button>
      {eligibleFields.length === 0 && (
        <p className="text-xs text-muted-foreground">Add another field first to reference it from a rule.</p>
      )}
    </div>
  );
}
