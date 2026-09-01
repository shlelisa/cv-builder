'use client';

import { TemplateAnalysis, TemplateStyle } from '@/types';

export interface TemplateCVRendererProps {
  analysis: TemplateAnalysis;
  singletonValues: Record<string, string>;
  entries: Record<string, Array<Record<string, string>>>;
  photoUrl?: string;
  styleOverrides?: Partial<TemplateStyle>;
  layoutType?: TemplateAnalysis['layout']['type'];
  zoom?: number;
}

const PAGE_W = 794;
const PAGE_H = 1123;
const PHOTO_SIZES: Record<string, number> = { small: 70, medium: 100, large: 130 };
const PHOTO_RADIUS: Record<string, number | string> = { circle: '50%', square: 0, rounded: 14 };
const PERSONAL_IDS = new Set(['personal', 'contact']);

export default function TemplateCVRenderer({
  analysis,
  singletonValues,
  entries,
  photoUrl,
  styleOverrides,
  layoutType,
  zoom = 1,
}: TemplateCVRendererProps) {
  const style = { ...analysis.style, ...(styleOverrides || {}) };
  const layout = analysis.layout;
  const resolvedLayout = layoutType || layout.type;
  const showPhoto = Boolean(photoUrl) && Boolean(layout.photo?.included);
  const photoShape = layout.photo?.shape || 'square';
  const photoSize = layout.photo?.size || 'medium';

  const photoEl = (align?: 'center' | 'left' | 'right') => {
    if (!showPhoto) return null;
    const size = PHOTO_SIZES[photoSize];
    const alignStyle =
      align === 'center'
        ? { margin: '0 auto' }
        : align === 'right'
          ? { marginLeft: 'auto' }
          : undefined;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt="Profile"
        className="block"
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: PHOTO_RADIUS[photoShape] ?? 0,
          border: `3px solid ${style.accentColor}`,
          marginBottom: 12,
          ...alignStyle,
        }}
      />
    );
  };

  const sectionHasData = (sectionId: string) => {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section) return false;
    const fields = analysis.fields.filter((f) => f.section === sectionId);
    if (section.repeatable) {
      return (entries[sectionId] || []).some((e) =>
        fields.some((f) => (e[f.id] || '').trim() !== ''),
      );
    }
    return fields.some((f) => (singletonValues[f.id] || '').trim() !== '');
  };

  const renderEntryBody = (sectionId: string, entry: Record<string, string>) => {
    const fields = analysis.fields.filter((f) => f.section === sectionId);
    const nodes: React.ReactNode[] = [];
    fields.forEach((field) => {
      const raw = entry[field.id] || '';
      if (!raw.trim()) return;
      if (field.type === 'textarea') {
        raw
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((line, lineIndex) => {
            nodes.push(
              <p key={`${field.id}-${lineIndex}`} className="pl-3" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2 }}>
                • {line}
              </p>,
            );
          });
      } else {
        nodes.push(
          <p key={field.id} style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2 }}>
            {raw}
          </p>,
        );
      }
    });
    return <>{nodes}</>;
  };

  const renderRepeatableSection = (sectionId: string, rail: boolean) => {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section) return null;
    const group = entries[sectionId] || [];
    return (
      <div style={{ marginBottom: rail ? 18 : 20 }}>
        {group.map((entry, index) => {
          const firstField = analysis.fields
            .filter((f) => f.section === sectionId)
            .find((f) => (entry[f.id] || '').trim());
          const title = firstField ? entry[firstField.id].trim() : `Entry ${index + 1}`;
          return (
            <div key={`${sectionId}-${index}`} style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: rail ? style.secondaryColor : style.textColor }}>
                {title}
              </p>
              {renderEntryBody(sectionId, entry)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSection = (sectionId: string, rail = false) => {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section || !sectionHasData(sectionId)) return null;

    const headingStyle: React.CSSProperties = {
      fontSize: rail ? 11 : 13,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: rail ? style.secondaryColor : style.primaryColor,
      paddingBottom: 4,
    };

    let heading: React.ReactNode;
    if (style.sectionDivider === 'line') {
      heading = (
        <div style={{ borderBottom: `2px solid ${rail ? style.accentColor : style.primaryColor}`, marginBottom: rail ? 8 : 10 }}>
          <h2 style={headingStyle}>{section.name}</h2>
        </div>
      );
    } else if (style.sectionDivider === 'border') {
      heading = (
        <h2
          style={{
            ...headingStyle,
            border: `1.5px solid ${style.accentColor}`,
            backgroundColor: rail ? '#ffffff22' : style.secondaryColor,
            padding: '4px 8px',
            marginBottom: rail ? 8 : 10,
            color: rail ? '#f8fafc' : style.textColor,
          }}
        >
          {section.name}
        </h2>
      );
    } else {
      heading = (
        <h2 style={{ ...headingStyle, marginBottom: rail ? 8 : 10 }}>{section.name}</h2>
      );
    }

    const body = section.repeatable
      ? renderRepeatableSection(sectionId, rail)
      : renderEntryBody(sectionId, singletonValues);

    return (
      <div style={{ marginBottom: rail ? 16 : 18 }}>
        {heading}
        <div>{body}</div>
      </div>
    );
  };

  const isSidebar = resolvedLayout === 'sidebar-left' || resolvedLayout === 'sidebar-right';
  const sidebarRight = resolvedLayout === 'sidebar-right';
  const isTwoCol = resolvedLayout === 'two-column';
  const photoPos = isSidebar
    ? layout.photo?.position || 'sidebar'
    : layout.photo?.position === 'sidebar'
      ? 'top-center'
      : layout.photo?.position || 'top-center';

  const sidebarSectionIds = new Set(layout.sidebarSections || []);
  const hasSidebarSection = (sectionId: string) => sidebarSectionIds.has(sectionId);

  const orderedDivisible = layout.orderedSections.filter(
    (sId) => !PERSONAL_IDS.has(sId) && !hasSidebarSection(sId),
  );
  const twoColMid = Math.ceil(orderedDivisible.length / 2);
  const twoLeft = orderedDivisible.slice(0, twoColMid);
  const twoRight = orderedDivisible.slice(twoColMid);

  const visibleSidebarIds = layout.orderedSections.filter(
    (sId) => hasSidebarSection(sId) && sectionHasData(sId),
  );
  const mainSections = layout.orderedSections.filter(
    (sId) => !PERSONAL_IDS.has(sId) && !hasSidebarSection(sId),
  );

  const headerAlign =
    style.headerStyle === 'centered'
      ? ('center' as const)
      : style.headerStyle === 'right-aligned'
        ? ('right' as const)
        : ('left' as const);

  const name = (singletonValues.fullName || '').trim() || 'Your Name';
  const contact = [singletonValues.email, singletonValues.phone, singletonValues.location]
    .filter((v) => v && v.trim())
    .join('  |  ');
  const quote = singletonValues.summary || singletonValues.professionalSummary || '';

  const photoInRow = showPhoto && (photoPos === 'top-left' || photoPos === 'top-right');
  const photoCenteredAbove = showPhoto && photoPos === 'top-center';

  const headerBlock = (
    <div
      style={{
        textAlign: headerAlign,
        marginBottom: isTwoCol ? 18 : 20,
        borderBottom: isSidebar ? 'none' : `3px solid ${style.primaryColor}`,
        paddingBottom: 12,
      }}
    >
      {photoCenteredAbove && <div className="flex justify-center">{photoEl('center')}</div>}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            headerAlign === 'center' ? 'center' : headerAlign === 'right' ? 'flex-end' : 'flex-start',
          gap: 16,
        }}
      >
        {photoInRow && photoEl(photoPos === 'top-right' ? 'right' : undefined)}
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: style.textColor,
            }}
          >
            {name}
          </h1>
          {contact && (
            <p style={{ fontSize: 11, color: style.textColor, marginTop: 6 }}>{contact}</p>
          )}
        </div>
      </div>
      {quote && (
        <p style={{ fontSize: 11.5, marginTop: 12, color: style.textColor }}>{quote}</p>
      )}
    </div>
  );

  const mainContent = (
    <div className="w-full h-full" style={{ padding: 40 }}>
      {headerBlock}
      {!isTwoCol && mainSections.map((sId) => renderSection(sId))}
      {isTwoCol && (
        <div className="flex" style={{ gap: 28 }}>
          <div className="flex-1">{twoLeft.map((sId) => renderSection(sId))}</div>
          <div className="flex-1">{twoRight.map((sId) => renderSection(sId))}</div>
        </div>
      )}
    </div>
  );

  const rail = (
    <div
      className="flex flex-col h-full"
      style={{
        width: 216,
        backgroundColor: style.secondaryColor,
        color: '#f8fafc',
        padding: 28,
        boxSizing: 'border-box',
      }}
    >
      {photoPos === 'sidebar' ? (
        <div className="flex justify-center">{photoEl('center')}</div>
      ) : null}
      {visibleSidebarIds.length > 0 && (
        <div className="space-y-6">
          {visibleSidebarIds.map((sId) => (
            <div key={sId}>{renderSection(sId, true)}</div>
          ))}
        </div>
      )}
    </div>
  );

  const mainColumn = (
    <div className="h-full overflow-hidden" style={{ backgroundColor: style.backgroundColor }}>
      {mainContent}
    </div>
  );

  return (
    <div id="cv-print-root">
      <div className="overflow-x-auto pb-2">
        <div
          className="cv-scale mx-auto rounded-lg"
          style={{
            width: PAGE_W * zoom,
            height: PAGE_H * zoom,
            overflow: 'hidden',
            backgroundColor: style.backgroundColor,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="cv-page flex"
            style={{
              width: PAGE_W,
              minHeight: PAGE_H,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundColor: style.backgroundColor,
              color: style.textColor,
              fontFamily: style.fontFamily,
            }}
          >
            {isSidebar ? (
              <>
                {!sidebarRight && rail}
                {mainColumn}
                {sidebarRight && rail}
              </>
            ) : (
              mainColumn
            )}
          </div>
        </div>
      </div>
    </div>
  );
}