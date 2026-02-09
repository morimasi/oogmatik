import React, { useMemo, useState, useEffect } from 'react';
import { ShapeType, BaseActivityData } from '../../types';

// --- KLİNİK RENK PALETİ ---
export const CLINICAL_COLORS = {
    primary: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#3f3f46'
};

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => (
    <div className="mb-6 w-full break-inside-avoid border-b-4 border-zinc-900 pb-4 relative">
        <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-2">{title}</h3>
                <p className="text-base font-bold text-zinc-700 leading-tight italic">{instruction}</p>
            </div>
            
            {/* TANISAL BİLGİ PANELİ (Sadece Ekranda Görünür, Yazıcıda Çıkmaz) */}
            {data?.targetedErrors && (
                <div className="flex flex-col gap-1 items-end no-print absolute -top-1 right-0">
                    <div className="flex flex-wrap gap-1 justify-end max-w-[250px]">
                        {data.targetedErrors.map(tag => (
                            <span key={tag} className="text-[7px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                <i className="fa-solid fa-microscope mr-1"></i>
                                {tag.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                    {data.cognitiveGoal && (
                        <span className="text-[8px] font-bold text-zinc-400 italic bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                             Hedef: {data.cognitiveGoal}
                        </span>
                    )}
                </div>
            )}
        </div>
        {note && <p className="mt-3 text-[10px] text-zinc-500 font-medium leading-relaxed max-w-3xl">
            <i className="fa-solid fa-graduation-cap mr-2"></i>{note}
        </p>}
    </div>
));

// Ten-Frame: Sayı hissi ve diskalkuli için standart klinik araç
export const TenFrame: React.FC<{ count: number; color?: string }> = ({ count, color = '#4f46e5' }) => (
    <div className="grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-32 h-14 rounded-md shadow-sm">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-zinc-200 rounded-sm flex items-center justify-center">
                {i < count && <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>}
            </div>
        ))}
    </div>
);

// Algoritma Akış Oku
export const FlowArrow = () => (
    <div className="flex flex-col items-center py-2 opacity-80">
        <div className="w-1.5 h-10 bg-gradient-to-b from-zinc-900 to-zinc-400 rounded-full"></div>
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-zinc-400 -mt-1"></div>
    </div>
);

// ImageDisplay: Support prompt, base64 and description props for multimodal image display
export const ImageDisplay = React.memo(({ prompt, className = "w-full h-24", base64, description }: { prompt?: string; className?: string; base64?: string, description?: string }) => {
    const [isLoading, setIsLoading] = useState(!base64);
    const query = encodeURIComponent(prompt || 'educational illustration');
    const url = base64 || `https://image.pollinations.ai/prompt/${query}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-zinc-50 ${className}`}>
            {isLoading && <div className="absolute inset-0 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i></div>}
            <img src={url} alt={description} className={`w-full h-full object-contain transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`} onLoad={() => setIsLoading(false)} />
        </div>
    );
});

// ReadingRuler: For clinical visual focus support
export const ReadingRuler = () => (
    <div className="absolute inset-x-0 h-20 bg-indigo-500/10 border-y-2 border-indigo-500 pointer-events-none z-50 no-print opacity-0 group-hover:opacity-100 transition-opacity"></div>
);

// StoryHighlighter: For keyword emphasis
export const StoryHighlighter = ({ text, highlights }: { text: string, highlights: { text: string, type: string }[] }) => {
    if (!highlights || highlights.length === 0) return <span>{text}</span>;
    
    let parts = [text];
    highlights.forEach(h => {
        if (!h.text) return;
        const newParts: string[] = [];
        parts.forEach(p => {
            if (typeof p !== 'string') {
                newParts.push(p);
                return;
            }
            const split = p.split(new RegExp(`(${h.text})`, 'gi'));
            newParts.push(...split);
        });
        parts = newParts;
    });

    return (
        <>
            {parts.map((part, i) => {
                const highlight = highlights.find(h => h.text.toLowerCase() === part.toLowerCase());
                if (highlight) {
                    const color = QUESTION_TYPES[highlight.type]?.color || '#4f46e5';
                    return <span key={i} className="bg-opacity-20 px-1 rounded" style={{ backgroundColor: color, color: color, fontWeight: 'bold' }}>{part}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};

// QUESTION_TYPES: For 5N1K categorization
export const QUESTION_TYPES: Record<string, { label: string, color: string }> = {
    who: { label: 'KİM', color: '#6366f1' },
    where: { label: 'NEREDE', color: '#10b981' },
    when: { label: 'NE ZAMAN', color: '#f59e0b' },
    what: { label: 'NE', color: '#ef4444' },
    why: { label: 'NEDEN', color: '#8b5cf6' },
    how: { label: 'NASIL', color: '#06b6d4' }
};

// Shape: Geometric shapes using SVG paths
/**
 * FIX: Changed Shape component to use React.FC to allow 'key' prop when used in lists, 
 * fixing TypeScript error on line 364.
 */
export const Shape: React.FC<{ name: ShapeType | string, className?: string, style?: React.CSSProperties }> = ({ name, className, style }) => {
    const paths: Record<string, string> = {
        triangle: "M 50 15 L 85 85 L 15 85 Z",
        circle: "M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0",
        square: "M 20 20 L 80 20 L 80 80 L 20 80 Z",
        star: "M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z",
        hexagon: "M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z",
        pentagon: "M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z",
        diamond: "M 50 10 L 85 50 L 50 90 L 15 50 Z",
        octagon: "M 30 10 L 70 10 L 90 30 L 90 70 L 70 90 L 30 90 L 10 70 L 10 30 Z"
    };
    return (
        <svg viewBox="0 0 100 100" className={className} style={style}>
            <path d={paths[name as string] || paths.circle} fill="currentColor" />
        </svg>
    );
};

// Base10Visualizer: Units (cubes) and Tens (rods)
export const Base10Visualizer: React.FC<{ number: number; className?: string }> = ({ number, className }) => {
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return (
        <div className={`flex gap-4 items-end ${className}`}>
            {tens > 0 && (
                <div className="flex gap-1">
                    {Array.from({ length: tens }).map((_, i) => (
                        <div key={i} className="flex flex-col-reverse w-4 border-2 border-indigo-900 bg-indigo-100 rounded-sm">
                            {Array.from({ length: 10 }).map((_, j) => (
                                <div key={j} className="h-4 w-full border-t border-indigo-900/20 first:border-t-0"></div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            {ones > 0 && (
                <div className="grid grid-cols-2 gap-1">
                    {Array.from({ length: ones }).map((_, i) => (
                        <div key={i} className="w-4 h-4 border-2 border-indigo-900 bg-indigo-50 rounded-sm"></div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Domino / Dice pattern
export const Domino: React.FC<{ count: number; color?: string }> = ({ count, color = '#4f46e5' }) => {
    const dots = [
        [], // 0
        [4], // 1
        [0, 8], // 2
        [0, 4, 8], // 3
        [0, 2, 6, 8], // 4
        [0, 2, 4, 6, 8], // 5
        [0, 2, 3, 5, 6, 8], // 6
        [0, 2, 3, 4, 5, 6, 8], // 7
        [0, 1, 2, 3, 5, 6, 7, 8], // 8
        [0, 1, 2, 3, 4, 5, 6, 7, 8] // 9
    ];
    const activeDots = dots[Math.min(9, count)] || [];
    return (
        <div className="w-16 h-16 bg-white border-4 border-black rounded-xl grid grid-cols-3 grid-rows-3 p-2 gap-1 shadow-sm">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                    {activeDots.includes(i) && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>}
                </div>
            ))}
        </div>
    );
};

// NumberBond: Triangle mapping
export const NumberBond: React.FC<{ whole: number; part1: number; part2: number; isAddition?: boolean }> = ({ whole, part1, part2 }) => (
    <div className="relative w-32 h-32 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-900 bg-white flex items-center justify-center font-black text-xl z-10">{whole}</div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="64" y1="48" x2="32" y2="90" stroke="#1e1b4b" strokeWidth="3" />
            <line x1="64" y1="48" x2="96" y2="90" stroke="#1e1b4b" strokeWidth="3" />
        </svg>
        <div className="flex gap-10 mt-10">
            <div className="w-10 h-10 rounded-full border-2 border-zinc-400 bg-zinc-50 flex items-center justify-center font-bold text-lg z-10">{part1}</div>
            <div className="w-10 h-10 rounded-full border-2 border-zinc-400 bg-zinc-50 flex items-center justify-center font-bold text-lg z-10">{part2}</div>
        </div>
    </div>
);

// AnalogClock: SVG clock face
export const AnalogClock: React.FC<{ hour: number; minute: number; className?: string; showNumbers?: boolean; showTicks?: boolean; showHands?: boolean }> = ({ hour, minute, className, showNumbers = true, showHands = true }) => {
    const hrAngle = (hour % 12) * 30 + minute * 0.5;
    const minAngle = minute * 6;
    return (
        <svg viewBox="0 0 100 100" className={`${className}`}>
            <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="3" />
            {showNumbers && Array.from({ length: 12 }).map((_, i) => {
                const angle = (i + 1) * 30 * (Math.PI / 180);
                const x = 50 + 35 * Math.sin(angle);
                const y = 50 - 35 * Math.cos(angle);
                return <text key={i} x={x} y={y} fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{i + 1}</text>;
            })}
            {showHands && (
                <>
                    <line x1="50" y1="50" x2={50 + 25 * Math.sin(hrAngle * Math.PI / 180)} y2={50 - 25 * Math.cos(hrAngle * Math.PI / 180)} stroke="black" strokeWidth="4" strokeLinecap="round" />
                    <line x1="50" y1="50" x2={50 + 38 * Math.sin(minAngle * Math.PI / 180)} y2={50 - 38 * Math.cos(minAngle * Math.PI / 180)} stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="2.5" fill="black" />
                </>
            )}
        </svg>
    );
};

// NumberLine: Horizontal scale
export const NumberLine: React.FC<{ start: number; end: number; step?: number; missing?: number[] }> = ({ start, end, step = 1, missing = [] }) => (
    <div className="w-full py-8 relative">
        <div className="h-1 w-full bg-zinc-900 rounded-full relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-zinc-900 -ml-1"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[10px] border-r-zinc-900 -mr-1"></div>
            {Array.from({ length: Math.floor((end - start) / step) + 1 }).map((_, i) => {
                const val = start + i * step;
                const isMissing = missing.includes(val);
                const pos = (i / ((end - start) / step)) * 100;
                return (
                    <div key={i} className="absolute flex flex-col items-center" style={{ left: `${pos}%` }}>
                        <div className="h-4 w-1 bg-zinc-900 -mt-1.5"></div>
                        <span className={`mt-2 font-mono font-black text-lg ${isMissing ? 'text-transparent border-b-2 border-dashed border-indigo-400 min-w-[20px] text-center' : 'text-zinc-800'}`}>
                            {isMissing ? '?' : val}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

// CubeStack: Isometric representation
export const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => {
    // Simple top-down approach representing stacks of cubes
    return (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${counts[0]?.length || 3}, 1fr)` }}>
            {counts.flatMap((row, r) => row.map((count, c) => (
                <div key={`${r}-${c}`} className="relative w-16 h-16 bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center rounded shadow-inner">
                    {count > 0 && (
                        <div className="flex flex-col-reverse gap-0.5 w-full h-full p-1">
                            {Array.from({ length: count }).map((_, i) => (
                                <div key={i} className="h-2 w-full bg-indigo-500 border border-indigo-900/20 rounded-xs shadow-sm"></div>
                            ))}
                        </div>
                    )}
                </div>
            )))}
        </div>
    );
};

// FractionVisual: Pie or bar chart
export const FractionVisual: React.FC<{ num: number; den: number; size?: number }> = ({ num, den, size = 100 }) => {
    const center = size / 2;
    const radius = size * 0.4;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={center} cy={center} r={radius} fill="white" stroke="black" strokeWidth="2" />
            {Array.from({ length: den }).map((_, i) => {
                const angle = (i * 360) / den;
                const rad = (angle - 90) * (Math.PI / 180);
                const x = center + radius * Math.cos(rad);
                const y = center + radius * Math.sin(rad);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="black" strokeWidth="1" />;
            })}
            {Array.from({ length: num }).map((_, i) => {
                const startAngle = (i * 360) / den - 90;
                const endAngle = ((i + 1) * 360) / den - 90;
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                const x1 = center + radius * Math.cos(startAngle * Math.PI / 180);
                /**
                 * FIX: Added missing 'const' for y1 variable declaration, fixing a critical bug.
                 */
                const y1 = center + radius * Math.sin(startAngle * Math.PI / 180);
                const x2 = center + radius * Math.cos(endAngle * Math.PI / 180);
                const y2 = center + radius * Math.sin(endAngle * Math.PI / 180);
                return <path key={i} d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`} fill="rgba(79, 70, 229, 0.4)" stroke="black" strokeWidth="1" />;
            })}
        </svg>
    );
};

// GridComponent: Generic table renderer
export const GridComponent: React.FC<{ grid: string[][]; cellClassName?: string }> = ({ grid, cellClassName }) => (
    <table className="border-collapse mx-auto">
        <tbody>
            {grid.map((row, r) => (
                <tr key={r}>
                    {row.map((cell, c) => (
                        <td key={c} className={`border border-zinc-300 text-center ${cellClassName || 'p-2'}`}>{cell}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

// DyslexicText: Highlight certain letters
export const DyslexicText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <p className="font-dyslexic">
            {text.split('').map((char, i) => {
                const isTarget = ['b', 'd', 'p', 'q'].includes(char.toLowerCase());
                return <span key={i} className={isTarget ? 'text-indigo-600 font-bold' : ''}>{char}</span>;
            })}
        </p>
    );
};

// HandwritingGuide: Lined paper
export const HandwritingGuide: React.FC<{ height: number; children?: React.ReactNode }> = ({ height, children }) => (
    <div className="relative w-full overflow-hidden bg-white border border-zinc-100 rounded" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="flex-1 border-b border-zinc-200"></div>
            <div className="h-[40%] bg-indigo-50/20 border-b border-indigo-200"></div>
            <div className="flex-1"></div>
        </div>
        <div className="relative z-10 w-full h-full flex items-center px-4">
            {children}
        </div>
    </div>
);

// TracingText: SVG text with dashed stroke
export const TracingText: React.FC<{ text: string; fontSize?: string }> = ({ text, fontSize = "32px" }) => (
    <svg className="w-full h-full overflow-visible">
        <text x="0" y="50%" dominantBaseline="middle" fontSize={fontSize} fill="none" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3 2" className="font-handwriting">
            {text}
        </text>
    </svg>
);

// ShapeDisplay: Render multiple small shapes in a box
export const ShapeDisplay: React.FC<{ shapes: string[] }> = ({ shapes }) => (
    <div className="flex flex-wrap gap-1 p-2 justify-center">
        {shapes.map((s, i) => <Shape key={i} name={s as ShapeType} className="w-6 h-6 text-zinc-800" />)}
    </div>
);

// SegmentDisplay: 7-segment like pattern
export const SegmentDisplay: React.FC<{ segments: boolean[] }> = ({ segments }) => (
    <div className="grid grid-cols-3 gap-1 w-12">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm border ${segments[i] ? 'bg-zinc-800 border-zinc-900' : 'bg-transparent border-zinc-100'}`}></div>
        ))}
    </div>
);

// CagedGridSvg: Specialized grid with cages
export const CagedGridSvg: React.FC<{ grid: (string | null)[][]; cages?: any[] }> = ({ grid }) => (
    <div className="relative border-4 border-black p-1 bg-white">
        <table className="border-collapse">
            <tbody>
                {grid.map((row, r) => (
                    <tr key={r}>
                        {row.map((cell, c) => (
                            <td key={c} className="w-12 h-12 border border-zinc-300 text-center font-bold text-xl">{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Matchstick: Visual stick
export const Matchstick: React.FC<{ rotation?: number }> = ({ rotation = 0 }) => (
    <div className="w-1 h-12 bg-amber-200 relative rounded-full border border-amber-900/20" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="absolute top-0 left-0 w-full h-2 bg-rose-600 rounded-t-full shadow-sm"></div>
    </div>
);

// ConnectionDot: Target for matching
export const ConnectionDot: React.FC<{ active?: boolean }> = ({ active }) => (
    <div className={`w-4 h-4 rounded-full border-2 transition-all ${active ? 'bg-indigo-600 border-white shadow-lg scale-125' : 'bg-white border-zinc-300 hover:border-indigo-400'}`}></div>
);
