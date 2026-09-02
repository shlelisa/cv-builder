'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import TemplateCVRenderer from '@/components/cv/TemplateCVRenderer';
import { STATIC_TEMPLATES, StaticTemplateDefinition } from '@/lib/static-templates';
import { exportToPdf, exportToWord, exportToImage } from '@/lib/export-utils';
import { TemplateField, TemplateSection } from '@/types';

type CategoryFilter = 'All' | 'Executive' | 'Corporate' | 'Tech' | 'Minimalist';

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

  const handleDownloadWord = () => {
    if (!selectedTemplate) return;
    setShowExportMenu(false);
    setIsExporting(true);
    setExportMessage('Generating Word document...');
    try {
      const filename = `${(singletonValues.fullName || 'My_CV').replace(/\s+/g, '_')}_CV.doc`;
      exportToWord(selectedTemplate.analysis, singletonValues, entries, filename);
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

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {(['All', 'Executive', 'Corporate', 'Tech', 'Minimalist'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all flex flex-col"
            >
              {/* Card Header Preview Area */}
              <div
                className="h-44 p-4 flex flex-col justify-between relative overflow-hidden transition-all group-hover:scale-[1.02]"
                style={{
                  backgroundColor: template.analysis.style.theme?.headerBackground || template.analysis.style.primaryColor || '#1e293b',
                  color: '#ffffff',
                }}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm text-white">
                    {template.badge}
                  </span>
                  <div className="flex items-center gap-1">
                    {template.colorPreview.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stylized Miniature Layout Wireframe */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/15 space-y-1.5 z-10">
                  <div className="w-2/3 h-2.5 bg-white/80 rounded" />
                  <div className="w-1/3 h-2 bg-white/50 rounded" />
                  <div className="w-full h-1 bg-white/30 rounded mt-2" />
                  <div className="w-4/5 h-1.5 bg-white/40 rounded" />
                  <div className="w-3/5 h-1.5 bg-white/40 rounded" />
                </div>

                <span className="text-[10px] text-white/70 uppercase tracking-widest font-mono z-10">
                  {template.analysis.layout.type.replace('-', ' ')}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-lg group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-sm font-semibold shadow"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Use This Template →
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

      {/* Main View: Full A4 View or Split-View */}
      {viewMode === 'fullA4' ? (
        <div className="bg-gray-100 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex justify-center overflow-auto min-h-[85vh]">
          <TemplateCVRenderer
            analysis={selectedTemplate.analysis}
            singletonValues={singletonValues}
            entries={entries}
            photoUrl={photoUrl || undefined}
            zoom={zoom}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (5 of 12 cols) */}
          <div className="lg:col-span-5 space-y-5">
          {/* Section Navigation Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-lg">
            {selectedTemplate.analysis.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeSectionId === sec.id
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
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
                              placeholder={field.placeholder}
                              className={BASE_INPUT_CLASS}
                            />
                          ) : (
                            <input
                              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                              value={singletonValues[field.id] || ''}
                              onChange={(e) =>
                                setSingletonValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                              }
                              placeholder={field.placeholder}
                              className={BASE_INPUT_CLASS}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Repeatable entry items */
                    <div className="space-y-4">
                      {(entries[section.id] || []).length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                            No entries yet.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEntry(section.id)}
                          >
                            + Add First Item
                          </Button>
                        </div>
                      )}

                      {(entries[section.id] || []).map((entryItem, entryIdx) => (
                        <div
                          key={entryIdx}
                          className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 space-y-3 relative"
                        >
                          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 pb-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                              #{entryIdx + 1} {fields[0] ? entryItem[fields[0].id] || 'Entry' : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEntry(section.id, entryIdx)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {fields.map((field) => (
                              <div key={field.id}>
                                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
                                  {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    rows={3}
                                    value={entryItem[field.id] || ''}
                                    onChange={(e) =>
                                      updateEntryField(section.id, entryIdx, field.id, e.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className={BASE_INPUT_CLASS}
                                  />
                                ) : (
                                  <input
                                    type={field.type === 'email' ? 'email' : 'text'}
                                    value={entryItem[field.id] || ''}
                                    onChange={(e) =>
                                      updateEntryField(section.id, entryIdx, field.id, e.target.value)
                                    }
                                    placeholder={field.placeholder}
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

        {/* Right Column: Live A4 Preview (7 of 12 cols, sticky) */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-gray-100 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex justify-center overflow-auto max-h-[calc(100vh-6rem)]">
            <TemplateCVRenderer
              analysis={selectedTemplate.analysis}
              singletonValues={singletonValues}
              entries={entries}
              photoUrl={photoUrl || undefined}
              zoom={zoom}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
}