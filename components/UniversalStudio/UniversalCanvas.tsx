import React, { useRef } from 'react';
import { LayoutItem } from '../../types';
import { useUniversalStudio } from '../../context/UniversalStudioContext';
import { BlockRenderer, SheetRenderer } from '../SheetRenderer';

const DraggableItem = ({ item, children }: { item: LayoutItem, children: any }) => {
    const { designMode, updateComponent, setSelectedId, selectedId, layout, setLayout } = useUniversalStudio();
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const initialLayout = useRef<LayoutItem[]>([]);

    const handleMouseDown = (e: any) => {
        if (!designMode) {
            setSelectedId(item.instanceId);
            return;
        }

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

                setLayout(initialLayout.current.map(l => {
                    if (l.instanceId === item.instanceId) {
                        return { ...l, style: { ...l.style, w: newW, h: newH } };
                    }
                    
                    // Akıllı Boşluk Doldurma ve Domino Etkisi
                    // Eğer bu öğe, boyutu değişen öğenin altında yer alıyorsa, onu da kaydır.
                    // Tolerans: 10px (Öğenin tam altında olup olmadığını anlamak için)
                    if (l.pageIndex === item.pageIndex && l.style.y >= (initialStyle.y + initialStyle.h - 10)) {
                        return { ...l, style: { ...l.style, y: l.style.y + heightDiff } };
                    }
                    return l;
                }));
            } else {
                let newX = Math.round((initialStyle.x + dx) / 8) * 8;
                let newY = Math.round((initialStyle.y + dy) / 8) * 8;
                
                const centerX = 794 / 2;
                const itemCenterX = newX + (initialStyle.w / 2);
                
                if (Math.abs(itemCenterX - centerX) < 15) newX = centerX - (initialStyle.w / 2);
                if (Math.abs(newX - 20) < 15) newX = 20;
                if (Math.abs((newX + initialStyle.w) - 774) < 15) newX = 774 - initialStyle.w;

                const deltaX = newX - initialStyle.x;
                const deltaY = newY - initialStyle.y;

                setLayout(initialLayout.current.map(l => {
                    // Eğer sürüklenen öğeyse VEYA aynı gruptalarsa birlikte hareket ettir
                    if (l.instanceId === item.instanceId || (item.groupId && l.groupId === item.groupId)) {
                        const originalL = initialLayout.current.find(orig => orig.instanceId === l.instanceId) || l;
                        return { ...l, style: { ...l.style, x: originalL.style.x + deltaX, y: originalL.style.y + deltaY } };
                    }
                    return l;
                }));
            }
        };

        const onMouseUp = () => {
            if (isDragging.current) {
                updateComponent(item.instanceId, {});
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
            className={`absolute group transition-shadow ${designMode ? 'cursor-move ring-indigo-500/20 hover:ring-1' : ''} ${isSelected && designMode ? 'ring-2 ring-indigo-500 shadow-2xl z-50' : ''}`}
            style={{
                left: item.style.x, top: item.style.y, width: item.style.w, height: item.style.h,
                transform: `rotate(${item.style.rotation || 0}deg)`, zIndex: item.style.zIndex
            }}
            onMouseDown={handleMouseDown}
        >
            {designMode && isSelected && (
                <>
                    <div className="absolute -top-8 left-0 bg-indigo-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-2 z-50">
                        <i className="fa-solid fa-arrows-up-down-left-right"></i>
                        {item.label}
                        <div className="w-px h-3 bg-white/20 mx-1"></div>
                        <button onClick={(e: any) => { e.stopPropagation(); updateComponent(item.instanceId, { isVisible: false }); }} className="hover:text-red-300"><i className="fa-solid fa-trash"></i></button>
                    </div>
                    <div className="resize-handle absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-md shadow-lg cursor-nwse-resize z-50 flex items-center justify-center">
                        <div className="w-1 h-1 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 ring-2 ring-indigo-500 ring-offset-2 pointer-events-none"></div>
                </>
            )}
            {children}
        </div>
    );
};

export const UniversalCanvas = () => {
    const { layout, designMode } = useUniversalStudio();

    if (!layout || layout.length === 0) return null;

    const renderItemContent = (item: LayoutItem) => {
        const s = item.style;
        const boxStyle = {
            padding: `${s.padding}px`, backgroundColor: s.backgroundColor, borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`, borderStyle: s.borderStyle || 'solid', borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none', opacity: s.opacity,
            color: s.color, fontFamily: s.fontFamily, fontSize: `${s.fontSize}px`, lineHeight: s.lineHeight,
            textAlign: s.textAlign as any, letterSpacing: `${s.letterSpacing}px`, fontWeight: s.fontWeight || 'normal'
        };

        if (item.id === 'activity_component') {
            return (
                <div style={boxStyle} className="h-full w-full overflow-hidden">
                    <SheetRenderer activityType={item.specificData.activityType} data={item.specificData.data} />
                </div>
            );
        }

        if (item.id === 'header') {
            return (
                <div style={boxStyle} className="h-full flex flex-col justify-center">
                    <h2 className="text-3xl font-black uppercase border-b-4 border-current pb-2">{item.specificData.title}</h2>
                </div>
            );
        }

        // For all standard WorksheetBlocks (text, image, grid, table, etc.)
        return (
            <div style={boxStyle} className="h-full w-full">
                <BlockRenderer block={{ type: item.id as any, content: item.specificData.content, style: {} }} />
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 w-full items-center pb-20">
            <style>{`
                .design-grid {
                    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
                    background-size: 8px 8px;
                }
            `}</style>
            
            {Array.from({ length: Math.max(1, ...layout.map(l => (l.pageIndex || 0) + 1)) }).map((_, pageIndex) => {
                const pageItems = layout.filter(l => l.isVisible && (l.pageIndex || 0) === pageIndex);
                
                return (
                    <div
                        key={pageIndex}
                        className={`worksheet-page print-page relative bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top transition-all ${designMode ? 'design-grid' : ''}`}
                        style={{ width: 794, minHeight: 1123, padding: 0 }}
                    >
                        {pageItems.map((item: LayoutItem) => (
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