import * as Icons from "lucide-react";
import { Star } from "lucide-react";
import type { Field } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELD_TYPE_META } from "@/lib/fieldDefaults";
import { cn } from "@/lib/utils";

export function FieldPreview({ field }: { field: Field }) {
  if (field.type === "section_heading") {
    return (
      <div>
        <h3 className="text-lg font-bold">{field.label || "Section heading"}</h3>
        {field.description && <p className="text-sm text-muted-foreground mt-1">{field.description}</p>}
      </div>
    );
  }
  if (field.type === "page_break") {
    return (
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span className="rounded-full border bg-card px-3 py-1">Page break · {field.label || "Next page"}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const meta = FIELD_TYPE_META[field.type];
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[meta.icon] ?? Icons.Square;

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {meta.label}
        </span>
        {field.required && <span className="text-[10px] font-semibold text-destructive">REQUIRED</span>}
      </div>
      <Label className="text-sm font-semibold">
        {field.label || "Untitled question"}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {field.description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
      )}
      <div className="mt-2.5 pointer-events-none opacity-90">
        <RenderInput field={field} />
      </div>
    </div>
  );
}

function RenderInput({ field }: { field: Field }) {
  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return <Input placeholder={field.placeholder ?? ""} />;
    case "long_text":
      return <Textarea placeholder={field.placeholder ?? ""} rows={3} />;
    case "number":
      return <Input type="number" placeholder={field.placeholder ?? ""} />;
    case "date":
      return <Input type="date" />;
    case "time":
      return <Input type="time" />;
    case "dropdown":
      return (
        <Select>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "radio":
      return (
        <RadioGroup>
          {field.options.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <RadioGroupItem value={o.id} id={`p-${o.id}`} />
              <Label htmlFor={`p-${o.id}`} className="font-normal">{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "checkbox":
      return (
        <div className="space-y-2">
          {field.options.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <Checkbox id={`p-${o.id}`} />
              <Label htmlFor={`p-${o.id}`} className="font-normal">{o.label}</Label>
            </div>
          ))}
        </div>
      );
    case "ranking":
      return (
        <ol className="space-y-1.5 text-sm">
          {field.options.map((o, i) => (
            <li key={o.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <span className="grid h-5 w-5 place-items-center rounded bg-card text-xs font-semibold">{i + 1}</span>
              <span>{o.label}</span>
              <Icons.GripVertical className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </li>
          ))}
        </ol>
      );
    case "linear_scale":
      return (
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{field.minLabel ?? field.min}</span>
            <span>{field.maxLabel ?? field.max}</span>
          </div>
          <div className="flex items-center justify-between">
            {Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i).map((n) => (
              <button
                key={n}
                type="button"
                className="grid h-9 w-9 place-items-center rounded-full border text-sm hover:border-brand-400 hover:text-brand-600"
              >
                {n}
              </button>
            ))}
          </div>
          <Slider className="mt-3" min={field.min} max={field.max} step={1} defaultValue={[Math.floor((field.min + field.max) / 2)]} />
        </div>
      );
    case "star_rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: field.max }, (_, i) => (
            <Star key={i} className={cn("h-6 w-6", i < 3 ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          ))}
        </div>
      );
    case "matrix":
      return (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th className="px-3 py-2 text-left font-medium"></th>
                {field.columns.map((c) => (
                  <th key={c.id} className="px-2 py-2 text-center font-medium">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {field.rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.label}</td>
                  {field.columns.map((c) => (
                    <td key={c.id} className="px-2 py-2 text-center">
                      <input type="radio" name={`m-${r.id}`} className="h-3.5 w-3.5" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "file_upload":
      return (
        <div className="rounded-md border-2 border-dashed bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
          <Icons.UploadCloud className="mx-auto mb-1 h-5 w-5" />
          Drop file or click to upload
        </div>
      );
    case "signature":
      return (
        <div className="rounded-md border bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
          <Icons.PenLine className="mx-auto mb-1 h-5 w-5" />
          Sign with mouse / finger
        </div>
      );
    default:
      return null;
  }
}
