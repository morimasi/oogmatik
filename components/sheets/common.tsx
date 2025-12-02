
import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP } from '../../services/offlineGenerators/helpers';
import { EditableElement, EditableText } from '../Editable'; 

// --- HELPER: SMART EMOJI FINDER ---
const findEmojiForDescription = (desc: string): string | null => {
    if (!desc) return null;
    const safeDesc = String(desc);
    const lowerDesc = safeDesc.toLocaleLowerCase('tr');
    
    if (EMOJI_MAP[safeDesc]) return EMOJI_MAP[safeDesc]; 
    
    for (const [emoji, name] of Object.entries(EMOJI_MAP)) {
        if (lowerDesc.includes(name.toLocaleLowerCase('tr')) || name.toLocaleLowerCase('tr').includes(lowerDesc)) {
            return emoji;
        }
    }
    return null;
};

interface ImageDisplayProps {
    base64?: string;
    description?: string | number;
    prompt?: string;
    className?: string;
}

// Enhanced ImageDisplay with Free AI Generation (Pollinations.ai)
export const ImageDisplay = React.memo(({ base64, description, prompt, className = "w-full h-32" }: ImageDisplayProps) => {
    let safeDesc = '';
    try { if (description) safeDesc = String(description); } catch (e) { safeDesc = ''; }

    // Generate a consistent seed based on description to ensure the image doesn't flicker on re-renders
    const seed = safeDesc.length > 0 ? safeDesc.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.floor(Math.random() * 1000);

    return (
        <div className={`image-display-container ${className} relative overflow-hidden bg-white`}>
            {(() => {
                // 1. Priority: Base64 or SVG provided directly
                if (base64 && typeof base64 === 'string' && (base64.trim().startsWith('<svg') || base64.trim().startsWith('```xml'))) {
                    let cleanSvg = base64.replace(/^```xml\s*|```\s*$/g, '').trim();
                    cleanSvg = cleanSvg.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '').replace('<svg', '<svg style="width:100%; height:100%; display:block;"');
                    return <div className="w-full h-full p-1 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: cleanSvg }} />;
                }
                
                if (base64 && typeof base64 === 'string' && (base64.startsWith('data:image') || base64.length > 100)) { 
                    return <img src={base64} alt={safeDesc} className="object-contain w-full h-full" />;
                }

                // 2. Priority: AI Generation (Pollinations.ai) - Free & Quota Friendly
                // If a specific prompt is provided (usually English from Gemini or Offline Generator)
                if (prompt && prompt.length > 2) {
                    // We append styling keywords to ensure consistent, child-friendly vector art style
                    // encodeURIComponent handles special chars including Turkish
                    const finalPrompt = `${prompt} children's book illustration, clean vector art, white background, high contrast, colorful, flat design`;
                    const encodedPrompt = encodeURIComponent(finalPrompt);
                    
                    // Pollinations URL construction
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;
                    
                    return (
                        <img 
                            src={imageUrl} 
                            alt={safeDesc} 
                            className="object-contain w-full h-full" 
                            loading="lazy"
                            onError={(e) => {
                                // Fallback to emoji if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    );
                }

                // 3. Fallback: Emoji or Initial Letter
                const emojiIcon = findEmojiForDescription(safeDesc);
                const initial = safeDesc.charAt(0).toUpperCase();
                return (
                    <div className={`rounded-xl flex flex-col items-center justify-center text-center p-2 h-full w-full bg-white border-2 border-zinc-100 ${prompt ? 'hidden' : ''}`}>
                        {emojiIcon ? (
                            <div className="text-5xl">{emojiIcon}</div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-black opacity-80 text-black">{initial}</span>
                                <span className="text-[10px] font-bold uppercase text-black">{safeDesc}</span>
                            </div>
                        )}
                    </div>
                );
            })()}
            
            {/* Immediate Fallback Element (displayed if image errors or no prompt) */}
            {(!prompt && !base64) && (
                 <div className={`rounded-xl flex flex-col items-center justify-center text-center p-2 h-full w-full bg-white border-2 border-zinc-100`}>
                    {findEmojiForDescription(safeDesc) ? (
                        <div className="text-5xl">{findEmojiForDescription(safeDesc)}</div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black opacity-80 text-black">{safeDesc.charAt(0).toUpperCase()}</span>
                            <span className="text-[10px] font-bold uppercase text-black">{safeDesc}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => {
    return (
        <div className="pedagogical-header mb-4 text-center print:mb-4 break-inside-avoid relative w-full">
            <EditableElement className="flex items-center justify-center gap-3 mb-2 relative z-0" style={{ display: 'var(--display-title)' }}>
                <EditableText tag="h3" value={title} className="text-3xl font-black text-black tracking-tight" />
            </EditableElement>
            
            <EditableElement id="instruction-box" className="inline-block px-8 py-2 bg-white rounded-2xl border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ display: 'var(--display-instruction)' }}>
                <EditableText tag="p" value={instruction} className="text-lg font-bold text-black" />
            </EditableElement>
            
            {(data?.imagePrompt || data?.imageBase64) && (
                <EditableElement className="my-4 mx-auto max-w-lg rounded-3xl overflow-hidden shadow-lg border-4 border-black" style={{ display: 'var(--display-image)' }}>
                    <ImageDisplay 
                        base64={data.imageBase64} 
                        prompt={data.imagePrompt}
                        description={data.title} 
                        className="w-full h-64 object-contain bg-white" 
                    />
                </EditableElement>
            )}

            {note && (
                <EditableElement className="print:block" style={{ display: 'var(--display-pedagogical-note)' }}>
                    <div className="pedagogical-note flex items-center justify-center gap-2 text-xs text-zinc-600 italic mt-1 font-bold">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>Eğitmen Notu: <EditableText tag="span" value={note} /></span>
                    </div>
                </EditableElement>
            )}
        </div>
    );
});

export const ReadingRuler: React.FC = () => {
    const [position, setPosition] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isActive || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setPosition(e.clientY - rect.top);
        };
        if (isActive) window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isActive]);

    return (
        <div className="relative w-full print:hidden group" ref={containerRef}>
            <div className="absolute top-0 right-0 z-20">
                <button onClick={() => setIsActive(!isActive)} className="text-[10px] px-2 py-1 rounded-bl-lg bg-zinc-200 hover:bg-zinc-300">
                    <i className="fa-solid fa-ruler-horizontal"></i>
                </button>
            </div>
            {isActive && <div className="absolute left-0 right-0 h-12 bg-yellow-200/30 border-y-2 border-black/50 pointer-events-none z-10" style={{ top: position - 24 }}></div>}
        </div>
    );
};

export const Shape = React.memo(({ name, className = "w-10 h-10" }: { name: ShapeType; className?: string }) => {
    const props = { stroke: "currentColor", strokeWidth: "4", fill: "transparent", className };
    switch (name) {
        case 'circle': return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="40" /></svg>;
        case 'square': return <svg viewBox="0 0 100 100" {...props}><rect x="10" y="10" width="80" height="80" /></svg>;
        case 'triangle': return <svg viewBox="0 0 100 100" {...props}><polygon points="50,10 90,90 10,90" /></svg>;
        default: return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="20" /></svg>;
    }
});

export const GridComponent = React.memo(({ grid, cellClassName = 'w-10 h-10', passwordCells }: { grid: any[][]; cellClassName?: string; passwordCells?: {row: number, col: number}[] }) => {
    const isPasswordCell = (r: number, c: number) => {
        return passwordCells?.some(pc => pc.row === r && pc.col === c);
    };

    return (
        <EditableElement>
        <table className="table-fixed w-full border-collapse">
            <tbody>
                {grid.map((row, r) => (
                <tr key={r}>
                    {row.map((cell, c) => (
                        <td 
                            key={c} 
                            className={`border text-center font-mono ${cellClassName} ${isPasswordCell(r,c) ? 'bg-zinc-200 border-black font-black' : 'bg-white text-black'}`} 
                            style={{borderColor: 'black', borderWidth: '1px'}}
                        >
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
    <div className="grid grid-cols-3 grid-rows-3 w-12 h-12 gap-0.5">
        {segments.map((active, i) => <div key={i} className={active ? 'bg-black' : 'bg-white border border-zinc-200'}></div>)}
    </div>
));

export const ShapeDisplay = React.memo(({ shapes }: { shapes: ShapeType[] }) => (
    <div className="flex gap-1 text-black">{shapes.map((s, i) => <Shape key={i} name={s} className="w-6 h-6" />)}</div>
));

// CagedGridSvg for Kendoku
export const CagedGridSvg = ({ size, cages, gridData }: { size: number, cages: any[], gridData: (number|null)[][] }) => {
    const cellSize = 50;
    const totalSize = size * cellSize;

    return (
        <svg width={totalSize + 4} height={totalSize + 4} viewBox={`-2 -2 ${totalSize+4} ${totalSize+4}`} className="overflow-visible bg-white">
            <defs>
                <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                    <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={totalSize} height={totalSize} fill="url(#grid)" stroke="#000" strokeWidth="2" />

            {/* Cages */}
            {cages.map((cage, idx) => {
                // Determine boundaries of cage cells to draw thick outline
                const pathInstructions: string[] = [];
                cage.cells.forEach((cell: any) => {
                    const r = cell.row;
                    const c = cell.col;
                    const x = c * cellSize;
                    const y = r * cellSize;
                    
                    // Check neighbors to see if we need a border
                    const hasTop = cage.cells.some((oc: any) => oc.row === r - 1 && oc.col === c);
                    const hasBottom = cage.cells.some((oc: any) => oc.row === r + 1 && oc.col === c);
                    const hasLeft = cage.cells.some((oc: any) => oc.row === r && oc.col === c - 1);
                    const hasRight = cage.cells.some((oc: any) => oc.row === r && oc.col === c + 1);

                    if (!hasTop) pathInstructions.push(`M ${x} ${y} L ${x + cellSize} ${y}`);
                    if (!hasBottom) pathInstructions.push(`M ${x} ${y + cellSize} L ${x + cellSize} ${y + cellSize}`);
                    if (!hasLeft) pathInstructions.push(`M ${x} ${y} L ${x} ${y + cellSize}`);
                    if (!hasRight) pathInstructions.push(`M ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize}`);
                });

                // Top-left cell for label
                const sortedCells = [...cage.cells].sort((a: any,b: any) => (a.row - b.row) || (a.col - b.col));
                const first = sortedCells[0];
                const labelX = first.col * cellSize + 2;
                const labelY = first.row * cellSize + 14;

                return (
                    <g key={idx}>
                        <path d={pathInstructions.join(' ')} stroke="#000" strokeWidth="3" fill="none" strokeLinecap="square" />
                        <text x={labelX} y={labelY} fontSize="10" fontWeight="bold" fill="#000">{cage.target}{cage.operation}</text>
                    </g>
                );
            })}

            {/* Numbers */}
            {gridData.map((row, r) => 
                row.map((val, c) => (
                    val !== null ? (
                        <text key={`${r}-${c}`} x={c * cellSize + cellSize/2} y={r * cellSize + cellSize/2 + 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="black">
                            {val}
                        </text>
                    ) : null
                ))
            )}
        </svg>
    );
};
