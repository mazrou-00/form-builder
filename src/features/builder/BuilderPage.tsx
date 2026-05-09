import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import {
  ChevronLeft,
  Eye,
  Inbox,
  Palette,
  Save,
  Share2,
  Globe,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore, selectForm } from "@/lib/store";
import { makeField } from "@/lib/fieldDefaults";
import type { Field, FieldType, Form } from "@/lib/types";
import { FieldPalette } from "@/features/builder/FieldPalette";
import { FormCanvas } from "@/features/builder/FormCanvas";
import { PropertiesPanel } from "@/features/builder/PropertiesPanel";
import { ThemePanel } from "@/features/builder/ThemePanel";
import { ShareDialog } from "@/features/builder/ShareDialog";
import { FieldPreview } from "@/features/builder/FieldPreview";
import { toast } from "sonner";

export function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const createForm = useStore((s) => s.createForm);
  const form = useStore(selectForm(id));
  const setFields = useStore((s) => s.setFields);
  const upsertField = useStore((s) => s.upsertField);
  const removeField = useStore((s) => s.removeField);
  const updateForm = useStore((s) => s.updateForm);
  const setTheme = useStore((s) => s.setTheme);
  const publish = useStore((s) => s.publish);
  const close = useStore((s) => s.close);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<FieldType | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Auto-create when /builder/new
  useEffect(() => {
    if (id === "new") {
      const f = createForm({ title: "Untitled form" });
      navigate(`/builder/${f.id}`, { replace: true });
    }
  }, [id, createForm, navigate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const selectedField = useMemo(
    () => form?.fields.find((f) => f.id === selectedId) ?? null,
    [form, selectedId]
  );

  if (!form) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <div>
          <h2 className="text-lg font-semibold">Form not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">It may have been deleted.</p>
          <Button asChild className="mt-4"><Link to="/forms">Back to all forms</Link></Button>
        </div>
      </div>
    );
  }

  function addField(type: FieldType, atIndex?: number) {
    if (!form) return;
    const f = makeField(type);
    const fields = [...form.fields];
    if (atIndex === undefined || atIndex < 0 || atIndex > fields.length) fields.push(f);
    else fields.splice(atIndex, 0, f);
    setFields(form.id, fields);
    setSelectedId(f.id);
  }

  function duplicateField(fieldId: string) {
    if (!form) return;
    const idx = form.fields.findIndex((x) => x.id === fieldId);
    if (idx === -1) return;
    const original = form.fields[idx];
    const copy: Field = { ...original, id: nanoid(8), label: `${original.label} (copy)` } as Field;
    const fields = [...form.fields];
    fields.splice(idx + 1, 0, copy);
    setFields(form.id, fields);
    setSelectedId(copy.id);
  }

  function onDragStart(e: DragStartEvent) {
    const data = e.active.data.current as { source?: string; type?: FieldType } | undefined;
    setActiveId(String(e.active.id));
    setActiveType(data?.type ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    setActiveType(null);
    const { active, over } = e;
    if (!form) return;
    if (!over) return;

    const activeData = active.data.current as { source?: string; type?: FieldType } | undefined;
    const overData = over.data.current as { source?: string } | undefined;

    if (activeData?.source === "palette" && activeData.type) {
      // Drop type onto canvas
      const overId = String(over.id);
      const overIdx =
        overId === "canvas-drop"
          ? form.fields.length
          : form.fields.findIndex((f) => f.id === overId);
      addField(activeData.type, overIdx === -1 ? form.fields.length : overIdx);
      return;
    }

    if (activeData?.source === "canvas" && overData?.source === "canvas") {
      const fromIdx = form.fields.findIndex((f) => f.id === active.id);
      const toIdx = form.fields.findIndex((f) => f.id === over.id);
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        setFields(form.id, arrayMove(form.fields, fromIdx, toIdx));
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <BuilderHeader
        form={form}
        onTitleChange={(v) => updateForm(form.id, { title: v })}
        onPublish={() => { publish(form.id); toast.success("Form published"); }}
        onClose={() => { close(form.id); toast.success("Form closed for new responses"); }}
        onSave={() => toast.success("Saved (autosaved to localStorage)")}
        onOpenTheme={() => setThemeOpen(true)}
        onOpenShare={() => setShareOpen(true)}
      />

      <div className="-mx-6 -my-2 flex h-[calc(100vh-12.5rem)] overflow-hidden rounded-2xl border bg-background shadow-sm lg:-mx-8">
        <FieldPalette onAdd={(type) => addField(type)} />

        <FormCanvas
          form={form}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onTitleChange={(t) => updateForm(form.id, { title: t })}
          onDescriptionChange={(d) => updateForm(form.id, { description: d })}
          onDuplicate={duplicateField}
          onRemove={(fid) => {
            removeField(form.id, fid);
            if (selectedId === fid) setSelectedId(null);
          }}
        />

        <PropertiesPanel
          form={form}
          field={selectedField}
          onChange={(field) => upsertField(form.id, field)}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeId && activeType ? (
          <div className="rounded-lg border bg-background p-3 text-xs shadow-lg">
            <FieldPreview field={makeField(activeType)} />
          </div>
        ) : activeId ? (
          (() => {
            const f = form.fields.find((x) => x.id === activeId);
            return f ? (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <FieldPreview field={f} />
              </div>
            ) : null;
          })()
        ) : null}
      </DragOverlay>

      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Theme</DialogTitle>
          </DialogHeader>
          <ThemePanel form={form} onChange={(patch) => setTheme(form.id, patch)} />
        </DialogContent>
      </Dialog>

      <ShareDialog form={form} open={shareOpen} onOpenChange={setShareOpen} />
    </DndContext>
  );
}

function BuilderHeader({
  form,
  onTitleChange,
  onPublish,
  onClose,
  onSave,
  onOpenTheme,
  onOpenShare,
}: {
  form: Form;
  onTitleChange: (v: string) => void;
  onPublish: () => void;
  onClose: () => void;
  onSave: () => void;
  onOpenTheme: () => void;
  onOpenShare: () => void;
}) {
  return (
    <div className="-mx-6 -mt-6 mb-4 flex items-center gap-3 border-b bg-card/80 px-6 py-3 backdrop-blur lg:-mx-8 lg:px-8">
      <Button asChild size="icon" variant="ghost"><Link to="/forms"><ChevronLeft className="h-4 w-4" /></Link></Button>
      <div className="flex flex-1 items-center gap-2">
        <input
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent text-base font-semibold outline-none"
        />
        <Badge variant={form.status === "published" ? "success" : form.status === "closed" ? "warning" : "secondary"} className="capitalize">
          {form.status === "published" && <Globe className="mr-1 h-3 w-3" />}
          {form.status === "closed" && <Lock className="mr-1 h-3 w-3" />}
          {form.status}
        </Badge>
      </div>
      <Button asChild size="sm" variant="ghost"><Link to={`/f/${form.slug}`} target="_blank"><Eye className="h-3.5 w-3.5" /> Preview</Link></Button>
      <Button asChild size="sm" variant="ghost"><Link to={`/forms/${form.id}/responses`}><Inbox className="h-3.5 w-3.5" /> Responses</Link></Button>
      <Button size="sm" variant="ghost" onClick={onOpenTheme}><Palette className="h-3.5 w-3.5" /> Theme</Button>
      <Button size="sm" variant="outline" onClick={onSave}><Save className="h-3.5 w-3.5" /> Save</Button>
      <Button size="sm" variant="outline" onClick={onOpenShare}><Share2 className="h-3.5 w-3.5" /> Share</Button>
      {form.status !== "published" ? (
        <Button size="sm" onClick={onPublish}>Publish</Button>
      ) : (
        <Button size="sm" variant="outline" onClick={onClose}>Close form</Button>
      )}
    </div>
  );
}
