import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import * as Icons from "lucide-react";
import { FIELD_TYPE_META } from "@/lib/fieldDefaults";
import type { FieldType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PaletteProps {
  onAdd: (type: FieldType) => void;
}

const GROUPS: { key: "input" | "choice" | "advanced" | "layout"; label: string }[] = [
  { key: "input", label: "Inputs" },
  { key: "choice", label: "Choices" },
  { key: "advanced", label: "Advanced" },
  { key: "layout", label: "Layout" },
];

export function FieldPalette({ onAdd }: PaletteProps) {
  return (
    <aside className="hidden border-r bg-card md:flex md:w-64 md:flex-col">
      <div className="border-b px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Field types
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">Drag onto canvas — or click to add.</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {GROUPS.map((g) => (
          <div key={g.key} className="mb-4">
            <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(FIELD_TYPE_META) as [FieldType, typeof FIELD_TYPE_META[FieldType]][])
                .filter(([, meta]) => meta.group === g.key)
                .map(([type, meta]) => (
                  <PaletteItem key={type} type={type} label={meta.label} icon={meta.icon} onAdd={onAdd} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PaletteItem({
  type,
  label,
  icon,
  onAdd,
}: {
  type: FieldType;
  label: string;
  icon: string;
  onAdd: (type: FieldType) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: "palette", type },
  });
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ?? Icons.Square;
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAdd(type)}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-lg border bg-background p-2.5 text-left text-xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10",
        "cursor-grab active:cursor-grabbing"
      )}
      type="button"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium leading-tight">{label}</span>
    </button>
  );
}
