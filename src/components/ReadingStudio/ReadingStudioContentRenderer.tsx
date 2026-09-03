import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutItem } from '../../types';
import { useReadingStore } from '../../store/useReadingStore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';
import { ContentEditor } from './Editor/ContentEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Page Layout Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_PADDING_TOP = 24;
const PAGE_PADDING_BOTTOM = 32;
const PAGE_PADDING_X = 28;
const COMPONENT_GAP = 24; // Boşluk bileşenler arası (~2 satır)
const SUBUNIT_GAP = 12;   // Aynı bileşenin alt soruları/paragrafları arası boşluk
const USABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Unit Decomposition Interface
// ─────────────────────────────────────────────────────────────────────────────
interface SubUnit {
  key: string;              // unique id: `${instanceId}_sub_${subIndex}`
  instanceId: string;
  item: LayoutItem;
  subIndex: number;
  totalSubIndexCount: number;
  data: any;
}

interface ComponentSlice {
  item: LayoutItem;
  sliceKey: string;
  subUnits: SubUnit[];
  isContinuation: boolean;
  isPartial: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Decompose LayoutItem into Atomic Sub-Units
// ─────────────────────────────────────────────────────────────────────────────
function decomposeItem(item: LayoutItem): SubUnit[] {
  const instanceId = item.instanceId;

  if (item.id === 'story_block') {
    const text = (item.specificData as any)?.text || '';
    const paragraphs = text.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
    const list = paragraphs.length > 0 ? paragraphs : [text];
    return list.map((para: string, idx: number) => ({
      key: `${instanceId}_sub_${idx}`,
      instanceId,
      item,
      subIndex: idx,
      totalSubIndexCount: list.length,
      data: para,
    }));
  }

  if (item.id === '5n1k') {
    const questions = Array.isArray((item.specificData as any)?.questions) ? (item.specificData as any).questions : [];
    const list = questions.length > 0 ? questions : [{ type: '-', question: '-' }];
    return list.map((q: any, idx: number) => ({
      key: `${instanceId}_sub_${idx}`,
      instanceId,
      item,
      subIndex: idx,
      totalSubIndexCount: list.length,
      data: q,
    }));
  }

  if (item.id === 'test_questions') {
    const questions = Array.isArray((item.specificData as any)?.questions) ? (item.specificData as any).questions : [];
    const list = questions.length > 0 ? questions : [{ question: '-', options: [] }];
    return list.map((q: any, idx: number) => ({
      key: `${instanceId}_sub_${idx}`,
      instanceId,
      item,
      subIndex: idx,
      totalSubIndexCount: list.length,
      data: q,
    }));
  }

  if (item.id === 'vocabulary') {
    const words = Array.isArray((item.specificData as any)?.words) ? (item.specificData as any).words : [];
    const list = words.length > 0 ? words : [{ word: '-', definition: '-' }];
    return list.map((w: any, idx: number) => ({
      key: `${instanceId}_sub_${idx}`,
      instanceId,
      item,
      subIndex: idx,
      totalSubIndexCount: list.length,
      data: w,
    }));
  }

  // Non-decomposable (indivisible) items
  return [
    {
      key: `${instanceId}_sub_0`,
      instanceId,
      item,
      subIndex: 0,
      totalSubIndexCount: 1,
      data: item.specificData,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Unit Level Pagination Engine
// Groups sub-units into page slices based on measured DOM heights.
// ─────────────────────────────────────────────────────────────────────────────
function paginateSubUnits(
  items: LayoutItem[],
  heights: Map<string, number>
): ComponentSlice[][] {
  const visibleItems = items.filter((i) => i.isVisible);
  const allSubUnits: SubUnit[] = visibleItems.flatMap(decomposeItem);

  const pagesSubUnits: SubUnit[][] = [[]];
  let usedY = 0;

  for (let i = 0; i < allSubUnits.length; i++) {
    const subUnit = allSubUnits[i];
    const measuredH = heights.get(subUnit.key) ?? (subUnit.item.id === 'header' ? 100 : 80);

    const isFirstSubUnitOfItem = subUnit.subIndex === 0;
    const gap = usedY > 0 ? (isFirstSubUnitOfItem ? COMPONENT_GAP : SUBUNIT_GAP) : 0;

    if (usedY > 0 && usedY + gap + measuredH > USABLE_HEIGHT) {
      // Move to next page
      pagesSubUnits.push([subUnit]);
      usedY = measuredH;
    } else {
      pagesSubUnits[pagesSubUnits.length - 1].push(subUnit);
      usedY += gap + measuredH;
    }
  }

  // Convert sub-units on each page into grouped ComponentSlices
  return pagesSubUnits.map((pageSubs, pageIdx) => {
    const slices: ComponentSlice[] = [];
    let currentSlice: ComponentSlice | null = null;

    for (const sub of pageSubs) {
      if (!currentSlice || currentSlice.item.instanceId !== sub.instanceId) {
        if (currentSlice) slices.push(currentSlice);
        currentSlice = {
          item: sub.item,
          sliceKey: `${sub.instanceId}_page_${pageIdx}_sub_${sub.subIndex}`,
          subUnits: [sub],
          isContinuation: sub.subIndex > 0,
          isPartial: false, // will update below
        };
      } else {
        currentSlice.subUnits.push(sub);
      }
    }
    if (currentSlice) slices.push(currentSlice);

    // Update isPartial flag
    slices.forEach((slice) => {
      const lastSub = slice.subUnits[slice.subUnits.length - 1];
      slice.isPartial = lastSub.subIndex + 1 < lastSub.totalSubIndexCount;
    });

    return slices;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Unit Render Wrapper (reports measured height to parent via ResizeObserver)
// ─────────────────────────────────────────────────────────────────────────────
const MeasurableSubUnit = ({
  subKey,
  children,
  onHeight,
}: {
  subKey: string;
  children: React.ReactNode;
  onHeight: (key: string, h: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onHeight(subKey, Math.ceil(entry.contentRect.height));
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [subKey, onHeight]);

  return <div ref={ref}>{children}</div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice Renderer for grouped sub-units of a component
// ─────────────────────────────────────────────────────────────────────────────
const renderComponentSlice = (
  slice: ComponentSlice,
  onHeight: (key: string, h: number) => void,
  onEdit: (item: LayoutItem) => void,
  isSelected: boolean,
  onSelect: (id: string) => void
) => {
  const { item, isContinuation, subUnits } = slice;
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

  const continuationBadge = isContinuation ? (
    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md mb-2 uppercase tracking-wider w-fit">
      <i className="fa-solid fa-turn-down-right" />
      <span>{item.label} (Devamı)</span>
    </div>
  ) : null;

  let sliceContent: React.ReactNode = null;

  // 1. HEADER
  if (item.id === 'header') {
    const d = (item.specificData || {}) as { title?: string; subtitle?: string };
    sliceContent = (
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
  // 2. STORY BLOCK (Paragraf parçaları)
  else if (item.id === 'story_block') {
    sliceContent = (
      <div style={baseStyle} className="flex flex-col gap-3">
        {continuationBadge}
        {subUnits.map((sub) => (
          <MeasurableSubUnit key={sub.key} subKey={sub.key} onHeight={onHeight}>
            <p className="break-words whitespace-pre-wrap leading-relaxed">{sub.data}</p>
          </MeasurableSubUnit>
        ))}
      </div>
    );
  }
  // 3. 5N1K (Soru parçaları)
  else if (item.id === '5n1k') {
    sliceContent = (
      <div className="flex flex-col bg-zinc-50/50 rounded-2xl border border-zinc-200" style={baseStyle}>
        {!isContinuation ? (
          <h4 className="font-black text-[11px] uppercase mb-4 text-accent border-b border-accent/20 pb-1">
            <i className="fa-solid fa-circle-question mr-2" />
            5N 1K — Okuduğunu Anlama Analizi
          </h4>
        ) : (
          continuationBadge
        )}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {subUnits.map((sub) => {
            const q = sub.data;
            return (
              <MeasurableSubUnit key={sub.key} subKey={sub.key} onHeight={onHeight}>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
                    {q.type?.toUpperCase() || '-'}
                  </span>
                  <p className="text-[13px] font-bold leading-tight">{q.question || '-'}</p>
                  <div className="h-6 border-b border-zinc-300 border-dashed" />
                </div>
              </MeasurableSubUnit>
            );
          })}
        </div>
      </div>
    );
  }
  // 4. VOCABULARY (Sözlük parçaları)
  else if (item.id === 'vocabulary') {
    sliceContent = (
      <div className="flex flex-col bg-amber-50/30 rounded-2xl border border-amber-200/50" style={baseStyle}>
        {!isContinuation ? (
          <h4 className="font-black text-[11px] uppercase mb-3 text-amber-700">
            <i className="fa-solid fa-spell-check mr-2" />
            Sözlükçe (Yeni Kelimeler)
          </h4>
        ) : (
          continuationBadge
        )}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {subUnits.map((sub) => {
            const v = sub.data;
            return (
              <MeasurableSubUnit key={sub.key} subKey={sub.key} onHeight={onHeight}>
                <div className="text-[12px] flex flex-col">
                  <span className="font-black text-amber-900 border-b border-amber-200 w-fit">{v.word}</span>
                  <p className="opacity-70 italic text-[11px]">{v.definition}</p>
                </div>
              </MeasurableSubUnit>
            );
          })}
        </div>
      </div>
    );
  }
  // 5. TEST QUESTIONS (Çoktan seçmeli soru parçaları)
  else if (item.id === 'test_questions') {
    sliceContent = (
      <div className="flex flex-col" style={baseStyle}>
        {!isContinuation ? (
          <h4 className="font-black text-[11px] uppercase mb-4 text-indigo-700 border-b border-indigo-100 pb-1">
            <i className="fa-solid fa-list-check mr-2" />
            Konu Değerlendirme Testi
          </h4>
        ) : (
          continuationBadge
        )}
        <div className="space-y-6">
          {subUnits.map((sub) => {
            const q = sub.data;
            return (
              <MeasurableSubUnit key={sub.key} subKey={sub.key} onHeight={onHeight}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {sub.subIndex + 1}
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
              </MeasurableSubUnit>
            );
          })}
        </div>
      </div>
    );
  }
  // 6. PEDAGOGICAL GOALS
  else if (item.id === 'pedagogical_goals') {
    const d = (item.specificData || {}) as { note?: string; goals?: string[] };
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
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
      </MeasurableSubUnit>
    );
  }
  // 7. LOGIC PROBLEM
  else if (item.id === 'logic_problem') {
    const puzzle = (item.specificData as any)?.puzzle as { question?: string } | undefined;
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
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
      </MeasurableSubUnit>
    );
  }
  // 8. SYLLABLE TRAIN
  else if (item.id === 'syllable_train') {
    const words = Array.isArray((item.specificData as any)?.words) ? (item.specificData as any).words : [];
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
        <div className="flex flex-col" style={baseStyle}>
          <h4 className="font-black text-[11px] uppercase mb-4 text-cyan-700">
            <i className="fa-solid fa-train mr-2" />
            Hecelerle Tren Yolculuğu
          </h4>
          <div className="flex flex-wrap gap-x-12 gap-y-8 justify-start">
            {words.map((w: any, i: number) => (
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
      </MeasurableSubUnit>
    );
  }
  // 9. CREATIVE AREA
  else if (item.id === 'creative_area') {
    const d = (item.specificData || {}) as { prompt?: string };
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
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
      </MeasurableSubUnit>
    );
  }
  // 10. NOTE AREA
  else if (item.id === 'note_area') {
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
        <div className="flex flex-col bg-yellow-50/50 rounded-2xl border border-yellow-200" style={baseStyle}>
          <h4 className="font-black text-[9px] uppercase mb-2 text-yellow-800 opacity-60">Gözlem ve Değerlendirme Notları</h4>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 border-b border-yellow-200" />
            ))}
          </div>
        </div>
      </MeasurableSubUnit>
    );
  } else {
    sliceContent = (
      <MeasurableSubUnit subKey={subUnits[0].key} onHeight={onHeight}>
        <div style={baseStyle}>{item.label}</div>
      </MeasurableSubUnit>
    );
  }

  return (
    <div
      key={slice.sliceKey}
      data-instance={item.instanceId}
      className={`w-full transition-shadow cursor-default ${isSelected ? 'ring-2 ring-accent shadow-2xl' : ''}`}
      onClick={() => onSelect(item.instanceId)}
      onDoubleClick={() => onEdit(item)}
    >
      {sliceContent}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ReadingStudioContentRenderer Component
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

  // Sub-unit DOM measured heights map
  const [heights, setHeights] = useState<Map<string, number>>(new Map());

  const handleHeight = useCallback((key: string, h: number) => {
    setHeights((prev) => {
      if (prev.get(key) === h) return prev;
      const next = new Map(prev);
      next.set(key, h);
      return next;
    });
  }, []);

  if (!layout || !Array.isArray(layout)) return null;

  const isLandscape = settings?.orientation === 'landscape';
  const canvasWidth = isLandscape ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = isLandscape ? A4_WIDTH_PX : A4_HEIGHT_PX;

  // Compute page slices using sub-unit heights
  const pagesSlices = paginateSubUnits(layout, heights);

  return (
    <>
      <div className="flex flex-col gap-8 w-full items-center">
        {pagesSlices.map((slices, pageIndex) => (
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
            {/* Page indicator watermark */}
            <div
              style={{ zIndex: 0 }}
              className="absolute bottom-6 right-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest pointer-events-none"
            >
              S. {pageIndex + 1}
            </div>

            {slices.map((slice) =>
              renderComponentSlice(slice, handleHeight, setEditingItem, selectedId === slice.item.instanceId, setSelectedId)
            )}
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
