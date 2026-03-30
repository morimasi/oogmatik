
import React, { useRef, useState, useEffect } from 'react';
import { LayoutItem } from '../../types';
import { useCreativeStore } from '../../store/useCreativeStore';
import { BlockRenderer, SheetRenderer } from '../SheetRenderer';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';

interface DraggableItemProps {
    key?: string | number;
    item: LayoutItem;
    children: React.ReactNode;
}

const DraggableItem = ({ item, children }: DraggableItemProps) => {
    const {
        designMode, updateComponent, _setSelectedId, selectedId, layout, setLayout,
        selectedIds, toggleSelection, lockedItems, groupedItems
    } = useCreativeStore();
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const initialLayout = useRef<LayoutItem[]>([]);

    const isLocked = lockedItems.includes(item.instanceId);
    const isSelected = selectedId === item.instanceId || selectedIds.includes(item.instanceId);
    const isInGroup = !!item.groupId;
    const groupColor = isInGroup ? getGroupColor(item.groupId!, groupedItems) : undefined;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isLocked) return;

        const isCtrlKey = e.ctrlKey || e.metaKey;

        if (!designMode) {
            toggleSelection(item.instanceId, isCtrlKey);
            return;
        }

        const target = e.target as HTMLElement;
        const isResizeHandle = target.closest('.resize-handle');
        const isLockButton = target.closest('.lock-button');
        const isActionButton = target.closest('.action-button');

        if (isLockButton || isActionButton) return;

        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        initialLayout.current = [...layout];

        const initialStyle = { ...item.style };
        toggleSelection(item.instanceId, isCtrlKey);

        const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
            if (!isDragging.current) return;

            const dx = moveEvent.clientX - startPos.current.x;
            const dy = moveEvent.clientY - startPos.current.y;

            if (isResizeHandle) {
                const initW = Number(initialStyle.w) || 0;
                const initH = Number(initialStyle.h) || 0;
                const newW = Math.max(50, Math.round((initW + dx) / 8) * 8);
                const newH = Math.max(30, Math.round((initH + dy) / 8) * 8);
                const heightDiff = newH - initH;

                setLayout(initialLayout.current.map((l: LayoutItem) => {
                    if (l.instanceId === item.instanceId) {
                        return { ...l, style: { ...l.style, w: newW, h: newH } };
                    }

                    const initY = Number(initialStyle.y) || 0;
                    if (l.pageIndex === item.pageIndex && Number(l.style.y) >= (initY + initH - 10)) {
                        return { ...l, style: { ...l.style, y: Number(l.style.y) + heightDiff } };
                    }
                    return l;
                }));
            } else {
                const initX = Number(initialStyle.x) || 0;
                const initY = Number(initialStyle.y) || 0;
                const initW = Number(initialStyle.w) || 0;

                let newX = Math.round((initX + dx) / 8) * 8;
                const newY = Math.round((initY + dy) / 8) * 8;

                const centerX = A4_WIDTH_PX / 2;
                const itemCenterX = newX + (initW / 2);

                if (Math.abs(itemCenterX - centerX) < 15) newX = centerX - (initW / 2);
                if (Math.abs(newX - 20) < 15) newX = 20;
                if (Math.abs((newX + initW) - (A4_WIDTH_PX - 20)) < 15) newX = (A4_WIDTH_PX - 20) - initW;

                const deltaX = newX - initX;
                const deltaY = newY - initY;

                setLayout(initialLayout.current.map((l: LayoutItem) => {
                    if (l.instanceId === item.instanceId || (item.groupId && l.groupId === item.groupId)) {
                        const originalL = initialLayout.current.find((orig: LayoutItem) => orig.instanceId === l.instanceId) || l;
                        return { ...l, style: { ...l.style, x: Number(originalL.style.x) + deltaX, y: Number(originalL.style.y) + deltaY } };
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

    return (
        <div
            className={`absolute transition-all ${designMode && !isLocked ? 'cursor-move' : ''} ${isSelected && designMode ? 'z-50' : ''} ${isLocked ? 'pointer-events-none' : ''}`}
            style={{
                left: item.style.x as number,
                top: item.style.y as number,
                width: item.style.w as number,
                height: (item.id === 'activity_component' && !item.groupId) ? 'auto' : (item.style.h as number),
                minHeight: (item.id === 'activity_component' && !item.groupId) ? `${item.style.h}px` : undefined,
                transform: `rotate(${item.style.rotation || 0}deg)`, zIndex: item.style.zIndex as number
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Grup Göstergesi */}
            {isInGroup && designMode && (
                <div
                    className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg opacity-30 pointer-events-none"
                    style={{ backgroundColor: groupColor, border: `2px dashed ${groupColor}` }}
                />
            )}

            {/* Seçim ve Kilit Göstergeleri */}
            {designMode && isSelected && (
                <>
                    <div className="absolute -top-10 left-0 bg-indigo-600 text-white text-[10px] font-black px-3 py-2 rounded-lg shadow-xl uppercase tracking-wider flex items-center gap-2 z-50">
                        <i className="fa-solid fa-arrows-up-down-left-right"></i>
                        {item.label}
                        {isInGroup && (
                            <span
                                className="px-1.5 py-0.5 rounded text-[8px]"
                                style={{ backgroundColor: groupColor }}
                            >
                                GRUP
                            </span>
                        )}
                        <div className="w-px h-3 bg-white/20 mx-1"></div>
                        <button
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); updateComponent(item.instanceId, { isVisible: false }); }}
                            className="action-button hover:text-red-300 transition-colors"
                            title="Sil"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>

                    {!isLocked && (
                        <div className="resize-handle absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-indigo-600 rounded-md shadow-lg cursor-nwse-resize z-50 flex items-center justify-center hover:scale-110 transition-transform">
                            <div className="w-1 h-1 bg-indigo-600 rounded-full"></div>
                        </div>
                    )}

                    <div className={`absolute inset-0 ring-2 ${isLocked ? 'ring-gray-400 ring-offset-1' : 'ring-indigo-500 ring-offset-2'} pointer-events-none rounded-sm`}></div>
                </>
            )}

            {/* Kilit İkonu */}
            {isLocked && designMode && (
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center shadow-lg z-50">
                    <i className="fa-solid fa-lock text-xs"></i>
                </div>
            )}

            {/* Grup İkonu */}
            {isInGroup && designMode && !isSelected && (
                <div
                    className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md z-40 text-white text-[8px]"
                    style={{ backgroundColor: groupColor }}
                >
                    <i className="fa-solid fa-object-group"></i>
                </div>
            )}

            {children}
        </div>
    );
};

// Grup renkleri
const GROUP_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#10b981'];

function getGroupColor(groupId: string, groupedItems: Record<string, string[]>): string {
    const groupIds = Object.keys(groupedItems);
    const index = groupIds.indexOf(groupId);
    return GROUP_COLORS[index % GROUP_COLORS.length];
}

export const UniversalCanvas = () => {
    const { layout, designMode, clearSelection } = useCreativeStore();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
    const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
    const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                clearSelection();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [clearSelection]);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (!designMode || e.target !== e.currentTarget) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        setIsMarqueeSelecting(true);
        setMarqueeStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setMarqueeEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        if (!e.ctrlKey && !e.metaKey) {
            clearSelection();
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isMarqueeSelecting) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        setMarqueeEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleCanvasMouseUp = () => {
        if (!isMarqueeSelecting) return;
        setIsMarqueeSelecting(false);
    };

    if (!layout || layout.length === 0) return null;

    const renderItemContent = (item: LayoutItem) => {
        const s = item.style;
        const boxStyle: React.CSSProperties = {
            padding: `${s.padding}px`, backgroundColor: s.backgroundColor as string, borderColor: s.borderColor as string,
            borderWidth: `${s.borderWidth}px`, borderStyle: (s.borderStyle || 'solid') as any, borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none', opacity: s.opacity as number,
            color: s.color as string, fontFamily: s.fontFamily as string, fontSize: `${s.fontSize}px`, lineHeight: s.lineHeight as string,
            textAlign: s.textAlign as any, letterSpacing: `${s.letterSpacing}px`, fontWeight: (s.fontWeight || 'normal') as any
        };

        if (item.id === 'activity_component') {
            const isFullPage = !item.groupId;
            return (
                <div
                    style={{
                        ...boxStyle,
                        height: isFullPage ? 'auto' : '100%',
                        minHeight: isFullPage ? `${item.style.h}px` : undefined
                    }}
                    className="w-full overflow-visible"
                >
                    <SheetRenderer activityType={item.specificData.activityType as any} data={(item.specificData.data as any) || { title: '', instruction: '' }} />
                </div>
            );
        }

        if (item.id === 'header') {
            return (
                <div style={boxStyle} className="h-full flex flex-col justify-center">
                    <h2 className="text-xl font-bold uppercase border-b-2 border-zinc-200 pb-1">{item.specificData.title as any}</h2>
                </div>
            );
        }

        return (
            <div style={boxStyle} className="h-full w-full">
                <BlockRenderer block={{ type: item.id as any, content: item.specificData.content as any, style: {} as any }} />
            </div>
        );
    };

    const marqueeStyle = isMarqueeSelecting ? {
        left: Math.min(marqueeStart.x, marqueeEnd.x),
        top: Math.min(marqueeStart.y, marqueeEnd.y),
        width: Math.abs(marqueeEnd.x - marqueeStart.x),
        height: Math.abs(marqueeEnd.y - marqueeStart.y),
    } : null;

    return (
        <div className="flex flex-col gap-8 w-full items-center pb-20">
            <style>{`
                .design-grid {
                    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
                    background-size: 8px 8px;
                }
            `}</style>

            {Array.from({ length: Math.max(1, ...layout.map((l: LayoutItem) => (l.pageIndex || 0) + 1)) }).map((_: any, pageIndex: number) => {
                const pageItems = layout.filter((l: LayoutItem) => l.isVisible && (l.pageIndex || 0) === pageIndex);

                return (
                    <div
                        key={pageIndex}
                        ref={pageIndex === 0 ? canvasRef : null}
                        className={`universal-mode-canvas worksheet-page print-page relative bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.3)] origin-top transition-all ${designMode ? 'design-grid' : ''}`}
                        style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: 0 }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                    >
                        {pageItems.map((item: LayoutItem) => (
                            <DraggableItem key={item.instanceId} item={item}>
                                {renderItemContent(item)}
                            </DraggableItem>
                        ))}

                        {/* Marquee Selection Box */}
                        {isMarqueeSelecting && marqueeStyle && (
                            <div
                                className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none z-50"
                                style={marqueeStyle}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
