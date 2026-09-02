'use client';

import { useMemo, useRef, useState } from 'react';
import { TemplateAnalysis, TemplateColumnId } from '@/types';
import { useApp } from '@/lib/AppContext';
import {
  CustomLayout,
  CustomLayoutSection,
  LayoutWarning,
  cloneCustomLayout,
  reindex,
} from '@/lib/layout-engine';

interface TemplateLayoutEditorProps {
  analysis: TemplateAnalysis;
  value: CustomLayout;
  onChange: (next: CustomLayout | null) => void;
  canRestore: boolean;
  warnings: LayoutWarning[];
}

const PERSONAL_IDS = new Set(['personal', 'contact']);
const ALL_COLUMNS: TemplateColumnId[] = ['main', 'sidebar', 'main-left', 'main-right'];

type ColumnLists = Record<TemplateColumnId, string[]>;

function emptyLists(): ColumnLists {
  return { main: [], sidebar: [], 'main-left': [], 'main-right': [] };
}

interface DragSource {
  col: TemplateColumnId;
  index: number;
}

function partition(value: CustomLayout): { lists: ColumnLists; hidden: Set<string> } {
  const lists = emptyLists();
  [...value.sections]
    .sort((a, b) => a.order - b.order)
    .forEach((s) => {
      if (PERSONAL_IDS.has(s.sectionId)) return;
      lists[s.column] = [...lists[s.column], s.sectionId];
    });
  return { lists, hidden: new Set(value.hidden) };
}

function fromColumnLists(lists: ColumnLists, prev: CustomLayout): CustomLayout {
  const sections: CustomLayoutSection[] = [];
  ALL_COLUMNS.forEach((col) => {
    lists[col].forEach((id) => sections.push({ sectionId: id, column: col, order: sections.length }));
  });
  return reindex({ sections, hidden: [...prev.hidden] });
}

function listsFor(columns: TemplateColumnId[]): ColumnLists {
  const base = emptyLists();
  ALL_COLUMNS.forEach((col) => {
    if (!columns.includes(col)) delete (base as Partial<ColumnLists>)[col];
  });
  return base;
}

export default function TemplateLayoutEditor({
  analysis,
  value,
  onChange,
  canRestore,
  warnings,
}: TemplateLayoutEditorProps) {
  const { t } = useApp();
  const { lists, hidden } = useMemo(() => partition(value), [value]);
  const columns = useMemo<TemplateColumnId[]>(() => {
    const isSidebarLayout = analysis.layout.type === 'sidebar-left' || analysis.layout.type === 'sidebar-right';
    const isTwoColLayout = analysis.layout.type === 'two-column';
    return isSidebarLayout ? ['main', 'sidebar'] : isTwoColLayout ? ['main-left', 'main-right'] : ['main'];
  }, [analysis.layout.type]);

  const dragRef = useRef<DragSource | null>(null);
  const [overTarget, setOverTarget] = useState<string | null>(null);

  const [past, setPast] = useState<CustomLayout[]>([]);
  const [future, setFuture] = useState<CustomLayout[]>([]);

  const sectionName = (id: string) => analysis.sections.find((s) => s.id === id)?.name || id;

  const commit = (next: CustomLayout) => {
    setPast((p) => [...p.slice(-49), cloneCustomLayout(value)]);
    setFuture([]);
    onChange(next);
  };

  const moveTo = (targetCol: TemplateColumnId, targetIndex: number | 'end', source: DragSource) => {
    const work = listsFor(columns);
    columns.forEach((col) => {
      work[col] = [...lists[col]];
    });
    const [moved] = work[source.col].splice(source.index, 1);
    if (!moved) return;
    let idx = targetIndex === 'end' ? work[targetCol].length : targetIndex;
    if (source.col === targetCol && source.index < idx) idx -= 1;
    work[targetCol].splice(idx, 0, moved);
    commit(fromColumnLists(work, value));
  };

  const toggleHidden = (id: string) => {
    const nextHidden = hidden.has(id)
      ? value.hidden.filter((h) => h !== id)
      : [...value.hidden, id];
    commit({ sections: value.sections, hidden: nextHidden });
  };

  const removeSection = (col: TemplateColumnId, index: number) => {
    const work = listsFor(columns);
    columns.forEach((c) => {
      work[c] = c === col ? lists[c].filter((_, i) => i !== index) : [...lists[c]];
    });
    commit(fromColumnLists(work, value));
  };

  const addSection = (id: string, col: TemplateColumnId) => {
    const work = listsFor(columns);
    columns.forEach((c) => {
      work[c] = c === col ? [...lists[c], id] : [...lists[c]];
    });
    commit(fromColumnLists(work, value));
  };

  const undo = () => {
    if (past.length === 0) return;
    onChange(cloneCustomLayout(past[past.length - 1]));
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [cloneCustomLayout(value), ...f]);
  };

  const redo = () => {
    if (future.length === 0) return;
    onChange(cloneCustomLayout(future[0]));
    setFuture((f) => f.slice(1));
    setPast((p) => [...p.slice(-49), cloneCustomLayout(value)]);
  };

  const restore = () => {
    onChange(null);
    setPast([]);
    setFuture([]);
    setOverTarget(null);
  };

  const inAnyColumn = new Set(columns.flatMap((col) => lists[col]));
  const available = analysis.sections.filter(
    (s) => !PERSONAL_IDS.has(s.id) && !inAnyColumn.has(s.id),
  );

  const renderRow = (id: string, col: TemplateColumnId, index: number) => {
    const isHidden = hidden.has(id);
    const rows = lists[col] || [];
    return (
      <div key={`${col}-${id}`}>
        <div
          draggable
          onDragStart={(e) => {
            dragRef.current = { col, index };
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            dragRef.current = null;
            setOverTarget(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOverTarget(`${col}-${index}`);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOverTarget(null);
            if (dragRef.current) moveTo(col, index, dragRef.current);
          }}
          className={`group flex cursor-grab items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm active:cursor-grabbing ${
            isHidden
              ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
              : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          } ${overTarget === `${col}-${index}` ? 'ring-2 ring-indigo-500' : ''}`}
        >
          <span className="truncate text-xs font-medium">{sectionName(id)}</span>
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => toggleHidden(id)}
              title={isHidden ? t.templates.showSection : t.templates.hideSection}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              {isHidden ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => removeSection(col, index)}
              title={t.templates.removeSection}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </span>
        </div>
        {index < rows.length - 1 && overTarget === `${col}-end-divider` && (
          <div className="h-1 rounded-full bg-indigo-500" />
        )}
      </div>
    );
  };

  const columnLabel = (col: TemplateColumnId) =>
    col === 'main'
      ? t.templates.mainColumn
      : col === 'sidebar'
        ? t.templates.sidebarColumn
        : col === 'main-left'
          ? t.templates.leftColumn
          : t.templates.rightColumn;

  const renderColumn = (col: TemplateColumnId) => {
    const rows = lists[col] || [];
    return (
      <div
        key={col}
        onDragOver={(e) => {
          if (dragRef.current) {
            e.preventDefault();
            setOverTarget(`${col}-end`);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOverTarget(null);
          if (dragRef.current) moveTo(col, 'end', dragRef.current);
        }}
        className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {columnLabel(col)}
          </span>
        </div>
        <div className="space-y-1.5">
          {rows.length === 0 && (
            <p className="px-1 py-3 text-center text-xs text-slate-400">{t.templates.emptyColumn}</p>
          )}
          {rows.map((id, i) => renderRow(id, col, i))}
          {overTarget === `${col}-end` && rows.length > 0 && (
            <div className="h-1 rounded-full bg-indigo-500" />
          )}
        </div>
        {available.length > 0 && (
          <div className="mt-2">
            <select
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (id) addSection(id, col);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="" disabled>
                {t.templates.addSection}
              </option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.templates.layoutHint}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
          >
            {t.templates.undo}
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
          >
            {t.templates.redo}
          </button>
          <button
            type="button"
            onClick={restore}
            disabled={!canRestore}
            className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs text-indigo-600 disabled:opacity-40 dark:border-indigo-700 dark:text-indigo-300"
          >
            {t.templates.restoreOrder}
          </button>
        </div>
      </div>

      <div className={columns.length > 1 ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : ''}>
        {columns.map((col) => renderColumn(col))}
      </div>

      {warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900 dark:bg-amber-950">
          <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-300">{t.templates.fidelityNotes}</p>
          <ul className="space-y-0.5 text-xs text-amber-600 dark:text-amber-400">
            {warnings.map((w) => (
              <li key={`${w.sectionId}-${w.message}`}>
                {sectionName(w.sectionId)}: {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}