'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import { aiService } from '@/services/ai';
import TemplateCVRenderer from '@/components/cv/TemplateCVRenderer';
import { TemplateAnalysis, TemplateField, TemplateSection, TemplateStyle } from '@/types';
import { resizeDataUrl } from '@/lib/image-utils';
import { applySampledColors, extractPalette } from '@/lib/palette';

type Step = 'upload' | 'analyzing' | 'result' | 'form' | 'generated';

interface EntryGroup {
  id: string;
  values: Record<string, string>;
}

const BASE_FIELD_CLASS =
  'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];

const LAYOUT_OPTIONS = ['single-column', 'two-column', 'sidebar-left', 'sidebar-right'];
const HEADER_OPTIONS = ['centered', 'left-aligned', 'right-aligned'];
const DIVIDER_OPTIONS = ['line', 'space', 'border'];

const COLOR_FIELDS: { key: keyof TemplateStyle; label: string }[] = [
  { key: 'primaryColor', label: 'Primary' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'backgroundColor', label: 'Background' },
  { key: 'textColor', label: 'Text' },
];

export default function TemplateAnalyzer() {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysis, setAnalysis] = useState<TemplateAnalysis | null>(null);
  const [singletonValues, setSingletonValues] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<Record<string, EntryGroup[]>>({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [generatedCv, setGeneratedCv] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');
  const [styleOverrides, setStyleOverrides] = useState<Partial<TemplateStyle>>({});
  const [layoutType, setLayoutType] = useState<TemplateAnalysis['layout']['type'] | undefined>(undefined);

  const [aiMode, setAiMode] = useState<'checking' | 'live' | 'demo'>('checking');
  const [aiDetail, setAiDetail] = useState('');
  const [palette, setPalette] = useState<string[]>([]);
  const [refinedSingleton, setRefinedSingleton] = useState<Record<string, string> | null>(null);
  const [refinedEntries, setRefinedEntries] = useState<Record<string, Array<Record<string, string>>> | null>(null);
  const [useRewrites, setUseRewrites] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ai-status');
        const data = await res.json();
        if (!cancelled && data.configured) {
          setAiMode('live');
          setAiDetail(`${data.provider} · ${data.model}`);
        } else if (!cancelled) {
          setAiMode('demo');
        }
      } catch {
        if (!cancelled) setAiMode('demo');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const simpleEntries = useMemo<Record<string, Array<Record<string, string>>>>(() => {
    const out: Record<string, Array<Record<string, string>>> = {};
    Object.entries(entries).forEach(([sectionId, group]) => {
      out[sectionId] = group.map((g) => g.values);
    });
    return out;
  }, [entries]);

  const renderSingleton = useRewrites && refinedSingleton ? refinedSingleton : singletonValues;
  const renderEntries = useRewrites && refinedEntries ? refinedEntries : simpleEntries;

  const readFileAsDataUrl = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }),
    [],
  );

  const convertPdfToImage = useCallback(async (dataUrl: string): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const raw = atob(dataUrl.split(',')[1]);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return canvas.toDataURL('image/png');
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError('');
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a PNG, JPG, WebP, GIF, or PDF file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be under 10 MB.');
        return;
      }

      const isPdf = file.type === 'application/pdf';
      const dataUrl = await readFileAsDataUrl(file);
      const rawImage = isPdf ? await convertPdfToImage(dataUrl) : dataUrl;
      const imageToAnalyze = await resizeDataUrl(rawImage, 1600);

      setPreviewUrl(imageToAnalyze);
      const pal = await extractPalette(imageToAnalyze);
      setPalette(pal);
      setStep('analyzing');

      try {
        let result: TemplateAnalysis | null = null;
        try {
          const apiRes = await fetch('/api/analyze-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageToAnalyze, palette: pal }),
          });
          const payload = await apiRes.json();
          if (payload && !payload.mock && payload.analysis) result = payload.analysis;
        } catch {
          // real AI unavailable — fall back to local analysis below
        }
        if (!result) result = await aiService.analyzeTemplate(imageToAnalyze);
        const analyzed = applySampledColors(result, pal);
        setAnalysis(analyzed);
        setSingletonValues({});
        const initialEntries: Record<string, EntryGroup[]> = {};
        result.sections.forEach((section) => {
          if (section.repeatable) {
            initialEntries[section.id] = [
              { id: `entry-${section.id}-0`, values: {} },
            ];
          }
        });
        setEntries(initialEntries);
        setPhotoUrl('');
        setStyleOverrides({});
        setLayoutType(undefined);
        setRefinedSingleton(null);
        setRefinedEntries(null);
        setStep('result');
      } catch {
        setError('Analysis failed. Please try again with a clearer image.');
        setStep('upload');
      }
    },
    [readFileAsDataUrl, convertPdfToImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoUrl(dataUrl);
      if (photoInputRef.current) photoInputRef.current.value = '';
    },
    [readFileAsDataUrl],
  );

  const addEntry = (sectionId: string) => {
    setEntries((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), { id: `entry-${sectionId}-${Date.now()}`, values: {} }],
    }));
  };

  const removeEntry = (sectionId: string, entryId: string) => {
    setEntries((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter((e) => e.id !== entryId),
    }));
  };

  const updateEntry = (sectionId: string, entryId: string, fieldId: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map((e) =>
        e.id === entryId ? { ...e, values: { ...e.values, [fieldId]: value } } : e,
      ),
    }));
  };

  const handleGenerate = async () => {
    if (!analysis) return;
    const simpleEntries: Record<string, Array<Record<string, string>>> = {};
    Object.entries(entries).forEach(([sectionId, group]) => {
      simpleEntries[sectionId] = group.map((g) => g.values);
    });

    let cv = '';
    let refS: Record<string, string> | null = null;
    let refE: Record<string, Array<Record<string, string>>> | null = null;
    try {
      const apiRes = await fetch('/api/write-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
          singleton: singletonValues,
          entries: simpleEntries,
          language: 'en',
        }),
      });
      const payload = await apiRes.json();
      if (payload && !payload.mock) {
        cv = typeof payload.cv === 'string' ? payload.cv : '';
        refS = payload.refined?.singleton ?? null;
        refE = payload.refined?.entries ?? null;
      }
    } catch {
      // real AI unavailable — fall back to local CV text below
    }
    if (!cv) {
      cv = aiService.generateFromTemplate(analysis, singletonValues, simpleEntries, Boolean(photoUrl));
    }

    setGeneratedCv(cv);
    setRefinedSingleton(refS);
    setRefinedEntries(refE);
    setUseRewrites(Boolean(refS) || Boolean(refE));
    setStep('generated');
  };

  const handleStartOver = () => {
    setStep('upload');
    setPreviewUrl('');
    setAnalysis(null);
    setSingletonValues({});
    setEntries({});
    setPhotoUrl('');
    setGeneratedCv('');
    setError('');
    setShowEditor(false);
    setStyleOverrides({});
    setLayoutType(undefined);
    setPalette([]);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const renderField = (field: TemplateField, value: string, onValue: (v: string) => void) => {
    return (
      <div key={field.id}>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            className={BASE_FIELD_CLASS}
            rows={3}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onValue(e.target.value)}
          />
        ) : field.type === 'select' && field.options ? (
          <select
            className={BASE_FIELD_CLASS}
            value={value}
            onChange={(e) => onValue(e.target.value)}
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'phone' ? 'tel' : field.type === 'date' ? 'date' : field.type}
            className={BASE_FIELD_CLASS}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onValue(e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderSectionForm = (section: TemplateSection) => {
    const fields = analysis?.fields.filter((f) => f.section === section.id) || [];
    const total = (
      <div key={section.id} className="space-y-3">
        <div className="border-b border-gray-200 dark:border-zinc-700 pb-2 flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-zinc-100">{section.name}</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{section.description}</p>
          </div>
          {section.repeatable && (
            <Button type="button" variant="outline" size="sm" onClick={() => addEntry(section.id)}>
              + {t.templates.addEntry}
            </Button>
          )}
        </div>

        {section.repeatable ? (
          entryForm(section, fields)
        ) : (
          <>
            {fields.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.map((field) => renderField(field, singletonValues[field.id] || '', (v) => setSingletonValues((prev) => ({ ...prev, [field.id]: v }))))}</div>}
            {section.id === 'personal' && analysis?.layout.photo?.included && renderPhotoInput()}
          </>
        )}
      </div>
    );
    return total;
  };

  const entryForm = (section: TemplateSection, fields: TemplateField[]) => {
    const group = entries[section.id] || [];
    return (
      <div className="space-y-3">
        {group.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-3 border border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
            No entries yet — click &quot;{t.templates.addEntry}&quot; to begin.
          </p>
        )}
        {group.map((grp, gi) => (
          <div key={grp.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-3 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                {section.name} {gi + 1}
              </span>
              {group.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => removeEntry(section.id, grp.id)}
                >
                  {t.common.remove}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((field) =>
                renderField(field, grp.values[field.id] || '', (v) =>
                  updateEntry(section.id, grp.id, field.id, v),
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPhotoInput = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
        {t.templates.photo}
      </label>
      <div className="flex items-center gap-3">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="w-full text-sm text-gray-500 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
          onChange={handlePhotoChange}
        />
        {photoUrl && (
          <button
            type="button"
            onClick={() => setPhotoUrl('')}
            className="text-xs text-red-600 dark:text-red-400 hover:underline whitespace-nowrap"
          >
            {t.templates.removePhoto}
          </button>
        )}
      </div>
      {photoUrl && (
        <div className="mt-3">
          {pictureTag()}
        </div>
      )}
    </div>
  );

  const pictureTag = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt="Profile preview"
      className="h-24 w-24 object-cover rounded-lg border border-gray-300 dark:border-zinc-600"
    />
  );

  const renderEditorPanel = () => {
    if (!analysis) return null;
    const styleNow = { ...analysis.style, ...styleOverrides };
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-zinc-100">
            {t.templates.designEditor}
          </h4>
          <Button type="button" variant="ghost" size="sm" onClick={() => setStyleOverrides({})}>
            {t.templates.resetDesign}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.templates.layout}
            </label>
            <select
              className={BASE_FIELD_CLASS}
              value={layoutType || analysis.layout.type}
              onChange={(e) => setLayoutType(e.target.value as typeof layoutType)}
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.templates.headerStyle}
            </label>
            <select
              className={BASE_FIELD_CLASS}
              value={styleNow.headerStyle}
              onChange={(e) => setStyleOverrides((prev) => ({ ...prev, headerStyle: e.target.value as TemplateStyle['headerStyle'] }))}
            >
              {HEADER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.templates.sectionDivider}
            </label>
            <select
              className={BASE_FIELD_CLASS}
              value={styleNow.sectionDivider}
              onChange={(e) => setStyleOverrides((prev) => ({ ...prev, sectionDivider: e.target.value as TemplateStyle['sectionDivider'] }))}
            >
              {DIVIDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.templates.fontFamily}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className={BASE_FIELD_CLASS}
                value={styleNow.fontFamily}
                onChange={(e) => setStyleOverrides((prev) => ({ ...prev, fontFamily: e.target.value }))}
              />
              <select
                className={`${BASE_FIELD_CLASS} w-40 shrink-0`}
                value={''}
                onChange={(e) =>
                  setStyleOverrides((prev) => ({ ...prev, fontFamily: e.target.value }))
                }
              >
                <option value="" disabled>
                  Presets
                </option>
                <option value="Inter, sans-serif">Modern Sans</option>
                <option value="Georgia, serif">Classic Serif</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Courier New, monospace">Monospace</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Colors
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {COLOR_FIELDS.map(({ key: ckey, label }) => (
                <div key={ckey}>
                  <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleNow[ckey]}
                      onChange={(e) =>
                        setStyleOverrides((prev) => ({ ...prev, [ckey]: e.target.value }))
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                      {styleNow[ckey]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyzedSections = () => {
    if (!analysis) return null;
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">Detected Sections</h4>
        <div className="space-y-1">
          {analysis.layout.orderedSections.map((sectionId, index) => {
            const section = analysis.sections.find((s) => s.id === sectionId);
            if (!section) return null;
            return (
              <div key={sectionId} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-zinc-300">{section.name}</span>
                {section.repeatable && <span className="text-xs text-gray-400 dark:text-zinc-500">(+)</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{t.templates.title}</h1>
          <p className="text-gray-600 dark:text-zinc-400">{t.templates.subtitle}</p>
        </div>
        {aiMode === 'live' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t.templates.aiLive} · {aiDetail}
          </span>
        ) : aiMode === 'demo' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
            {t.templates.aiDemo}
          </span>
        ) : null}
      </div>

      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-zinc-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-1">{t.templates.dragDrop}</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t.templates.fileTypes}</p>
        </div>
      )}

      {step === 'analyzing' && (
        <div className="space-y-6">
          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Template preview" className="w-full max-h-96 object-contain bg-gray-50 dark:bg-zinc-800" />
            </div>
          )}
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 dark:text-zinc-300 font-medium">{t.templates.analyzing}</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center max-w-md">
              {t.templates.analyzingHint}
            </p>
          </div>
        </div>
      )}

      {step === 'result' && analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Template preview" className="w-full object-contain bg-gray-50 dark:bg-zinc-800" />
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">{analysis.templateName}</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">{analysis.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">Layout</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-zinc-100 capitalize">
                    {analysis.layout.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">Color Style</span>
                  <div className="flex gap-1 items-center mt-1">
                    {[analysis.style.primaryColor, analysis.style.secondaryColor, analysis.style.accentColor].map((c) => (
                      <span key={c} className="w-4 h-4 rounded-full border border-gray-300 dark:border-zinc-600" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">Sections Found</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{analysis.sections.length}</span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">Photo Required</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {analysis.layout.photo?.included ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {palette.length > 0 && (
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-2">Detected Colors</span>
                  <div className="flex items-center gap-2">
                    {palette.map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-zinc-600"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {renderAnalyzedSections()}

              <div className="flex gap-3">
                <Button onClick={handleStartOver} variant="outline" size="sm">
                  {t.templates.uploadNew}
                </Button>
                <Button onClick={() => setStep('form')} variant="primary" size="sm">
                  {t.templates.startFilling} →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'form' && analysis && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => setStep('result')} variant="outline" size="sm">
              ← {t.templates.backToAnalysis}
            </Button>
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{t.templates.fillFields}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 sticky top-24 self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Template reference" className="w-full object-contain bg-gray-50 dark:bg-zinc-800" />
              <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">{t.templates.referenceHint}</p>
              </div>
            </div>

            <div className="space-y-6">
              {analysis.layout.orderedSections.map((sectionId) => {
                const section = analysis.sections.find((s) => s.id === sectionId);
                if (!section) return null;
                return (
                  <div key={section.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm">
                    {renderSectionForm(section)}
                  </div>
                );
              })}

              <Button onClick={handleGenerate} variant="primary" className="w-full" size="lg">
                {t.templates.generateCv}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'generated' && analysis && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setStep('form')} variant="outline" size="sm">
              ← {t.templates.editFields}
            </Button>
            <Button variant={showEditor ? 'primary' : 'outline'} size="sm" onClick={() => setShowEditor((v) => !v)}>
              {t.templates.editDesign}
            </Button>
            {(refinedSingleton || refinedEntries) && (
              <button
                onClick={() => setUseRewrites((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  useRewrites
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                    useRewrites ? 'bg-white text-blue-600 border-white' : 'border-gray-400 dark:border-zinc-600'
                  }`}
                >
                  {useRewrites ? '✓' : ''}
                </span>
                {t.templates.useAiRewrite}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              {t.templates.downloadCv}
            </Button>
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-300 dark:border-zinc-700 p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'visual' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-zinc-300'}`}
              >
                {t.templates.visual}
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-zinc-300'}`}
              >
                {t.templates.textView}
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleStartOver}>
              {t.templates.startOver}
            </Button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 font-medium text-sm">
              ✓ {t.templates.generatedSuccess}
            </p>
          </div>

          {showEditor && renderEditorPanel()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Original template" className="w-full object-contain bg-gray-50 dark:bg-zinc-800" />
              <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">{t.templates.originalTemplate}</p>
              </div>
            </div>

            <div className="space-y-4">
              {viewMode === 'visual' ? (
                <TemplateCVRenderer
                  analysis={analysis}
                  singletonValues={renderSingleton}
                  entries={renderEntries}
                  photoUrl={photoUrl || undefined}
                  styleOverrides={styleOverrides}
                  layoutType={layoutType}
                  zoom={0.75}
                />
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-zinc-100 mb-3">{t.templates.generatedCv}</h4>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-300 font-mono leading-relaxed">
                    {generatedCv}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}