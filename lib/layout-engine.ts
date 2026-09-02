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
  left: string[];
  right: string[];
}

export interface LayoutWarning {
  sectionId: string;
  message: string;
}

const HEADER_ONLY_IDS = new Set(['personal']);

const SIDEBAR_CANDIDATE_IDS = new Set([
  'contact',
  'skills',
  'softSkills',
  'techSkills',
  'technicalSkills',
  'languages',
  'hobbies',
  'interests',
]);

const colLabel = (column: TemplateColumnId): string =>
  column === 'sidebar' ? 'Sidebar' : column === 'main-left' ? 'Left' : column === 'main-right' ? 'Right' : 'Main';

function placementsToSections(analysis: TemplateAnalysis): CustomLayoutSection[] {
  const placements = analysis.layout.placements || [];
  return placements
    .filter((p) => !HEADER_ONLY_IDS.has(p.sectionId))
    .map((p) => ({ sectionId: p.sectionId, column: p.column, order: p.order }));
}

export function defaultCustomLayout(analysis: TemplateAnalysis): CustomLayout {
  const placements = placementsToSections(analysis);
  if (placements.length > 0) return { sections: placements, hidden: [] };

  const type = analysis.layout.type;
  const isSidebar = type === 'sidebar-left' || type === 'sidebar-right';
  const isTwoCol = type === 'two-column';
  const sections: CustomLayoutSection[] = [];

  if (isTwoCol) {
    const order = analysis.layout.orderedSections.filter((id) => !HEADER_ONLY_IDS.has(id));
    const mainFrac = analysis.layout.geometry?.mainWidth || 0.5;
    const leftCount = Math.min(order.length - 1, Math.max(1, Math.round(mainFrac * order.length)));
    order.forEach((id, index) => {
      sections.push({ sectionId: id, column: index < leftCount ? 'main-left' : 'main-right', order: index % Math.max(1, leftCount) });
    });
    return { sections, hidden: [] };
  }

  const templateDefaults = new Set(analysis.layout.sidebarSections || []);
  const hasExplicitSidebarDefaults = templateDefaults.size > 0;

  analysis.layout.orderedSections.forEach((id, index) => {
    if (HEADER_ONLY_IDS.has(id)) return;
    const inSidebar = isSidebar && (
      hasExplicitSidebarDefaults
        ? templateDefaults.has(id)
        : SIDEBAR_CANDIDATE_IDS.has(id)
    );
    sections.push({
      sectionId: id,
      column: inSidebar ? 'sidebar' : 'main',
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
  const type = analysis.layout.type;
  const allowSidebar = type === 'sidebar-left' || type === 'sidebar-right';
  const isTwoCol = type === 'two-column';

  const main: string[] = [];
  const sidebar: string[] = [];
  const left: string[] = [];
  const right: string[] = [];
  const knownIds = new Set(analysis.sections.map((s) => s.id));
  const hidden = new Set(layout.hidden);

  layout.sections.forEach((p) => {
    if (HEADER_ONLY_IDS.has(p.sectionId)) return;
    if (hidden.has(p.sectionId)) return;
    if (!knownIds.has(p.sectionId)) return;
    if (isTwoCol) {
      (p.column === 'main-left' ? left : right).push(p.sectionId);
      return;
    }
    if (p.column === 'sidebar' && !allowSidebar) {
      main.push(p.sectionId);
      return;
    }
    (p.column === 'sidebar' ? sidebar : main).push(p.sectionId);
  });

  return { main, sidebar, left, right };
}

export function validateLayout(analysis: TemplateAnalysis, custom?: CustomLayout): LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  const baseline = defaultCustomLayout(analysis);
  const baselineMap = new Map(baseline.sections.map((s) => [s.sectionId, colLabel(s.column)]));
  if (!custom) return warnings;

  custom.sections.forEach((s) => {
    const original = baselineMap.get(s.sectionId);
    if (original && original !== colLabel(s.column)) {
      warnings.push({
        sectionId: s.sectionId,
        message: `Moved to the ${colLabel(s.column)} column (template has it in the ${original} column).`,
      });
    }
    if (!HEADER_ONLY_IDS.has(s.sectionId) && custom.hidden.includes(s.sectionId)) {
      warnings.push({
        sectionId: s.sectionId,
        message: 'Section is hidden — it will not appear in the CV.',
      });
    }
  });

  analysis.layout.orderedSections.forEach((id) => {
    if (HEADER_ONLY_IDS.has(id)) return;
    if (!custom.sections.some((s) => s.sectionId === id) && !custom.hidden.includes(id)) {
      warnings.push({
        sectionId: id,
        message: 'Removed from layout — it will not appear in the CV.',
      });
    }
  });

  return warnings;
}