import { TemplateAnalysis, TemplateField, TemplateFieldType, TemplateSection } from '@/types';

const LAYOUT_TYPES = ['single-column', 'two-column', 'sidebar-left', 'sidebar-right'];
const HEADER_STYLES = ['centered', 'left-aligned', 'right-aligned'];
const DIVIDERS = ['line', 'space', 'border'];
const PHOTO_POSITIONS = ['top-center', 'top-left', 'top-right', 'sidebar'];
const PHOTO_SHAPES = ['circle', 'square', 'rounded'];
const PHOTO_SIZES = ['small', 'medium', 'large'];
const FIELD_TYPES: string[] = ['text', 'email', 'phone', 'url', 'textarea', 'select', 'date'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);
const numOrUndef = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const toStr = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function pickHex(v: unknown, fallback: string): string {
  const s = str(v);
  return HEX_RE.test(s) ? s.toLowerCase() : fallback;
}

export function parseAndSanitizeAnalysis(input: unknown): TemplateAnalysis {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  const sections: TemplateSection[] = arr(raw.sections)
    .map((s) => {
      const sec = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
      return {
        id: str(sec.id) || `section-${Math.random().toString(36).slice(2, 8)}`,
        name: str(sec.name) || str(sec.title) || 'Section',
        description: str(sec.description),
        repeatable: bool(sec.repeatable, false),
        maxEntries: numOrUndef(sec.maxEntries),
      };
    })
    .filter((s) => s.id);

  const sectionIds = new Set(sections.map((s) => s.id));
  const ids = (v: unknown): string[] => arr(v).map(toStr).filter(Boolean);

  const orderedSections = ids(raw.orderedSections ?? (raw.layout as Record<string, unknown>)?.orderedSections).filter((id) => sectionIds.has(id));
  sections.forEach((s) => {
    if (!orderedSections.includes(s.id)) orderedSections.push(s.id);
  });

  const sidebarSections = ids((raw.layout as Record<string, unknown>)?.sidebarSections).filter((id) => orderedSections.includes(id));

  const rawLayout = (raw.layout && typeof raw.layout === 'object' ? raw.layout : {}) as Record<string, unknown>;
  const rawPhoto = (rawLayout.photo && typeof rawLayout.photo === 'object' ? rawLayout.photo : {}) as Record<string, unknown>;

  const fields: TemplateField[] = arr(raw.fields)
    .map((f) => {
      const field = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>;
      const type = FIELD_TYPES.includes(field.type as string) ? (field.type as TemplateFieldType) : 'text';
      return {
        id: str(field.id) || `field-${Math.random().toString(36).slice(2, 8)}`,
        label: str(field.label) || str(field.name) || 'Field',
        type,
        required: bool(field.required, true),
        placeholder: str(field.placeholder) || undefined,
        options: (() => {
          const opts = arr(field.options).map(toStr).filter(Boolean);
          return opts.length > 0 ? opts : undefined;
        })(),
        section: str(field.section) || 'personal',
      };
    })
    .filter((f) => f.id);

  const knownSectionIds = new Set(sections.map((s) => s.id));
  fields.forEach((f) => {
    if (!knownSectionIds.has(f.section)) f.section = sections[0]?.id || 'personal';
  });

  const rawStyle = (raw.style && typeof raw.style === 'object' ? raw.style : {}) as Record<string, unknown>;
  const backgroundFallback = '#ffffff';

  type LayoutType = TemplateAnalysis['layout']['type'];
  type PhotoConfig = NonNullable<TemplateAnalysis['layout']['photo']>;

  const layout: TemplateAnalysis['layout'] = {
    type: LAYOUT_TYPES.includes(rawLayout.type as string) ? (rawLayout.type as LayoutType) : 'single-column',
    orderedSections,
    sidebarSections: sidebarSections.length > 0 ? sidebarSections : undefined,
    photo: bool(rawPhoto.included, false)
      ? {
          included: true,
          position: PHOTO_POSITIONS.includes(rawPhoto.position as string) ? (rawPhoto.position as PhotoConfig['position']) : 'sidebar',
          shape: PHOTO_SHAPES.includes(rawPhoto.shape as string) ? (rawPhoto.shape as PhotoConfig['shape']) : 'circle',
          size: PHOTO_SIZES.includes(rawPhoto.size as string) ? (rawPhoto.size as PhotoConfig['size']) : 'medium',
        }
      : undefined,
  };
  const style: TemplateAnalysis['style'] = {
    primaryColor: pickHex(rawStyle.primaryColor, '#1e293b'),
    secondaryColor: pickHex(rawStyle.secondaryColor, '#334155'),
    backgroundColor: pickHex(rawStyle.backgroundColor, backgroundFallback),
    textColor: pickHex(rawStyle.textColor, '#111827'),
    accentColor: pickHex(rawStyle.accentColor, '#0ea5e9'),
    fontFamily: str(rawStyle.fontFamily) || 'Inter, sans-serif',
    headerStyle: HEADER_STYLES.includes(rawStyle.headerStyle as string) ? (rawStyle.headerStyle as TemplateAnalysis['style']['headerStyle']) : 'left-aligned',
    sectionDivider: DIVIDERS.includes(rawStyle.sectionDivider as string) ? (rawStyle.sectionDivider as TemplateAnalysis['style']['sectionDivider']) : 'line',
  };

  return {
    templateName: str(raw.templateName) || 'Detected Template',
    description: str(raw.description) || 'Auto-detected CV template.',
    layout,
    style,
    sections,
    fields,
    confidence: Math.min(1, Math.max(0, typeof raw.confidence === 'number' ? raw.confidence : 0.7)),
  };
}

export function buildAnalyzePrompt(palette: string[] = []): string {
  const paletteLine =
    palette.length > 0
      ? `\nThe exact dominant colors sampled from this image (hex, most frequent first) are: ${palette.join(', ')}. Use these as the authoritative source for style colors when they match what you see.`
      : '';

  return `You are an expert CV template analyzer. Study the uploaded CV template image very carefully.

Extract EVERYTHING visible in the template and return STRICT JSON (no prose, no code fences) that matches this exact shape:

{
  "templateName": string,
  "description": string,
  "confidence": number 0..1,
  "layout": {
    "type": "single-column" | "two-column" | "sidebar-left" | "sidebar-right",
    "orderedSections": string[],  // every visible section in display order (read column by column for multi-column layouts)
    "sidebarSections": string[] | undefined,  // section ids placed in the colored sidebar (for sidebar layouts)
    "photo": { "included": boolean, "position": "top-center" | "top-left" | "top-right" | "sidebar", "shape": "circle" | "square" | "rounded", "size": "small" | "medium" | "large" } | null
  },
  "style": {
    "primaryColor": "#hex",   // main heading/accent color
    "secondaryColor": "#hex", // secondary headings / sidebar color
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "accentColor": "#hex",    // most vivid color
    "fontFamily": "e.g. Georgia, serif",
    "headerStyle": "centered" | "left-aligned" | "right-aligned",
    "sectionDivider": "line" | "space" | "border"
  },
  "sections": [
    { "id": string, "name": string, "description": string, "repeatable": boolean, "maxEntries": number | null }
  ],
  "fields": [
    { "id": string, "label": string, "type": "text"|"email"|"phone"|"url"|"textarea"|"select"|"date", "required": boolean, "placeholder": string | null, "section": string /* section id from above */, "options": string[] | null }
  ]
}

Rules:
- DO NOT omit any section that exists in the template (header/contact, about/summary, skills, experience, education, projects, certifications, languages, interests, references, achievements, volunteering...). Every visible section must appear in orderedSections AND in sections.
- For each section list EVERY field a user would need to fill (labels visible on the page). Fields like name, title, email, phone, address, website, linkedin must be in the contact/personal section.
- Sections that clearly contain MULTIPLE repeated entries (e.g. several experience or education rows) must have repeatable=true.
- Compute colors as the nearest #hex approximations of what is actually used (headings, sidebar/rail, icons, lines). If a section title color is dark navy, use that as primaryColor. Use exact hex values.
- Estimate the layout type from column arrangement; if there is a distinct colored left (or right) rail, use sidebar-left (or sidebar-right) and list sidebarSections.
- Keep field ids short and use a section prefix (e.g. expCompany, eduDegree, projName).
- confidence = how sure you are about the overall structure (0.6-0.98).${paletteLine}`;
}

export interface AiWriteResult {
  cv: string;
  refined?: {
    singleton?: Record<string, string>;
    entries?: Record<string, Array<Record<string, string>>>;
  };
}

export function buildWritePrompt(
  analysis: TemplateAnalysis,
  singletonValues: Record<string, string>,
  entries: Record<string, Array<Record<string, string>>>,
  language: string,
): string {
  return `You are an expert CV writer and editor. Turn the raw user input below into a polished, professional CV.
Return STRICT JSON only (no prose, no code fences) with this shape:
{
  "cv": string, // complete formatted CV text (A4, section headings in caps, one line per item, bullets with "-")
  "refined": {
    "singleton": { ...same keys as the input singleton, values improved... },
    "entries": { ...same section keys as the input entries, each an array with the SAME number of items and SAME keys per item, values improved... }
  }
}

Writing rules:
- Keep all facts exactly as given. Do NOT invent skills, employers, dates, or achievements.
- Trim unnecessary filler words. Make bullets concise, action-orientated, measurable where facts allow.
- Fix grammar, spelling, and capitalization. Split long textarea fields into clean bullet-worthy lines.
- Empty values must stay empty strings. Keep every key — do not drop or add keys. Structure: "cv" is the full text document; "refined" mirrors the input data structure 1:1 so it can be rendered in the same visual template.
- The "cv" string should be plain text using the section headings from the template analysis: ${analysis.layout.orderedSections.join(', ')}.

Target language: ${language}.

Input data:
${JSON.stringify({ analysis: { layout: analysis.layout.type, sections: analysis.sections }, singleton: singletonValues, entries }, null, 2)}`;
}

export function sanitizeWriteResult(
  input: unknown,
  originalSingleton: Record<string, string>,
  originalEntries: Record<string, Array<Record<string, string>>>,
): AiWriteResult {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const cv = str(raw.cv);
  const refined = (raw.refined && typeof raw.refined === 'object' ? raw.refined : {}) as Record<string, unknown>;

  const refinedSingleton: Record<string, string> = { ...originalSingleton };
  const rSingleton = (refined.singleton && typeof refined.singleton === 'object' ? refined.singleton : {}) as Record<string, unknown>;
  Object.keys(originalSingleton).forEach((key) => {
    if (typeof rSingleton[key] === 'string') refinedSingleton[key] = (rSingleton[key] as string).trim();
  });

  const refinedEntries: Record<string, Array<Record<string, string>>> = {};
  const rEntries = (refined.entries && typeof refined.entries === 'object' ? refined.entries : {}) as Record<string, unknown>;
  Object.entries(originalEntries).forEach(([sectionId, items]) => {
    const rItems = Array.isArray(rEntries[sectionId]) ? (rEntries[sectionId] as unknown[]) : [];
    refinedEntries[sectionId] = items.map((item, i) => {
      const merged = { ...item };
      const picked = rItems[i] && typeof rItems[i] === 'object' ? (rItems[i] as Record<string, unknown>) : {};
      Object.keys(item).forEach((key) => {
        if (typeof picked[key] === 'string' && (picked[key] as string).trim()) merged[key] = (picked[key] as string).trim();
      });
      return merged;
    });
  });

  return {
    cv: cv || '',
    refined: {
      singleton: refinedSingleton,
      entries: refinedEntries,
    },
  };
}