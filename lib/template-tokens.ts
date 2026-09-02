import { TemplateAnalysis, TemplateLayout, TemplateStyle } from '@/types';

const PAGE_W = 794;
const MM_TO_PX = PAGE_W / 210;

export interface ResolvedTheme {
  mainBackground: string;
  sidebarBackground: string;
  headerBackground: string | null;
  headingColor: string;
  sidebarHeadingColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
}

export interface ResolvedTypographySpec {
  family: string;
  size: number;
  weight: number | string;
  letterSpacing: number;
  textTransform: string;
  lineHeight: number;
}

export interface ResolvedTypography {
  name: ResolvedTypographySpec;
  jobTitle: ResolvedTypographySpec;
  sectionHeading: ResolvedTypographySpec;
  sidebarHeading: ResolvedTypographySpec;
  body: ResolvedTypographySpec;
  sidebarText: ResolvedTypographySpec;
}

export interface ResolvedGeometry {
  orientation: 'portrait' | 'landscape';
  sidebarWidth: number;
  mainWidth: number;
  gap: number;
  headerHeight: number | null;
  verticalGap: number;
  pagePad: { top: number; right: number; bottom: number; left: number };
  columnTopPad: number;
}

export interface ResolvedComponentStyle {
  headingVariant: 'underline' | 'dotted' | 'border' | 'filled' | 'icon' | 'plain';
  bulletStyle: 'dot' | 'square' | 'dash' | 'arrow' | 'line';
  timeline: boolean;
  icons: boolean;
  headerBand: boolean;
}

const spec = (
  t: Partial<ResolvedTypographySpec> | undefined,
  fallback: ResolvedTypographySpec,
): ResolvedTypographySpec => ({
  family: t?.family || fallback.family,
  size: t?.size || fallback.size,
  weight: t?.weight || fallback.weight,
  letterSpacing: t?.letterSpacing ?? fallback.letterSpacing,
  textTransform: t?.textTransform || fallback.textTransform,
  lineHeight: t?.lineHeight || fallback.lineHeight,
});

const familyOf = (style: TemplateStyle): string => style.fontFamily || 'Inter, sans-serif';

export function resolveThemeTokens(style: TemplateStyle): ResolvedTheme {
  const theme = style.theme || {};
  const headerBand =
    (style.componentStyle?.headerBackground ?? false) || Boolean(theme.headerBackground);
  const sidebarBackground = theme.sidebarBackground || style.secondaryColor || '#1e293b';
  return {
    mainBackground: theme.mainBackground || style.backgroundColor || '#ffffff',
    sidebarBackground,
    headerBackground: theme.headerBackground || (headerBand ? style.primaryColor : null),
    headingColor: theme.headingColor || style.primaryColor || '#1e293b',
    sidebarHeadingColor: onColorFor(theme.sidebarHeadingColor ?? theme.textColor, sidebarBackground),
    textColor: theme.textColor || style.textColor || '#111827',
    borderColor: theme.borderColor || style.primaryColor || style.accentColor || '#1e293b',
    iconColor: theme.iconColor || style.accentColor || style.primaryColor || '#0ea5e9',
  };
}

function rgbOf(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return { r, g, b };
}

export function luminance(hex: string): number {
  const { r, g, b } = rgbOf(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function autoContrastColor(bg: string): string {
  return luminance(bg) > 150 ? '#111827' : '#f8fafc';
}

function onColorFor(textColor: string | undefined, bg: string): string {
  if (textColor && Math.abs(luminance(textColor) - luminance(bg)) > 90) return textColor;
  return autoContrastColor(bg);
}

export function resolveTypography(style: TemplateStyle): ResolvedTypography {
  const typo = style.typography || {};
  return {
    name: spec(typo.name, {
      family: familyOf(style),
      size: style.nameSize || 28,
      weight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      lineHeight: 1.1,
    }),
    jobTitle: spec(typo.jobTitle, {
      family: familyOf(style),
      size: style.nameSize ? style.nameSize - 8 : 15,
      weight: 600,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      lineHeight: 1.2,
    }),
    sectionHeading: spec(typo.sectionHeading, {
      family: familyOf(style),
      size: style.headingSize || 13,
      weight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      lineHeight: 1.2,
    }),
    sidebarHeading: spec(typo.sidebarHeading, {
      family: familyOf(style),
      size: (style.headingSize || 13) - 2,
      weight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      lineHeight: 1.2,
    }),
    body: spec(typo.body, {
      family: familyOf(style),
      size: style.bodySize || 11,
      weight: 400,
      letterSpacing: 0,
      textTransform: 'none',
      lineHeight: 1.5,
    }),
    sidebarText: spec(typo.sidebarText, {
      family: familyOf(style),
      size: (style.bodySize || 11) - 0.5,
      weight: 400,
      letterSpacing: 0,
      textTransform: 'none',
      lineHeight: 1.45,
    }),
  };
}

export function resolveComponentStyle(style: TemplateStyle): ResolvedComponentStyle {
  const cs = style.componentStyle || {};
  return {
    headingVariant: cs.headingVariant || 'underline',
    bulletStyle: cs.bulletStyle || 'dot',
    timeline: cs.timeline ?? false,
    icons: cs.icons ?? false,
    headerBand: (cs.headerBackground ?? false) || Boolean(style.theme?.headerBackground),
  };
}

export function resolveGeometry(
  layout: TemplateLayout,
  layoutType?: TemplateAnalysis['layout']['type'],
): ResolvedGeometry {
  const type = layoutType || layout.type;
  const geo = layout.geometry || {};
  const isSidebar = type === 'sidebar-left' || type === 'sidebar-right';
  const isTwoCol = type === 'two-column';

  const columns = layout.columns || [];
  const sidebarCol = columns.find((c) => c.id === 'sidebar');

  let sidebarFrac: number;
  if (geo.sidebarWidth) sidebarFrac = geo.sidebarWidth;
  else if (sidebarCol?.width) sidebarFrac = sidebarCol.width;
  else if (isSidebar) sidebarFrac = 0.28;
  else sidebarFrac = 0;

  const gap = geo.gap || (isSidebar || isTwoCol ? 0 : 24);
  const mainFrac = isTwoCol && geo.mainWidth ? geo.mainWidth : 1 - sidebarFrac - gap / PAGE_W;
  const marginsMm = layout.page?.margins;
  const pagePad = marginsMm
    ? {
        top: Math.round(marginsMm.top * MM_TO_PX),
        right: Math.round(marginsMm.right * MM_TO_PX),
        bottom: Math.round(marginsMm.bottom * MM_TO_PX),
        left: Math.round(marginsMm.left * MM_TO_PX),
      }
    : { top: 40, right: 40, bottom: 40, left: 40 };

  return {
    orientation: geo.orientation || 'portrait',
    sidebarWidth: Math.max(0, Math.round(sidebarFrac * PAGE_W)),
    mainWidth: Math.max(0, Math.round(mainFrac * PAGE_W)),
    gap: Math.max(0, Math.round(gap)),
    headerHeight: geo.headerHeight && geo.headerHeight > 10 ? geo.headerHeight : null,
    verticalGap: geo.verticalGap || (isSidebar ? 16 : 18),
    pagePad: { ...pagePad },
    columnTopPad: geo.contentBounds?.top ? Math.round(geo.contentBounds.top) : Math.min(40, pagePad.top * 0.7),
  };
}

export const SECTION_ICON: Record<string, string> = {
  personal: 'user',
  contact: 'phone',
  summary: 'user',
  profile: 'user',
  experience: 'briefcase',
  workExperience: 'briefcase',
  education: 'education',
  skills: 'skills',
  softSkills: 'skills',
  technicalSkills: 'skills',
  languages: 'globe',
  projects: 'folder',
  project: 'folder',
  achievements: 'award',
  certifications: 'medal',
  certificates: 'medal',
  references: 'users',
  interests: 'heart',
  volunteering: 'heart',
  awards: 'award',
};

export { PAGE_W };