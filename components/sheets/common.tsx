
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP } from '../../services/offlineGenerators/helpers';
import { EditableElement, EditableText } from '../Editable'; 

const findEmojiForDescription = (desc: string): string | null => {
    if (!desc) return null;
    const safeDesc = String(desc);
    if (EMOJI_MAP[safeDesc]) return EMOJI_MAP[safeDesc]; 
    return null;
};

interface ImageDisplayProps {
    base64?: string;
    description?: string | number;
    prompt?: string;
    className?: string;
}

export const ImageDisplay = React.memo(({ base64, description, prompt, className = "w-full h-24" }: ImageDisplayProps) => {
    let safeDesc = '';
    try { if (description) safeDesc = String(description); } catch (e) { safeDesc = ''; }
    const seed = useMemo(() => safeDesc.length > 0 ? safeDesc.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.floor(Math.random() * 1000), [safeDesc]);

    return (
        <div className={`image-display-container ${className} relative overflow-hidden bg-transparent flex items-center justify-center group`}>
            {/* Editable Label Overlay if description provided */}
            {safeDesc && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 p-1 text-[8px] text-center opacity-0 group-hover:opacity-100 transition-opacity z-10 edit-handle">
                    <EditableText value={safeDesc} tag="span" />
                </div>
            )}
            
            {(() => {
                if (base64 && typeof base64 === 'string' && (base64.trim().startsWith('<svg') || base64.trim().startsWith('```xml'))) {
                    let cleanSvg = base64.replace(/^```xml\s*|```\s*$/g, '').trim();
                    cleanSvg = cleanSvg.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '').replace('<svg', '<svg style="width:100%; height:100%; display:block;"');
                    return <div className="w-full h-full p-1" dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
                }
                
                if (base64 && typeof base64 === 'string' && (base64.startsWith('data:image') || base64.length > 100)) { 
                    return <img src={base64} alt={safeDesc} className="object-contain w-full h-full" loading="lazy" />;
                }

                let contentForPrompt = prompt || safeDesc;
                if (contentForPrompt && contentForPrompt.length > 1) {
                    const finalPrompt = `${contentForPrompt}, simple educational vector icon, black and white line art, white background, high contrast`;
                    const encodedPrompt = encodeURIComponent(finalPrompt);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=256&height=256&nologo=true&seed=${seed}&model=flux`;
                    
                    return (
                        <img 
                            src={imageUrl} 
                            alt={safeDesc} 
                            className="object-contain w-full h-full" 
                            loading="lazy"
                        />
                    );
                }

                return (
                    <div className="flex flex-col items-center justify-center h-full w-full border border-dashed border-zinc-300 rounded">
                        <span className="text-xl font-bold opacity-50 text-black">
                            <EditableText value={safeDesc ? safeDesc.charAt(0).toUpperCase() : '?'} tag="span" />
                        </span>
                    </div>
                );
            })()}
        </div>
    );
});

// Reduced Minimal Header
export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => {
    return (
        <div className="mb-4 w-full break-inside-avoid">
            <div className="flex items-start justify-between gap-4 border-b-2 border-zinc-800 pb-2 mb-2">
                <div className="flex-1">
                    <EditableElement style={{ display: 'var(--display-title)' }}>
                        <EditableText tag="h3" value={title} className="text-xl font-black text-black uppercase tracking-tight leading-none mb-1" />
                    </EditableElement>
                    
                    <EditableElement style={{ display: 'var(--display-instruction)' }}>
                        <EditableText tag="p" value={instruction} className="text-sm font-medium text-zinc-700 leading-tight" />
                    </EditableElement>
                </div>
                
                {(data?.imagePrompt || data?.imageBase64) && (
                    <EditableElement className="w-16 h-16 shrink-0 border border-zinc-200 rounded p-1" style={{ display: 'var(--display-image)' }}>
                        <ImageDisplay 
                            base64={data.imageBase64} 
                            prompt={data.imagePrompt}
                            description={data.title} 
                            className="w-full h-full object-contain" 
                        />
                    </EditableElement>
                )}
            </div>

            {note && (
                <EditableElement className="print:block" style={{ display: 'var(--display-pedagogical-note)' }}>
                    <p className="text-[10px] text-zinc-500 italic"><i className="fa-solid fa-info-circle mr-1"></i><EditableText tag="span" value={note} /></p>
                </EditableElement>
            )}
        </div>
    );
});

export const ReadingRuler: React.FC = () => {
    return null; // Removed for print optimization
};

export const Shape = React.memo(({ name, className = "w-8 h-8" }: { name: ShapeType; className?: string }) => {
    const props = { stroke: "currentColor", strokeWidth: "2", fill: "transparent", className };
    switch (name) {
        case 'circle': return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="45" /></svg>;
        case 'square': return <svg viewBox="0 0 100 100" {...props}><rect x="5" y="5" width="90" height="90" /></svg>;
        case 'triangle': return <svg viewBox="0 0 100 100" {...props}><polygon points="50,5 95,95 5,95" /></svg>;
        default: return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="30" /></svg>;
    }
});

export const Matchstick = React.memo(({ x1, y1, x2, y2, color }: { x1: number, y1: number, x2: number, y2: number, color?: string }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color || "black"} strokeWidth="3" strokeLinecap="round" />
));

export const ConnectionDot = React.memo(({ side }: { side: 'left' | 'right' }) => (
    <div className={`w-2 h-2 rounded-full bg-black absolute top-1/2 -translate-y-1/2 ${side === 'left' ? '-left-1' : '-right-1'}`}></div>
));

export const GridComponent = React.memo(({ grid, cellClassName = 'w-8 h-8', passwordCells }: { grid: any[][]; cellClassName?: string; passwordCells?: {row: number, col: number}[] }) => {
    return (
        <EditableElement>
        <table className="border-collapse border border-black mx-auto">
            <tbody>
                {grid.map((row, r) => (
                <tr key={r}>
                    {row.map((cell, c) => (
                        <td key={c} className={`border border-black text-center ${cellClassName} p-0 m-0 leading-none`}>
                            {/* Make every cell editable */}
                            <EditableText value={cell || ''} tag="span" />
                        </td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
        </EditableElement>
    )
});

export const SegmentDisplay = React.memo(({ segments }: { segments: boolean[] }) => (
    <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 gap-px border border-black bg-black">
        {segments.map((active, i) => <div key={i} className={active ? 'bg-black' : 'bg-white'}></div>)}
    </div>
));

export const ShapeDisplay = React.memo(({ shapes }: { shapes: ShapeType[] }) => (
    <div className="flex gap-0.5 text-black">{shapes.map((s, i) => <Shape key={i} name={s} className="w-4 h-4" />)}</div>
));

export const CagedGridSvg = React.memo(({ size, cages, gridData }: { size: number, cages: any[], gridData: (number|null)[][] }) => {
    const cellSize = 30; // Smaller cell
    const totalSize = size * cellSize;

    return (
        <svg width={totalSize + 2} height={totalSize + 2} className="overflow-visible bg-white border border-black">
            {/* Grid Lines */}
            {Array.from({length: size+1}).map((_, i) => (
                <React.Fragment key={i}>
                    <line x1={0} y1={i*cellSize} x2={totalSize} y2={i*cellSize} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={i*cellSize} y1={0} x2={i*cellSize} y2={totalSize} stroke="#e5e7eb" strokeWidth="1" />
                </React.Fragment>
            ))}

            {/* Cages */}
            {cages.map((cage, idx) => {
                const first = cage.cells[0];
                // Using text logic instead of complex drawing for editability
                return <text key={idx} x={first.col * cellSize + 2} y={first.row * cellSize + 10} fontSize="8" fontWeight="bold">{cage.target}{cage.operation}</text>
            })}
        </svg>
    );
});
