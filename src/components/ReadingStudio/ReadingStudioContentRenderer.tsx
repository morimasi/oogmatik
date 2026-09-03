import React, { useState } from 'react';
import { LayoutItem } from '../../types';
import { useReadingStore } from '../../store/useReadingStore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';
import { ContentEditor } from './Editor/ContentEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Component Item Renderer
// Render individual layout items inside the continuous Word-style document flow
// ─────────────────────────────────────────────────────────────────────────────
const renderItemContent = (
  item: LayoutItem,
  onEdit: (item: LayoutItem) => void,
  isSelected: boolean,
  onSelect: (id: string) => void
) => {
  const s = item.style as Record<string, unknown>;
  const baseStyle: React.CSSProperties = {
    padding: `${(s.padding as number) || 16}px`,
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

  let content: React.ReactNode = null;

  // 1. HEADER
  if (item.id === 'header') {
    const d = (item.specificData || {}) as { title?: string; subtitle?: string };
    content = (
      <div className="flex flex-col justify-end border-b-2 border-zinc-900 pb-3" style={baseStyle}>
        <h1 className="font-black uppercase leading-none tracking-tight" style={{ fontSize: '2.4em' }}>
          {d.title || 'HİKAYE'}
        </h1>
        <div className="flex justify-between items-center mt-3">
          <span className="font-bold text-[11px] uppercase tracking-widest opacity-60">{d.subtitle}</span>
          <div className="flex gap-4">
            <span className="text-[11px] border-b border-black font-bold">İsim: ...............................</span>
            <span className="text-[11px] border-b border-black font-bold">Tarih: ..../..../20....</span>
          </div>
        </div>
      </div>
    );
  }
  // 2. STORY BLOCK (Kesintisiz Hikaye Metni)
  else if (item.id === 'story_block') {
    const d = (item.specificData || {}) as { text?: string };
    content = (
      <div style={baseStyle} className="story-text-block">
        <div className="break-words whitespace-pre-wrap leading-relaxed font-lexend text-[15px]">
          {d.text || ''}
        </div>
      </div>
    );
  }
  // 3. 5N1K ANALİZİ
  else if (item.id === '5n1k') {
    const questions = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { type?: string; question?: string }[])
      : [];
    content = (
      <div className="flex flex-col bg-zinc-50/50 rounded-2xl border border-zinc-200" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-4 text-accent border-b border-accent/20 pb-1.5 flex items-center gap-2">
          <i className="fa-solid fa-circle-question" />
          <span>5N 1K — Okuduğunu Anlama Analizi</span>
        </h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          {questions.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <span className="text-[10px] font-black opacity-50 uppercase tracking-tighter">
                {q.type?.toUpperCase() || '-'}
              </span>
              <p className="text-[13px] font-bold leading-snug">{q.question || '-'}</p>
              <div className="h-6 border-b border-zinc-300 border-dashed mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 4. SÖZLÜKÇE
  else if (item.id === 'vocabulary') {
    const words = Array.isArray((item.specificData as Record<string, unknown>)?.['words'])
      ? ((item.specificData as Record<string, unknown>)['words'] as { word?: string; definition?: string }[])
      : [];
    content = (
      <div className="flex flex-col bg-amber-50/40 rounded-2xl border border-amber-200/60" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-3 text-amber-800 flex items-center gap-2">
          <i className="fa-solid fa-spell-check" />
          <span>Sözlükçe (Yeni Kelimeler)</span>
        </h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {words.map((v, idx) => (
            <div key={idx} className="text-[12px] flex flex-col break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <span className="font-black text-amber-900 border-b border-amber-300 w-fit">{v.word}</span>
              <p className="opacity-75 italic text-[11px] mt-0.5">{v.definition}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 5. TEST SORULARI
  else if (item.id === 'test_questions') {
    const questions = Array.isArray((item.specificData as Record<string, unknown>)?.['questions'])
      ? ((item.specificData as Record<string, unknown>)['questions'] as { question?: string; options?: string[] }[])
      : [];
    content = (
      <div className="flex flex-col" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-4 text-indigo-800 border-b border-indigo-100 pb-1.5 flex items-center gap-2">
          <i className="fa-solid fa-list-check" />
          <span>Konu Değerlendirme Testi</span>
        </h4>
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="font-bold text-[14px] leading-snug">{q.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-9">
                {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-zinc-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="text-[12px] opacity-85">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 6. PEDAGOGICAL GOALS
  else if (item.id === 'pedagogical_goals') {
    const d = (item.specificData || {}) as { note?: string; goals?: string[] };
    content = (
      <div className="flex flex-col bg-emerald-50/50 rounded-2xl border border-emerald-200" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-2 text-emerald-800 flex items-center gap-2">
          <i className="fa-solid fa-brain" />
          <span>Pedagojik Not ve Hedefler</span>
        </h4>
        <p className="text-[11px] leading-relaxed italic opacity-85 mb-3">{d.note || '-'}</p>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(d.goals) ? d.goals : []).map((g, i) => (
            <span key={i} className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 rounded-md text-[10px] font-black uppercase">
              # {g}
            </span>
          ))}
        </div>
      </div>
    );
  }
  // 7. LOGIC PROBLEM
  else if (item.id === 'logic_problem') {
    const puzzle = (item.specificData as any)?.puzzle as { question?: string } | undefined;
    content = (
      <div className="flex flex-col bg-orange-50/50 rounded-2xl border border-orange-200" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-3 text-orange-800 flex items-center gap-2">
          <i className="fa-solid fa-puzzle-piece" />
          <span>Muhakeme ve Mantık Sorusu</span>
        </h4>
        {puzzle ? (
          <div className="flex flex-col gap-3">
            <p className="font-bold text-[14px] bg-white p-3.5 rounded-xl border border-orange-100 shadow-sm leading-relaxed">{puzzle.question}</p>
            <div className="h-10 border-b border-orange-300 border-dashed opacity-60" />
          </div>
        ) : (
          <p className="text-xs italic opacity-50">Mantık sorusu hazırlanıyor...</p>
        )}
      </div>
    );
  }
  // 8. SYLLABLE TRAIN
  else if (item.id === 'syllable_train') {
    const words = Array.isArray((item.specificData as any)?.words) ? (item.specificData as any).words : [];
    content = (
      <div className="flex flex-col" style={baseStyle}>
        <h4 className="font-black text-[12px] uppercase mb-4 text-cyan-800 flex items-center gap-2">
          <i className="fa-solid fa-train" />
          <span>Hecelerle Tren Yolculuğu</span>
        </h4>
        <div className="flex flex-wrap gap-x-12 gap-y-8 justify-start">
          {words.map((w: any, i: number) => (
            <div key={i} className="flex items-end gap-0.5 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
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
  // 9. CREATIVE AREA
  else if (item.id === 'creative_area') {
    const d = (item.specificData || {}) as { prompt?: string };
    content = (
      <div className="flex flex-col rounded-3xl border-2 border-dashed border-zinc-300 p-6 relative" style={baseStyle}>
        <div className="absolute -top-3.5 left-8 px-4 bg-white font-black text-[11px] uppercase tracking-widest text-zinc-500">
          <i className="fa-solid fa-palette mr-2" />
          Düşün ve Tasarla
        </div>
        <p className="font-bold text-[13px] leading-relaxed text-zinc-700 mb-5 italic">"{d.prompt}"</p>
        <div className="h-36 rounded-2xl border-2 border-zinc-200 bg-zinc-50/30 flex items-center justify-center">
          <i className="fa-solid fa-pencil text-4xl text-zinc-200" />
        </div>
      </div>
    );
  }
  // 10. NOTE AREA
  else if (item.id === 'note_area') {
    content = (
      <div className="flex flex-col bg-yellow-50/50 rounded-2xl border border-yellow-200" style={baseStyle}>
        <h4 className="font-black text-[10px] uppercase mb-2 text-yellow-900 opacity-70">Gözlem ve Değerlendirme Notları</h4>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 border-b border-yellow-300/60" />
          ))}
        </div>
      </div>
    );
  } else {
    content = <div style={baseStyle}>{item.label}</div>;
  }

  return (
    <div
      key={item.instanceId}
      data-instance={item.instanceId}
      className={`w-full transition-shadow cursor-default group hover:ring-1 hover:ring-accent/40 rounded-xl ${isSelected ? 'ring-2 ring-accent shadow-2xl' : ''}`}
      onClick={() => onSelect(item.instanceId)}
      onDoubleClick={() => onEdit(item)}
    >
      {content}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ReadingStudioContentRenderer — Word-Style Continuous Document Engine
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

  if (!layout || !Array.isArray(layout)) return null;

  const visibleItems = layout.filter((item) => item.isVisible);
  const isLandscape = settings?.orientation === 'landscape';
  const canvasWidth = isLandscape ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const minCanvasHeight = isLandscape ? A4_WIDTH_PX : A4_HEIGHT_PX;

  return (
    <>
      <div className="flex justify-center w-full">
        {/* Single continuous Word-style document container */}
        <div
          id="reading-studio-document"
          className={`worksheet-page a4-page bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.25)] ${designMode ? 'design-grid' : ''} ${isLandscape ? 'landscape' : ''}`}
          style={{
            width: canvasWidth,
            minHeight: minCanvasHeight,
            padding: '32px 36px 40px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px', // Standard 2-line spacing between components
          }}
        >
          {visibleItems.map((item) =>
            renderItemContent(item, setEditingItem, selectedId === item.instanceId, setSelectedId)
          )}
        </div>
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
