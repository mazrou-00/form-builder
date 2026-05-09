import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Field, Form, FormResponse, FormTheme } from "@/lib/types";
import { DEFAULT_THEME } from "@/lib/types";
import { buildSeed } from "@/lib/seed";

const STORAGE_KEY = "form-builder/v1";

const seed = buildSeed();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32) || "form";
}

interface State {
  forms: Form[];
  responses: FormResponse[];
  /** Bumped to force re-init if shape changes. */
  version: number;
  appTheme: "light" | "dark";
}

interface Actions {
  toggleAppTheme: () => void;
  createForm: (input?: Partial<Pick<Form, "title" | "description">>) => Form;
  duplicateForm: (id: string) => Form | undefined;
  deleteForm: (id: string) => void;
  renameForm: (id: string, title: string) => void;
  updateForm: (id: string, patch: Partial<Form>) => void;
  setFields: (id: string, fields: Field[]) => void;
  upsertField: (id: string, field: Field) => void;
  removeField: (id: string, fieldId: string) => void;
  reorderFields: (id: string, from: number, to: number) => void;
  setTheme: (id: string, theme: Partial<FormTheme>) => void;
  publish: (id: string) => void;
  close: (id: string) => void;
  submitResponse: (formId: string, answers: Record<string, unknown>, durationMs?: number) => FormResponse;
  deleteResponse: (id: string) => void;
  resetMockData: () => void;
}

type Store = State & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      forms: seed.forms,
      responses: seed.responses,
      version: 1,
      appTheme: "light",

      toggleAppTheme: () =>
        set((s) => ({ appTheme: s.appTheme === "light" ? "dark" : "light" })),

      createForm: (input) => {
        const now = Date.now();
        const title = input?.title ?? "Untitled form";
        const f: Form = {
          id: nanoid(8),
          slug: slugify(title) + "-" + nanoid(4).toLowerCase(),
          title,
          description: input?.description ?? "",
          fields: [],
          theme: { ...DEFAULT_THEME },
          status: "draft",
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ forms: [f, ...s.forms] }));
        return f;
      },

      duplicateForm: (id) => {
        const src = get().forms.find((f) => f.id === id);
        if (!src) return;
        const now = Date.now();
        const copy: Form = {
          ...src,
          id: nanoid(8),
          slug: slugify(src.title + " copy") + "-" + nanoid(4).toLowerCase(),
          title: src.title + " (copy)",
          status: "draft",
          createdAt: now,
          updatedAt: now,
          fields: src.fields.map((field) => ({ ...field, id: nanoid(8) })),
        };
        set((s) => ({ forms: [copy, ...s.forms] }));
        return copy;
      },

      deleteForm: (id) =>
        set((s) => ({
          forms: s.forms.filter((f) => f.id !== id),
          responses: s.responses.filter((r) => r.formId !== id),
        })),

      renameForm: (id, title) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, title, updatedAt: Date.now() } : f
          ),
        })),

      updateForm: (id, patch) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f
          ),
        })),

      setFields: (id, fields) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, fields, updatedAt: Date.now() } : f
          ),
        })),

      upsertField: (id, field) =>
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== id) return f;
            const idx = f.fields.findIndex((x) => x.id === field.id);
            const fields = idx === -1 ? [...f.fields, field] : f.fields.map((x, i) => (i === idx ? field : x));
            return { ...f, fields, updatedAt: Date.now() };
          }),
        })),

      removeField: (id, fieldId) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id
              ? { ...f, fields: f.fields.filter((x) => x.id !== fieldId), updatedAt: Date.now() }
              : f
          ),
        })),

      reorderFields: (id, from, to) =>
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== id) return f;
            const fields = [...f.fields];
            const [item] = fields.splice(from, 1);
            fields.splice(to, 0, item);
            return { ...f, fields, updatedAt: Date.now() };
          }),
        })),

      setTheme: (id, theme) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, theme: { ...f.theme, ...theme }, updatedAt: Date.now() } : f
          ),
        })),

      publish: (id) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, status: "published", updatedAt: Date.now() } : f
          ),
        })),

      close: (id) =>
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, status: "closed", updatedAt: Date.now() } : f
          ),
        })),

      submitResponse: (formId, answers, durationMs) => {
        const r: FormResponse = {
          id: nanoid(10),
          formId,
          answers,
          submittedAt: Date.now(),
          durationMs,
        };
        set((s) => ({ responses: [r, ...s.responses] }));
        return r;
      },

      deleteResponse: (id) =>
        set((s) => ({ responses: s.responses.filter((r) => r.id !== id) })),

      resetMockData: () => {
        const fresh = buildSeed();
        set({ forms: fresh.forms, responses: fresh.responses, version: 1 });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (s) => ({
        forms: s.forms,
        responses: s.responses,
        version: s.version,
        appTheme: s.appTheme,
      }),
    }
  )
);

export const selectForm = (id: string | undefined) => (s: Store) =>
  id ? s.forms.find((f) => f.id === id) : undefined;

export const selectFormBySlug = (slug: string | undefined) => (s: Store) =>
  slug ? s.forms.find((f) => f.slug === slug) : undefined;

export const selectResponses = (formId: string | undefined) => (s: Store) =>
  formId ? s.responses.filter((r) => r.formId === formId) : [];
