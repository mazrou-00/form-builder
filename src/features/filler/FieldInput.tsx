import { useEffect, useRef, useState } from "react";
import { GripVertical, Star, UploadCloud } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChoiceField, Field, MatrixField, ScaleField } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  primaryColor: string;
  buttonShape: "rounded" | "square" | "pill";
}

export function FieldInput({ field, value, onChange, error, primaryColor, buttonShape }: Props) {
  if (field.type === "section_heading") {
    return (
      <div>
        <h3 className="text-lg font-bold">{field.label}</h3>
        {field.description && <p className="mt-1 text-sm text-muted-foreground">{field.description}</p>}
      </div>
    );
  }
  if (field.type === "page_break") return null;

  return (
    <div className={cn("rounded-xl border bg-card p-5", error && "border-destructive")}>
      <Label className="text-sm font-semibold">
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {field.description && <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>}
      <div className="mt-3">
        <Renderer field={field} value={value} onChange={onChange} primaryColor={primaryColor} buttonShape={buttonShape} />
      </div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Renderer({
  field,
  value,
  onChange,
  primaryColor,
  buttonShape,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  primaryColor: string;
  buttonShape: "rounded" | "square" | "pill";
}) {
  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return (
        <Input
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
        />
      );
    case "long_text":
      return (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          rows={4}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={(value as number | string) ?? ""}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder={field.placeholder ?? ""}
        />
      );
    case "date":
      return <Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "time":
      return <Input type="time" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "dropdown": {
      const f = field as ChoiceField;
      return (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {f.options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    case "radio": {
      const f = field as ChoiceField;
      return (
        <RadioGroup value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          {f.options.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <RadioGroupItem id={`${f.id}-${o.id}`} value={o.id} />
              <Label htmlFor={`${f.id}-${o.id}`} className="font-normal">{o.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }
    case "checkbox": {
      const f = field as ChoiceField;
      const set = new Set<string>(Array.isArray(value) ? (value as string[]) : []);
      return (
        <div className="space-y-2">
          {f.options.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <Checkbox
                id={`${f.id}-${o.id}`}
                checked={set.has(o.id)}
                onCheckedChange={(v) => {
                  const next = new Set(set);
                  if (v) next.add(o.id); else next.delete(o.id);
                  onChange([...next]);
                }}
              />
              <Label htmlFor={`${f.id}-${o.id}`} className="font-normal">{o.label}</Label>
            </div>
          ))}
        </div>
      );
    }
    case "ranking": {
      const f = field as ChoiceField;
      const order: string[] = Array.isArray(value) && (value as string[]).length === f.options.length
        ? (value as string[])
        : f.options.map((o) => o.id);
      return <RankingInput options={f.options} order={order} onChange={(v) => onChange(v)} />;
    }
    case "linear_scale": {
      const f = field as ScaleField;
      const v = typeof value === "number" ? value : null;
      return (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{f.minLabel ?? f.min}</span>
            <span>{f.maxLabel ?? f.max}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn(
                  "grid h-10 min-w-10 place-items-center rounded-full border px-2 text-sm font-medium transition",
                  v === n ? "text-white" : "bg-card hover:border-foreground"
                )}
                style={{
                  background: v === n ? primaryColor : undefined,
                  borderColor: v === n ? primaryColor : undefined,
                  borderRadius: buttonShape === "square" ? 4 : 9999,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "star_rating": {
      const f = field as ScaleField;
      const v = typeof value === "number" ? value : 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n === v ? 0 : n)}
              aria-label={`Rate ${n}`}
              className="transition hover:scale-110"
            >
              <Star
                className={cn("h-7 w-7 transition-colors", n <= v ? "" : "text-muted-foreground")}
                style={n <= v ? { color: primaryColor, fill: primaryColor } : {}}
              />
            </button>
          ))}
        </div>
      );
    }
    case "matrix": {
      const f = field as MatrixField;
      const v = (value as Record<string, string>) ?? {};
      return (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th className="px-3 py-2 text-left font-medium" />
                {f.columns.map((c) => (
                  <th key={c.id} className="px-2 py-2 text-center font-medium">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.label}</td>
                  {f.columns.map((c) => (
                    <td key={c.id} className="px-2 py-2 text-center">
                      <input
                        type="radio"
                        name={`${f.id}-${r.id}`}
                        checked={v[r.id] === c.id}
                        onChange={() => onChange({ ...v, [r.id]: c.id })}
                        className="h-3.5 w-3.5"
                        style={{ accentColor: primaryColor }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "file_upload": {
      const f = field;
      const fileName = typeof value === "string" ? value : "";
      return (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground hover:border-foreground">
          <UploadCloud className="h-5 w-5" />
          {fileName ? (
            <span className="font-medium text-foreground">{fileName}</span>
          ) : (
            <span>Click to upload — file is mocked, only the name is captured.</span>
          )}
          <input
            type="file"
            accept={f.accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onChange(file?.name ?? "");
            }}
          />
        </label>
      );
    }
    case "signature":
      return <SignatureInput value={value as string} onChange={onChange} primaryColor={primaryColor} />;
    default:
      return null;
  }
}

function RankingInput({
  options,
  order,
  onChange,
}: {
  options: { id: string; label: string }[];
  order: string[];
  onChange: (v: string[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const ordered = order.map((id) => options.find((o) => o.id === id)).filter((x): x is { id: string; label: string } => !!x);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = order.indexOf(String(active.id));
        const to = order.indexOf(String(over.id));
        if (from === -1 || to === -1) return;
        onChange(arrayMove(order, from, to));
      }}
    >
      <SortableContext items={ordered.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1.5">
          {ordered.map((o, i) => (
            <RankingRow key={o.id} id={o.id} index={i} label={o.label} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function RankingRow({ id, index, label }: { id: string; index: number; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
    >
      <span className="grid h-6 w-6 place-items-center rounded bg-muted text-xs font-semibold">{index + 1}</span>
      <span className="flex-1">{label}</span>
      <button {...listeners} {...attributes} className="cursor-grab text-muted-foreground active:cursor-grabbing" type="button" aria-label="Drag">
        <GripVertical className="h-4 w-4" />
      </button>
    </li>
  );
}

function SignatureInput({
  value,
  onChange,
  primaryColor,
}: {
  value?: string;
  onChange: (v: string) => void;
  primaryColor: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    if (value && !hasInk && ref.current) {
      const ctx = ref.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      }
    }
  }, [value, hasInk]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = ref.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function emit() {
    if (!ref.current) return;
    onChange(ref.current.toDataURL("image/png"));
  }

  function clear() {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx?.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange("");
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={520}
        height={150}
        className="w-full cursor-crosshair touch-none rounded-md border bg-background"
        onPointerDown={(e) => {
          setDrawing(true);
          const ctx = ref.current!.getContext("2d")!;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.strokeStyle = primaryColor;
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing) return;
          const ctx = ref.current!.getContext("2d")!;
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          setHasInk(true);
        }}
        onPointerUp={() => {
          if (!drawing) return;
          setDrawing(false);
          emit();
        }}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}
