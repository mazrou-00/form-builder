import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FONT_FAMILIES, type ButtonShape, type Form, type FormTheme, type ThemeMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESETS: { name: string; primary: string; bg?: string }[] = [
  { name: "Cobalt", primary: "#465FFF", bg: "#F9FAFB" },
  { name: "Emerald", primary: "#10B981", bg: "#F8FAFC" },
  { name: "Amber", primary: "#F59E0B", bg: "#FFFBEB" },
  { name: "Rose", primary: "#F43F5E", bg: "#FFF1F2" },
  { name: "Slate", primary: "#0F172A", bg: "#F1F5F9" },
  { name: "Violet", primary: "#7C3AED", bg: "#FAF5FF" },
];

interface Props {
  form: Form;
  onChange: (theme: Partial<FormTheme>) => void;
}

export function ThemePanel({ form, onChange }: Props) {
  const t = form.theme;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <div>
          <Label>Theme presets</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onChange({ primaryColor: p.primary, headerColor: p.primary, backgroundColor: p.bg })}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition hover:border-foreground",
                  t.primaryColor.toLowerCase() === p.primary.toLowerCase() && "border-foreground"
                )}
              >
                <span className="h-6 w-6 rounded-full" style={{ background: p.primary }} />
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mode</Label>
            <Select value={t.mode} onValueChange={(v) => onChange({ mode: v as ThemeMode })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Button shape</Label>
            <Select value={t.buttonShape} onValueChange={(v) => onChange({ buttonShape: v as ButtonShape })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Primary color</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={t.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value, headerColor: e.target.value })}
                className="h-9 w-9 cursor-pointer rounded border bg-transparent"
              />
              <Input value={t.primaryColor} onChange={(e) => onChange({ primaryColor: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Background</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={t.backgroundColor ?? "#FFFFFF"}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="h-9 w-9 cursor-pointer rounded border bg-transparent"
              />
              <Input value={t.backgroundColor ?? ""} onChange={(e) => onChange({ backgroundColor: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <Label>Font family</Label>
          <Select value={t.fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Header image URL (optional)</Label>
          <Input
            className="mt-1.5"
            placeholder="https://images.unsplash.com/..."
            value={t.headerImage ?? ""}
            onChange={(e) => onChange({ headerImage: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Leave blank to use a solid color header.</p>
        </div>
      </div>

      <ThemePreview form={form} />
    </div>
  );
}

function ThemePreview({ form }: { form: Form }) {
  const t = form.theme;
  const buttonRadius =
    t.buttonShape === "pill" ? "9999px" : t.buttonShape === "square" ? "0px" : "0.5rem";
  const isDark = t.mode === "dark";
  const bg = t.backgroundColor ?? (isDark ? "#0F172A" : "#FFFFFF");
  const text = isDark ? "#F1F5F9" : "#0F172A";
  const muted = isDark ? "#94A3B8" : "#64748B";

  return (
    <div>
      <Label>Preview</Label>
      <div
        className="mt-1.5 overflow-hidden rounded-2xl border shadow-sm"
        style={{ background: bg, color: text, fontFamily: t.fontFamily }}
      >
        <div
          className="h-20"
          style={{
            background: t.headerImage
              ? `url(${t.headerImage}) center/cover`
              : t.headerColor || t.primaryColor,
          }}
        />
        <div className="space-y-3 p-5">
          <div>
            <div className="text-base font-bold">{form.title}</div>
            <p className="mt-0.5 text-xs" style={{ color: muted }}>{form.description || "Form description preview."}</p>
          </div>
          <div>
            <div className="text-xs font-medium">Sample question *</div>
            <input
              placeholder="Type your answer"
              className="mt-1 w-full border bg-transparent px-3 py-2 text-sm outline-none"
              style={{ borderColor: muted, borderRadius: t.buttonShape === "square" ? 0 : 6 }}
              readOnly
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-white"
            style={{ background: t.primaryColor, borderRadius: buttonRadius }}
          >
            Submit
          </button>
          <Button variant="link" type="button" className="ml-2 h-auto p-0 text-xs" style={{ color: t.primaryColor }}>
            Reset answers
          </Button>
        </div>
      </div>
    </div>
  );
}
