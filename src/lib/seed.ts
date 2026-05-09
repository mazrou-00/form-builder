import { nanoid } from "nanoid";
import type { ChoiceField, Field, Form, FormResponse, MatrixField } from "@/lib/types";
import { DEFAULT_THEME } from "@/lib/types";
import { makeField } from "@/lib/fieldDefaults";

const id = () => nanoid(8);

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const c = [...arr];
  const out: T[] = [];
  while (out.length < n && c.length) {
    out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
  }
  return out;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FIRST = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Avery", "Hayden", "Aisha", "Omar", "Leila", "Yusuf", "Mariam", "Ahmed", "Fatima", "Khalid", "Noor", "Zayd"];
const LAST = ["Khan", "Singh", "Patel", "Garcia", "Martinez", "Lee", "Chen", "Wong", "Smith", "Johnson", "Almazrou", "Hassan", "Mubarak", "Said", "Faraj", "Nasser"];

function fakeName() {
  return `${pick(FIRST)} ${pick(LAST)}`;
}

function fakeEmail(name: string) {
  return name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
}

function makeAnswer(field: Field): unknown {
  switch (field.type) {
    case "short_text":
      return pick([fakeName(), "It was great", "Could improve", "Loved it", "Average experience"]);
    case "long_text":
      return pick([
        "The product worked exactly as described and the support was responsive.",
        "I'd love to see more customization options in the future.",
        "Onboarding was smooth, but the docs could be more detailed.",
        "Excellent, I will recommend to my team.",
        "Some bugs in the mobile app, otherwise solid.",
      ]);
    case "email": {
      const n = fakeName();
      return fakeEmail(n);
    }
    case "phone":
      return `+971 ${rand(50, 58)} ${rand(100, 999)} ${rand(1000, 9999)}`;
    case "url":
      return pick(["https://example.com", "https://acme.test", "https://contoso.dev"]);
    case "number":
      return rand(field.min ?? 0, field.max ?? 100);
    case "date":
      return new Date(Date.now() - rand(0, 60) * 86400000).toISOString().slice(0, 10);
    case "time":
      return `${String(rand(8, 18)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`;
    case "dropdown":
    case "radio": {
      const f = field as ChoiceField;
      return pick(f.options).id;
    }
    case "checkbox": {
      const f = field as ChoiceField;
      const n = rand(1, Math.min(3, f.options.length));
      return pickN(f.options, n).map((o) => o.id);
    }
    case "ranking": {
      const f = field as ChoiceField;
      return pickN(f.options, f.options.length).map((o) => o.id);
    }
    case "linear_scale":
    case "star_rating":
      return rand(field.min, field.max);
    case "matrix": {
      const f = field as MatrixField;
      const out: Record<string, string> = {};
      for (const row of f.rows) out[row.id] = pick(f.columns).id;
      return out;
    }
    case "file_upload":
      return pick(["receipt.pdf", "id-front.jpg", "screenshot.png", "scan.pdf"]);
    case "signature":
      return "data:signature/svg;base64,MOCK";
    case "section_heading":
    case "page_break":
      return undefined;
  }
}

function makeResponses(form: Form, count: number): FormResponse[] {
  const out: FormResponse[] = [];
  for (let i = 0; i < count; i++) {
    const submittedAt = Date.now() - rand(0, 90) * 86400000 - rand(0, 23) * 3600000;
    const answers: Record<string, unknown> = {};
    for (const f of form.fields) {
      const a = makeAnswer(f);
      if (a !== undefined) answers[f.id] = a;
    }
    out.push({
      id: id(),
      formId: form.id,
      answers,
      submittedAt,
      durationMs: rand(45, 600) * 1000,
      fromMock: true,
    });
  }
  return out.sort((a, b) => b.submittedAt - a.submittedAt);
}

function buildCustomerFeedback(): Form {
  const fields: Field[] = [];
  fields.push({ ...makeField("section_heading"), label: "About you", description: "We collect this so we can follow up if needed." });
  fields.push({ ...makeField("short_text"), label: "Full name", required: true });
  fields.push({ ...makeField("email"), label: "Work email", required: true });
  fields.push({ ...makeField("dropdown"), label: "Company size",
    options: [
      { id: id(), label: "1–10" },
      { id: id(), label: "11–50" },
      { id: id(), label: "51–200" },
      { id: id(), label: "201–1000" },
      { id: id(), label: "1000+" },
    ],
  } as Field);
  fields.push(makeField("page_break"));
  fields.push({ ...makeField("section_heading"), label: "Your experience" });
  fields.push({ ...makeField("linear_scale"), label: "How likely are you to recommend us?", min: 0, max: 10, minLabel: "Not likely", maxLabel: "Very likely", required: true } as Field);
  fields.push({ ...makeField("star_rating"), label: "Overall product quality" });
  fields.push({ ...makeField("matrix"), label: "Rate each area",
    rows: [
      { id: id(), label: "Performance" },
      { id: id(), label: "Reliability" },
      { id: id(), label: "Support" },
      { id: id(), label: "Documentation" },
    ],
    columns: [
      { id: id(), label: "Poor" },
      { id: id(), label: "Fair" },
      { id: id(), label: "Good" },
      { id: id(), label: "Excellent" },
    ],
  } as MatrixField);
  fields.push({ ...makeField("checkbox"), label: "Which features do you use?",
    options: [
      { id: id(), label: "Dashboards" },
      { id: id(), label: "Workflows" },
      { id: id(), label: "Integrations" },
      { id: id(), label: "Reporting" },
      { id: id(), label: "Mobile app" },
    ],
  } as Field);
  fields.push({ ...makeField("long_text"), label: "What could we improve?" });
  return wrapForm("Customer Feedback Q2", "Help us understand what's working and what isn't.", fields, "#465FFF");
}

function buildEventRSVP(): Form {
  const f: Field[] = [];
  f.push({ ...makeField("short_text"), label: "Your name", required: true });
  f.push({ ...makeField("email"), label: "Email", required: true });
  f.push({ ...makeField("radio"), label: "Will you attend?",
    options: [
      { id: id(), label: "Yes, I'll be there" },
      { id: id(), label: "No, I can't make it" },
      { id: id(), label: "Maybe" },
    ],
    required: true,
  } as Field);
  const guestField = { ...makeField("number"), label: "How many guests?", min: 0, max: 5 } as Field;
  f.push(guestField);
  f.push({ ...makeField("checkbox"), label: "Dietary preferences",
    options: [
      { id: id(), label: "Vegetarian" },
      { id: id(), label: "Vegan" },
      { id: id(), label: "Gluten-free" },
      { id: id(), label: "Halal" },
      { id: id(), label: "Nut allergy" },
    ],
  } as Field);
  f.push({ ...makeField("long_text"), label: "Anything we should know?" });
  return wrapForm("Annual Gala — RSVP", "Save your seat for the November 14 event.", f, "#10B981");
}

function buildJobApplication(): Form {
  const f: Field[] = [];
  f.push({ ...makeField("section_heading"), label: "Personal" });
  f.push({ ...makeField("short_text"), label: "Full name", required: true });
  f.push({ ...makeField("email"), label: "Email", required: true });
  f.push({ ...makeField("phone"), label: "Phone" });
  f.push({ ...makeField("url"), label: "LinkedIn profile" });
  f.push(makeField("page_break"));
  f.push({ ...makeField("section_heading"), label: "Role" });
  f.push({ ...makeField("dropdown"), label: "Position",
    options: [
      { id: id(), label: "Frontend Engineer" },
      { id: id(), label: "Backend Engineer" },
      { id: id(), label: "Product Designer" },
      { id: id(), label: "Product Manager" },
    ],
    required: true,
  } as Field);
  f.push({ ...makeField("ranking"), label: "Rank these tools by familiarity",
    options: [
      { id: id(), label: "React" },
      { id: id(), label: "TypeScript" },
      { id: id(), label: "Node.js" },
      { id: id(), label: "PostgreSQL" },
      { id: id(), label: "Tailwind CSS" },
    ],
  } as Field);
  f.push({ ...makeField("number"), label: "Years of experience", min: 0, max: 40 } as Field);
  f.push({ ...makeField("file_upload"), label: "Resume (PDF)", accept: ".pdf,.doc,.docx" } as Field);
  f.push(makeField("page_break"));
  f.push({ ...makeField("long_text"), label: "Why do you want to join?", required: true });
  f.push({ ...makeField("signature"), label: "Sign to confirm submission" });
  return wrapForm("Engineering — Open Roles", "We review applications weekly. We promise to respond.", f, "#F97316");
}

function wrapForm(title: string, description: string, fields: Field[], color: string): Form {
  const now = Date.now();
  return {
    id: id(),
    slug: slugify(title) + "-" + nanoid(4).toLowerCase(),
    title,
    description,
    fields,
    theme: { ...DEFAULT_THEME, primaryColor: color, headerColor: color },
    status: "published",
    createdAt: now - rand(7, 60) * 86400000,
    updatedAt: now - rand(0, 6) * 86400000,
  };
}

export interface SeedData {
  forms: Form[];
  responses: FormResponse[];
}

export function buildSeed(): SeedData {
  const forms = [buildCustomerFeedback(), buildEventRSVP(), buildJobApplication()];
  const responses: FormResponse[] = [];
  responses.push(...makeResponses(forms[0], 64));
  responses.push(...makeResponses(forms[1], 38));
  responses.push(...makeResponses(forms[2], 27));
  return { forms, responses };
}
