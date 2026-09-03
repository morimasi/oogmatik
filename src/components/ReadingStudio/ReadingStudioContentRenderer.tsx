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
// Usable height inside one A4 page (padded)
const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
const COMPONENT_GAP = 28; // ~2 satır boşluk

// ─────────────────────────────────────────────────────────────────────────────
// Component renderers  (pure, no hooks)
// ─────────────────────────────────────────────────────────────────────────────
const renderItemContent = (item: LayoutItem) => {
  const s = item.style as Record<string, unknown>;
  const base: React.CSSProperties = {
    padding: `${(s.padding as number) || 15}px`,
    backgroundColor: (s.backgroundColor as string) || 'transparent',
    borderColor: (s.borderColor as string) || 'transparent',
    borderWidth: `${(s.borderWidth as number) || 0}px`,
    borderStyle: (s.borderStyle as string) || 'solid',
    borderRadius: `${(s.borderRadius as number) || 0}px`,
    opacity: (s.opacity as number) ?? 1,
    color: (s.color as string) || '#000000',
    fontFamily: (s.fontFamily as string) || 'Lexend',
    fontSize: `${(s.fontSize as number) || 14}px`,
    lineHeight: (s.lineHeight as number) || 1.6,
    textAlign: ((s.textAlign as string) || 'left') as React.CSSProperties['textAlign'],
  };

  if (item.id === 'header') {
    const d = (item.specificData ?? {}) as { title?: string; subtitle?: string };
    return (
      <div className="flex flex-col justify-end border-b-2 border-zinc-900 pb-3" style={base}>
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
    const d = (item.specificData ?? {}) as { text?: string };
    return (
      <div style={base}>
        <div className="break-words whitespace-pre-wrap leading-relaxed">{d.text}</div>
      </div>
    );
  }

  if (item.id === '5n1k') {
    const qs = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { type?: string; question?: string }[])
      : [];
    return (
      <div className="flex flex-col bg-zinc-50/50 rounded-2xl border border-zinc-200" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-accent border-b border-accent/20 pb-1">
          <i className="fa-solid fa-circle-question mr-2" />5N 1K — Okuduğunu Anlama Analizi
        </h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {qs.map((q, i) => (
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
    const ws = Array.isArray((item.specificData as Record<string, unknown>)?.['words'])
      ? ((item.specificData as Record<string, unknown>)['words'] as { word?: string; definition?: string }[])
      : [];
    return (
      <div className="flex flex-col bg-amber-50/30 rounded-2xl border border-amber-200/50" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-3 text-amber-700">
          <i className="fa-solid fa-spell-check mr-2" />Sözlükçe (Yeni Kelimeler)
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {ws.map((v, i) => (
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
    const d = (item.specificData ?? {}) as { note?: string; goals?: string[] };
    return (
      <div className="flex flex-col bg-emerald-50/50 rounded-2xl border border-emerald-200" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-2 text-emerald-800">
          <i className="fa-solid fa-brain mr-2" />Pedagojik Not ve Hedefler
        </h4>
        <p className="text-[11px] leading-relaxed italic opacity-80 mb-3">{d.note || '-'}</p>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(d.goals) ? d.goals : []).map((g, i) => (
            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase">
              #{g}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (item.id === 'test_questions') {
    const qs = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { question?: string; options?: string[] }[])
      : [];
    return (
      <div className="flex flex-col" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-indigo-700 border-b border-indigo-100 pb-1">
          <i className="fa-solid fa-list-check mr-2" />Konu Değerlendirme Testi
        </h4>
        <div className="space-y-6">
          {qs.map((q, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                <p className="font-bold text-[14px] leading-snug">{q.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-9">
                {(Array.isArray(q.options) ? q.options : []).map((opt: string, oi: number) => (
                  <div key={oi} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + oi)}
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
    const puzzle = ((item.specificData as Record<string, unknown>)?.['puzzle']) as { question?: string } | undefined;
    return (
      <div className="flex flex-col bg-orange-50/50 rounded-2xl border border-orange-200" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-3 text-orange-800">
          <i className="fa-solid fa-puzzle-piece mr-2" />Muhakeme ve Mantık Sorusu
        </h4>
        {puzzle ? (
          <>
            <p className="font-bold text-[14px] bg-white p-3 rounded-xl border border-orange-100 shadow-sm leading-relaxed">{puzzle.question}</p>
            <div className="h-10 border-b border-orange-300 border-dashed opacity-50 mt-3" />
          </>
        ) : (
          <p className="text-xs italic opacity-40">Mantık sorusu hazırlanıyor...</p>
        )}
      </div>
    );
  }

  if (item.id === 'syllable_train') {
    const ws = Array.isArray((item.specificData as Record<string, unknown>)?.['words'])
      ? ((item.specificData as Record<string, unknown>)['words'] as { syllables?: string[] }[])
      : [];
    return (
      <div className="flex flex-col" style={base}>
        <h4 className="font-black text-[11px] uppercase mb-4 text-cyan-700">
          <i className="fa-solid fa-train mr-2" />Hecelerle Tren Yolculuğu
        </h4>
        <div className="flex flex-wrap gap-x-12 gap-y-8 justify-start">
          {ws.map((w, i) => (
            <div key={i} className="flex items-end gap-0.5">
              <div className="w-10 h-10 bg-cyan-600 rounded-l-lg flex items-center justify-center text-white">
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
    const d = (item.specificData ?? {}) as { prompt?: string };
    return (
      <div className="flex flex-col rounded-3xl border-2 border-dashed border-zinc-200 p-6 relative" style={base}>
        <div className="absolute -top-3 left-8 px-4 bg-white font-black text-[11px] uppercase tracking-widest text-zinc-400">
          <i className="fa-solid fa-palette mr-2" />Düşün ve Tasarla
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
      <div className="flex flex-col bg-yellow-50/50 rounded-2xl border border-yellow-200" style={base}>
        <h4 className="font-black text-[9px] uppercase mb-2 text-yellow-800 opacity-60">Gözlem ve Değerlendirme Notları</h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 border-b border-yellow-200" />)}
        </div>
      </div>
    );
  }

  return <div style={base}>{item.label}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// FlowItem — measures its own height via ResizeObserver
// ─────────────────────────────────────────────────────────────────────────────
const FlowItem = ({
  item,
  onHeight,
  selected,
  onSelect,
  onEdit,
}: {
  item: LayoutItem;
  onHeight: (id: string, h: number) => void;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (item: LayoutItem) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) onHeight(item.instanceId, Math.ceil(e.contentRect.height));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [item.instanceId, onHeight]);

  return (
    <div
      ref={ref}
      className={`w-full transition-shadow ${selected ? 'ring-2 ring-accent shadow-xl' : ''}`}
      onClick={() => onSelect(item.instanceId)}
      onDoubleClick={() => onEdit(item)}
      style={{ cursor: 'default' }}
    >
      {renderItemContent(item)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sliding-window page engine
//
// How it works:
//   1. All visible items are rendered in a SINGLE hidden "tape" div (full height)
//   2. We measure each component's actual rendered height
//   3. A4 "windows" clip a USABLE_HEIGHT slice of the tape via overflow:hidden
//      + a negative translateY to slide to the correct position
//   4. Result: any overflowing component is naturally split at the page boundary
//      and continues seamlessly on the next page — exactly like Word / PDF
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

  const visibleItems = layout.filter((l) => l.isVisible);

  // ── Calculate total tape height and page-break offsets ──
  // We accumulate top-positions for each item. Page breaks occur every USABLE_HEIGHT px.
  const itemTops: number[] = [];
  let cursor = 0;
  for (let i = 0; i < visibleItems.length; i++) {
    const gap = i === 0 ? 0 : COMPONENT_GAP;
    cursor += gap;
    itemTops.push(cursor);
    const h = heights.get(visibleItems[i].instanceId) ?? 80;
    cursor += h;
  }
  const totalTapeHeight = cursor;

  // Page break offsets: 0, USABLE_HEIGHT, 2*USABLE_HEIGHT, …
  const pageCount = Math.max(1, Math.ceil(totalTapeHeight / USABLE_HEIGHT));
  const pageOffsets = Array.from({ length: pageCount }, (_, i) => i * USABLE_HEIGHT);

  return (
    <>
      <div className="flex flex-col gap-8 w-full items-center">
        {pageOffsets.map((offset, pageIndex) => (
          <div
            key={pageIndex}
            className={`a4-page worksheet-page bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top relative ${designMode ? 'design-grid' : ''} ${isLandscape ? 'landscape' : ''}`}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Page number watermark */}
            <div className="absolute bottom-5 right-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest pointer-events-none z-10">
              S. {pageIndex + 1}
            </div>

            {/*
              The "tape" — all items rendered in flow.
              We slide it up by `offset` to show the correct slice.
              PAGE_PADDING_TOP is only applied on page 1; subsequent pages
              start exactly where page 1 ended (no padding gap between pages).
            */}
            <div
              style={{
                paddingLeft: PAGE_PADDING_X,
                paddingRight: PAGE_PADDING_X,
                paddingTop: pageIndex === 0 ? PAGE_PADDING_TOP : 0,
                paddingBottom: PAGE_PADDING_BOTTOM,
                display: 'flex',
                flexDirection: 'column',
                gap: COMPONENT_GAP,
                transform: `translateY(-${offset}px)`,
                // Ensure the tape always has enough room
                minHeight: totalTapeHeight + PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM,
              }}
            >
              {visibleItems.map((item) => (
                <FlowItem
                  key={item.instanceId}
                  item={item}
                  onHeight={handleHeight}
                  selected={selectedId === item.instanceId}
                  onSelect={setSelectedId}
                  onEdit={(itm) => setEditingItem(itm)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <ContentEditor item={editingItem} open onClose={() => setEditingItem(null)} />
      )}
    </>
  );
};
