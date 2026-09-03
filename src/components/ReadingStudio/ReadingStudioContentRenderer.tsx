import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutItem } from '../../types';
import { useReadingStore } from '../../store/useReadingStore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';
import { ContentEditor } from './Editor/ContentEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_PADDING_TOP = 24;
const PAGE_PADDING_BOTTOM = 32;
const PAGE_PADDING_X = 28;
const COMPONENT_GAP = 28; // ~2 satır boşluk (14px × 2)
const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;

// ─────────────────────────────────────────────────────────────────────────────
// Height-aware pagination helper
// Groups visible items into pages based on accumulated natural height.
// Heights come from the DOM via ResizeObserver.
// If an item taller than USABLE_HEIGHT appears, it occupies its own page.
// ─────────────────────────────────────────────────────────────────────────────
function paginateItems(items: LayoutItem[], heights: Map<string, number>): LayoutItem[][] {
  const pages: LayoutItem[][] = [[]];

  let usedY = 0;
  for (const item of items) {
    const h = heights.get(item.instanceId) ?? 120;
    const gap = usedY > 0 ? COMPONENT_GAP : 0;

    if (usedY > 0 && usedY + gap + h > USABLE_HEIGHT) {
      // Start a new page
      pages.push([item]);
      usedY = h;
    } else {
      pages[pages.length - 1].push(item);
      usedY += gap + h;
    }
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component renderers
// ─────────────────────────────────────────────────────────────────────────────
const renderItemContent = (item: LayoutItem) => {
  const s = item.style as Record<string, unknown>;
  const baseStyle: React.CSSProperties = {
    padding: `${(s.padding as number) || 15}px`,
    backgroundColor: (s.backgroundColor as string) || 'transparent',
    borderColor: (s.borderColor as string) || 'transparent',
    borderWidth: `${(s.borderWidth as number) || 0}px`,
    borderStyle: (s.borderStyle as string) || 'solid',
    borderRadius: `${(s.borderRadius as number) || 0}px`,
    opacity: (s.opacity as number) || 1,
    color: (s.color as string) || '#000000',
    fontFamily: (s.fontFamily as string) || 'Lexend',
    fontSize: `${(s.fontSize as number) || 14}px`,
    lineHeight: (s.lineHeight as number) || 1.6,
    textAlign: ((s.textAlign as string) || 'left') as React.CSSProperties['textAlign'],
  };

  if (item.id === 'header') {
    const d = (item.specificData || {}) as { title?: string; subtitle?: string };
    return (
      <div className="flex flex-col justify-end border-b-2 border-zinc-900 pb-3" style={baseStyle}>
        <h1 className="font-black uppercase leading-none tracking-tight" style={{ fontSize: '2.5em' }}>
          {d.title || 'HİKAYE'}
        </h1>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">{d.subtitle}</span>
          <div className="flex gap-4">
            <span className="text-[10px] border-b border-black font-bold">İsim: ...............................</span>
            <span className="text-[10px] border-b border-black font-bold">Tarih: ..../..../20....</span>
          </div>
        </div>
      </div>
    );
  }

  if (item.id === 'story_block') {
    const d = (item.specificData || {}) as { text?: string };
    return (
      <div style={baseStyle}>
        <div className="break-words whitespace-pre-wrap leading-relaxed">{d.text}</div>
      </div>
    );
  }

  if (item.id === '5n1k') {
    const questions = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { type?: string; question?: string }[])
      : [];
    return (
      <div className="flex flex-col bg-zinc-50/50 rounded-2xl border border-zinc-200" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-accent border-b border-accent/20 pb-1">
          <i className="fa-solid fa-circle-question mr-2" />
          5N 1K — Okuduğunu Anlama Analizi
        </h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {questions.map((q, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">{q.type?.toUpperCase() || '-'}</span>
              <p className="text-[13px] font-bold leading-tight">{q.question || '-'}</p>
              <div className="h-6 border-b border-zinc-300 border-dashed" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'vocabulary') {
    const words = Array.isArray((item.specificData as Record<string, unknown>)?.['words'])
      ? ((item.specificData as Record<string, unknown>)['words'] as { word?: string; definition?: string }[])
      : [];
    return (
      <div className="flex flex-col bg-amber-50/30 rounded-2xl border border-amber-200/50" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-3 text-amber-700">
          <i className="fa-solid fa-spell-check mr-2" />
          Sözlükçe (Yeni Kelimeler)
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {words.map((v, i) => (
            <div key={i} className="text-[12px] flex flex-col">
              <span className="font-black text-amber-900 border-b border-amber-200 w-fit">{v.word}</span>
              <p className="opacity-70 italic text-[11px]">{v.definition}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'pedagogical_goals') {
    const d = (item.specificData || {}) as { note?: string; goals?: string[] };
    return (
      <div className="flex flex-col bg-emerald-50/50 rounded-2xl border border-emerald-200" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-2 text-emerald-800">
          <i className="fa-solid fa-brain mr-2" />
          Pedagojik Not ve Hedefler
        </h4>
        <p className="text-[11px] leading-relaxed italic opacity-80 mb-3">{d.note || '-'}</p>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(d.goals) ? d.goals : []).map((g, i) => (
            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase">
              # {g}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'test_questions') {
    const questions = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { question?: string; options?: string[] }[])
      : [];
    return (
      <div className="flex flex-col" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-indigo-700 border-b border-indigo-100 pb-1">
          <i className="fa-solid fa-list-check mr-2" />
          Konu Değerlendirme Testi
        </h4>
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {i + 1}
                </span>
                <p className="font-bold text-[14px] leading-snug">{q.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-9">
                {(Array.isArray(q.options) ? q.options : []).map((opt: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-[12px] opacity-80">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'logic_problem') {
    const puzzle = (item.specificData as Record<string, unknown>)?.['puzzle'] as { question?: string } | undefined;
    return (
      <div className="flex flex-col bg-orange-50/50 rounded-2xl border border-orange-200" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-3 text-orange-800">
          <i className="fa-solid fa-puzzle-piece mr-2" />
          Muhakeme ve Mantık Sorusu
        </h4>
        {puzzle ? (
          <div className="flex flex-col gap-3">
            <p className="font-bold text-[14px] bg-white p-3 rounded-xl border border-orange-100 shadow-sm leading-relaxed">{puzzle.question}</p>
            <div className="h-10 border-b border-orange-300 border-dashed opacity-50" />
          </div>
        ) : (
          <p className="text-xs italic opacity-40">Mantık sorusu hazırlanıyor...</p>
        )}
      </div>
    );
  }

  if (item.id === 'syllable_train') {
    const words = Array.isArray((item.specificData as Record<string, unknown>)?.['words'])
      ? ((item.specificData as Record<string, unknown>)['words'] as { syllables?: string[] }[])
      : [];
    return (
      <div className="flex flex-col" style={baseStyle}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-cyan-700">
          <i className="fa-solid fa-train mr-2" />
          Hecelerle Tren Yolculuğu
        </h4>
        <div className="flex flex-wrap gap-x-12 gap-y-8 justify-start">
          {words.map((w, i) => (
            <div key={i} className="flex items-end gap-0.5">
              <div className="w-10 h-10 bg-cyan-600 rounded-l-lg flex flex-col justify-center items-center text-white relative">
                <i className="fa-solid fa-train text-xs" />
              </div>
              {(Array.isArray(w.syllables) ? w.syllables : []).map((syl: string, si: number) => (
                <div key={si} className="w-12 h-10 border-2 border-cyan-700 border-l-0 bg-white flex items-center justify-center font-black text-sm">
                  {(syl || '').toUpperCase()}
                </div>
              ))}
              <div className="w-12 h-10 border-2 border-dashed border-cyan-300 border-l-0 bg-zinc-50 flex items-center justify-center text-cyan-200">?</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'creative_area') {
    const d = (item.specificData || {}) as { prompt?: string };
    return (
      <div className="flex flex-col rounded-3xl border-2 border-dashed border-zinc-200 p-6 relative" style={baseStyle}>
        <div className="absolute -top-3 left-8 px-4 bg-white font-black text-[11px] uppercase tracking-widest text-zinc-400">
          <i className="fa-solid fa-palette mr-2" />
          Düşün ve Tasarla
        </div>
        <p className="font-bold text-[13px] leading-relaxed text-zinc-600 mb-6 italic">"{d.prompt}"</p>
        <div className="h-32 rounded-2xl border-2 border-zinc-100 bg-zinc-50/20 flex items-center justify-center">
          <i className="fa-solid fa-pencil text-4xl text-zinc-100" />
        </div>
      </div>
    );
  }

  if (item.id === 'note_area') {
    return (
      <div className="flex flex-col bg-yellow-50/50 rounded-2xl border border-yellow-200" style={baseStyle}>
        <h4 className="font-black text-[9px] uppercase mb-2 text-yellow-800 opacity-60">Gözlem ve Değerlendirme Notları</h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 border-b border-yellow-200" />
          ))}
        </div>
      </div>
    );
  }

  return <div style={baseStyle}>{item.label}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Single component wrapper — reports its rendered height via onHeight callback
// ─────────────────────────────────────────────────────────────────────────────
const FlowItem = ({
  item,
  onHeight,
  onEdit,
  isSelected,
  onSelect,
}: {
  item: LayoutItem;
  onHeight: (id: string, h: number) => void;
  onEdit: (item: LayoutItem) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onHeight(item.instanceId, Math.ceil(entry.contentRect.height));
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [item.instanceId, onHeight]);

  return (
    <div
      ref={ref}
      data-instance={item.instanceId}
      className={`w-full transition-shadow cursor-default ${isSelected ? 'ring-2 ring-accent shadow-2xl' : ''}`}
      onClick={() => onSelect(item.instanceId)}
      onDoubleClick={() => onEdit(item)}
    >
      {renderItemContent(item)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Renderer
// ─────────────────────────────────────────────────────────────────────────────
export const ReadingStudioContentRenderer = ({
  layout,
  settings,
}: {
  layout: LayoutItem[];
  storyData?: unknown;
  settings?: Record<string, unknown>;
}) => {
  const { designMode, selectedId, setSelectedId } = useReadingStore();
  const [editingItem, setEditingItem] = useState<LayoutItem | null>(null);

  // Heights measured from DOM
  const [heights, setHeights] = useState<Map<string, number>>(new Map());

  const handleHeight = useCallback((id: string, h: number) => {
    setHeights((prev) => {
      if (prev.get(id) === h) return prev;
      const next = new Map(prev);
      next.set(id, h);
      return next;
    });
  }, []);

  if (!layout || !Array.isArray(layout)) return null;

  const isLandscape = settings?.orientation === 'landscape';
  const canvasWidth = isLandscape ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = isLandscape ? A4_WIDTH_PX : A4_HEIGHT_PX;

  // Only render visible items in their layout order
  const visibleItems = layout.filter((l) => l.isVisible);

  // Paginate using measured heights
  const pages = paginateItems(visibleItems, heights);

  return (
    <>
      <div className="flex flex-col gap-8 w-full items-center">
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className={`a4-page worksheet-page bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top ${designMode ? 'design-grid' : ''} ${isLandscape ? 'landscape' : ''}`}
            style={{
              width: canvasWidth,
              minHeight: canvasHeight,
              padding: `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${PAGE_PADDING_BOTTOM}px`,
              boxSizing: 'border-box',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: `${COMPONENT_GAP}px`,
            }}
          >
            {/* Page number */}
            <div
              style={{ zIndex: 0 }}
              className="absolute bottom-6 right-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest pointer-events-none"
            >
              S. {pageIndex + 1}
            </div>

            {pageItems.map((item) => (
              <FlowItem
                key={item.instanceId}
                item={item}
                onHeight={handleHeight}
                onEdit={(itm) => setEditingItem(itm)}
                isSelected={selectedId === item.instanceId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        ))}
      </div>

      {editingItem && (
        <ContentEditor
          item={editingItem}
          open={true}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
};
