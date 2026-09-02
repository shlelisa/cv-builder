import { TemplateAnalysis, TemplateColumnId } from '@/types';

export interface CustomLayoutSection {
  sectionId: string;
  column: TemplateColumnId;
  order: number;
}

export interface CustomLayout {
  sections: CustomLayoutSection[];
  hidden: string[];
}

export interface ResolvedPlacement {
  main: string[];
  sidebar: string[];
}

export interface LayoutWarning {
  sectionId: string;
  message: string;
}

const PERSONAL_IDS = new Set(['personal', 'contact']);

export function defaultCustomLayout(analysis: TemplateAnalysis): CustomLayout {
  const sections: CustomLayoutSection[] = [];
  const templateDefaults = new Set(analysis.layout.sidebarSections || []);
  analysis.layout.orderedSections.forEach((id, index) => {
    if (PERSONAL_IDS.has(id)) return;
    sections.push({
      sectionId: id,
      column: templateDefaults.has(id) ? 'sidebar' : 'main',
      order: index,
    });
  });
  return { sections, hidden: [] };
}

export function cloneCustomLayout(layout: CustomLayout): CustomLayout {
  return {
    sections: layout.sections.map((s) => ({ ...s })),
    hidden: [...layout.hidden],
  };
}

export function reindex(layout: CustomLayout): CustomLayout {
  return {
    hidden: [...layout.hidden],
    sections: layout.sections
      .map((s, index) => ({ sectionId: s.sectionId, column: s.column, order: index }))
      .sort((a, b) => a.order - b.order),
  };
}

export function resolveLayout(analysis: TemplateAnalysis, custom?: CustomLayout): ResolvedPlacement {
  const layout = custom ? reindex(cloneCustomLayout(custom)) : defaultCustomLayout(analysis);
  const allowSidebar = analysis.layout.type === 'sidebar-left' || analysis.layout.type === 'sidebar-right';

  const main: string[] = [];
  const sidebar: string[] = [];
  const knownIds = new Set(analysis.sections.map((s) => s.id));
  const hidden = new Set(layout.hidden);

  layout.sections.forEach((p) => {
    if (PERSONAL_IDS.has(p.sectionId)) return;
    if (hidden.has(p.sectionId)) return;
    if (!knownIds.has(p.sectionId)) return;
    if (p.column === 'sidebar' && !allowSidebar) {
      main.push(p.sectionId);
      return;
    }
    (p.column === 'sidebar' ? sidebar : main).push(p.sectionId);
  });

  return { main, sidebar };
}

export function validateLayout(analysis: TemplateAnalysis, custom?: CustomLayout): LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  const baseline = defaultCustomLayout(analysis);
  const baselineMap = new Map(baseline.sections.map((s) => [s.sectionId, s.column]));
  if (!custom) return warnings;

  custom.sections.forEach((s) => {
    const original = baselineMap.get(s.sectionId);
    if (original && original !== s.column) {
      warnings.push({
        sectionId: s.sectionId,
        message: `Moved to ${s.column === 'sidebar' ? 'Sidebar' : 'Main'} column (template has it in ${original === 'sidebar' ? 'Sidebar' : 'Main'}).`,
      });
    }
    if (!PERSONAL_IDS.has(s.sectionId) && custom.hidden.includes(s.sectionId)) {
      warnings.push({
        sectionId: s.sectionId,
        message: 'Section is hidden — it will not appear in the CV.',
      });
    }
  });

  analysis.layout.orderedSections.forEach((id) => {
    if (PERSONAL_IDS.has(id)) return;
    if (!custom.sections.some((s) => s.sectionId === id) && !custom.hidden.includes(id)) {
      warnings.push({
        sectionId: id,
        message: 'Removed from layout — it will not appear in the CV.',
      });
    }
  });

  return warnings;
}