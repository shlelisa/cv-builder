'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import TemplateCVRenderer from '@/components/cv/TemplateCVRenderer';
import { STATIC_TEMPLATES, StaticTemplateDefinition } from '@/lib/static-templates';
import { exportToPdf, exportToWord, exportToImage } from '@/lib/export-utils';
import { TemplateField, TemplateSection, TemplateStyle } from '@/types';

type CategoryFilter = 'All' | 'Executive' | 'Corporate' | 'Tech' | 'Academic' | 'Minimalist';

interface PresetPalette {
  name: string;
  primary: string;
  sidebar: string;
  header?: string;
  accent: string;
}

const PRESET_PALETTES: PresetPalette[] = [
  { name: 'Plum & Mauve', primary: '#4c1728', sidebar: '#f5f0f3', header: '#4c1728', accent: '#4c1728' },
  { name: 'Corporate Navy', primary: '#142b42', sidebar: '#142b42', header: '#142b42', accent: '#2563eb' },
  { name: 'Emerald Forest', primary: '#064e3b', sidebar: '#064e3b', header: '#064e3b', accent: '#059669' },
  { name: 'Charcoal Slate', primary: '#27272a', sidebar: '#27272a', header: '#27272a', accent: '#3b82f6' },
  { name: 'Cobalt Modern', primary: '#1e3a8a', sidebar: '#f0f4f8', header: '#1e3a8a', accent: '#2563eb' },
  { name: 'Monochrome ATS', primary: '#09090b', sidebar: '#18181b', header: '#09090b', accent: '#71717a' },
];

const FONT_OPTIONS = [
  { id: 'Inter, sans-serif', label: 'Inter', category: 'Clean Modern' },
  { id: 'Roboto, sans-serif', label: 'Roboto', category: 'Versatile Sans' },
  { id: 'Outfit, sans-serif', label: 'Outfit', category: 'Geometric Modern' },
  { id: 'Merriweather, serif', label: 'Merriweather', category: 'Classic Editorial' },
  { id: "'Playfair Display', serif", label: 'Playfair Display', category: 'Prestigious Serif' },
  { id: 'Georgia, serif', label: 'Georgia', category: 'Academic Serif' },
  { id: 'Arial, sans-serif', label: 'Arial', category: 'Universal ATS' },
];

function isDarkHex(hex?: string): boolean {
  if (!hex || hex === 'transparent') return false;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return false;
}

const BASE_INPUT_CLASS =
  'w-full px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100';

export default function CVBuilder() {
  const { t } = useApp();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  // Form values state
  const [singletonValues, setSingletonValues] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<Record<string, Array<Record<string, string>>>>({});
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // UI state
  const [activeSectionId, setActiveSectionId] = useState<string>('personal');
  const [zoom, setZoom] = useState<number>(0.8);
  const [viewMode, setViewMode] = useState<'split' | 'fullA4'>('split');
  const [editorTab, setEditorTab] = useState<'content' | 'design'>('content');
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [styleOverrides, setStyleOverrides] = useState<Partial<TemplateStyle>>({});
  const [fontScale, setFontScale] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const selectedTemplate = useMemo(() => {
    return STATIC_TEMPLATES.find((tpl) => tpl.id === selectedTemplateId) || null;
  }, [selectedTemplateId]);

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === 'All') return STATIC_TEMPLATES;
    return STATIC_TEMPLATES.filter((tpl) => tpl.category === categoryFilter);
  }, [categoryFilter]);

  // Select a template and populate with starter data if empty
  const handleSelectTemplate = (template: StaticTemplateDefinition) => {
    setSelectedTemplateId(template.id);
    setStyleOverrides({});
    setFontScale('standard');
    setEditorTab('content');

    // If user hasn't typed their name yet, prefill starter data
    const hasExistingData = Boolean(
      singletonValues.fullName ||
        singletonValues.name ||
        Object.keys(entries).some((k) => entries[k]?.length > 0),
    );

    if (!hasExistingData) {
      setSingletonValues({ ...template.defaultSingleton });
      setEntries(JSON.parse(JSON.stringify(template.defaultEntries)));
    } else {
      // Merge with template defaults for any missing fields
      setSingletonValues((prev) => ({
        ...template.defaultSingleton,
        ...prev,
      }));
      setEntries((prev) => ({
        ...template.defaultEntries,
        ...prev,
      }));
    }

    if (template.analysis.sections[0]) {
      setActiveSectionId(template.analysis.sections[0].id);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tplParam = params.get('template');
      if (tplParam) {
        const found = STATIC_TEMPLATES.find((t) => t.id === tplParam);
        if (found) {
          handleSelectTemplate(found);
        }
      }
    }
  }, []);

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        if (photoInputRef.current) photoInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const applyPalette = (pal: PresetPalette) => {
    setStyleOverrides((prev) => {
      const darkSidebar = isDarkHex(pal.sidebar);
      return {
        ...prev,
        primaryColor: pal.primary,
        accentColor: pal.accent,
        theme: {
          ...(selectedTemplate?.analysis.style.theme || {}),
          ...(prev.theme || {}),
          headingColor: pal.primary,
          iconColor: pal.accent,
          borderColor: pal.primary,
          sidebarBackground: pal.sidebar,
          headerBackground: pal.header || pal.primary,
          sidebarHeadingColor: darkSidebar ? '#ffffff' : pal.primary,
        },
      };
    });
  };

  const handleColorChange = (key: 'primary' | 'sidebar' | 'accent', color: string) => {
    setStyleOverrides((prev) => {
      const currentTheme = {
        ...(selectedTemplate?.analysis.style.theme || {}),
        ...(prev.theme || {}),
      };

      if (key === 'primary') {
        return {
          ...prev,
          primaryColor: color,
          theme: {
            ...currentTheme,
            headingColor: color,
            borderColor: color,
          },
        };
      } else if (key === 'sidebar') {
        const dark = isDarkHex(color);
        return {
          ...prev,
          theme: {
            ...currentTheme,
            sidebarBackground: color,
            sidebarHeadingColor: dark ? '#ffffff' : (prev.primaryColor || selectedTemplate?.analysis.style.primaryColor || '#1e293b'),
          },
        };
      } else {
        return {
          ...prev,
          accentColor: color,
          theme: {
            ...currentTheme,
            iconColor: color,
          },
        };
      }
    });
  };

  const handleFontChange = (fontFamily: string) => {
    setStyleOverrides((prev) => ({
      ...prev,
      fontFamily,
      typography: {
        ...(selectedTemplate?.analysis.style.typography || {}),
        ...(prev.typography || {}),
        body: {
          ...(selectedTemplate?.analysis.style.typography?.body || { size: 9.5, weight: 400 }),
          ...(prev.typography?.body || {}),
          family: fontFamily,
        },
        sidebarText: {
          ...(selectedTemplate?.analysis.style.typography?.sidebarText || { size: 9, weight: 400 }),
          ...(prev.typography?.sidebarText || {}),
          family: fontFamily,
        },
        sectionHeading: {
          ...(selectedTemplate?.analysis.style.typography?.sectionHeading || { size: 12.5, weight: 700 }),
          ...(prev.typography?.sectionHeading || {}),
          family: fontFamily,
        },
        sidebarHeading: {
          ...(selectedTemplate?.analysis.style.typography?.sidebarHeading || { size: 12, weight: 700 }),
          ...(prev.typography?.sidebarHeading || {}),
          family: fontFamily,
        },
        name: {
          ...(selectedTemplate?.analysis.style.typography?.name || { size: 24, weight: 800 }),
          ...(prev.typography?.name || {}),
          family: fontFamily,
        },
        jobTitle: {
          ...(selectedTemplate?.analysis.style.typography?.jobTitle || { size: 13, weight: 600 }),
          ...(prev.typography?.jobTitle || {}),
          family: fontFamily,
        },
      },
    }));
  };

  const handleFontScaleChange = (scale: 'compact' | 'standard' | 'spacious') => {
    setFontScale(scale);
    const multiplier = scale === 'compact' ? 0.9 : scale === 'spacious' ? 1.12 : 1.0;
    const baseBody = selectedTemplate?.analysis.style.bodySize || 9.5;
    const baseHeading = selectedTemplate?.analysis.style.headingSize || 12.5;
    const baseName = selectedTemplate?.analysis.style.nameSize || 24;

    setStyleOverrides((prev) => ({
      ...prev,
      bodySize: Math.round(baseBody * multiplier * 10) / 10,
      headingSize: Math.round(baseHeading * multiplier * 10) / 10,
      nameSize: Math.round(baseName * multiplier * 10) / 10,
      typography: {
        ...(selectedTemplate?.analysis.style.typography || {}),
        ...(prev.typography || {}),
        body: {
          ...(selectedTemplate?.analysis.style.typography?.body || { weight: 400 }),
          ...(prev.typography?.body || {}),
          size: Math.round(baseBody * multiplier * 10) / 10,
        },
        sidebarText: {
          ...(selectedTemplate?.analysis.style.typography?.sidebarText || { weight: 400 }),
          ...(prev.typography?.sidebarText || {}),
          size: Math.round(Math.max(8, baseBody - 0.5) * multiplier * 10) / 10,
        },
        sectionHeading: {
          ...(selectedTemplate?.analysis.style.typography?.sectionHeading || { weight: 700 }),
          ...(prev.typography?.sectionHeading || {}),
          size: Math.round(baseHeading * multiplier * 10) / 10,
        },
        sidebarHeading: {
          ...(selectedTemplate?.analysis.style.typography?.sidebarHeading || { weight: 700 }),
          ...(prev.typography?.sidebarHeading || {}),
          size: Math.round(Math.max(10, baseHeading - 0.5) * multiplier * 10) / 10,
        },
        name: {
          ...(selectedTemplate?.analysis.style.typography?.name || { weight: 800 }),
          ...(prev.typography?.name || {}),
          size: Math.round(baseName * multiplier * 10) / 10,
        },
      },
    }));
  };

  const handleHeadingVariantChange = (variant: 'underline' | 'border' | 'filled' | 'plain') => {
    setStyleOverrides((prev) => ({
      ...prev,
      componentStyle: {
        ...(selectedTemplate?.analysis.style.componentStyle || { bulletStyle: 'dot', timeline: true, icons: true, headerBackground: false }),
        ...(prev.componentStyle || {}),
        headingVariant: variant,
      },
    }));
  };

  const handleBulletStyleChange = (bulletStyle: 'dot' | 'square' | 'dash' | 'arrow') => {
    setStyleOverrides((prev) => ({
      ...prev,
      componentStyle: {
        ...(selectedTemplate?.analysis.style.componentStyle || { headingVariant: 'underline', timeline: true, icons: true, headerBackground: false }),
        ...(prev.componentStyle || {}),
        bulletStyle,
      },
    }));
  };

  const handleDownloadWord = () => {
    if (!selectedTemplate) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportMessage('Generating Word document...');
    try {
      const filename = `${(singletonValues.fullName || 'My_CV').replace(/\s+/g, '_')}_CV.doc`;
      exportToWord(selectedTemplate.analysis, singletonValues, entries, filename, styleOverrides);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  const handleDownloadImage = async () => {
    if (!selectedTemplate) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportMessage('Rendering high-resolution A4 image...');
    try {
      const filename = `${(singletonValues.fullName || 'My_CV').replace(/\s+/g, '_')}_CV.png`;
      await exportToImage('cv-print-root', filename);
    } catch (err) {
      console.error('Image export failed:', err);
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  const handleDownloadPdf = () => {
    setShowExportMenu(false);
    exportToPdf();
  };

  // Section entry helpers
  const addEntry = (sectionId: string) => {
    if (!selectedTemplate) return;
    const newEntry: Record<string, string> = {};
    const sectionFields = selectedTemplate.analysis.fields.filter((f) => f.section === sectionId);
    sectionFields.forEach((f) => {
      newEntry[f.id] = '';
    });
    setEntries((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), newEntry],
    }));
  };

  const updateEntryField = (sectionId: string, entryIndex: number, fieldId: string, value: string) => {
    setEntries((prev) => {
      const group = [...(prev[sectionId] || [])];
      if (!group[entryIndex]) return prev;
      group[entryIndex] = { ...group[entryIndex], [fieldId]: value };
      return { ...prev, [sectionId]: group };
    });
  };

  const removeEntry = (sectionId: string, entryIndex: number) => {
    setEntries((prev) => {
      const group = [...(prev[sectionId] || [])];
      group.splice(entryIndex, 1);
      return { ...prev, [sectionId]: group };
    });
  };

  // ----------------------------------------------------
  // VIEW 1: TEMPLATE SELECTION GALLERY
  // ----------------------------------------------------
  if (!selectedTemplate) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            ✨ Professional CV Designer
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
            Choose a CV Template to Begin
          </h1>
          <p className="text-base text-gray-600 dark:text-zinc-400">
            Select any of our modern, recruiter-tested A4 templates. You can customize all text, colors, photo, and layout options with live preview, then download in Word, PDF, or Image.
          </p>

          {/* Category Filter Tabs - Horizontally scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap p-1 max-w-full justify-start sm:justify-center scrollbar-none">
            {(['All', 'Executive', 'Corporate', 'Tech', 'Academic', 'Minimalist'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full shrink-0 transition-colors ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid - Displaying Real A4 Rendered Designs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-blue-500/60 transition-all flex flex-col"
            >
              {/* Live Miniature A4 Document Preview */}
              <div
                className="relative w-full aspect-[210/297] overflow-hidden bg-gray-100 dark:bg-zinc-800/80 flex justify-center items-start pt-3 cursor-pointer select-none"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="pointer-events-none select-none origin-top transition-transform duration-300 group-hover:scale-[1.03] shadow-lg">
                  <TemplateCVRenderer
                    analysis={template.analysis}
                    singletonValues={template.defaultSingleton}
                    entries={template.defaultEntries}
                    zoom={0.34}
                  />
                </div>

                {/* Hover Overlay with Action Button */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3.5 p-4 z-20">
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/60 px-3.5 py-1 rounded-full shadow">
                    {template.badge}
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="shadow-2xl font-bold text-sm px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transform translate-y-2 group-hover:translate-y-0 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template);
                    }}
                  >
                    Use This Template →
                  </Button>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {template.colorPreview.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">
                  {template.description}
                </p>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs font-semibold group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Customize Template →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: SPLIT-VIEW BUILDER & LIVE PREVIEW
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Top Action & Navigation Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedTemplateId(null)}
          >
            ← Change Template
          </Button>
          <div className="border-l border-gray-200 dark:border-zinc-700 pl-3">
            <span className="text-xs text-gray-400 dark:text-zinc-500 block">Template</span>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">
              {selectedTemplate.name}
            </span>
          </div>
        </div>

        {/* Action Controls: Photo, Zoom, Download */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          {/* Photo Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
          >
            📷 {photoUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          {photoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 text-xs px-2"
              onClick={() => setPhotoUrl('')}
            >
              ✕
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-zinc-700 p-0.5 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setViewMode('split');
                setZoom(0.8);
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
            >
              Split Editor
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('fullA4');
                setZoom(1.0);
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'fullA4'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
            >
              📄 Full A4 View
            </button>
          </div>

          {/* Paper Zoom Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 px-2.5 py-1 text-xs bg-gray-50 dark:bg-zinc-800">
            <span className="text-gray-500 dark:text-zinc-400 font-medium">Zoom:</span>
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="bg-transparent text-gray-800 dark:text-zinc-200 font-semibold cursor-pointer focus:outline-none"
            >
              <option value={0.8}>A4 Fit View (80%)</option>
              <option value={1.0}>Actual A4 (100%)</option>
              <option value={0.85}>Large (85%)</option>
              <option value={0.7}>Standard (70%)</option>
            </select>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="gap-1.5 shadow"
              onClick={() => setShowExportMenu((v) => !v)}
              disabled={isExporting}
            >
              <span>📥 Download CV</span>
              <span className="text-[10px]">▼</span>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-800 py-1.5 z-50">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2.5"
                >
                  <span className="text-base">📄</span>
                  <div>
                    <span className="font-semibold block">Download PDF</span>
                    <span className="text-xs text-gray-400 block">Print-ready A4 document</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadWord}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 border-t border-gray-100 dark:border-zinc-800"
                >
                  <span className="text-base">📝</span>
                  <div>
                    <span className="font-semibold block">Download Word (.doc)</span>
                    <span className="text-xs text-gray-400 block">Editable in Microsoft Word</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 border-t border-gray-100 dark:border-zinc-800"
                >
                  <span className="text-base">🖼️</span>
                  <div>
                    <span className="font-semibold block">Download Image (.png)</span>
                    <span className="text-xs text-gray-400 block">High-resolution PNG file</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExporting && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Mobile Tab Switcher (Visible only on mobile/tablet < lg) */}
      {viewMode === 'split' && (
        <div className="lg:hidden flex p-1 bg-gray-200/80 dark:bg-zinc-800/90 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setMobilePane('editor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              mobilePane === 'editor'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            }`}
          >
            <span>📝 Form & Style Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              mobilePane === 'preview'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            }`}
          >
            <span>👁️ Live A4 Preview</span>
          </button>
        </div>
      )}

      {/* Main View: Full A4 View or Split-View */}
      {viewMode === 'fullA4' ? (
        <div className="bg-gray-100 dark:bg-zinc-800/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto overflow-y-auto min-h-[85vh]">
          <div className="w-fit min-w-full flex justify-center">
            <TemplateCVRenderer
              analysis={selectedTemplate.analysis}
              singletonValues={singletonValues}
              entries={entries}
              photoUrl={photoUrl || undefined}
              zoom={zoom}
              styleOverrides={styleOverrides}
              onPhotoClick={() => photoInputRef.current?.click()}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Design Studio (5 of 12 cols) */}
          <div className={`lg:col-span-5 space-y-5 ${mobilePane === 'editor' ? 'block' : 'hidden lg:block'}`}>
            {/* Mode Switcher: Content Editor vs Colors & Fonts */}
            <div className="flex p-1 bg-gray-200/70 dark:bg-zinc-800/90 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setEditorTab('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  editorTab === 'content'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
                }`}
              >
                <span>📝 Content Form</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('design')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  editorTab === 'design'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
                }`}
              >
                <span>🎨 Colors, Fonts & Style</span>
                {Object.keys(styleOverrides).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            </div>

            {/* TAB 1: CONTENT FORM */}
            {editorTab === 'content' && (
              <div className="space-y-4">
                {/* Section Navigation Pills - Horizontal Scrollable */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-zinc-800/80 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none select-none touch-pan-x">
                  {selectedTemplate.analysis.sections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        activeSectionId === sec.id
                          ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/60 dark:border-zinc-700'
                          : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-200/60 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      {sec.name}
                    </button>
                  ))}
                </div>

                {/* Active Section Form */}
                {selectedTemplate.analysis.sections
                  .filter((sec) => sec.id === activeSectionId)
                  .map((section) => {
                    const fields = selectedTemplate.analysis.fields.filter((f) => f.section === section.id);

                    return (
                      <div
                        key={section.id}
                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base">
                              {section.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">{section.description}</p>
                          </div>
                          {section.repeatable && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addEntry(section.id)}
                            >
                              + Add Item
                            </Button>
                          )}
                        </div>

                        {/* Non-repeatable fields */}
                        {!section.repeatable ? (
                          <div className="space-y-3.5">
                            {fields.map((field) => (
                              <div key={field.id}>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    rows={4}
                                    value={singletonValues[field.id] || ''}
                                    onChange={(e) =>
                                      setSingletonValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                                    }
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className={BASE_INPUT_CLASS}
                                  />
                                ) : (
                                  <input
                                    type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                                    value={singletonValues[field.id] || ''}
                                    onChange={(e) =>
                                      setSingletonValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                                    }
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    className={BASE_INPUT_CLASS}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Repeatable Entries */
                          <div className="space-y-4">
                            {(!entries[section.id] || entries[section.id].length === 0) && (
                              <div className="text-center py-6 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                  No entries added yet. Click &quot;+ Add Item&quot; above.
                                </p>
                              </div>
                            )}

                            {(entries[section.id] || []).map((entry, entryIndex) => (
                              <div
                                key={entryIndex}
                                className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50/50 dark:bg-zinc-800/30 space-y-3 relative group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                                    #{entryIndex + 1} {section.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeEntry(section.id, entryIndex)}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {fields.map((field) => (
                                    <div
                                      key={field.id}
                                      className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                                    >
                                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                      </label>
                                      {field.type === 'textarea' ? (
                                        <textarea
                                          rows={3}
                                          value={entry[field.id] || ''}
                                          onChange={(e) =>
                                            updateEntryField(section.id, entryIndex, field.id, e.target.value)
                                          }
                                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                                          className={BASE_INPUT_CLASS}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={entry[field.id] || ''}
                                          onChange={(e) =>
                                            updateEntryField(section.id, entryIndex, field.id, e.target.value)
                                          }
                                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                                          className={BASE_INPUT_CLASS}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* TAB 2: DESIGN & APPEARANCE STUDIO */}
            {editorTab === 'design' && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base">
                      🎨 Custom Design & Appearance
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Customize palette colors, typography, font sizing, and visual accents.
                    </p>
                  </div>
                  {Object.keys(styleOverrides).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStyleOverrides({});
                        setFontScale('standard');
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ↺ Reset Defaults
                    </button>
                  )}
                </div>

                {/* 1. Quick Preset Palettes */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                    Curated Color Palettes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PRESET_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => applyPalette(pal)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-sm transition-all text-left bg-gray-50/50 dark:bg-zinc-800/40"
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 shadow-sm"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 shadow-sm"
                            style={{ backgroundColor: pal.sidebar }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">
                          {pal.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Color Controls */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                    Custom Color Controls
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Primary Color */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300 block">
                        Primary Accent
                      </span>
                      <div className="flex items-center gap-2 border border-gray-300 dark:border-zinc-700 rounded-lg p-1.5 bg-gray-50 dark:bg-zinc-800">
                        <input
                          type="color"
                          value={
                            styleOverrides.primaryColor ||
                            selectedTemplate.analysis.style.theme?.headingColor ||
                            selectedTemplate.analysis.style.primaryColor ||
                            '#1e293b'
                          }
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-700 dark:text-zinc-300 uppercase">
                          {styleOverrides.primaryColor || selectedTemplate.analysis.style.primaryColor}
                        </span>
                      </div>
                    </div>

                    {/* Sidebar Background */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300 block">
                        Sidebar Tone
                      </span>
                      <div className="flex items-center gap-2 border border-gray-300 dark:border-zinc-700 rounded-lg p-1.5 bg-gray-50 dark:bg-zinc-800">
                        <input
                          type="color"
                          value={
                            styleOverrides.theme?.sidebarBackground ||
                            selectedTemplate.analysis.style.theme?.sidebarBackground ||
                            '#142b42'
                          }
                          onChange={(e) => handleColorChange('sidebar', e.target.value)}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-700 dark:text-zinc-300 uppercase truncate">
                          {styleOverrides.theme?.sidebarBackground || selectedTemplate.analysis.style.theme?.sidebarBackground || '#142b42'}
                        </span>
                      </div>
                    </div>

                    {/* Icon / Detail Color */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300 block">
                        Icon / Bullets
                      </span>
                      <div className="flex items-center gap-2 border border-gray-300 dark:border-zinc-700 rounded-lg p-1.5 bg-gray-50 dark:bg-zinc-800">
                        <input
                          type="color"
                          value={
                            styleOverrides.accentColor ||
                            selectedTemplate.analysis.style.accentColor ||
                            '#2563eb'
                          }
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-700 dark:text-zinc-300 uppercase">
                          {styleOverrides.accentColor || selectedTemplate.analysis.style.accentColor || '#2563eb'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Typography / Font Family */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                    Typography & Font Family
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => {
                      const isCurrent =
                        (styleOverrides.fontFamily || selectedTemplate.analysis.style.fontFamily) === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => handleFontChange(font.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm'
                              : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm font-semibold text-gray-900 dark:text-zinc-100"
                              style={{ fontFamily: font.id }}
                            >
                              {font.label}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                              {font.category}
                            </span>
                          </div>
                          <span
                            className="text-xs text-gray-500 dark:text-zinc-400 block mt-1 line-clamp-1"
                            style={{ fontFamily: font.id }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Font Size Scale */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                    Font Sizing & Scale
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact' as const, label: 'Compact (0.9x)', desc: 'Fit more experience' },
                      { id: 'standard' as const, label: 'Standard (1.0x)', desc: 'Balanced default' },
                      { id: 'spacious' as const, label: 'Spacious (1.1x)', desc: 'Larger text' },
                    ].map((scale) => (
                      <button
                        key={scale.id}
                        type="button"
                        onClick={() => handleFontScaleChange(scale.id)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          fontScale === scale.id
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm font-bold text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 text-gray-700 dark:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs block">{scale.label}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{scale.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Bullet & Heading Accents */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                    Heading & Bullet Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1 block">
                        Section Heading
                      </span>
                      <select
                        value={
                          styleOverrides.componentStyle?.headingVariant ||
                          selectedTemplate.analysis.style.componentStyle?.headingVariant ||
                          'underline'
                        }
                        onChange={(e) =>
                          handleHeadingVariantChange(
                            e.target.value as 'underline' | 'border' | 'filled' | 'plain',
                          )
                        }
                        className={BASE_INPUT_CLASS}
                      >
                        <option value="underline">Clean Underline</option>
                        <option value="filled">Filled Banner</option>
                        <option value="border">Border Box</option>
                        <option value="plain">Minimal Plain</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1 block">
                        Bullet Point
                      </span>
                      <select
                        value={
                          styleOverrides.componentStyle?.bulletStyle ||
                          selectedTemplate.analysis.style.componentStyle?.bulletStyle ||
                          'dot'
                        }
                        onChange={(e) =>
                          handleBulletStyleChange(
                            e.target.value as 'dot' | 'square' | 'dash' | 'arrow',
                          )
                        }
                        className={BASE_INPUT_CLASS}
                      >
                        <option value="dot">• Dot</option>
                        <option value="square">▪ Square</option>
                        <option value="dash">– Dash</option>
                        <option value="arrow">› Arrow</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live A4 Preview (7 of 12 cols, sticky) */}
          <div className={`lg:col-span-7 sticky top-20 ${mobilePane === 'preview' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-100 dark:bg-zinc-800/50 p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto overflow-y-auto max-h-[calc(100vh-6rem)]">
              <div className="w-fit min-w-full flex justify-center">
                <TemplateCVRenderer
                  analysis={selectedTemplate.analysis}
                  singletonValues={singletonValues}
                  entries={entries}
                  photoUrl={photoUrl || undefined}
                  zoom={zoom}
                  styleOverrides={styleOverrides}
                  onPhotoClick={() => photoInputRef.current?.click()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}