import React, { useState, useCallback, useRef } from 'react';
import { ImageDisplay, QUESTION_TYPES } from '../sheets/common';
import { InteractiveStoryData, LayoutItem } from '../../types';
import { useReadingStore } from '../../store/useReadingStore';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';

const DraggableItem = ({ item, children }: { item: any, children: any }) => {
    const { designMode, updateComponent, setSelectedId, selectedId, layout, setLayout } = useReadingStore();
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const initialLayout = useRef<LayoutItem[]>([]);

    const handleMouseDown = (e: any) => {
        if (!designMode) return;

        const isResizeHandle = e.target.closest('.resize-handle');
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        initialLayout.current = [...layout]; // Store the exact layout at drag start

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

                setLayout(initialLayout.current.map(l => {
                    if (l.instanceId === item.instanceId) {
                        return { ...l, style: { ...l.style, w: newW, h: newH } };
                    }

                    // Akıllı Boşluk Doldurma: Boyutu değişen öğenin BİR ALTINDA kalan tüm öğeleri kaydır
                    if (l.pageIndex === item.pageIndex && l.style.y >= (initialStyle.y + initialStyle.h - 10)) {
                        return {
                            ...l,
                            style: { ...l.style, y: l.style.y + heightDiff }
                        };
                    }
                    return l;
                }));
            } else {
                let newX = Math.round((initialStyle.x + dx) / 8) * 8;
                let newY = Math.round((initialStyle.y + dy) / 8) * 8;

                // Magnetic Snap to common alignments (Grid, Center, Margins)
                const centerX = A4_WIDTH_PX / 2;
                const itemCenterX = newX + (initialStyle.w / 2);

                // Snap to Center X
                if (Math.abs(itemCenterX - centerX) < 15) {
                    newX = centerX - (initialStyle.w / 2);
                }
                // Snap to Left Margin (20px)
                if (Math.abs(newX - 20) < 15) newX = 20;
                // Snap to Right Margin (taking default 20px margin into account)
                if (Math.abs((newX + initialStyle.w) - (A4_WIDTH_PX - 20)) < 15) {
                    newX = (A4_WIDTH_PX - 20) - initialStyle.w;
                }

                setLayout(initialLayout.current.map(l => {
                    if (l.instanceId === item.instanceId) {
                        return { ...l, style: { ...l.style, x: newX, y: newY } };
                    }
                    return l;
                }));
            }
        };

        const onMouseUp = () => {
            if (isDragging.current) {
                // Save to history only if there was actual movement/resizing
                updateComponent(item.instanceId, {}, true);
            }
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
            className={`absolute group transition-shadow ${designMode ? 'cursor-move ring-indigo-500/20' : ''} ${isSelected && designMode ? 'ring-2 ring-indigo-500 shadow-2xl z-50' : ''}`}
            style={{
                left: item.style.x,
                top: item.style.y,
                width: item.style.w,
                height: item.style.h,
                transform: `rotate(${item.style.rotation || 0}deg)`,
                zIndex: item.style.zIndex
            }}
            onMouseDown={handleMouseDown}
        >
            {designMode && isSelected && (
                <>
                    <div className="absolute -top-10 left-0 bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                        <i className="fa-solid fa-arrows-up-down-left-right"></i>
                        {item.label}
                        <div className="w-px h-3 bg-white/20 mx-1"></div>
                        <button onClick={(e: any) => { e.stopPropagation(); updateComponent(item.instanceId, { isVisible: false }, true); }} className="hover:text-red-300"><i className="fa-solid fa-trash"></i></button>
                    </div>
                    {/* Resize Handle */}
                    <div className="resize-handle absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-md shadow-lg cursor-nwse-resize z-50 flex items-center justify-center">
                        <div className="w-1 h-1 bg-indigo-600 rounded-full"></div>
                    </div>
                    {/* Selection Frame */}
                    <div className="absolute inset-0 ring-2 ring-indigo-500 ring-offset-2 pointer-events-none"></div>
                </>
            )}
            {children}
        </div>
    );
};

export const ReadingStudioContentRenderer = ({ layout, storyData }: { layout: LayoutItem[], storyData: InteractiveStoryData | null }) => {
    const { designMode } = useReadingStore();
    if (!layout || !Array.isArray(layout)) return null;

    const renderItemContent = (item: any) => {
        const s = item.style;
        const boxStyle = {
            padding: `${s.padding}px`,
            backgroundColor: s.backgroundColor,
            borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`,
            borderStyle: s.borderStyle || 'solid',
            borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none',
            opacity: s.opacity,
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: `${s.fontSize}px`,
            lineHeight: s.lineHeight,
            textAlign: s.textAlign as any,
            letterSpacing: `${s.letterSpacing}px`,
            fontWeight: s.fontWeight || 'normal'
        };

        if (item.id === 'header') {
            const data = item.specificData || { title: "HİKAYE", subtitle: "" };
            return (
                <div className="h-full flex flex-col justify-end" style={boxStyle}>
                    <h1 className="font-black uppercase leading-none" style={{ fontSize: '2em', color: 'inherit' }}>{data.title}</h1>
                    <span className="font-mono text-xs opacity-70 mt-1">{data.subtitle}</span>
                </div>
            );
        }

        if (item.id === 'story_block') {
            const data = item.specificData || { text: "" };
            return (
                <div className="relative" style={boxStyle}>
                    {item.style.imageSettings?.enabled && (
                        <div className={`float-${item.style.imageSettings.position === 'left' ? 'left' : 'right'} w-1/3 h-48 bg-transparent ml-4 mb-2 rounded-lg relative z-10`}>
                            <ImageDisplay
                                prompt={data.imagePrompt}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: (data.text || '').replace(/\n/g, '<br/>') }}></div>
                </div>
            );
        }

        if (item.id === 'vocabulary') {
            const data = item.specificData || { words: [] };
            return (
                <div className="flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">Kelime Hazinesi</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {(data.words || []).map((v: any, i: number) => (
                            <div key={i} className="text-sm">
                                <span className="font-bold border-b-2 border-indigo-200">{v.word}:</span>
                                <span className="ml-1 opacity-80">{v.definition}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (item.id === '5n1k') {
            const data = item.specificData || { questions: [] };
            const typeMap: any = { who: 'KİM?', where: 'NEREDE?', when: 'NE ZAMAN?', what: 'NE?', why: 'NEDEN?', how: 'NASIL?' };
            return (
                <div className="flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-3 border-b-2 border-zinc-900 pb-1">5N 1K Çalışması</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {(data.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-indigo-600 uppercase">{typeMap[q.type] || 'SORU'}</span>
                                <p className="text-sm font-bold">{q.question}</p>
                                <div className="h-6 border-b border-zinc-200 border-dashed"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (item.id === 'questions' || item.id === 'questions_test') {
            const data = item.specificData || { questions: [] };
            return (
                <div className="flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.label}</h4>
                    <div className="flex-1 space-y-3">
                        {(data.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex gap-2 items-start text-sm">
                                <span className="font-bold bg-current text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{ backgroundColor: s.color }}>{i + 1}</span>
                                <div className="flex-1">
                                    <p className="font-bold">{q.question || q.text}</p>
                                    <div className="h-6 border-b border-zinc-200 border-dashed mt-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (item.id === 'creative') {
            const data = item.specificData || { task: "" };
            return (
                <div className="h-full flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                    <p className="text-sm font-bold mb-2">{data.task}</p>
                    <div className="flex-1 border-2 border-dashed border-current/30 rounded-xl min-h-[100px]"></div>
                </div>
            );
        }

        if (item.id === 'pedagogical_note') {
            const data = item.specificData || { text: "" };
            return (
                <div className="h-full flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-[10px] uppercase mb-1 opacity-50 flex items-center gap-2">
                        <i className="fa-solid fa-graduation-cap"></i>
                        {item.customTitle}
                    </h4>
                    <p className="text-[11px] leading-relaxed italic opacity-80">{data.text || "Pedagojik analiz bekleniyor..."}</p>
                </div>
            );
        }

        if (item.id === 'logic_problem') {
            const data = item.specificData || { puzzle: null, questions: [] };
            const puzzle = data.puzzle || (data.questions && data.questions[0]);
            return (
                <div className="h-full flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-brain-circuit text-indigo-600"></i>
                        Mantıksal Akıl Yürütme
                    </h4>
                    {puzzle ? (
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-indigo-100 shadow-sm flex-1">
                            <p className="text-sm font-bold text-zinc-900 mb-2">{puzzle.question || puzzle.text}</p>
                            <div className="h-12 border-b-2 border-zinc-200 border-dashed opacity-50"></div>
                            {puzzle.hint && (
                                <p className="mt-3 text-[11px] italic text-indigo-500 flex items-center gap-1">
                                    <i className="fa-solid fa-lightbulb"></i>
                                    İpucu: {puzzle.hint}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs italic opacity-50 uppercase tracking-widest text-center py-4">Soru üretilmedi</div>
                    )}
                </div>
            );
        }

        if (item.id === 'syllable_train') {
            const storyText = storyData?.story || "";
            const firstWord = storyText.split(' ')[0] || "Tren";
            return (
                <div className="h-full flex flex-col justify-center items-center" style={boxStyle}>
                    <h4 className="font-black text-[10px] uppercase mb-4 opacity-50 self-start">Heceleme Antrenmanı</h4>
                    <div className="flex gap-1">
                        {firstWord.split('').map((char, i) => (
                            <div key={i} className="w-10 h-10 border-2 border-zinc-900 rounded-lg flex items-center justify-center font-black text-lg bg-zinc-50 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                {char.toUpperCase()}
                            </div>
                        ))}
                        <div className="w-10 h-10 border-2 border-zinc-300 border-dashed rounded-lg flex items-center justify-center text-zinc-300 font-black">?</div>
                    </div>
                </div>
            );
        }

        if (item.id === 'tracker') {
            return (
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border-2 border-zinc-900" style={boxStyle}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Okuma Takibi:</span>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 border-2 border-zinc-900 rounded-full flex items-center justify-center text-[10px] font-black">{i}</div>)}
                    </div>
                </div>
            );
        }

        return <div style={boxStyle}>{item.label}</div>;
    };

    return (
        <div className="flex flex-col gap-8 w-full items-center">
            <style>{`
                .design-grid {
                    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
                    background-size: 8px 8px;
                }
            `}</style>

            {Array.from({ length: Math.max(1, ...layout.map((l: any) => (l.pageIndex || 0) + 1)) }).map((_, pageIndex) => {
                const pageItems = layout.filter((l: any) => l.isVisible && (l.pageIndex || 0) === pageIndex);

                return (
                    <div
                        key={pageIndex}
                        className={`a4-page worksheet-page print-page relative bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top transition-all ${designMode ? 'design-grid' : ''}`}
                        style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: 0 }}
                    >
                        {pageItems.map((item: any) => (
                            <DraggableItem key={item.instanceId} item={item}>
                                {renderItemContent(item)}
                            </DraggableItem>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
