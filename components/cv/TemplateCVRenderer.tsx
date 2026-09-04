'use client';

import React from 'react';
import { TemplateAnalysis, TemplateField, TemplateStyle } from '@/types';
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
  layoutOverrides?: Partial<TemplateAnalysis['layout']>;
  customLayout?: CustomLayout;
  zoom?: number;
  onPhotoClick?: () => void;
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

/**
 * Strips leading dashes, dots, bullets, and combos like "- .", "-.", "• ", "* "
 * so that AI-generated bullet points render cleanly without duplicate bullet characters.
 */
export function cleanBulletText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[\s\-\*\•\–\—\.\·\›\>\o\u2022\u2023\u25E6\u2043\u2219]+[\s\.\-]*/, '')
    .trim();
}

const ICON_PATHS: Record<string, string> = {
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  code: 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
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

function getContactIcon(field: TemplateField): string {
  const text = `${field.id} ${field.label}`.toLowerCase();
  if (text.includes('phone') || text.includes('tel') || text.includes('mobile')) return 'phone';
  if (text.includes('mail') || text.includes('email')) return 'mail';
  if (text.includes('address') || text.includes('location') || text.includes('city')) return 'pin';
  if (text.includes('linkedin')) return 'linkedin';
  if (text.includes('github') || text.includes('code')) return 'code';
  if (text.includes('web') || text.includes('site') || text.includes('portfolio') || text.includes('link')) return 'globe';
  return 'tag';
}

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
  layoutOverrides,
  customLayout,
  zoom = 1,
  onPhotoClick,
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
  const layout: TemplateAnalysis['layout'] = {
    ...analysis.layout,
    ...(layoutOverrides || {}),
  };
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
  const sidebarCol = layout.columns?.find((c) => c.id === 'sidebar');
  const sidebarPadH = typeof sidebarCol?.padding === 'number' ? Math.round(sidebarCol.padding * S) : Math.max(18, Math.round(pagePad.right * 0.6));

  const isSidebar = resolvedLayout === 'sidebar-left' || resolvedLayout === 'sidebar-right';
  const sidebarRight = resolvedLayout === 'sidebar-right';
  const isTwoCol = resolvedLayout === 'two-column';
  const hasHeaderBand = Boolean(theme.headerBackground);
  const showPhoto = layout.photo?.included ?? Boolean(photoUrl);
  const photoShape = layout.photo?.shape || 'circle';
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
  const leftSections = placement.left;
  const rightSections = placement.right;

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
    const size = PHOTO_SIZES[photoSize] || 100;
    const alignStyle =
      align === 'center'
        ? { margin: '0 auto' }
        : align === 'right'
          ? { marginLeft: 'auto' }
          : undefined;

    const borderColor =
      theme.sidebarBackground === '#ffffff'
        ? theme.borderColor || '#cbd5e1'
        : 'rgba(255, 255, 255, 0.45)';

    const photoMargin = photoPos === 'sidebar' ? 20 : 16;

    if (photoUrl) {
      return (
        <div
          onClick={onPhotoClick}
          className={onPhotoClick ? 'cursor-pointer group relative' : undefined}
          title={onPhotoClick ? 'Click to change photo' : undefined}
          style={{ width: size, height: size, marginBottom: photoMargin, ...alignStyle }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Profile"
            className="block w-full h-full"
            style={{
              width: size,
              height: size,
              objectFit: 'cover',
              borderRadius: PHOTO_RADIUS[photoShape] ?? '50%',
              border: photoShape === 'circle' ? '4px solid #ffffff' : `3px solid ${borderColor}`,
              boxShadow: photoShape === 'circle' ? '0 6px 20px rgba(0,0,0,0.18)' : '0 4px 14px rgba(0,0,0,0.12)',
            }}
          />
          {onPhotoClick && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold print:hidden">
              📷 Change
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        onClick={onPhotoClick}
        className={onPhotoClick ? 'cursor-pointer group transition-transform hover:scale-105' : undefined}
        title={onPhotoClick ? 'Click to upload photo' : 'Photo'}
        style={{
          width: size,
          height: size,
          borderRadius: PHOTO_RADIUS[photoShape] ?? '50%',
          border: photoShape === 'circle' ? '4px solid #ffffff' : `3px solid ${borderColor}`,
          boxShadow: photoShape === 'circle' ? '0 6px 20px rgba(0,0,0,0.14)' : '0 4px 12px rgba(0,0,0,0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: photoMargin,
          color: theme.sidebarHeadingColor || theme.iconColor || '#64748b',
          position: 'relative',
          ...alignStyle,
        }}
      >
        <span style={{ opacity: 0.85 }}>
          {renderIconPath('user', Math.round(size * 0.44), theme.sidebarHeadingColor || theme.iconColor || '#64748b')}
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: style.accentColor || '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          className="print:hidden"
        >
          📷
        </span>
      </div>
    );
  };

  const renderEntryBody = (
    sectionId: string,
    entry: Record<string, string>,
    rail: boolean,
    skipFieldIds: Set<string> = new Set(),
  ) => {
    const fields = analysis.fields.filter((f) => f.section === sectionId && !skipFieldIds.has(f.id));
    const fg = rail ? theme.sidebarHeadingColor : theme.textColor;
    const size = rail ? typo.sidebarText.size : typo.body.size;
    const lh = rail ? typo.sidebarText.lineHeight : typo.body.lineHeight;
    const char = BULLET_CHAR[cs.bulletStyle] || '•';
    const isContactSec = sectionId.toLowerCase().includes('contact');

    return (
      <>
        {fields.map((field) => {
          const raw = entry[field.id] || '';
          if (!raw.trim()) return null;

          if (isContactSec) {
            const icon = getContactIcon(field);
            return (
              <div
                key={field.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 5,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: rail ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.iconColor || theme.sidebarHeadingColor,
                    flexShrink: 0,
                  }}
                >
                  {renderIconPath(icon, 11, theme.iconColor || theme.sidebarHeadingColor)}
                </span>
                <span
                  style={{
                    fontSize: size,
                    fontWeight: 400,
                    color: fg,
                    wordBreak: 'break-word',
                    flex: 1,
                    minWidth: 0,
                    lineHeight: 1.35,
                  }}
                >
                  {raw}
                </span>
              </div>
            );
          }

          if (sectionId === 'personalInfo') {
            return (
              <p key={field.id} style={{ fontSize: size, fontWeight: 400, lineHeight: 1.5, marginTop: 1, color: fg }}>
                <strong style={{ fontWeight: 700 }}>{field.label}: </strong>{raw}
              </p>
            );
          }

          if (field.type === 'textarea') {
            const isPlainColonList = sectionId === 'technicalSkills';
            return raw
              .split(/\s*\|\s*|\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, lineIndex) => {
                if (isPlainColonList) {
                  const colonIdx = line.indexOf(':');
                  if (colonIdx > 0) {
                    const prefix = line.substring(0, colonIdx + 1);
                    const rest = line.substring(colonIdx + 1);
                    return (
                      <p key={`${field.id}-${lineIndex}`} style={{ fontSize: size, lineHeight: lh, marginTop: 3, color: fg }}>
                        <strong style={{ fontWeight: 700 }}>{prefix}</strong>{rest}
                      </p>
                    );
                  }
                  return (
                    <p key={`${field.id}-${lineIndex}`} style={{ fontSize: size, lineHeight: lh, marginTop: 3, color: fg }}>
                      {line}
                    </p>
                  );
                }

                return (
                  <div
                    key={`${field.id}-${lineIndex}`}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 7,
                      marginTop: 2,
                      marginBottom: 2,
                      fontSize: size,
                      color: fg,
                      lineHeight: lh,
                      paddingLeft: rail ? 2 : 12,
                    }}
                  >
                    <span
                      style={{
                        color: theme.iconColor || fg,
                        fontSize: 9,
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {rail ? '•' : char}
                    </span>
                    <span style={{ fontWeight: 400 }}>{cleanBulletText(line)}</span>
                  </div>
                );
              });
          }

          if (rail && (sectionId.toLowerCase().includes('skill') || sectionId.toLowerCase().includes('language'))) {
            return (
              <div key={field.id} style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3, marginBottom: 3 }}>
                <span style={{ color: theme.iconColor || fg, fontSize: 10, lineHeight: 1, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: size, fontWeight: 400, lineHeight: lh, color: fg }}>{cleanBulletText(raw)}</span>
              </div>
            );
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
    const fg = rail ? theme.sidebarHeadingColor : theme.textColor;

    return (
      <div style={{ marginBottom: rail ? 12 : 16 }}>
        {group.map((entry, index) => {
          const sectionFields = analysis.fields.filter((f) => f.section === sectionId);
          const firstField = sectionFields.find((f) => (entry[f.id] || '').trim());
          const title = firstField ? entry[firstField.id].trim() : `Entry ${index + 1}`;

          // Find date field to display right-aligned beside title
          const dateField = sectionFields.find(
            (f) =>
              f.id !== firstField?.id &&
              /date|year|duration|period|time/i.test(`${f.id} ${f.label}`) &&
              (entry[f.id] || '').trim(),
          );
          const dateText = dateField ? (entry[dateField.id] || '').trim() : '';

          const skipIds = new Set<string>();
          if (firstField) skipIds.add(firstField.id);

          if (rail) {
            return (
              <div key={`${sectionId}-${index}`} style={{ marginBottom: 9, paddingBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: titleFs, color: titleFg, marginBottom: 2 }}>{title}</p>
                {dateText && (
                  <p style={{ fontSize: Math.max(9, titleFs - 1.5), color: fg, opacity: 0.8, marginBottom: 2 }}>
                    {dateText}
                  </p>
                )}
                <div>{renderEntryBody(sectionId, entry, rail, skipIds)}</div>
              </div>
            );
          }
          if (dateField) skipIds.add(dateField.id);

          if (cs.timeline) {
            return (
              <div key={`${sectionId}-${index}`} style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, width: 14 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: `1.5px solid ${theme.headingColor || '#2c3848'}`,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  {index < group.length - 1 && <span style={{ width: 1.5, flex: 1, backgroundColor: '#cbd5e1' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: titleFs, color: titleFg }}>{title}</p>
                    {dateText && (
                      <span style={{ fontSize: Math.max(10, titleFs - 1.5), color: theme.textColor, opacity: 0.8, fontWeight: 500 }}>
                        {dateText}
                      </span>
                    )}
                  </div>
                  <div>{renderEntryBody(sectionId, entry, rail, skipIds)}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={`${sectionId}-${index}`} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}>
                <p style={{ fontWeight: 700, fontSize: titleFs, color: titleFg }}>{title}</p>
                {dateText && (
                  <span style={{ fontSize: Math.max(10, titleFs - 1.5), color: theme.textColor, opacity: 0.8, fontWeight: 500 }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div>{renderEntryBody(sectionId, entry, rail, skipIds)}</div>
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
    } else if (!rail) {
      // Main Column: Icon Badge (if cs.icons) + Section Heading + Border Divider
      heading = (
        <div
          style={{
            borderBottom: `1.5px solid ${theme.borderColor || theme.headingColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            paddingBottom: 2,
          }}
        >
          {cs.icons && (
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: theme.headingColor || style.primaryColor || '#1e293b',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {renderIconPath(iconName, 13, '#ffffff')}
            </span>
          )}
          <h2 style={headingBase}>{section.name}</h2>
        </div>
      );
    } else {
      // Sidebar Rail: Icon + Section Heading + Underline
      heading = (
        <div
          style={{
            borderBottom: `1.5px solid ${theme.iconColor || theme.sidebarHeadingColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
            paddingBottom: 4,
          }}
        >
          <span style={{ color: theme.iconColor || theme.sidebarHeadingColor, flexShrink: 0 }}>
            {renderIconPath(iconName, 13, theme.iconColor || theme.sidebarHeadingColor)}
          </span>
          <h2 style={headingBase}>{section.name}</h2>
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

  const name = (() => {
    const personalFields = analysis.fields.filter((f) => f.section === 'personal' || f.section === 'contact');
    const nameField = personalFields.find((f) =>
      /^(full[_-]?name|name|firstName|first[_-]?name)$/i.test(f.id) ||
      /\b(full\s*name|name|first\s*name)\b/i.test((f.label || '')),
    );
    if (nameField) {
      const v = (singletonValues[nameField.id] || '').trim();
      if (v) return v;
    }
    return (singletonValues.fullName || singletonValues.name || singletonValues.full_name || '').trim() || 'Your Name';
  })();

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

  const nameFieldIds = new Set<string>();
  const titleFieldIds = new Set<string>();
  {
    const personalFields = analysis.fields.filter((f) => f.section === 'personal' || f.section === 'contact');
    personalFields.forEach((f) => {
      const lbl = (f.label || '').toLowerCase();
      const fid = (f.id || '').toLowerCase();
      if (/\b(full\s*name|name|first\s*name)\b/.test(lbl) || /^(full[_-]?name|name|firstName|first[_-]?name)$/i.test(fid)) {
        nameFieldIds.add(f.id);
      }
      if (/title|job|position|role|designation|profession/.test(lbl)) {
        titleFieldIds.add(f.id);
      }
    });
  }
  // Collect ALL contact-like fields from personal/contact sections, excluding name/title/photo/summary
  const contactLines = (() => {
    const personalFields = analysis.fields.filter((f) => f.section === 'personal' || f.section === 'contact');
    const skipIds = new Set([...nameFieldIds, ...titleFieldIds]);
    const lines: string[] = [];
    personalFields.forEach((f) => {
      if (skipIds.has(f.id)) return;
      const lbl = (f.label || '').toLowerCase();
      // Skip photo, summary/about fields — they aren't contact info
      if (/photo|image|avatar|picture|summary|about|objective|profile\s*summary/.test(lbl)) return;
      if (f.type === 'textarea') return;
      const v = (singletonValues[f.id] || '').trim();
      if (v) lines.push(v);
    });
    const hasContactSection = analysis.sections.some(
      (s) => (s.id.toLowerCase().includes('contact') || s.name.toLowerCase().includes('contact')) && sectionHasData(s.id),
    );
    if (hasContactSection) return [];
    return lines;
  })();

  const bandTextColor = autoContrastColor(theme.headerBackground || '#1e293b');
  const photoInRow = showPhoto && (photoPos === 'top-left' || photoPos === 'top-right');

  const isFullWidthHeader =
    resolvedLayout === 'single-column' ||
    resolvedLayout === 'two-column' ||
    layout.headerPlacement === 'top-full-width' ||
    style.headerStyle === 'banner-full' ||
    (isSidebar &&
      layout.headerPlacement !== 'main-column' &&
      layout.headerPlacement !== 'sidebar-top' &&
      (hasHeaderBand || style.headerStyle === 'centered'));

  const renderHeaderContent = (forMainCol = false) => (
    <div
      style={{
        width: '100%',
        backgroundColor: theme.headerBackground || undefined,
        color: bandTextColor,
        paddingTop: Math.max(pagePad.top, 22),
        paddingBottom: Math.max(pagePad.top, 22),
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
          gap: 24,
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {(!forMainCol || photoPos !== 'sidebar') && photoInRow && photoEl(photoPos === 'top-right' ? 'right' : undefined)}
        <div style={{ textAlign: headerAlign, width: headerAlign === 'center' ? '100%' : undefined }}>
          <h1
            style={{
              fontFamily: typo.name.family,
              fontSize: typo.name.size,
              fontWeight: typo.name.weight,
              letterSpacing: typo.name.letterSpacing,
              textTransform: tt(typo.name.textTransform),
              lineHeight: typo.name.lineHeight,
              color: bandTextColor,
              textAlign: headerAlign,
            }}
          >
            {name}
          </h1>
          {jobTitle && (
            <p style={{ fontFamily: typo.jobTitle.family, fontSize: typo.jobTitle.size, fontWeight: typo.jobTitle.weight, letterSpacing: typo.jobTitle.letterSpacing, textTransform: tt(typo.jobTitle.textTransform), color: bandTextColor, opacity: 0.92, marginTop: 4, textAlign: headerAlign }}>
              {jobTitle}
            </p>
          )}
          {contactLines.length > 0 && (
            <p style={{ fontFamily: typo.body.family, fontSize: typo.body.size, lineHeight: 1.6, color: bandTextColor, opacity: 0.85, marginTop: 8, textAlign: headerAlign }}>
              {contactLines.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
      {(!forMainCol || photoPos !== 'sidebar') && showPhoto && photoPos === 'top-center' && <div className="flex justify-center mt-3 mb-2">{photoEl('center')}</div>}
    </div>
  );

  const headerBand = hasHeaderBand && renderHeaderContent(false);
  const mainColHeaderBand = hasHeaderBand && renderHeaderContent(true);

  const inlineHeader = !hasHeaderBand && !layout.hideInlineHeader && (
    <div style={{ textAlign: headerAlign, width: '100%', marginBottom: isTwoCol ? 18 : 22, borderBottom: isSidebar && !isFullWidthHeader ? 'none' : `3px solid ${theme.borderColor}`, paddingBottom: 14 }}>
      {showPhoto && photoPos === 'top-center' && <div className="flex justify-center mb-3">{photoEl('center')}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: headerAlign === 'center' ? 'center' : headerAlign === 'right' ? 'flex-end' : 'flex-start', gap: 24, width: '100%' }}>
        {photoInRow && photoEl(photoPos === 'top-right' ? 'right' : undefined)}
        <div style={{ textAlign: headerAlign, width: headerAlign === 'center' ? '100%' : undefined }}>
          <h1 style={{ fontFamily: typo.name.family, fontSize: typo.name.size, fontWeight: typo.name.weight, letterSpacing: typo.name.letterSpacing, textTransform: tt(typo.name.textTransform), color: theme.headingColor, textAlign: headerAlign }}>
            {name}
          </h1>
          {jobTitle && (
            <p style={{ fontFamily: typo.jobTitle.family, fontSize: typo.jobTitle.size, fontWeight: typo.jobTitle.weight, letterSpacing: typo.jobTitle.letterSpacing, textTransform: tt(typo.jobTitle.textTransform), color: theme.headingColor, marginTop: 4, textAlign: headerAlign }}>
              {jobTitle}
            </p>
          )}
          {contactLines.length > 0 && (
            <p style={{ fontSize: typo.body.size, lineHeight: 1.6, color: theme.textColor, marginTop: 8, textAlign: headerAlign }}>
              {contactLines.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const twoLeftW = isTwoCol
    ? Math.max(200, Math.round((geo0.mainWidth > 0 && geo0.mainWidth < PAGE_W ? geo0.mainWidth / PAGE_W : 0.5) * (pageW - pagePad.left - pagePad.right - colGap)))
    : 0;

  const mainContent = (
    <div
      className="w-full h-full"
      style={{
        paddingTop: isFullWidthHeader ? Math.min(22, Math.round(pagePad.top * 0.9)) : isSidebar && hasHeaderBand ? 20 : pagePad.top,
        paddingRight: pagePad.right,
        paddingBottom: pagePad.bottom,
        paddingLeft: pagePad.left,
        boxSizing: 'border-box',
      }}
    >
      {!isFullWidthHeader && inlineHeader}
      {!isTwoCol && mainSections.map((sId, i) => renderSection(sId, false, i, mainSections.length))}
      {isTwoCol && (
        <div className="flex" style={{ gap: colGap }}>
          <div style={{ width: twoLeftW, flexShrink: 0 }}>
            {leftSections.map((sId, i, arr) => renderSection(sId, false, i, arr.length))}
          </div>
          <div style={{ flex: 1 }}>
            {rightSections.map((sId, i, arr) => renderSection(sId, false, i, arr.length))}
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
        paddingTop: isFullWidthHeader ? Math.min(22, Math.round(pagePad.top * 0.9)) : Math.round(geo0.columnTopPad * S),
        paddingRight: sidebarPadH,
        paddingBottom: pagePad.bottom,
        paddingLeft: sidebarPadH,
        height: '100%',
        boxSizing: 'border-box',
        fontFamily,
      }}
    >
      {showPhoto && photoPos === 'sidebar' && <div className="flex justify-center mb-4">{photoEl('center')}</div>}
      {visibleSidebarIds.length > 0 && (
        <div>
          {visibleSidebarIds.map((sId, i, arr) => renderSection(sId, true, i, arr.length))}
        </div>
      )}
    </div>
  );

  const mainColumn = (
    <div className="h-full overflow-hidden flex flex-col" style={{ backgroundColor: theme.mainBackground, fontFamily, color: theme.textColor }}>
      {!isFullWidthHeader && isSidebar && hasHeaderBand && mainColHeaderBand}
      <div className="flex-1">{mainContent}</div>
    </div>
  );

  return (
    <div className="w-fit min-w-full pb-4 flex flex-col items-center">
      {/* A4 Paper Indicator Badge - Outside of print root */}
      <div
        className="print-hide flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-2 px-1 select-none"
        style={{ width: pageW * zoom }}
      >
        <span className="inline-flex items-center gap-1.5 font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
          <span>📄</span>
          <span>A4 Document · 210 × 297 mm</span>
        </span>
        <span className="text-[11px] opacity-75 font-mono">100% Single-Page A4</span>
      </div>

      <div id="cv-print-root">
        <div
          className="cv-scale transition-all"
          style={{
            width: pageW * zoom,
            height: pageH * zoom,
            backgroundColor: theme.mainBackground,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="cv-page flex flex-col"
            style={{
              width: pageW,
              height: pageH,
              minHeight: pageH,
              maxHeight: pageH,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundColor: theme.mainBackground,
              color: theme.textColor,
              fontFamily,
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {isFullWidthHeader && (hasHeaderBand ? headerBand : inlineHeader)}
            <div className="flex flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>
              {isSidebar ? (
                <>
                  {!sidebarRight && rail}
                  <div style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>{mainColumn}</div>
                  {sidebarRight && rail}
                </>
              ) : (
                <div className="flex-1" style={{ overflow: 'hidden', height: '100%' }}>{mainColumn}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}