import {
  TemplateAnalysis,
  TemplateComponentStyle,
  TemplateField,
  TemplateFieldType,
  TemplateSection,
  TemplateTypographyToken,
} from '@/types';

const LAYOUT_TYPES = ['single-column', 'two-column', 'sidebar-left', 'sidebar-right'];
const HEADER_STYLES = ['centered', 'left-aligned', 'right-aligned'];
const DIVIDERS = ['line', 'space', 'border'];
const HEADING_VARIANTS = ['underline', 'dotted', 'border', 'filled', 'icon', 'plain'];
const BULLET_STYLES = ['dot', 'square', 'dash', 'arrow', 'line'];
const TRANSFORMS = ['none', 'uppercase', 'capitalize'];
const PHOTO_POSITIONS = ['top-center', 'top-left', 'top-right', 'sidebar'];
const PHOTO_SHAPES = ['circle', 'square', 'rounded'];
const PHOTO_SIZES = ['small', 'medium', 'large'];
const FIELD_TYPES: string[] = ['text', 'email', 'phone', 'url', 'textarea', 'select', 'date'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const PERSONAL_IDS_SET = new Set(['personal']);
const DEFAULT_SIDEBAR_SECTION_PATTERNS = [
  'contact',
  'skill',
  'soft',
  'tech',
  'language',
  'interest',
  'hobby',
  'hobbies',
];

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

  const rawLayout = (raw.layout && typeof raw.layout === 'object' ? raw.layout : {}) as Record<string, unknown>;
  const rawPhoto = (rawLayout.photo && typeof rawLayout.photo === 'object' ? rawLayout.photo : {}) as Record<string, unknown>;
  const layoutType: LayoutType = LAYOUT_TYPES.includes(rawLayout.type as string)
    ? (rawLayout.type as LayoutType)
    : 'single-column';

  let sidebarSections = ids(rawLayout?.sidebarSections).filter((id) => orderedSections.includes(id));
  if ((layoutType === 'sidebar-left' || layoutType === 'sidebar-right') && sidebarSections.length === 0) {
    sidebarSections = orderedSections.filter((id) => {
      const lower = id.toLowerCase();
      return DEFAULT_SIDEBAR_SECTION_PATTERNS.some((p) => lower.includes(p));
    });
  }

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
  const originalFieldSections = new Map(fields.map((f) => [f.id, f.section]));
  fields.forEach((f) => {
    if (!knownSectionIds.has(f.section)) f.section = sections[0]?.id || 'personal';
  });

  const rawStyle = (raw.style && typeof raw.style === 'object' ? raw.style : {}) as Record<string, unknown>;
  const backgroundFallback = '#ffffff';

  type LayoutType = TemplateAnalysis['layout']['type'];
  type PhotoConfig = NonNullable<TemplateAnalysis['layout']['photo']>;

  const pt = (v: unknown): TemplateTypographyToken | undefined => {
    if (!v || typeof v !== 'object') return undefined;
    const t = v as Record<string, unknown>;
    const fam = str(t.family);
    const tf = TRANSFORMS.includes(t.textTransform as string) ? (t.textTransform as TemplateTypographyToken['textTransform']) : undefined;
    return {
      ...(fam ? { family: fam } : {}),
      ...(t.weight !== undefined ? { weight: t.weight as number | string } : {}),
      ...(typeof t.size === 'number' && t.size > 4 ? { size: t.size } : {}),
      ...(typeof t.letterSpacing === 'number' ? { letterSpacing: t.letterSpacing } : {}),
      ...(tf ? { textTransform: tf } : {}),
      ...(typeof t.lineHeight === 'number' && t.lineHeight > 0.5 ? { lineHeight: t.lineHeight } : {}),
    };
  };

  const rawTheme = (rawStyle.theme && typeof rawStyle.theme === 'object' ? rawStyle.theme : {}) as Record<string, unknown>;
  const rawTypography = (rawStyle.typography && typeof rawStyle.typography === 'object' ? rawStyle.typography : {}) as Record<string, unknown>;
  const rawComponent = (rawStyle.componentStyle && typeof rawStyle.componentStyle === 'object' ? rawStyle.componentStyle : {}) as Record<string, unknown>;

  const rawPage = (rawLayout.page && typeof rawLayout.page === 'object' ? rawLayout.page : {}) as Record<string, unknown>;
  const rawMargins = (rawPage.margins && typeof rawPage.margins === 'object' ? rawPage.margins : {}) as Record<string, unknown>;
  const mm = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback);

  const rawColumns = Array.isArray(rawLayout.columns) ? rawLayout.columns : [];

  const rawGeometry = (rawLayout.geometry && typeof rawLayout.geometry === 'object' ? rawLayout.geometry : {}) as Record<string, unknown>;
  const frac = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 1 ? v : undefined;
  const px = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;

  const normalizeColumn = (
    col: unknown,
    type: LayoutType,
  ): NonNullable<TemplateAnalysis['layout']['placements']>[number]['column'] => {
    const s = str(col);
    const isTwo = type === 'two-column';
    switch (s) {
      case 'sidebar':
        return isTwo ? 'main-right' : 'sidebar';
      case 'main-left':
      case 'left':
        return isTwo ? 'main-left' : 'main';
      case 'main-right':
      case 'right':
        return isTwo ? 'main-right' : 'main';
      default:
        return isTwo ? 'main-left' : 'main';
    }
  };

  const defaultPlacements: TemplateAnalysis['layout']['placements'] = orderedSections
    .map((id, index) => ({
      sectionId: id,
      column: sidebarSections.includes(id) ? ('sidebar' as const) : normalizeColumn('main', layoutType),
      order: index,
    }))
    .filter((p) => !PERSONAL_IDS_SET.has(p.sectionId));
  const providedPlacements = Array.isArray(rawLayout.placements)
    ? rawLayout.placements
        .map((p) => {
          const pl = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
          const id = str(pl.sectionId);
          if (!knownSectionIds.has(id)) return null;
          return {
            sectionId: id,
            column: normalizeColumn(pl.column, layoutType),
            order: typeof pl.order === 'number' ? pl.order : 0,
          };
        })
        .filter((p): p is NonNullable<TemplateAnalysis['layout']['placements']>[number] => p !== null)
    : null;

  const clampFrac = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1 ? v : undefined;

  const rawCrop = () => {
    const source: unknown = rawPhoto.crop ?? rawPhoto.box ?? rawPhoto.bounds;
    let box: Record<string, unknown>;
    if (Array.isArray(source) && source.length === 4) {
      box = { left: source[0], top: source[1], width: source[2], height: source[3] };
    } else if (source && typeof source === 'object') {
      box = source as Record<string, unknown>;
    } else {
      return undefined;
    }
    const w = clampFrac(box.width) ?? clampFrac(box.w) ?? clampFrac(box.size);
    const h = clampFrac(box.height) ?? clampFrac(box.h);
    const left = clampFrac(box.left) ?? clampFrac(box.x);
    const top = clampFrac(box.top) ?? clampFrac(box.y);
    if (w === undefined || h === undefined || left === undefined || top === undefined) return undefined;
    if (w < 0.02 || h < 0.02 || left + w > 1.001 || top + h > 1.001) return undefined;
    const l = Math.max(0, Math.min(0.98, left));
    const T = Math.max(0, Math.min(0.98, top));
    return { left: l, top: T, width: w, height: h };
  };
  const HEADER_PLACEMENTS = ['top-full-width', 'main-column', 'sidebar-top', 'inline'];
  const rawHeaderPlacement = str(rawLayout.headerPlacement ?? (rawLayout as Record<string, unknown>).headerSpan);
  const headerPlacement: TemplateAnalysis['layout']['headerPlacement'] = HEADER_PLACEMENTS.includes(rawHeaderPlacement)
    ? (rawHeaderPlacement as TemplateAnalysis['layout']['headerPlacement'])
    : undefined;

  const layout: TemplateAnalysis['layout'] = {
    type: layoutType,
    headerPlacement: headerPlacement || undefined,
    orderedSections,
    sidebarSections: sidebarSections.length > 0 ? sidebarSections : undefined,
    photo: bool(rawPhoto.included, false)
      ? {
          included: bool(rawPhoto.included, false),
          position: PHOTO_POSITIONS.includes(rawPhoto.position as string) ? (rawPhoto.position as PhotoConfig['position']) : 'sidebar',
          shape: PHOTO_SHAPES.includes(rawPhoto.shape as string) ? (rawPhoto.shape as PhotoConfig['shape']) : 'circle',
          size: PHOTO_SIZES.includes(rawPhoto.size as string) ? (rawPhoto.size as PhotoConfig['size']) : 'medium',
          ...(crop ? { crop } : {}),
        }
      : crop
        ? {
            included: true,
            position: PHOTO_POSITIONS.includes(rawPhoto.position as string) ? (rawPhoto.position as PhotoConfig['position']) : 'sidebar',
            shape: PHOTO_SHAPES.includes(rawPhoto.shape as string) ? (rawPhoto.shape as PhotoConfig['shape']) : 'circle',
            size: PHOTO_SIZES.includes(rawPhoto.size as string) ? (rawPhoto.size as PhotoConfig['size']) : 'medium',
            crop,
          }
        : undefined,
    page:
      rawPage && (rawPage.widthMm !== undefined || rawPage.heightMm !== undefined || rawMargins.top !== undefined)
        ? {
            widthMm: mm(rawPage.widthMm, 210),
            heightMm: mm(rawPage.heightMm, 297),
            margins: {
              top: mm(rawMargins.top, 12),
              right: mm(rawMargins.right, 12),
              bottom: mm(rawMargins.bottom, 12),
              left: mm(rawMargins.left, 12),
            },
          }
        : undefined,
    columns:
      rawColumns.length > 0
        ? rawColumns
            .map((c) => {
              const col = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
              return {
                id: col.id === 'sidebar' ? ('sidebar' as const) : ('main' as const),
                width: typeof col.width === 'number' && col.width > 0 && col.width < 1 ? col.width : undefined,
                background: str(col.background) || undefined,
                padding: typeof col.padding === 'number' && col.padding >= 0 ? col.padding : undefined,
              };
            })
        : undefined,
    placements: providedPlacements || defaultPlacements,
    geometry: rawGeometry && (rawGeometry.orientation !== undefined || rawGeometry.sidebarWidth !== undefined)
      ? {
          ...(rawGeometry.orientation === 'landscape' ? { orientation: 'landscape' as const } : {}),
          ...(px(rawGeometry.headerHeight) ? { headerHeight: px(rawGeometry.headerHeight) } : {}),
          ...(frac(rawGeometry.sidebarWidth) ? { sidebarWidth: frac(rawGeometry.sidebarWidth) } : {}),
          ...(frac(rawGeometry.mainWidth) ? { mainWidth: frac(rawGeometry.mainWidth) } : {}),
          ...(px(rawGeometry.gap) ? { gap: px(rawGeometry.gap) } : {}),
          ...(px(rawGeometry.verticalGap) ? { verticalGap: px(rawGeometry.verticalGap) } : {}),
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
    nameSize: typeof rawStyle.nameSize === 'number' && rawStyle.nameSize > 8 ? rawStyle.nameSize : undefined,
    headingSize: typeof rawStyle.headingSize === 'number' && rawStyle.headingSize > 7 ? rawStyle.headingSize : undefined,
    bodySize: typeof rawStyle.bodySize === 'number' && rawStyle.bodySize > 6 ? rawStyle.bodySize : undefined,
    theme: {
      ...(pickHex(rawTheme.headerBackground, '') ? { headerBackground: pickHex(rawTheme.headerBackground, '') } : {}),
      ...(pickHex(rawTheme.sidebarBackground, '') ? { sidebarBackground: pickHex(rawTheme.sidebarBackground, '') } : {}),
      ...(pickHex(rawTheme.mainBackground, '') ? { mainBackground: pickHex(rawTheme.mainBackground, '') } : {}),
      ...(pickHex(rawTheme.headingColor, '') ? { headingColor: pickHex(rawTheme.headingColor, '') } : {}),
      ...(pickHex(rawTheme.textColor, '') ? { textColor: pickHex(rawTheme.textColor, '') } : {}),
      ...(pickHex(rawTheme.borderColor, '') ? { borderColor: pickHex(rawTheme.borderColor, '') } : {}),
      ...(pickHex(rawTheme.iconColor, '') ? { iconColor: pickHex(rawTheme.iconColor, '') } : {}),
      ...(pickHex(rawTheme.sidebarHeadingColor, '') ? { sidebarHeadingColor: pickHex(rawTheme.sidebarHeadingColor, '') } : {}),
    },
    typography: Object.keys(rawTypography).length > 0
      ? {
          ...(pt(rawTypography.name) ? { name: pt(rawTypography.name) } : {}),
          ...(pt(rawTypography.jobTitle) ? { jobTitle: pt(rawTypography.jobTitle) } : {}),
          ...(pt(rawTypography.sectionHeading) ? { sectionHeading: pt(rawTypography.sectionHeading) } : {}),
          ...(pt(rawTypography.body) ? { body: pt(rawTypography.body) } : {}),
          ...(pt(rawTypography.sidebarHeading) ? { sidebarHeading: pt(rawTypography.sidebarHeading) } : {}),
          ...(pt(rawTypography.sidebarText) ? { sidebarText: pt(rawTypography.sidebarText) } : {}),
        }
      : undefined,
    componentStyle:
      HEADING_VARIANTS.includes(rawComponent.headingVariant as string) ||
      BULLET_STYLES.includes(rawComponent.bulletStyle as string) ||
      rawComponent.timeline !== undefined ||
      rawComponent.icons !== undefined ||
      rawComponent.headerBackground !== undefined
        ? {
            ...(HEADING_VARIANTS.includes(rawComponent.headingVariant as string)
              ? { headingVariant: rawComponent.headingVariant as TemplateComponentStyle['headingVariant'] }
              : {}),
            ...(BULLET_STYLES.includes(rawComponent.bulletStyle as string)
              ? { bulletStyle: rawComponent.bulletStyle as TemplateComponentStyle['bulletStyle'] }
              : {}),
            ...(typeof rawComponent.timeline === 'boolean' ? { timeline: rawComponent.timeline } : {}),
            ...(typeof rawComponent.icons === 'boolean' ? { icons: rawComponent.icons } : {}),
            ...(typeof rawComponent.headerBackground === 'boolean' ? { headerBackground: rawComponent.headerBackground } : {}),
          }
        : undefined,
  };

  const rawContent = (raw.content && typeof raw.content === 'object' ? raw.content : {}) as Record<string, unknown>;
  const rawContentEntries =
    (raw.contentEntries && typeof raw.contentEntries === 'object' ? raw.contentEntries : {}) as Record<string, unknown>;

  const fieldIdsBySection = new Map<string, Set<string>>();
  fields.forEach((f) => {
    if (!fieldIdsBySection.has(f.section)) fieldIdsBySection.set(f.section, new Set());
    fieldIdsBySection.get(f.section)!.add(f.id);
  });

  const pickEntryStrings = (obj: unknown, allowed: Set<string>): Record<string, string> => {
    if (!obj || typeof obj !== 'object') return {};
    const rec = obj as Record<string, unknown>;
    const out: Record<string, string> = {};
    allowed.forEach((id) => {
      if (typeof rec[id] === 'string' && rec[id].trim()) out[id] = (rec[id] as string).trim();
    });
    return out;
  };

  const content: Record<string, string> = {};
  const contentEntries: Record<string, Array<Record<string, string>>> = {};

  const applySectionContent = (sectionId: string, value: unknown) => {
    const section = sections.find((s) => s.id === sectionId);
    const allowed =
      fieldIdsBySection.get(sectionId) ||
      new Set<string>(
        fields.filter((f) => f.section === sectionId || originalFieldSections.get(f.id) === sectionId).map((f) => f.id),
      );
    if (allowed.size === 0) return;
    const isRepeatable = section?.repeatable ?? false;
    if (isRepeatable) {
      const list = arr(value).length > 0 ? arr(value) : arr((value as Record<string, unknown>)?.entries);
      const items = list
        .map((item) => {
          const rec = (item && typeof item === 'object' && !Array.isArray(item) ? item : {}) as Record<string, unknown>;
          return pickEntryStrings(rec, allowed);
        })
        .filter((rec) => Object.keys(rec).length > 0);
      if (items.length > 0) contentEntries[sectionId] = items;
    } else {
      const rec = (value && typeof value === 'object' && !Array.isArray(value) ? value : {}) as Record<string, unknown>;
      const merged = { ...pickEntryStrings(rec.value ?? rec, allowed), ...pickEntryStrings(rec, allowed) };
      Object.entries(merged).forEach(([id, text]) => {
        content[id] = text;
      });
    }
  };

  Object.entries(rawContent).forEach(([key, value]) => {
    const isSection =
      sections.some((s) => s.id === key) ||
      fields.some((f) => f.section === key) ||
      fields.some((f) => originalFieldSections.get(f.id) === key);
    if (isSection) {
      applySectionContent(key, value);
      return;
    }
    const field = fields.find((f) => f.id === key);
    if (field && typeof value === 'string' && value.trim()) content[field.id] = value.trim();
  });

  Object.entries(rawContentEntries).forEach(([key, value]) => {
    if (key in contentEntries) return;
    applySectionContent(key, value);
  });

  return {
    templateName: str(raw.templateName) || 'Detected Template',
    description: str(raw.description) || 'Auto-detected CV template.',
    layout,
    style,
    sections,
    fields,
    confidence: Math.min(1, Math.max(0, typeof raw.confidence === 'number' ? raw.confidence : 0.7)),
    ...(Object.keys(content).length > 0 ? { content } : {}),
    ...(Object.keys(contentEntries).length > 0 ? { contentEntries } : {}),
  };
}

export function buildAnalyzePrompt(palette: string[] = []): string {
  const paletteLine =
    palette.length > 0
      ? `\nThe exact dominant colors sampled from this image (hex, most frequent first) are: ${palette.join(', ')}. Use these as the authoritative source for style colors when they match what you see.`
      : '';

  return `You are an expert CV template analyzer. Study the uploaded CV template image very carefully.
It is the MASTER DESIGN. Your job is to describe it EXACTLY so another program can reproduce it pixel-for-pixel with different content. Do NOT simplify, redesign, or invent a style.

Extract EVERYTHING visible in the template and return STRICT JSON (no prose, no code fences) that matches this exact shape:

{
  "templateName": string,
  "description": string,
  "confidence": number 0..1,
  "layout": {
    "type": "single-column" | "two-column" | "sidebar-left" | "sidebar-right",
    "headerPlacement": "top-full-width" | "main-column" | "sidebar-top", // REQUIRED: "top-full-width" if the name/header banner spans 100% across the whole top of the page above the columns; "main-column" if the sidebar runs full-height to the top edge and the header is only inside the main column; "sidebar-top" if the candidate name is inside the sidebar.
    "orderedSections": string[],  // every visible section in display order (read column by column for multi-column layouts)
    "sidebarSections": string[] | undefined,  // section ids placed in the colored sidebar (for sidebar layouts)
    "photo": { "included": boolean, "position": "top-center" | "top-left" | "top-right" | "sidebar", "shape": "circle" | "square" | "rounded", "size": "small" | "medium" | "large", "crop": { "left": number, "top": number, "width": number, "height": number } | null },
    "page": { "widthMm": number | null, "heightMm": number | null, "margins": { "top": number, "right": number, "bottom": number, "left": number } } | null,
    "columns": [ { "id": "main" | "sidebar", "width": number 0..1 (fraction), "background": "#hex" | null } ] | null,
    "placements": [ { "sectionId": string, "column": "main" | "sidebar" | "main-left" | "main-right", "order": number } ] | null,
    "geometry": { "orientation": "portrait" | "landscape", "headerHeight": number | null, "sidebarWidth": number 0..1, "mainWidth": number 0..1, "gap": number | null, "verticalGap": number | null } | null
  },
  "style": {
    "primaryColor": "#hex",   // main heading/accent color
    "secondaryColor": "#hex", // secondary color
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "accentColor": "#hex",    // most vivid accent
    "fontFamily": "e.g. Georgia, serif",
    "headerStyle": "centered" | "left-aligned" | "right-aligned" | "banner-full",
    "sectionDivider": "line" | "space" | "border",
    "nameSize": number,
    "bodySize": number,
    "headingSize": number,
    "theme": {
      "headerBackground": "#hex" | null,   // full header/name band background, if any
      "sidebarBackground": "#hex" | null,  // sidebar/rail background, if any
      "mainBackground": "#hex" | null,     // main content background
      "headingColor": "#hex" | null,      // section heading color
      "textColor": "#hex" | null,         // body text color
      "borderColor": "#hex" | null,       // rules, borders, dividers
      "iconColor": "#hex" | null          // icon/bullet accent color
    },
    "typography": {
      "name": { "family"?: string, "weight"?: number, "size"?: number, "letterSpacing"?: number, "textTransform"?: "none"|"uppercase"|"capitalize", "lineHeight"?: number },
      "jobTitle": { ... same shape ... },
      "sectionHeading": { ... same shape ... },
      "body": { ... same shape ... },
      "sidebarHeading": { ... same shape ... },
      "sidebarText": { ... same shape ... }
    },
    "componentStyle": {
      "headingVariant": "underline" | "dotted" | "border" | "filled" | "icon" | "plain",  // how section headings are built
      "bulletStyle": "dot" | "square" | "dash" | "arrow" | "line",
      "timeline": boolean,        // true if experience/education use a left timeline rail with dots
      "icons": boolean,           // true if sections have small icons beside/in headings
      "headerBackground": boolean // true if the header/name area is a colored band
    }
  },
  "sections": [
    { "id": string, "name": string, "description": string, "repeatable": boolean, "maxEntries": number | null }
  ],
  "fields": [
    { "id": string, "label": string, "type": "text"|"email"|"phone"|"url"|"textarea"|"select"|"date", "required": boolean, "placeholder": string | null, "section": string /* section id from above */, "options": string[] | null }
  ],
  "content": {
    "<sectionId>": { "<fieldId>": string } | [ { "<fieldId>": string } ]
  }
}

Rules — the template is the exact source of truth:
- DO NOT omit any section that exists in the template (header/contact, about/summary, skills, experience, education, projects, certifications, languages, interests, references, achievements, volunteering...). Every visible section must appear in orderedSections AND in sections.
- HEADER PLACEMENT (CRITICAL):
  * If the candidate name/title is in a full-width header band spanning 100% across the whole top of the document (with the sidebar starting underneath the header banner), set "headerPlacement": "top-full-width" and "theme.headerBackground" to its exact color.
  * If the sidebar goes all the way from the top edge to bottom, and the header is only located inside the main body column next to the sidebar, set "headerPlacement": "main-column".
- For each section list EVERY field a user would need to fill (labels visible on the page). Fields like name, title, email, phone, address, website, linkedin must be in the contact/personal section.
- Sections that clearly contain MULTIPLE repeated entries (e.g. several experience or education rows) must have repeatable=true.
- Colors: sample the ACTUAL pixels. Report exact #hex for each theme slot. Never substitute generic names (no "blue"/"gray") — give the precise hex value from the image. headerBackground covers a full name/header band if one exists; sidebarBackground covers the colored rail; headingColor is the section-heading text color; borderColor is lines/dividers; iconColor is icons or bullet marks.
- Geometry: measure proportions from the image. sidebarWidth/mainWidth are fractions of total page width (0..1). headerHeight and gaps in px relative to a 794-px-wide page. If a header band exists, set headerHeight (approximate its height in px).
- Typography: estimate per-role family, weight, size (px), letterSpacing, textTransform (are headings uppercase, capitalized, letter-spaced?), lineHeight from the image. Body text, sidebar text, and headings often differ — record each.
- Component style: reproduce HOW the template draws things — underline (thick/thin line under heading), dotted rule, bordered box, filled color strip, icon beside the heading, or plain. Note timelines (experience/education drawn as a vertical line of dots) and icons.
- PHOTO: if the template contains a person's portrait photo, set included=true and report its exact bounding box in "crop" as fractions of the FULL template image (0..1): { left, top, width, height } covering ONLY the photo (do not include surrounding text or margins). For a circular photo, give the crop that contains the whole circle. If there is no photo, return included=false and crop=null.
- Layout type: if a distinct left or right sidebar/rail exists, use sidebar-left (or sidebar-right). CRITICAL: list EVERY section physically located in the sidebar column in "sidebarSections" (e.g. contact, softSkills, techSkills, languages, hobbies, interests) AND in placements with column "sidebar". Never put sidebar sections in the main column.
- For the main column: list sections physically in the main body in placements with column "main" (e.g. profile/summary, education, experience, projects, achievements, references).
- If the name/job title is inside a colored rectangle/band next to the sidebar photo, set theme.headerBackground to that rectangle's hex color.
- For TWO-COLUMN layouts (two equal-column or asymmetric-column plain design, no colored rail): list orderedSections as the LEFT column sections top-to-bottom, then the RIGHT column sections top-to-bottom. In placements use column "main-left" for every section physically on the left and "main-right" for every section physically on the right (order restarts at 0 in each column). Set geometry.mainWidth to the left-column width as a fraction 0..1 (e.g. 0.38) so the left column uses exactly the template's proportion. Do NOT guess a left/right split — use what you SEE.
- For single-column layouts every section is "main".
- Do not flatten the design: if two columns have different widths, keep those widths in geometry/columns.
- CONTENT: transcribe the actual text visible in the template into "content", keyed by section id, using the SAME field ids from "fields". A non-repeatable section maps to an object { fieldId: value }; a repeatable section (experience, education, projects, ...) maps to an ARRAY of objects, one per visible entry. Copy EXACTLY what you see — real names, titles, companies, dates, emails, phones, addresses, and every bullet line. Multi-line textareas (summaries, descriptions, responsibilities) keep the bullet lines separated by "\\n". Include every visible phone/email/link exactly. If a section has content but no obvious field (e.g. a skill tag list or language list), use the section's main text field. This content is the DEFAULT data used to build the CV — do not paraphrase, translate, or invent;
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