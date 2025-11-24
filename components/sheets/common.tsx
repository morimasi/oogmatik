
import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP } from '../../services/offlineGenerators/helpers';

// --- HELPER: SMART VISUAL FINDER ---
// Finds emoji OR SVG shape instructions
const findVisualForDescription = (desc: string): { type: 'emoji' | 'shape' | 'none', value: string } => {
    if (!desc) return { type: 'none', value: '' };
    const lowerDesc = desc.toLocaleLowerCase('tr');
    
    // 1. Check for Geometric Shapes (SVG Render)
    if (lowerDesc.includes('kare') || lowerDesc.includes('square')) return { type: 'shape', value: 'square' };
    if (lowerDesc.includes('daire') || lowerDesc.includes('çember') || lowerDesc.includes('circle')) return { type: 'shape', value: 'circle' };
    if (lowerDesc.includes('üçgen') || lowerDesc.includes('triangle')) return { type: 'shape', value: 'triangle' };
    if (lowerDesc.includes('yıldız') || lowerDesc.includes('star')) return { type: 'shape', value: 'star' };
    if (lowerDesc.includes('kalp') || lowerDesc.includes('heart')) return { type: 'shape', value: 'heart' };
    if (lowerDesc.includes('elmas') || lowerDesc.includes('baklava') || lowerDesc.includes('diamond')) return { type: 'shape', value: 'diamond' };
    if (lowerDesc.includes('beşgen') || lowerDesc.includes('pentagon')) return { type: 'shape', value: 'pentagon' };
    if (lowerDesc.includes('altıgen') || lowerDesc.includes('hexagon')) return { type: 'shape', value: 'hexagon' };

    // 2. Check EMOJI_MAP (English & Turkish keys)
    if (EMOJI_MAP[lowerDesc]) return { type: 'emoji', value: EMOJI_MAP[lowerDesc] };
    
    // 3. Contains search in map keys
    for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
        if (lowerDesc.includes(key)) return { type: 'emoji', value: emoji };
    }
    
    return { type: 'none', value: '' };
};

// --- TTS HELPER ---
const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synth = window.speechSynthesis;

    const speak = (text: string) => {
        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.9; 
        utterance.onend = () => setIsSpeaking(false);
        
        setIsSpeaking(true);
        synth.speak(utterance);
    };

    const cancel = () => {
        if (synth.speaking) {
            synth.cancel();
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        return () => cancel();
    }, []);

    return { speak, cancel, isSpeaking };
};

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => {
    const { speak, isSpeaking } = useTTS();

    return (
        <div className="mb-6 text-center print:mb-4 break-inside-avoid relative group">
            <div className="flex items-center justify-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 font-dyslexic">{title}</h3>
                <button 
                    onClick={() => speak(`${title}. Yönerge: ${instruction}`)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all print:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSpeaking ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-zinc-100 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-zinc-800'}`}
                    title="Sesli Oku"
                >
                    <i className={`fa-solid ${isSpeaking ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                </button>
            </div>
            
            <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-2">{instruction}</p>
            
            {/* Main Activity Image */}
            {(data?.imageBase64 || data?.imagePrompt) && (
                <div className="my-4 mx-auto max-w-md rounded-xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                    <ImageDisplay 
                        base64={data?.imageBase64} 
                        description={data?.imagePrompt || title} 
                        className="w-full h-48 object-contain p-4" 
                    />
                </div>
            )}

            {note && <div className="pedagogical-note inline-block px-4 py-1 mt-2 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic"><i className="fa-solid fa-graduation-cap mr-1"></i>Eğitmen Notu: {note}</p>
            </div>}
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
            const relativeY = e.clientY - rect.top;
            setPosition(relativeY);
        };

        if (isActive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isActive]);

    return (
        <div className="relative w-full print:hidden group" ref={containerRef}>
            <div className="absolute top-2 right-2 z-20">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`text-xs px-3 py-1 rounded-full shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                    title="Okuma Cetveli"
                >
                    <i className="fa-solid fa-ruler-horizontal mr-1"></i> Cetvel {isActive ? 'Açık' : 'Kapalı'}
                </button>
            </div>
            {isActive && (
                <div 
                    className="absolute left-0 right-0 h-12 bg-yellow-200/30 border-y-2 border-indigo-400/50 pointer-events-none z-10 mix-blend-multiply dark:mix-blend-screen dark:bg-yellow-900/30"
                    style={{ top: position - 24 }} 
                ></div>
            )}
        </div>
    );
};

export const Shape = React.memo(({ name, className = "w-10 h-10" }: { name: string; className?: string }) => {
    const strokeColor = "currentColor"; 
    const strokeWidth = "4";
    const fillColor = "transparent"; 
    
    const shapeName = name.toLowerCase();

    switch (true) {
        case shapeName.includes('circle') || shapeName.includes('daire'): 
            return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('square') || shapeName.includes('kare'): 
            return <svg viewBox="0 0 100 100" className={className}><rect x="10" y="10" width="80" height="80" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('triangle') || shapeName.includes('üçgen'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,10 90,90 10,90" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('hexagon') || shapeName.includes('altıgen'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('star') || shapeName.includes('yıldız'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('diamond') || shapeName.includes('elmas'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,50 50,95 5,50" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('pentagon') || shapeName.includes('beşgen'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,40 78,95 22,95 5,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('octagon') || shapeName.includes('sekizgen'): 
            return <svg viewBox="0 0 100 100" className={className}><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case shapeName.includes('heart') || shapeName.includes('kalp'):
            return <svg viewBox="0 0 100 100" className={className}><path d="M50 30 L50 90 L90 30 A20 20 0 0 0 50 30 A20 20 0 0 0 10 30 Z" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>; // Simplified Heart
        default: 
            return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="20" stroke={strokeColor} strokeWidth="2" fill="none" /></svg>;
    }
});

// Enhanced ImageDisplay with robust Fallback
export const ImageDisplay = React.memo(({ base64, description, className = "w-full h-32" }: { base64?: string; description?: string; className?: string }) => {
    
    // 1. Try rendering Base64 Image
    if (base64 && typeof base64 === 'string' && base64.length > 100) { 
        return <img src={`data:image/png;base64,${base64}`} alt={description || 'Görsel'} className={`${className} object-contain rounded-md bg-white dark:bg-zinc-800 shadow-sm`} loading="lazy" />;
    }
    
    // 2. Smart Fallback (Emoji or Shape)
    const visual = findVisualForDescription(description || '');
    
    // 3. Render
    return (
        <div className={`bg-indigo-50 dark:bg-zinc-800/80 rounded-lg border-2 border-dashed border-indigo-200 dark:border-zinc-600 flex flex-col items-center justify-center text-center p-2 overflow-hidden select-none ${className}`}>
            {visual.type === 'emoji' ? (
                // Emoji High-Res Representation
                <div className="text-6xl md:text-7xl lg:text-8xl filter drop-shadow-sm transform transition-transform hover:scale-110 cursor-default animate-in fade-in zoom-in duration-300 leading-none" role="img" aria-label={description}>
                    {visual.value}
                </div>
            ) : visual.type === 'shape' ? (
                // SVG Shape Render
                <div className="w-24 h-24 text-indigo-600 dark:text-indigo-400 animate-in fade-in zoom-in duration-300">
                    <Shape name={visual.value} className="w-full h-full" />
                </div>
            ) : (
                // Generic Placeholder if nothing matches
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <i className="fa-regular fa-image text-4xl text-indigo-300 dark:text-zinc-500 mb-2"></i>
                    <span className="text-[10px] font-bold text-indigo-400 dark:text-zinc-500 uppercase">Resim Alanı</span>
                </div>
            )}
            
            {/* Show label only if it's NOT an emoji (to avoid redundancy) or if it's a placeholder */}
            {description && visual.type !== 'emoji' && (
                <p className="text-[10px] sm:text-xs font-bold text-indigo-900 dark:text-indigo-200 px-1 leading-tight uppercase tracking-wide break-words w-full mt-1">
                    {description}
                </p>
            )}
        </div>
    );
});

export const GridComponent = React.memo(({ grid, passwordCells, cellClassName = 'w-10 h-10', passwordColumnIndex, showLetters = true }: { grid: (string | number | null)[][]; passwordCells?: {row: number; col: number}[]; cellClassName?: string, passwordColumnIndex?: number, showLetters?: boolean }) => (
    <table className="table-fixed w-full border-collapse">
        <tbody>
            {(grid || []).map((row, rowIndex) => (
            <tr key={rowIndex}>
                {(row || []).map((cell, cellIndex) => {
                    const isPasswordCell = passwordCells?.some(p => p.row === rowIndex && p.col === cellIndex) || passwordColumnIndex === cellIndex;
                    const isBlackCell = cell === null;
                    return (
                        <td key={cellIndex} className={`border text-center font-mono text-lg ${cellClassName} ${isPasswordCell ? 'bg-amber-200 dark:bg-amber-800' : ''} ${isBlackCell ? 'bg-zinc-800 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-700/50'}`} style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                            {showLetters ? (typeof cell === 'string' ? cell.toLocaleUpperCase('tr') : cell) : ''}
                        </td>
                    )
                })}
            </tr>
            ))}
        </tbody>
    </table>
));

export const SegmentDisplay = React.memo(({ segments }: { segments: boolean[] }) => {
    const segmentClasses = (isActive: boolean) => isActive ? 'bg-zinc-800 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700';
    return (
        <div className="grid grid-cols-3 grid-rows-3 w-12 h-16 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={segmentClasses((segments || [])[i] ?? false)}></div>
            ))}
        </div>
    );
});

export const CagedGridSvg = React.memo(({
    size,
    cages,
    gridData
}: {
    size: number;
    cages: { cells: { row: number; col: number }[]; operation?: string; target: number }[];
    gridData: (number | null)[][];
}) => {
    const cellSize = 50;
    const totalSize = size * cellSize;

    const isEdge = (r: number, c: number, dir: 'top' | 'bottom' | 'left' | 'right') => {
        const cage = cages.find(ca => ca.cells.some(cell => cell.row === r && cell.col === c));
        if (!cage) return false;

        const neighbor = {
            top: { r: r - 1, c: c },
            bottom: { r: r + 1, c: c },
            left: { r: r, c: c - 1 },
            right: { r: r, c: c + 1 },
        }[dir];

        return !cage.cells.some(cell => cell.row === neighbor.r && cell.col === neighbor.c);
    };

    return (
        <div className="flex justify-center p-2">
            <svg width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300">
                {Array.from({ length: size + 1 }).map((_, i) => (
                    <g key={i}>
                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
                    </g>
                ))}
                {Array.from({ length: size * size }).map((_, i) => {
                    const r = Math.floor(i / size);
                    const c = i % size;
                    return (
                        <g key={`${r}-${c}`}>
                            {isEdge(r, c, 'top') && <line x1={c * cellSize} y1={r * cellSize} x2={(c + 1) * cellSize} y2={r * cellSize} className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" />}
                            {isEdge(r, c, 'bottom') && <line x1={c * cellSize} y1={(r + 1) * cellSize} x2={(c + 1) * cellSize} y2={(r + 1) * cellSize} className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" />}
                            {isEdge(r, c, 'left') && <line x1={c * cellSize} y1={r * cellSize} x2={c * cellSize} y2={(r + 1) * cellSize} className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" />}
                            {isEdge(r, c, 'right') && <line x1={(c + 1) * cellSize} y1={r * cellSize} x2={(c + 1) * cellSize} y2={(r + 1) * cellSize} className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" />}
                        </g>
                    );
                })}
                {(cages || []).map((cage, i) => {
                    const firstCell = cage.cells.reduce((prev, curr) => (curr.row < prev.row || (curr.row === prev.row && curr.col < prev.col)) ? curr : prev);
                    return (
                        <text key={i} x={firstCell.col * cellSize + 5} y={firstCell.row * cellSize + 15} className="text-xs font-bold fill-zinc-800 dark:fill-zinc-200">
                            {cage.target}{cage.operation}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
});

export const ShapeDisplay = React.memo(({ shapes }: { shapes: ShapeType[] }) => (
    <div className="flex items-center justify-center gap-2">
        {(shapes || []).map((shape, i) => <Shape key={i} name={shape} className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />)}
    </div>
));
