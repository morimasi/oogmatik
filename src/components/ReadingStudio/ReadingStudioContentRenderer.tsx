import React, { useRef } from 'react';
import { ImageDisplay } from '../sheets/common';
import { InteractiveStoryData, LayoutItem } from '../../types';
import { useReadingStore } from '../../store/useReadingStore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';

const DraggableItem = ({
  item,
  children,
  canvasWidth,
}: {
  item: any;
  children: any;
  key?: any;
  canvasWidth: number;
}) => {
  const { designMode, updateComponent, setSelectedId, selectedId, layout, setLayout } =
    useReadingStore();
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const initialLayout = useRef<LayoutItem[]>([]);

  const handleMouseDown = (e: any) => {
    if (!designMode) return;

    const isResizeHandle = e.target.closest('.resize-handle');
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    initialLayout.current = [...layout];

    const initialStyle = { ...item.style };
    setSelectedId(item.instanceId);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;

      const dx = moveEvent.clientX - startPos.current.x;
      const dy = moveEvent.clientY - startPos.current.y;

      if (isResizeHandle) {
        const newW = Math.max(50, Math.round((initialStyle.w + dx) / 8) * 8);
        const newH = Math.max(30, Math.round((initialStyle.h + dy) / 8) * 8);
        const heightDiff = newH - initialStyle.h;

        setLayout(
          initialLayout.current.map((l) => {
            if (l.instanceId === item.instanceId) {
              return { ...l, style: { ...l.style, w: newW, h: newH } };
            }

            const initY = Number(initialStyle.y) || 0;
            const initH = Number(initialStyle.h) || 0;
            if (l.pageIndex === item.pageIndex && Number(l.style.y) >= initY + initH - 10) {
              return {
                ...l,
                style: { ...l.style, y: Number(l.style.y) + heightDiff },
              };
            }
            return l;
          })
        );
      } else {
        let newX = Math.round((initialStyle.x + dx) / 8) * 8;
        const newY = Math.round((initialStyle.y + dy) / 8) * 8;

        const centerX = canvasWidth / 2;
        const itemCenterX = newX + initialStyle.w / 2;

        if (Math.abs(itemCenterX - centerX) < 15) {
          newX = centerX - initialStyle.w / 2;
        }
        if (Math.abs(newX - 20) < 15) newX = 20;
        if (Math.abs(newX + initialStyle.w - (canvasWidth - 20)) < 15) {
          newX = canvasWidth - 20 - initialStyle.w;
        }

        setLayout(
          initialLayout.current.map((l) => {
            if (l.instanceId === item.instanceId) {
              return { ...l, style: { ...l.style, x: newX, y: newY } };
            }
            return l;
          })
        );
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const isSelected = selectedId === item.instanceId;

  return (
    <div
      className={`absolute group transition-shadow ${designMode ? 'cursor-move ring-accent/20' : ''} ${isSelected && designMode ? 'ring-2 ring-accent shadow-2xl z-50' : ''}`}
      style={{
        left: item.style.x,
        top: item.style.y,
        width: item.style.w,
        height: item.style.h,
        transform: `rotate(${item.style.rotation || 0}deg)`,
        zIndex: item.style.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {designMode && isSelected && (
        <>
          <div className="absolute -top-10 left-0 bg-accent text-white text-[8px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <i className="fa-solid fa-arrows-up-down-left-right"></i>
            {item.label}
          </div>
          <div className="resize-handle absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-accent rounded-md shadow-lg cursor-nwse-resize z-50 flex items-center justify-center">
            <div className="w-1 h-1 bg-accent rounded-full"></div>
          </div>
          <div className="absolute inset-0 ring-2 ring-accent ring-offset-2 pointer-events-none"></div>
        </>
      )}
      {children}
    </div>
  );
};

export const ReadingStudioContentRenderer = ({
  layout,
  storyData,
  settings,
}: {
  layout: LayoutItem[];
  storyData: InteractiveStoryData | null;
  settings?: any;
}) => {
  const { designMode } = useReadingStore();
  if (!layout || !Array.isArray(layout)) return null;

  const isLandscape = settings?.orientation === 'landscape';
  const canvasWidth = isLandscape ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = isLandscape ? A4_WIDTH_PX : A4_HEIGHT_PX;

  const renderItemContent = (item: any) => {
    const s = item.style;
    const boxStyle = {
      padding: `${s.padding || 15}px`,
      backgroundColor: s.backgroundColor || 'transparent',
      borderColor: s.borderColor || 'transparent',
      borderWidth: `${s.borderWidth || 0}px`,
      borderStyle: s.borderStyle || 'solid',
      borderRadius: `${s.borderRadius || 0}px`,
      opacity: s.opacity || 1,
      color: s.color || '#000000',
      fontFamily: s.fontFamily || 'Lexend',
      fontSize: `${s.fontSize || 14}px`,
      lineHeight: s.lineHeight || 1.5,
      textAlign: (s.textAlign as any) || 'left',
    };

    // 1. HEADER
    if (item.id === 'header') {
      const data = item.specificData || { title: 'HİKAYE', subtitle: '' };
      return (
        <div className="h-full flex flex-col justify-end border-b-2 border-zinc-900 pb-2" style={boxStyle}>
          <h1 className="font-black uppercase leading-none tracking-tight" style={{ fontSize: '2.5em' }}>
            {data.title}
          </h1>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">
                {data.subtitle}
            </span>
            <div className="flex gap-4">
                <span className="text-[10px] border-b border-black font-bold">İsim: ...............................</span>
                <span className="text-[10px] border-b border-black font-bold">Tarih: ..../..../20....</span>
            </div>
          </div>
        </div>
      );
    }

    // 2. STORY BLOCK
    if (item.id === 'story_block') {
      const data = item.specificData || { text: '' };
      return (
        <div className="relative" style={boxStyle}>
          <div className="reading-text-flow break-words whitespace-pre-wrap leading-relaxed">
            {data.text}
          </div>
        </div>
      );
    }

    // 3. 5N1K ANALYSIS
    if (item.id === '5n1k') {
      const questions = Array.isArray(item.specificData?.questions) ? item.specificData.questions : [];
      return (
        <div className="flex flex-col h-full bg-zinc-50/50 rounded-2xl border border-zinc-200" style={boxStyle}>
          <h4 className="font-black text-[11px] uppercase mb-4 text-accent border-b border-accent/20 pb-1">
            <i className="fa-solid fa-circle-question mr-2"></i>
            5N 1K - Okuduğunu Anlama Analizi
          </h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {questions.map((q: any, i: number) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter">
                  {q.type?.toUpperCase() || '-'}
                </span>
                <p className="text-[13px] font-bold leading-tight">{q.question || '-'}</p>
                <div className="h-6 border-b border-zinc-300 border-dashed"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. VOCABULARY
    if (item.id === 'vocabulary') {
      const words = Array.isArray(item.specificData?.words) ? item.specificData.words : [];
      return (
        <div className="flex flex-col h-full bg-amber-50/30 rounded-2xl border border-amber-200/50" style={boxStyle}>
          <h4 className="font-black text-[11px] uppercase mb-3 text-amber-700">
            <i className="fa-solid fa-spell-check mr-2"></i>
            Sözlükçe (Yeni Kelimeler)
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {words.map((v: any, i: number) => (
              <div key={i} className="text-[12px] flex flex-col">
                <span className="font-black text-amber-900 border-b border-amber-200 w-fit">{v.word}</span>
                <p className="opacity-70 italic text-[11px]">{v.definition}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. PEDAGOGICAL GOALS
    if (item.id === 'pedagogical_goals') {
      const data = item.specificData || { note: '', goals: [] };
      return (
          <div className="flex flex-col h-full bg-emerald-50/50 rounded-2xl border border-emerald-200" style={boxStyle}>
               <h4 className="font-black text-[11px] uppercase mb-2 text-emerald-800">
                   <i className="fa-solid fa-brain mr-2"></i>
                   Pedagojik Not ve Hedefler
               </h4>
               <p className="text-[11px] leading-relaxed italic opacity-80 mb-3">{data.note}</p>
               <div className="flex flex-wrap gap-2">
                    {data.goals?.map((g: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase">
                            # {g}
                        </span>
                    ))}
               </div>
          </div>
      );
    }

    // 6. TEST QUESTIONS
    if (item.id === 'test_questions') {
        const questions = Array.isArray(item.specificData?.questions) ? item.specificData.questions : [];
        return (
            <div className="flex flex-col h-full" style={boxStyle}>
                 <h4 className="font-black text-[11px] uppercase mb-4 text-indigo-700 border-b border-indigo-100 pb-1">
                     <i className="fa-solid fa-list-check mr-2"></i>
                     Konu Değerlendirme Testi
                 </h4>
                 <div className="space-y-6">
                    {questions.map((q: any, i: number) => (
                        <div key={i} className="flex flex-col gap-2">
                             <div className="flex gap-3">
                                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</span>
                                <p className="font-bold text-[14px] leading-snug">{q.question}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-9">
                                {(Array.isArray(q.options) ? q.options : []).map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] font-bold">
                                            {String.fromCharCode(65 + optIdx)}
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

    // 7. LOGIC PROBLEMS
    if (item.id === 'logic_problem') {
        const puzzle = item.specificData?.puzzle;
        return (
            <div className="flex flex-col h-full bg-orange-50/50 rounded-2xl border border-orange-200" style={boxStyle}>
                 <h4 className="font-black text-[11px] uppercase mb-3 text-orange-800">
                     <i className="fa-solid fa-puzzle-piece mr-2"></i>
                     Muhakeme ve Mantık Sorusu
                 </h4>
                 {puzzle ? (
                     <div className="flex flex-col gap-3">
                         <p className="font-bold text-[14px] bg-white p-3 rounded-xl border border-orange-100 shadow-sm leading-relaxed">
                            {puzzle.question}
                         </p>
                         <div className="h-10 border-b border-orange-300 border-dashed opacity-50"></div>
                     </div>
                 ) : (
                     <p className="text-xs italic opacity-40">Mantık sorusu hazırlanıyor...</p>
                 )}
            </div>
        );
    }

    // 8. SYLLABLE TRAIN (Vagon Tasarımı)
    if (item.id === 'syllable_train') {
        const words = Array.isArray(item.specificData?.words) ? item.specificData.words : [];
        return (
            <div className="flex flex-col h-full" style={boxStyle}>
                 <h4 className="font-black text-[11px] uppercase mb-4 text-cyan-700">
                     <i className="fa-solid fa-train mr-2"></i>
                     Hecelerle Tren Yolculuğu (5-10 Kelime)
                 </h4>
                 <div className="flex flex-wrap gap-x-12 gap-y-8 justify-start">
                    {words.map((w: any, i: number) => (
                        <div key={i} className="flex items-end gap-0.5">
                             {/* Locomotive Placeholder (Simplified) */}
                             <div className="w-10 h-10 bg-cyan-600 rounded-l-lg flex flex-col justify-center items-center text-white relative">
                                 <i className="fa-solid fa-steam-symbol text-[10px] absolute -top-4"></i>
                                 <i className="fa-solid fa-train text-xs"></i>
                             </div>
                             {/* Syllable Wagons */}
                             {(Array.isArray(w.syllables) ? w.syllables : []).map((syl: string, sylIdx: number) => (
                                 <div key={sylIdx} className="w-12 h-10 border-2 border-cyan-700 border-l-0 bg-white flex items-center justify-center font-black text-sm relative group overflow-hidden">
                                    {syl.toUpperCase()}
                                    <div className="absolute bottom-0 h-1 bg-cyan-700/20 w-full"></div>
                                    {/* Wheels */}
                                    <div className="absolute -bottom-1 w-[120%] flex justify-around px-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white"></div>
                                    </div>
                                 </div>
                             ))}
                             {/* Empty Wagon for Practice */}
                             <div className="w-12 h-10 border-2 border-dashed border-cyan-300 border-l-0 bg-zinc-50 flex items-center justify-center text-cyan-200">
                                 ?
                             </div>
                        </div>
                    ))}
                 </div>
            </div>
        );
    }

    // 9. CREATIVE AREA
    if (item.id === 'creative_area') {
        const data = item.specificData || { prompt: '' };
        return (
            <div className="h-full flex flex-col rounded-3xl border-2 border-dashed border-zinc-200 p-6 relative" style={boxStyle}>
                 <div className="absolute -top-3 left-8 px-4 bg-white font-black text-[11px] uppercase tracking-widest text-zinc-400">
                     <i className="fa-solid fa-palette mr-2"></i>
                     Düşün ve Tasarla (Yaratıcı Alan)
                 </div>
                 <p className="font-bold text-[13px] leading-relaxed text-zinc-600 mb-6 italic">
                    "{data.prompt}"
                 </p>
                 <div className="flex-1 rounded-2xl border-2 border-zinc-100 bg-zinc-50/20 flex items-center justify-center group">
                      <i className="fa-solid fa-pencil text-4xl text-zinc-100 group-hover:scale-110 transition-transform"></i>
                 </div>
            </div>
        );
    }

    // 10. NOTES AREA
    if (item.id === 'note_area') {
        return (
            <div className="h-full flex flex-col bg-yellow-50/50 rounded-2xl border border-yellow-200 p-4" style={boxStyle}>
                <h4 className="font-black text-[9px] uppercase mb-2 text-yellow-800 opacity-60">Gözlem ve Değerlendirme Notları</h4>
                <div className="flex-1 space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-6 border-b border-yellow-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    return <div style={boxStyle}>{item.label}</div>;
  };

  return (
    <div className="flex flex-col gap-8 w-full items-center">
      {Array.from({ length: Math.max(1, ...layout.map((l: any) => (l.pageIndex || 0) + 1)) }).map(
        (_, pageIndex) => {
          const pageItems = layout.filter(
            (l: any) => l.isVisible && (l.pageIndex || 0) === pageIndex
          );

          return (
            <div
              key={pageIndex}
              className={`a4-page worksheet-page relative bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top transition-all ${designMode ? 'design-grid' : ''} ${isLandscape ? 'landscape' : ''}`}
              style={{ width: canvasWidth, minHeight: canvasHeight, padding: 0 }}
            >
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                 {/* Page Number Indicator */}
                 <div className="absolute bottom-6 right-8 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    P. {pageIndex + 1}
                 </div>
              </div>
              
              {pageItems.map((item: any) => (
                <DraggableItem key={item.instanceId} item={item} canvasWidth={canvasWidth}>
                  {renderItemContent(item)}
                </DraggableItem>
              ))}
            </div>
          );
        }
      )}
    </div>
  );
};
