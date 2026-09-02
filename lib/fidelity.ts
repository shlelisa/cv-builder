import { TemplateAnalysis, TemplateStyle } from '@/types';
import { CustomLayout, validateLayout } from '@/lib/layout-engine';
import {
  PAGE_W,
  ResolvedTheme,
  resolveGeometry,
  resolveThemeTokens,
  resolveTypography,
} from '@/lib/template-tokens';

export interface FidelityIssue {
  category: string;
  message: string;
}

export interface FidelityReport {
  overall: number;
  breakdown: {
    layout: number;
    colors: number;
    typography: number;
    spacing: number;
    sections: number;
    alignment: number;
  };
  issues: FidelityIssue[];
}

export interface FidelityInput {
  styleOverrides?: Partial<TemplateStyle>;
  layoutType?: TemplateAnalysis['layout']['type'];
  customLayout?: CustomLayout | null;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return { r, g, b };
}

function colorDist(a: string, b: string): number {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return Math.abs(ca.r - cb.r) + Math.abs(ca.g - cb.g) + Math.abs(ca.b - cb.b);
}

function colorScore(a: string | null | undefined, b: string): { score: number; matched: boolean } {
  if (!a) return { score: 0, matched: false };
  const d = colorDist(a, b);
  if (d <= 48) return { score: 1, matched: true };
  if (d <= 140) return { score: Math.max(0, 1 - (d - 48) / 140), matched: false };
  return { score: 0, matched: false };
}

function proximity(a: number | undefined, b: number, tol = 0.02): { score: number; defined: boolean } {
  if (a === undefined) return { score: 0, defined: false };
  const diff = Math.abs(a - b);
  if (diff <= tol) return { score: 1, defined: true };
  return { score: Math.max(0, 1 - diff / 0.5), defined: true };
}

function near(a: number | undefined, b: number, tol = 2): { score: number; defined: boolean } {
  if (a === undefined) return { score: 0, defined: false };
  const diff = Math.abs(a - b);
  if (diff <= tol) return { score: 1, defined: true };
  return { score: Math.max(0, 1 - diff / 20), defined: true };
}

export function scoreTemplateMatch(analysis: TemplateAnalysis, input: FidelityInput = {}): FidelityReport {
  const effective = {
    ...analysis.style,
    ...(input.styleOverrides || {}),
    theme: { ...(analysis.style.theme || {}), ...(input.styleOverrides?.theme || {}) },
    typography: {
      ...(analysis.style.typography || {}),
      ...(input.styleOverrides?.typography || {}),
    },
    componentStyle: {
      ...(analysis.style.componentStyle || {}),
      ...(input.styleOverrides?.componentStyle || {}),
    },
  };

  const theme: ResolvedTheme = resolveThemeTokens(effective);
  const typo = resolveTypography(effective);
  const geo = resolveGeometry(analysis.layout, input.layoutType);

  const issues: FidelityIssue[] = [];
  const rawStyle = analysis.style;
  const srcTheme = rawStyle.theme || {};
  const srcTypo = rawStyle.typography || {};
  const srcGeo = analysis.layout.geometry || {};
  const srcCss = rawStyle.componentStyle || {};

  // ---- LAYOUT ----
  const sidebarFracUsed = geo.sidebarWidth / PAGE_W;
  const expectedSidebar = srcGeo.sidebarWidth ?? analysis.layout.columns?.find((c) => c.id === 'sidebar')?.width;
  const sb = proximity(expectedSidebar, sidebarFracUsed, 0.02);
  let layoutScore = sb.score;
  if (expectedSidebar === undefined && (analysis.layout.type === 'sidebar-left' || analysis.layout.type === 'sidebar-right')) {
    const implied = 0.28;
    const d = Math.abs(implied - sidebarFracUsed);
    layoutScore = d <= 0.02 ? 0.75 : Math.max(0, 1 - d / 0.5);
    issues.push({ category: 'layout', message: 'Sidebar width not detected from template — using the standard 28% proportion.' });
  } else if (expectedSidebar === undefined) {
    layoutScore = 1;
  }

  if (srcGeo.orientation === 'landscape' && geo.orientation === 'portrait') {
    layoutScore *= 0.5;
    issues.push({ category: 'layout', message: 'Template is landscape but the page renders portrait.' });
  }
  if (srcCss.headerBackground === true || srcTheme.headerBackground) {
    if (!geo.headerHeight) {
      layoutScore *= 0.85;
      issues.push({ category: 'layout', message: 'Header band height estimated (no height detected).' });
    }
  }

  // ---- COLORS ----
  const colorCases: Array<[keyof NonNullable<TemplateAnalysis['style']['theme']>, string, number]> = [
    ['mainBackground', theme.mainBackground, 0.22],
    ['sidebarBackground', theme.sidebarBackground, 0.2],
    ['headingColor', theme.headingColor, 0.16],
    ['textColor', theme.textColor, 0.12],
    ['borderColor', theme.borderColor, 0.1],
    ['iconColor', theme.iconColor, 0.08],
    ['headerBackground', theme.headerBackground || '', 0.12],
  ];
  let colorSum = 0;
  let colorWeight = 0;
  colorCases.forEach(([key, used, w]) => {
    const expected = key === 'headerBackground' ? srcTheme.headerBackground : srcTheme[key];
    const res = colorScore(expected, used || '');
    colorSum += res.score * w;
    colorWeight += w;
    if (key !== 'headerBackground' && expected === undefined) {
      issues.push({ category: 'colors', message: `${key} not sampled from template — using an estimated color.` });
    }
  });
  const colors = colorWeight > 0 ? Math.round((colorSum / colorWeight) * 100) : 0;

  // ---- TYPOGRAPHY ----
  type TypoToken = NonNullable<TemplateAnalysis['style']['typography']>[keyof NonNullable<TemplateAnalysis['style']['typography']>];
  const typoCases: Array<[TypoToken | undefined, number, string]> = [
    [srcTypo.name, typo.name.size, 'Name font size'],
    [srcTypo.sectionHeading, typo.sectionHeading.size, 'Section heading size'],
    [srcTypo.body, typo.body.size, 'Body font size'],
  ];
  let typoSum = 0;
  let typoWeight = 0;
  typoCases.forEach(([token, used, label]) => {
    const expected = token?.size;
    const res = near(expected, used, 1.5);
    typoSum += res.score;
    typoWeight += 1;
    if (expected === undefined) issues.push({ category: 'typography', message: `${label} not detected — using ${used}px.` });
  });
  const headingTransform = srcTypo.sectionHeading?.textTransform;
  const transformOk =
    headingTransform === undefined ||
    (headingTransform === 'none' && typo.sectionHeading.textTransform === 'none') ||
    (headingTransform !== 'none' && typo.sectionHeading.textTransform === (headingTransform as string));
  if (headingTransform !== undefined && !transformOk) {
    issues.push({ category: 'typography', message: `Section-heading text transform differs from template (${headingTransform}).` });
  } else {
    typoSum += 1;
    typoWeight += 1;
  }
  const typography = typoWeight > 0 ? Math.round((typoSum / typoWeight) * 100) : 0;

  // ---- SPACING ----
  const margins = analysis.layout.page?.margins;
  let spacingSum = 0;
  let spacingWeight = 0;
  if (margins) {
    const m = margins;
    spacingSum += near(m.top, Math.round(geo.pagePad.top / (PAGE_W / 210)), 4).score;
    spacingSum += near(m.left, Math.round(geo.pagePad.left / (PAGE_W / 210)), 4).score;
    spacingWeight += 2;
  } else {
    spacingSum += 0.7;
    spacingWeight += 1;
    issues.push({ category: 'spacing', message: 'Page margins not detected — using standard A4 margins.' });
  }
  if (srcGeo.verticalGap !== undefined) {
    spacingSum += near(srcGeo.verticalGap, geo.verticalGap, 3).score;
    spacingWeight += 1;
  } else {
    spacingSum += 0.8;
    spacingWeight += 1;
  }
  const spacing = Math.round((spacingSum / spacingWeight) * 100);

  // ---- SECTIONS ----
  const placementMoves = validateLayout(analysis, input.customLayout ?? undefined).filter((w) =>
    w.message.startsWith('Moved'),
  ).length;
  const removed = validateLayout(analysis, input.customLayout ?? undefined).filter((w) =>
    w.message.startsWith('Removed') || w.message.startsWith('Section is hidden'),
  ).length;
  const nonPersonal = analysis.layout.orderedSections.filter((s) => s !== 'personal' && s !== 'contact').length;
  const coverage = nonPersonal > 0 ? Math.min(1, (nonPersonal - removed) / nonPersonal) : 1;
  const sections = Math.round(coverage * 100) - placementMoves * 3;
  if (removed > 0) issues.push({ category: 'sections', message: `${removed} template section(s) hidden or removed from the layout.` });
  if (placementMoves > 0) issues.push({ category: 'sections', message: `${placementMoves} section(s) moved to a column different from the template.` });

  // ---- ALIGNMENT ----
  const headerAlign = rawStyle.headerStyle;
  let alignment = 100;
  if (headerAlign === undefined) {
    alignment = 80;
    issues.push({ category: 'alignment', message: 'Header alignment not detected — using left-aligned.' });
  }

  // correction loop simulation: style/layoutType overrides that contradict the template lower the score
  if (input.layoutType && input.layoutType !== analysis.layout.type) {
    layoutScore *= 0.6;
    issues.push({ category: 'layout', message: `Layout type changed from "${analysis.layout.type}" to "${input.layoutType}".` });
  }
  const layoutScoreFinal = Math.max(0, Math.min(1, layoutScore));
  const overall = Math.round(
    (layoutScoreFinal * 100 * 0.22 +
      colors * 0.22 +
      typography * 0.18 +
      spacing * 0.12 +
      sections * 0.14 +
      alignment * 0.12),
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown: {
      layout: Math.max(0, Math.min(100, Math.round(layoutScoreFinal * 100))),
      colors,
      typography,
      spacing,
      sections: Math.max(0, Math.min(100, sections)),
      alignment,
    },
    issues,
  };
}