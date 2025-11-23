
import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP } from '../../services/offlineGenerators/helpers';

// --- HELPER: SMART EMOJI FINDER ---
const findEmojiForDescription = (desc: string): string | null => {
    if (!desc) return null;
    const lowerDesc = desc.toLocaleLowerCase('tr');
    
    // 1. Check direct mapping in EMOJI_MAP keys or values
    if (EMOJI_MAP[desc]) return EMOJI_MAP[desc]; // Check if desc is an emoji key directly (rare)
    
    for (const [emoji, name] of Object.entries(EMOJI_MAP)) {
        if (lowerDesc.includes(name.toLocaleLowerCase('tr')) || name.toLocaleLowerCase('tr').includes(lowerDesc)) {
            return emoji;
        }
    }
    
    // 2. Basic Heuristics for common terms not in map
    const commonMap: Record<string, string> = {
        'elma': '🍎', 'kedi': '🐱', 'köpek': '🐶', 'araba': '🚗', 'yıldız': '⭐',
        'kalem': '✏️', 'kitap': '📚', 'top': '⚽', 'balık': '🐟', 'kuş': '🐦',
        'çiçek': '🌸', 'ev': '🏠', 'güneş': '☀️', 'ay': '🌙', 'saat': '⏰',
        'ağaç': '🌳', 'kalp': '❤️', 'bulut': '☁️', 'kar': '❄️', 'ateş': '🔥',
        'su': '💧', 'muz': '🍌', 'çilek': '🍓', 'portakal': '🍊', 'üzüm': '🍇'
    };

    for (const [key, emoji] of Object.entries(commonMap)) {
        if (lowerDesc.includes(key)) return emoji;
    }
    
    return null;
};

// Updated PedagogicalHeader to accept full data or at least imageBase64
export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => (
    <div className="mb-6 text-center print:mb-4 break-inside-avoid">
        <h3 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100 font-dyslexic">{title}</h3>
        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-2">{instruction}</p>
        
        {/* Main Activity Image if available */}
        {(data?.imageBase64 || (data?.imagePrompt && findEmojiForDescription(data.imagePrompt))) && (
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
));

export const ReadingRuler: React.FC = () => {
    const [position, setPosition] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isActive || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Relative position within the container
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
                    className={`text-xs px-3 py-1 rounded-full shadow-sm transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                    title="Okuma Cetveli"
                >
                    <i className="fa-solid fa-ruler-horizontal mr-1"></i> Cetvel {isActive ? 'Açık' : 'Kapalı'}
                </button>
            </div>
            {isActive && (
                <div 
                    className="absolute left-0 right-0 h-12 bg-yellow-200/30 border-y-2 border-indigo-400/50 pointer-events-none z-10 mix-blend-multiply dark:mix-blend-screen dark:bg-yellow-900/30"
                    style={{ top: position - 24 }} // Center the ruler on cursor
                ></div>
            )}
        </div>
    );
};

// Memoized Shape Component with improved visibility
export const Shape = React.memo(({ name, className = "w-10 h-10" }: { name: ShapeType; className?: string }) => {
    // Force colors to be visible in both light/dark/print modes
    const strokeColor = "currentColor"; 
    const strokeWidth = "4";
    const fillColor = "transparent"; 
    
    switch (name) {
        case 'circle':
            return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'square':
            return <svg viewBox="0 0 100 100" className={className}><rect x="10" y="10" width="80" height="80" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'triangle':
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,10 90,90 10,90" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'hexagon':
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'star':
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'diamond':
            return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,50 50,95 5,50" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'pentagon':
             return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,40 78,95 22,95 5,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'octagon':
            return <svg viewBox="0 0 100 100" className={className}><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'cube':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M25 35 V75 L50 90 L75 75 V35 L50 20 Z M25 35 L50 20 L75 35 M50 90 V55 L25 75 M75 75 L50 55"/></svg>;
        case 'sphere':
             return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><circle cx="50" cy="50" r="40"/><ellipse cx="50" cy="50" rx="40" ry="10" strokeDasharray="5,5" /></svg>;
        case 'pyramid':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M50 10 L10 90 H90 Z M50 10 L50 90 M10 90 L50 50 L90 90"/></svg>;
        case 'cone':
            return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M50 10 L10 90 H90 Z"/><ellipse cx="50" cy="90" rx="40" ry="10"/></svg>;
        default:
            return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="20" stroke={strokeColor} strokeWidth="2" fill="none" /></svg>;
    }
});

// Memoized Image Display with Smart Fallback
export const ImageDisplay = React.memo(({ base64, description, className = "w-full h-32" }: { base64?: string; description?: string; className?: string }) => {
    
    // 1. Try rendering Base64 Image (Must check if it's a valid non-empty string)
    if (base64 && typeof base64 === 'string' && base64.length > 100) { 
        return <img src={`data:image/png;base64,${base64}`} alt={description || 'Görsel'} className={`${className} object-contain rounded-md bg-white dark:bg-zinc-800 shadow-sm`} loading="lazy" />;
    }
    
    // 2. Smart Emoji Fallback
    const emojiIcon = findEmojiForDescription(description || '');
    
    // 3. Fallback UI (Card with Icon/Emoji + Text)
    return (
        <div className={`bg-indigo-50 dark:bg-zinc-800/80 rounded-lg border-2 border-dashed border-indigo-200 dark:border-zinc-600 flex flex-col items-center justify-center text-center p-2 overflow-hidden select-none ${className}`}>
            {emojiIcon ? (
                <div className="text-5xl sm:text-6xl mb-1 filter drop-shadow-sm transform transition-transform hover:scale-110 cursor-default animate-in fade-in zoom-in duration-300" role="img" aria-label={description}>
                    {emojiIcon}
                </div>
            ) : (
                <div className="w-12 h-12 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center mb-1 text-indigo-400 dark:text-indigo-300 shadow-sm">
                    <i className="fa-regular fa-image fa-xl"></i>
                </div>
            )}
            
            {description && (
                <p className="text-[10px] sm:text-xs font-bold text-indigo-900 dark:text-indigo-200 px-1 leading-tight uppercase tracking-wide break-words w-full mt-1">
                    {description}
                </p>
            )}
        </div>
    );
});

// Memoized Grid Component
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
                {/* Thin grid lines */}
                {Array.from({ length: size + 1 }).map((_, i) => (
                    <g key={i}>
                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" />
                    </g>
                ))}
                
                {/* Thick cage lines */}
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

                 {/* Cage clues */}
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

// Memoized Shape Display
export const ShapeDisplay = React.memo(({ shapes }: { shapes: ShapeType[] }) => (
    <div className="flex items-center justify-center gap-2">
        {(shapes || []).map((shape, i) => <Shape key={i} name={shape} className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />)}
    </div>
));
