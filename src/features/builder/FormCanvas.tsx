import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldPreview } from "@/features/builder/FieldPreview";
import type { Field, Form } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CanvasProps {
  form: Form;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function FormCanvas({
  form,
  selectedId,
  onSelect,
  onTitleChange,
  onDescriptionChange,
  onDuplicate,
  onRemove,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop", data: { source: "canvas" } });

  return (
    <div className="flex-1 overflow-y-auto bg-muted/30 p-6 scrollbar-thin">
      <div className="mx-auto max-w-2xl">
        <div
          className="overflow-hidden rounded-2xl border-t-8 bg-card shadow-sm"
          style={{ borderTopColor: form.theme.headerColor || form.theme.primaryColor }}
        >
          <div className="p-6">
            <input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Form title"
              className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground"
            />
            <textarea
              value={form.description ?? ""}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Form description (optional)"
              rows={2}
              className="mt-1 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <SortableContext items={form.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={cn(
              "mt-3 space-y-3 rounded-xl",
              isOver && "outline-2 outline-dashed outline-brand-300 outline-offset-2"
            )}
          >
            {form.fields.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border-2 border-dashed bg-card/50 px-6 py-16 text-center">
                <div className="text-sm font-medium">Drop fields here to start building</div>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Drag a field from the left palette, or click any palette item to append it.
                </p>
              </div>
            ) : (
              form.fields.map((field) => (
                <SortableFieldRow
                  key={field.id}
                  field={field}
                  selected={selectedId === field.id}
                  onSelect={() => onSelect(field.id)}
                  onDuplicate={() => onDuplicate(field.id)}
                  onRemove={() => onRemove(field.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableFieldRow({
  field,
  selected,
  onSelect,
  onDuplicate,
  onRemove,
}: {
  field: Field;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { source: "canvas" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        "group relative flex items-stretch gap-2 rounded-2xl border bg-card shadow-sm transition",
        selected && "ring-2 ring-brand-400"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onSelect() : undefined)}
    >
      <button
        {...listeners}
        {...attributes}
        type="button"
        className="grid w-7 cursor-grab place-items-center rounded-l-2xl border-r bg-muted/30 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 px-4 py-4">
        <FieldPreview field={field} />
      </div>

      <div className="flex flex-col items-center gap-1 px-1.5 py-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
