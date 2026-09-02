'use client';

import React from 'react';
import { TemplateAnalysis, TemplateStyle } from '@/types';
import { CustomLayout, resolveLayout } from '@/lib/layout-engine';
import {
  PAGE_W,
  SECTION_ICON,
  autoContrastColor,
  resolveComponentStyle,
  resolveGeometry,
  resolveThemeTokens,
  resolveTypography,
} from '@/lib/template-tokens';

export interface TemplateCVRendererProps {
  analysis: TemplateAnalysis;
  singletonValues: Record<string, string>;
  entries: Record<string, Array<Record<string, string>>>;
  photoUrl?: string;
  styleOverrides?: Partial<TemplateStyle>;
  layoutType?: TemplateAnalysis['layout']['type'];
  customLayout?: CustomLayout;
  zoom?: number;
}

const PAGE_H_PORTRAIT = 1123;
const PAGE_W_LANDSCAPE = 1123;
const PAGE_H_LANDSCAPE = 794;

const PHOTO_SIZES: Record<string, number> = { small: 70, medium: 100, large: 130 };
const PHOTO_RADIUS: Record<string, number | string> = { circle: '50%', square: 0, rounded: 14 };

const BULLET_CHAR: Record<string, string> = {
  dot: '•',
  square: '▪',
  dash: '–',
  arrow: '›',
  line: '—',
};

const ICON_PATHS: Record<string, string> = {
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  briefcase:
    'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M2 20h20 M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14H2z',
  education: 'M22 10 12 5 2 10l10 5 10-5z M6 12v5c3 3 9 3 12 0v-5',
  skills: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  globe: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z M2 12h20',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  award: 'M15.477 12.89 17 22l-5-3-5 3 1.523-9.11 M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12',
  medal:
    'M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15 M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  tag: 'M20.59 13.41 11 3.82A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59A2 2 0 0 0 3.82 11l9.59 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z M7 7h.01',
};

function renderIconPath(name: string, size: number, color: string) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={ICON_PATHS[name] || ICON_PATHS.tag} />
    </svg>
  );
}

export default function TemplateCVRenderer({
  analysis,
  singletonValues,
  entries,
  photoUrl,
  styleOverrides,
  layoutType,
  customLayout,
  zoom = 1,
}: TemplateCVRendererProps) {
  const style: TemplateStyle = {
    ...analysis.style,
    ...(styleOverrides || {}),
    theme: { ...(analysis.style.theme || {}), ...(styleOverrides?.theme || {}) },
    typography: {
      ...(analysis.style.typography || {}),
      ...(styleOverrides?.typography || {}),
    },
    componentStyle: {
      ...(analysis.style.componentStyle || {}),
      ...(styleOverrides?.componentStyle || {}),
    },
  };
  const layout = analysis.layout;
  const resolvedLayout = layoutType || layout.type;
  const cs = resolveComponentStyle(style);
  const theme = resolveThemeTokens(style);
  const typo = resolveTypography(style);
  const geo0 = resolveGeometry(layout, layoutType);

  const pageW = geo0.orientation === 'landscape' ? PAGE_W_LANDSCAPE : PAGE_W;
  const pageH = geo0.orientation === 'landscape' ? PAGE_H_LANDSCAPE : PAGE_H_PORTRAIT;
  const S = pageW / 794;
  const pagePad = {
    top: Math.round(geo0.pagePad.top * S),
    right: Math.round(geo0.pagePad.right * S),
    bottom: Math.round(geo0.pagePad.bottom * S),
    left: Math.round(geo0.pagePad.left * S),
  };
  const railWidth = Math.round(geo0.sidebarWidth * S);
  const colGap = Math.round(geo0.gap * S);
  const verticalGap = Math.round(geo0.verticalGap * S);
  const headerH = geo0.headerHeight ? Math.round(geo0.headerHeight * S) : null;

  const isSidebar = resolvedLayout === 'sidebar-left' || resolvedLayout === 'sidebar-right';
  const sidebarRight = resolvedLayout === 'sidebar-right';
  const isTwoCol = resolvedLayout === 'two-column';
  const hasHeaderBand = Boolean(theme.headerBackground);
  const showPhoto = Boolean(photoUrl);
  const photoShape = layout.photo?.shape || 'square';
  const photoSize = layout.photo?.size || 'medium';
  const photoPos = isSidebar
    ? layout.photo?.position || 'sidebar'
    : layout.photo?.position === 'sidebar'
      ? 'top-center'
      : layout.photo?.position || 'top-center';

  const placement = resolveLayout(analysis, customLayout);
  const mainSections = placement.main;
  const sidebarList = placement.sidebar;
  const visibleSidebarIds = sidebarList.filter((sId) => sectionHasData(sId));

  const fontFamily = typo.body.family;
  const tt = (v: string) => v as React.CSSProperties['textTransform'];

  function sectionHasData(sectionId: string) {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section) return false;
    const fields = analysis.fields.filter((f) => f.section === sectionId);
    if (section.repeatable) {
      return (entries[sectionId] || []).some((e) => fields.some((f) => (e[f.id] || '').trim() !== ''));
    }
    return fields.some((f) => (singletonValues[f.id] || '').trim() !== '');
  }

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
          border: `3px solid ${theme.borderColor}`,
          marginBottom: 12,
          ...alignStyle,
        }}
      />
    );
  };

  const renderEntryBody = (sectionId: string, entry: Record<string, string>, rail: boolean) => {
    const fields = analysis.fields.filter((f) => f.section === sectionId);
    const fg = rail ? theme.sidebarHeadingColor : theme.textColor;
    const size = rail ? typo.sidebarText.size : typo.body.size;
    const lh = rail ? typo.sidebarText.lineHeight : typo.body.lineHeight;
    const char = BULLET_CHAR[cs.bulletStyle] || '•';
    return (
      <>
        {fields.map((field) => {
          const raw = entry[field.id] || '';
          if (!raw.trim()) return null;
          if (field.type === 'textarea') {
            return raw
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, lineIndex) => (
                <p
                  key={`${field.id}-${lineIndex}`}
                  style={{ fontSize: size, fontWeight: 400, lineHeight: lh, marginTop: 2, color: fg, paddingLeft: rail ? 0 : 14 }}
                >
                  {!rail && <span style={{ color: theme.iconColor, marginRight: 4 }}>{char}</span>}
                  {line}
                </p>
              ));
          }
          return (
            <p key={field.id} style={{ fontSize: size, fontWeight: 400, lineHeight: lh, marginTop: 2, color: fg }}>
              {raw}
            </p>
          );
        })}
      </>
    );
  };

  const renderRepeatableSection = (sectionId: string, rail: boolean) => {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section) return null;
    const group = entries[sectionId] || [];
    const titleFs = rail ? typo.sidebarText.size + 0.8 : typo.body.size + 1;
    const titleFg = rail ? theme.sidebarHeadingColor : theme.headingColor;

    if (cs.timeline) {
      return (
        <div style={{ marginBottom: rail ? 14 : 16 }}>
          {group.map((entry, index) => {
            const firstField = analysis.fields
              .filter((f) => f.section === sectionId)
              .find((f) => (entry[f.id] || '').trim());
            const title = firstField ? entry[firstField.id].trim() : `Entry ${index + 1}`;
            return (
              <div key={`${sectionId}-${index}`} style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, width: 14 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.iconColor,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  {index < group.length - 1 && <span style={{ width: 2, flex: 1, backgroundColor: theme.borderColor }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: titleFs, color: titleFg }}>{title}</p>
                  <div>{renderEntryBody(sectionId, entry, rail)}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: rail ? 14 : 16 }}>
        {group.map((entry, index) => {
          const firstField = analysis.fields
            .filter((f) => f.section === sectionId)
            .find((f) => (entry[f.id] || '').trim());
          const title = firstField ? entry[firstField.id].trim() : `Entry ${index + 1}`;
          return (
            <div key={`${sectionId}-${index}`} style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: titleFs, color: titleFg }}>{title}</p>
              {renderEntryBody(sectionId, entry, rail)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSection = (sectionId: string, rail = false, i = 0, total = 1) => {
    const section = analysis.sections.find((s) => s.id === sectionId);
    if (!section || !sectionHasData(sectionId)) return null;

    const isLast = i === total - 1;
    const marginBottom = isLast ? 0 : rail ? Math.round(verticalGap * 0.9) : verticalGap;

    const headingToken = rail ? typo.sidebarHeading : typo.sectionHeading;
    const fallbackHeadingSize = rail ? typo.sidebarHeading.size : typo.sectionHeading.size;
    const headlineColor = rail ? theme.sidebarHeadingColor : theme.headingColor;
    const myVariant = cs.headingVariant;
    const showIcon = cs.icons || myVariant === 'icon';
    const iconName = SECTION_ICON[sectionId] || 'tag';

    const headingBase: React.CSSProperties = {
      fontSize: headingToken.size || fallbackHeadingSize,
      fontWeight: headingToken.weight,
      letterSpacing: headingToken.letterSpacing,
      textTransform: tt(headingToken.textTransform),
      color: myVariant === 'filled' ? '#ffffff' : headlineColor,
      lineHeight: headingToken.lineHeight,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    };

    let heading: React.ReactNode;
    if (myVariant === 'plain') {
      heading = <h2 style={{ ...headingBase, marginBottom: rail ? 6 : 8 }}>{section.name}</h2>;
    } else if (myVariant === 'border') {
      heading = (
        <h2
          style={{
            ...headingBase,
            border: `1.5px solid ${theme.borderColor}`,
            padding: '3px 8px',
            marginBottom: rail ? 6 : 8,
            color: rail ? theme.sidebarHeadingColor : theme.headingColor,
            backgroundColor: rail ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}
        >
          {section.name}
        </h2>
      );
    } else if (myVariant === 'filled') {
      heading = (
        <h2
          style={{
            ...headingBase,
            backgroundColor: theme.borderColor,
            padding: '4px 10px',
            marginBottom: rail ? 6 : 8,
            color: '#ffffff',
          }}
        >
          {section.name}
        </h2>
      );
    } else {
      const borderBottom =
        myVariant === 'dotted' ? `2px dotted ${theme.borderColor}` : `2px solid ${rail ? theme.iconColor : theme.borderColor}`;
      heading = (
        <div
          style={{
            borderBottom,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: rail ? 6 : 8,
            paddingBottom: 3,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {showIcon && renderIconPath(iconName, 12, theme.iconColor)}
            <h2 style={headingBase}>{section.name}</h2>
          </span>
        </div>
      );
    }

    const body = section.repeatable
      ? renderRepeatableSection(sectionId, rail)
      : renderEntryBody(sectionId, singletonValues, rail);

    return (
      <div key={section.id} style={{ marginBottom }}>
        {heading}
        <div>{body}</div>
      </div>
    );
  };

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

  const jobTitle = (() => {
    const personalFields = analysis.fields.filter((f) => f.section === 'personal' || f.section === 'contact');
    const hit = personalFields.find((f) =>
      /title|job|position|role|designation|profession/.test((f.label || '').toLowerCase()),
    );
    if (hit) {
      const v = (singletonValues[hit.id] || '').trim();
      if (v) return v;
    }
    return (singletonValues.jobTitle || singletonValues.title || '').trim();
  })();

  const bandTextColor = autoContrastColor(theme.headerBackground || '#1e293b');
  const photoInRow = showPhoto && (photoPos === 'top-left' || photoPos === 'top-right');

  const headerBand = hasHeaderBand && (
    <div
      style={{
        width: '100%',
        backgroundColor: theme.headerBackground || undefined,
        color: bandTextColor,
        paddingTop: Math.max(pagePad.top, 24),
        paddingBottom: Math.max(pagePad.top, 24),
        paddingRight: pagePad.right,
        paddingLeft: pagePad.left,
        minHeight: headerH || undefined,
        boxSizing: 'border-box',
        textAlign: headerAlign,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: headerAlign === 'center' ? 'center' : headerAlign === 'right' ? 'flex-end' : 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {(photoInRow) && photoEl(photoPos === 'top-right' ? 'right' : undefined)}
        <div>
          <h1
            style={{
              fontFamily: typo.name.family,
              fontSize: typo.name.size,
              fontWeight: typo.name.weight,
              letterSpacing: typo.name.letterSpacing,
              textTransform: tt(typo.name.textTransform),
              lineHeight: typo.name.lineHeight,
              color: bandTextColor,
            }}
          >
            {name}
          </h1>
          {jobTitle && (
            <p style={{ fontFamily: typo.jobTitle.family, fontSize: typo.jobTitle.size, fontWeight: typo.jobTitle.weight, letterSpacing: typo.jobTitle.letterSpacing, textTransform: tt(typo.jobTitle.textTransform), color: bandTextColor, opacity: 0.92, marginTop: 4 }}>
              {jobTitle}
            </p>
          )}
          {contact && (
            <p style={{ fontFamily: typo.body.family, fontSize: typo.body.size, lineHeight: 1.5, color: bandTextColor, opacity: 0.85, marginTop: 8 }}>
              {contact}
            </p>
          )}
        </div>
      </div>
      {showPhoto && photoPos === 'top-center' && <div className="flex justify-center mt-2">{photoEl('center')}</div>}
    </div>
  );

  const inlineHeader = !hasHeaderBand && (
    <div style={{ textAlign: headerAlign, marginBottom: isTwoCol ? 18 : 20, borderBottom: isSidebar ? 'none' : `3px solid ${theme.borderColor}`, paddingBottom: 12 }}>
      {showPhoto && photoPos === 'top-center' && <div className="flex justify-center">{photoEl('center')}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: headerAlign === 'center' ? 'center' : headerAlign === 'right' ? 'flex-end' : 'flex-start', gap: 16 }}>
        {photoInRow && photoEl(photoPos === 'top-right' ? 'right' : undefined)}
        <div>
          <h1 style={{ fontFamily: typo.name.family, fontSize: typo.name.size, fontWeight: typo.name.weight, letterSpacing: typo.name.letterSpacing, textTransform: tt(typo.name.textTransform), color: theme.headingColor }}>
            {name}
          </h1>
          {jobTitle && (
            <p style={{ fontFamily: typo.jobTitle.family, fontSize: typo.jobTitle.size, fontWeight: typo.jobTitle.weight, letterSpacing: typo.jobTitle.letterSpacing, textTransform: tt(typo.jobTitle.textTransform), color: theme.headingColor, marginTop: 4 }}>
              {jobTitle}
            </p>
          )}
          {contact && <p style={{ fontSize: typo.body.size, color: theme.textColor, marginTop: 6 }}>{contact}</p>}
        </div>
      </div>
    </div>
  );

  const twoLeftW = isTwoCol ? Math.max(200, Math.round((pageW - pagePad.left - pagePad.right - colGap) / 2)) : 0;

  const mainContent = (
    <div
      className="w-full h-full"
      style={{
        paddingTop: hasHeaderBand ? pagePad.top : pagePad.top,
        paddingRight: pagePad.right,
        paddingBottom: pagePad.bottom,
        paddingLeft: pagePad.left,
        boxSizing: 'border-box',
      }}
    >
      {inlineHeader}
      {!isTwoCol && mainSections.map((sId, i) => renderSection(sId, false, i, mainSections.length))}
      {isTwoCol && (
        <div className="flex" style={{ gap: colGap }}>
          <div style={{ width: twoLeftW, flexShrink: 0 }}>
            {mainSections.slice(0, Math.ceil(mainSections.length / 2)).map((sId, i, arr) =>
              renderSection(sId, false, i, arr.length),
            )}
          </div>
          <div style={{ flex: 1 }}>
            {mainSections
              .slice(Math.ceil(mainSections.length / 2))
              .map((sId, i, arr) => renderSection(sId, false, i, arr.length))}
          </div>
        </div>
      )}
    </div>
  );

  const rail = (
    <div
      className="flex flex-col h-full"
      style={{
        width: railWidth,
        backgroundColor: theme.sidebarBackground,
        color: theme.sidebarHeadingColor,
        paddingTop: hasHeaderBand ? pagePad.top : pagePad.top,
        paddingRight: Math.max(20, Math.round(pagePad.right * 0.6)),
        paddingBottom: pagePad.bottom,
        paddingLeft: Math.max(20, Math.round(pagePad.left * 0.6)),
        boxSizing: 'border-box',
        fontFamily,
      }}
    >
      {(showPhoto && photoPos === 'sidebar') && <div className="flex justify-center">{photoEl('center')}</div>}
      {visibleSidebarIds.length > 0 && (
        <div>
          {visibleSidebarIds.map((sId, i, arr) => renderSection(sId, true, i, arr.length))}
        </div>
      )}
    </div>
  );

  const mainColumn = (
    <div className="h-full overflow-hidden" style={{ backgroundColor: theme.mainBackground, fontFamily, color: theme.textColor }}>
      {mainContent}
    </div>
  );

  return (
    <div id="cv-print-root">
      <div className="overflow-x-auto pb-2">
        <div
          className="cv-scale mx-auto rounded-lg"
          style={{
            width: pageW * zoom,
            height: pageH * zoom,
            overflow: 'hidden',
            backgroundColor: theme.mainBackground,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="cv-page flex flex-col"
            style={{
              width: pageW,
              minHeight: pageH,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundColor: theme.mainBackground,
              color: theme.textColor,
              fontFamily,
            }}
          >
            {hasHeaderBand && headerBand}
            <div className="flex flex-1">
              {isSidebar ? (
                <>
                  {!sidebarRight && rail}
                  <div style={{ flex: 1, minWidth: 0 }}>{mainColumn}</div>
                  {sidebarRight && rail}
                </>
              ) : (
                <div className="flex-1">{mainColumn}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}