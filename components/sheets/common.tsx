
import React, { useState, useEffect, useRef } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP } from '../../services/offlineGenerators/helpers';
import { MascotRobot, MascotOwl, MascotCat } from '../VisualAssets';
import { EditableElement, EditableText } from '../Editable'; // Import Editable Components

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
    
    const commonMap: Record<string, string> = {
        'elma': '🍎', 'kedi': '🐱', 'köpek': '🐶', 'araba': '🚗', 'yıldız': '⭐',
        'kalem': '✏️', 'kitap': '📚', 'top': '⚽', 'balık': '🐟', 'kuş': '🐦',
        'çiçek': '🌸', 'ev': '🏠', 'güneş': '☀️', 'ay': '🌙', 'saat': '⏰',
        'ağaç': '🌳', 'kalp': '❤️', 'bulut': '☁️', 'kar': '❄️', 'ateş': '🔥',
        'su': '💧', 'muz': '🍌', 'çilek': '🍓', 'portakal': '🍊', 'üzüm': '🍇',
        'kutu': '📦', 'şapka': '🧢', 'gözlük': '👓', 'ayakkabı': '👟', 'çanta': '🎒',
        'matematik': '🧮', 'sayı': '1️⃣', 'işlem': '➗', 'bulmaca': '🧩', 'dikkat': '👀',
        'fark': '≠', 'hece': '🗣️', 'tren': '🚂', 'resfebe': '🖼️', 'müzik': '🎵',
        'harf': '🅰️', 'kelime': '🔤', 'tablo': '📊', 'şekil': '🔷', 'tema': '🎨'
    };

    for (const [key, emoji] of Object.entries(commonMap)) {
        if (lowerDesc.includes(key)) return emoji;
    }
    
    return null;
};

// --- HELPER: STRING TO COLOR ---
const stringToColor = (str: string): string => {
    const safeStr = String(str);
    const colors = [
        'bg-red-100 text-red-600 border-red-200',
        'bg-orange-100 text-orange-600 border-orange-200',
        'bg-amber-100 text-amber-600 border-amber-200',
        'bg-yellow-100 text-yellow-600 border-yellow-200',
        'bg-lime-100 text-lime-600 border-lime-200',
        'bg-green-100 text-green-600 border-green-200',
        'bg-emerald-100 text-emerald-600 border-emerald-200',
        'bg-teal-100 text-teal-600 border-teal-200',
        'bg-cyan-100 text-cyan-600 border-cyan-200',
        'bg-sky-100 text-sky-600 border-sky-200',
        'bg-blue-100 text-blue-600 border-blue-200',
        'bg-indigo-100 text-indigo-600 border-indigo-200',
        'bg-violet-100 text-violet-600 border-violet-200',
        'bg-purple-100 text-purple-600 border-purple-200',
        'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
        'bg-pink-100 text-pink-600 border-pink-200',
        'bg-rose-100 text-rose-600 border-rose-200'
    ];
    let hash = 0;
    for (let i = 0; i < safeStr.length; i++) {
        hash = safeStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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

// Enhanced ImageDisplay with Professional SVG Handling
export const ImageDisplay = React.memo(({ base64, description, className = "w-full h-32" }: { base64?: string; description?: string | number; className?: string }) => {
    
    let safeDesc = '';
    try {
        if (description !== null && description !== undefined) {
            safeDesc = String(description);
        }
    } catch (e) {
        safeDesc = '';
    }

    // Wrap with EditableElement
    return (
    <EditableElement className={className}>
        {/* Actual Content Logic */}
        {(() => {
            // 1. Try rendering SVG Code (AI Generated)
            if (base64 && typeof base64 === 'string' && (base64.trim().startsWith('<svg') || base64.trim().startsWith('```xml'))) {
                let cleanSvg = base64.replace(/^```xml\s*|```\s*$/g, '').trim();
                cleanSvg = cleanSvg.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '');
                if (!cleanSvg.includes('preserveAspectRatio')) cleanSvg = cleanSvg.replace('<svg', '<svg preserveAspectRatio="xMidYMid meet"');
                if (!cleanSvg.includes('viewBox')) cleanSvg = cleanSvg.replace('<svg', '<svg viewBox="0 0 512 512"');
                cleanSvg = cleanSvg.replace('<svg', '<svg style="width:100%; height:100%; display:block;"');

                return (
                    <div 
                        className={`flex items-center justify-center rounded-xl overflow-hidden relative group bg-white dark:bg-zinc-800/30 transition-all w-full h-full`}
                        title={safeDesc || 'Görsel'}
                        role="img"
                        aria-label={safeDesc}
                    >
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:20px_20px] -z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-zinc-100/30 -z-10"></div>
                        <div className="w-full h-full p-1 flex items-center justify-center [&>svg]:drop-shadow-md transition-transform duration-300 hover:scale-105" dangerouslySetInnerHTML={{ __html: cleanSvg }} />
                    </div>
                );
            }

            // 2. Try rendering Base64 Image
            if (base64 && typeof base64 === 'string' && (base64.startsWith('data:image') || base64.length > 100)) { 
                const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
                return (
                    <img src={src} alt={safeDesc || 'Görsel'} className={`object-contain rounded-lg shadow-sm bg-white/50 dark:bg-zinc-800/50 transition-all duration-300 hover:scale-[1.02] w-full h-full`} loading="lazy" />
                );
            }
            
            // 3. AI generated Emoji fallback
            if (base64 && typeof base64 === 'string' && base64.length < 15 && base64.trim().length > 0) {
                 return (
                    <div className={`rounded-xl flex flex-col items-center justify-center text-center p-2 overflow-hidden select-none transition-all bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 w-full h-full`}>
                        <div className="text-5xl md:text-6xl filter drop-shadow-sm transform transition-transform hover:scale-110 cursor-default animate-in fade-in zoom-in duration-300 leading-none" role="img" aria-label={safeDesc}>
                            {base64}
                        </div>
                    </div>
                 );
            }
            
            const cleanDescription = (safeDesc.trim().length > 0) ? safeDesc : 'Görsel';
            const emojiIcon = findEmojiForDescription(cleanDescription);
            const colorClass = stringToColor(cleanDescription);
            const initial = cleanDescription.charAt(0).toUpperCase();
            
            return (
                <div className={`rounded-xl flex flex-col items-center justify-center text-center p-2 overflow-hidden select-none transition-all w-full h-full ${emojiIcon ? 'bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700' : `border-2 ${colorClass}`}`}>
                    {emojiIcon ? (
                        <div className="text-5xl md:text-6xl filter drop-shadow-sm transform transition-transform hover:scale-110 cursor-default animate-in fade-in zoom-in duration-300 leading-none" role="img" aria-label={cleanDescription}>
                            {emojiIcon}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in duration-500">
                            <span className="text-4xl font-black opacity-80 mb-1">{initial}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 px-1 truncate max-w-full">{cleanDescription}</span>
                        </div>
                    )}
                </div>
            );
        })()}
    </EditableElement>
    );
});

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => {
    const { speak, isSpeaking } = useTTS();

    // Determine Mascot based on title keywords (heuristic)
    const getMascot = () => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('matematik') || lowerTitle.includes('sayı') || lowerTitle.includes('işlem')) return <MascotRobot className="w-24 h-24" />;
        if (lowerTitle.includes('okuma') || lowerTitle.includes('hikaye') || lowerTitle.includes('kelime')) return <MascotOwl className="w-24 h-24" />;
        return <MascotCat className="w-24 h-24" />;
    };

    return (
        <EditableElement id="header-block" className="pedagogical-header mb-8 text-center print:mb-6 break-inside-avoid relative group w-full">
            
            {/* Student Info Strip injected in Worksheet.tsx, kept here for fallback logic if needed */}
            <div 
                className="justify-between items-center mb-6 border-b-2 border-black pb-2 text-sm font-bold text-black uppercase tracking-widest hidden print:flex student-info-strip-default"
                style={{ display: 'var(--show-student-info, flex)' }}
            >
                <div className="flex-1 text-left">Adı Soyadı: ...........................................</div>
                <div className="w-48 text-right">Tarih: ...../...../.......</div>
                <div className="w-24 text-right">Puan: .......</div>
            </div>

            {/* Mascot Container (Movable) */}
            <EditableElement id="mascot" className="absolute -top-4 right-0 z-10 hidden print:block" style={{ display: 'var(--show-mascot, block)' }}>
                {getMascot()}
                <div className="absolute -left-16 top-4 bg-white border-2 border-black rounded-xl p-2 shadow-sm text-[10px] font-bold w-16 text-center bubble-triangle">
                    <EditableText value="Hadi Çöz!" tag="span" />
                </div>
            </EditableElement>

            <div className="flex items-center justify-center gap-3 mb-3 relative z-0">
                <EditableText 
                    tag="h3" 
                    value={title} 
                    className="text-3xl font-black text-zinc-800 dark:text-zinc-100 font-dyslexic tracking-tight relative inline-block"
                />
                <button 
                    onClick={() => speak(`${title}. Yönerge: ${instruction}`)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all print:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSpeaking ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-zinc-100 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-zinc-800'}`}
                    title="Sesli Oku"
                >
                    <i className={`fa-solid ${isSpeaking ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
                </button>
            </div>
            
            <EditableElement id="instruction-box" className="inline-block px-8 py-3 bg-white dark:bg-indigo-900/20 rounded-2xl border-2 border-indigo-100 dark:border-indigo-800 mb-4 shadow-sm relative print:border-zinc-300">
                <EditableText 
                    tag="p" 
                    value={instruction} 
                    className="text-lg font-bold text-indigo-800 dark:text-indigo-200 print:text-black font-dyslexic" 
                />
                <div className="absolute -top-3 -left-3 text-2xl text-indigo-300 print:text-zinc-400">
                    <i className="fa-solid fa-quote-left"></i>
                </div>
            </EditableElement>
            
            {data?.imageBase64 && (
                <div className="my-6 mx-auto max-w-lg rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-700 bg-white dark:bg-zinc-800 relative group-hover:shadow-xl transition-all duration-300 print:shadow-none print:border-zinc-200">
                    <ImageDisplay 
                        base64={data.imageBase64} 
                        description={data.imagePrompt || title} 
                        className="w-full h-64 object-contain bg-white dark:bg-zinc-800/50" 
                    />
                </div>
            )}

            {note && (
                <div className="print:block" style={{ display: 'var(--show-pedagogical-note, flex)' }}>
                    <div className="pedagogical-note flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 italic mt-2">
                        <i className="fa-solid fa-graduation-cap text-zinc-400"></i>
                        <span>Eğitmen Notu: <EditableText tag="span" value={note} /></span>
                    </div>
                </div>
            )}
        </EditableElement>
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
            <div className="absolute top-0 right-0 z-20">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`text-[10px] px-2 py-1 rounded-bl-lg shadow-sm transition-colors focus:outline-none ${isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                    title="Okuma Cetveli"
                >
                    <i className="fa-solid fa-ruler-horizontal"></i>
                </button>
            </div>
            {isActive && (
                <div 
                    className="absolute left-0 right-0 h-12 bg-yellow-200/30 border-y-2 border-indigo-400/50 pointer-events-none z-10 mix-blend-multiply dark:mix-blend-screen dark:bg-yellow-900/30 transition-none"
                    style={{ top: position - 24 }} 
                ></div>
            )}
        </div>
    );
};

export const Shape = React.memo(({ name, className = "w-10 h-10" }: { name: ShapeType; className?: string }) => {
    const strokeColor = "currentColor"; 
    const strokeWidth = "4";
    const fillColor = "transparent"; 
    
    switch (name) {
        case 'circle': return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'square': return <svg viewBox="0 0 100 100" className={className}><rect x="10" y="10" width="80" height="80" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'triangle': return <svg viewBox="0 0 100 100" className={className}><polygon points="50,10 90,90 10,90" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'hexagon': return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'star': return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'diamond': return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,50 50,95 5,50" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'pentagon': return <svg viewBox="0 0 100 100" className={className}><polygon points="50,5 95,40 78,95 22,95 5,40" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'octagon': return <svg viewBox="0 0 100 100" className={className}><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" stroke={strokeColor} strokeWidth={strokeWidth} fill={fillColor} /></svg>;
        case 'cube': return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M25 35 V75 L50 90 L75 75 V35 L50 20 Z M25 35 L50 20 L75 35 M50 90 V55 L25 75 M75 75 L50 55"/></svg>;
        case 'sphere': return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><circle cx="50" cy="50" r="40"/><ellipse cx="50" cy="50" rx="40" ry="10" strokeDasharray="5,5" /></svg>;
        case 'pyramid': return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M50 10 L10 90 H90 Z M50 10 L50 90 M10 90 L50 50 L90 90"/></svg>;
        case 'cone': return <svg viewBox="0 0 100 100" className={className} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M50 10 L10 90 H90 Z"/><ellipse cx="50" cy="90" rx="40" ry="10"/></svg>;
        default: return <svg viewBox="0 0 100 100" className={className}><circle cx="50" cy="50" r="20" stroke={strokeColor} strokeWidth="2" fill="none" /></svg>;
    }
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
                            {showLetters ? (typeof cell === 'string' ? <EditableText value={cell.toLocaleUpperCase('tr')} tag="span" /> : <EditableText value={cell || ''} tag="span" />) : ''}
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
