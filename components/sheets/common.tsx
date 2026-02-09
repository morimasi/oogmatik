
import React, { useMemo, useState } from 'react';
import { ShapeType, BaseActivityData } from '../../types';

// --- KLİNİK RENK PALETİ ---
export const CLINICAL_COLORS = {
    primary: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#3f3f46'
};

// --- CONSTANTS ---
export const QUESTION_TYPES: Record<string, { label: string; color: string }> = {
    who: { label: 'KİM?', color: '#4f46e5' },
    where: { label: 'NEREDE?', color: '#10b981' },
    when: { label: 'NE ZAMAN?', color: '#f59e0b' },
    what: { label: 'NE?', color: '#ef4444' },
    why: { label: 'NİYE?', color: '#8b5cf6' },
    how: { label: 'NASIL?', color: '#ec4899' },
};

const SHAPE_PATHS: Record<string, string> = {
    triangle: "M 50 15 L 85 85 L 15 85 Z",
    circle: "M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0",
    square: "M 20 20 L 80 20 L 80 80 L 20 80 Z",
    star: "M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z",
    hexagon: "M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z",
    pentagon: "M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z",
    diamond: "M 50 10 L 85 50 L 50 90 L 15 50 Z"
};

// --- COMPONENTS ---

/* Fix: Component to handle focus mode visualization in print/preview */
export const ReadingRuler = () => null; 

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => (
    <div className="mb-6 w-full break-inside-avoid border-b-4 border-zinc-900 pb-4">
        <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none mb-2">{title}</h3>
                <p className="text-base font-bold text-zinc-700 leading-tight italic">{instruction}</p>
            </div>
            {data?.targetedErrors && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px] no-print">
                    {data.targetedErrors.map(tag => (
                        <span key={tag} className="text-[7px] font-black bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 uppercase tracking-widest">
                            {tag.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            )}
        </div>
        {note && <p className="mt-3 text-[10px] text-zinc-500 font-medium leading-relaxed max-w-3xl">
            <i className="fa-solid fa-graduation-cap mr-2"></i>{note}
        </p>}
    </div>
));

/* Fix: Ten-Frame for number sense */
export const TenFrame: React.FC<{ count: number; color?: string }> = ({ count, color = '#4f46e5' }) => (
    <div className="grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-32 h-14 rounded-md shadow-sm">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-zinc-200 rounded-sm flex items-center justify-center">
                {i < count && <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>}
            </div>
        ))}
    </div>
);

/* Fix: Basic Shape renderer */
export const Shape: React.FC<{ name: ShapeType; className?: string; color?: string }> = ({ name, className = "w-8 h-8", color = "currentColor" }) => (
    <svg viewBox="0 0 100 100" className={className} fill={color}>
        <path d={SHAPE_PATHS[name] || SHAPE_PATHS.circle} />
    </svg>
);

/* Fix: Grid renderer for various activities */
export const GridComponent: React.FC<{ grid: string[][]; cellClassName?: string }> = ({ grid, cellClassName = "w-10 h-10 border" }) => (
    <div className="inline-block border-2 border-zinc-900 bg-white">
        {grid.map((row, r) => (
            <div key={r} className="flex">
                {row.map((cell, c) => (
                    <div key={c} className={`flex items-center justify-center font-bold ${cellClassName}`}>
                        {cell}
                    </div>
                ))}
            </div>
        ))}
    </div>
);

/* Fix: Caged Grid for Kendoku-like puzzles */
export const CagedGridSvg = () => null; 

/* Fix: Display for multiple shapes */
export const ShapeDisplay: React.FC<{ shapes: ShapeType[] }> = ({ shapes }) => (
    <div className="flex gap-1">
        {shapes.map((s, i) => <Shape key={i} name={s} className="w-4 h-4" />)}
    </div>
);

/* Fix: Segment display for logical tasks */
export const SegmentDisplay: React.FC<{ segments?: boolean[]; color?: string }> = ({ segments = [], color = "black" }) => (
    <div className="w-12 h-20 relative">
        {/* Simplified 7-segment visualization */}
        <div className="absolute inset-0 border-2 border-zinc-100 opacity-20"></div>
        {segments.map((active, i) => active && <div key={i} className="absolute bg-current" style={{ opacity: 0.8 }}></div>)}
    </div>
);

/* Fix: Matchstick visualization */
export const Matchstick: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
);

/* Fix: Connection dots for ABC activities */
export const ConnectionDot: React.FC<{ x: number; y: number; label?: string }> = ({ x, y, label }) => (
    <g transform={`translate(${x}, ${y})`}>
        <circle r="4" fill="black" />
        {label && <text y="15" textAnchor="middle" fontSize="10" fontWeight="bold">{label}</text>}
    </g>
);

/* Fix: 3D cube stack counter */
export const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => (
    <div className="flex flex-col items-center">
        {/* Isometric representation is complex, this is a simplified plan-view or placeholder */}
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${counts[0]?.length || 0}, 30px)` }}>
            {counts.map((row, r) => row.map((count, c) => (
                <div key={`${r}-${c}`} className="w-[30px] h-[30px] border-2 border-zinc-800 bg-zinc-100 flex items-center justify-center font-bold text-xs">
                    {count}
                </div>
            )))}
        </div>
    </div>
);

/* Fix: Dyslexia-friendly text block */
export const DyslexicText: React.FC<{ text: string }> = ({ text }) => (
    <p className="font-dyslexic text-lg leading-relaxed">{text}</p>
);

/* Fix: Guide lines for handwriting */
export const HandwritingGuide: React.FC<{ height: number; children?: React.ReactNode }> = ({ height, children }) => (
    <div className="relative w-full border-b border-zinc-200" style={{ height: `${height}px`, backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: `100% ${height / 4}px` }}>
        {children}
    </div>
);

/* Fix: Tracing text (dotted font) */
export const TracingText: React.FC<{ text: string; fontSize?: string }> = ({ text, fontSize = "32px" }) => (
    <span className="font-tracing opacity-40 select-none" style={{ fontSize }}>{text}</span>
);

/* Fix: Domino/Dice visualizer */
export const Domino: React.FC<{ count: number }> = ({ count }) => (
    <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center bg-white">
        <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${[4, 0, 8, 2, 6, 1, 7, 3, 5].slice(0, count).includes(i) ? 'bg-black' : 'bg-transparent'}`}></div>
            ))}
        </div>
    </div>
);

/* Fix: Number bond visualization */
export const NumberBond: React.FC<{ whole: number; part1: number; part2: number; isAddition: boolean }> = ({ whole, part1, part2 }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold">{whole}</div>
        <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-sm">{part1}</div>
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-sm">{part2}</div>
        </div>
    </div>
);

/* Fix: Fraction visualization */
export const FractionVisual: React.FC<{ num: number; den: number }> = ({ num, den }) => (
    <div className="w-12 h-12 rounded-full border-2 border-black relative overflow-hidden">
        {Array.from({ length: den }).map((_, i) => (
            <div 
                key={i} 
                className={`absolute inset-0 ${i < num ? 'bg-indigo-500' : 'bg-transparent'}`}
                style={{ 
                    clipPath: `conic-gradient(from ${i * (360 / den)}deg, #000 ${360 / den}deg, transparent 0)`,
                    transform: `rotate(${i * (360 / den)}deg)`
                }}
            ></div>
        ))}
    </div>
);

/* Fix: Analog clock component */
export const AnalogClock: React.FC<{ hour: number; minute: number; className?: string; showNumbers?: boolean; showTicks?: boolean; showHands?: boolean }> = ({ hour, minute, className, showHands = true }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeWidth="2" />
        {showHands && (
            <>
                <line x1="50" y1="50" x2={50 + 25 * Math.sin((hour + minute / 60) * Math.PI / 6) } y2={50 - 25 * Math.cos((hour + minute / 60) * Math.PI / 6)} stroke="black" strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="50" x2={50 + 35 * Math.sin(minute * Math.PI / 30)} y2={50 - 35 * Math.cos(minute * Math.PI / 30)} stroke="black" strokeWidth="2" strokeLinecap="round" />
            </>
        )}
        <circle cx="50" cy="50" r="2" fill="black" />
    </svg>
);

/* Fix: Number line visualization */
export const NumberLine: React.FC<{ start: number; end: number; step: number; missing?: number[] }> = ({ start, end, step, missing = [] }) => (
    <div className="w-full h-12 flex items-center px-4">
        <div className="w-full h-0.5 bg-black relative">
            {Array.from({ length: (end - start) / step + 1 }).map((_, i) => {
                const val = start + i * step;
                return (
                    <div key={val} className="absolute top-0 h-3 w-0.5 bg-black" style={{ left: `${(i / ((end - start) / step)) * 100}%` }}>
                        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold">
                            {missing.includes(val) ? '?' : val}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

/* Fix: Place value blocks */
export const Base10Visualizer: React.FC<{ number: number; className?: string }> = ({ number, className }) => (
    <div className={`flex gap-2 ${className}`}>
        {Array.from({ length: Math.floor(number / 10) }).map((_, i) => <div key={i} className="w-2 h-10 bg-indigo-200 border border-indigo-400"></div>)}
        {Array.from({ length: number % 10 }).map((_, i) => <div key={i} className="w-2 h-2 bg-indigo-500 border border-indigo-700"></div>)}
    </div>
);

/* Fix: Story text highlighter */
export const StoryHighlighter: React.FC<{ text: string; highlights: { text: string; type: string }[] }> = ({ text, highlights }) => {
    let result: (string | JSX.Element)[] = [text];
    
    highlights.forEach(h => {
        if (!h.text) return;
        const color = QUESTION_TYPES[h.type]?.color || '#fef08a';
        
        result = result.flatMap(part => {
            if (typeof part !== 'string') return part;
            const pieces = part.split(h.text);
            return pieces.reduce((acc: (string | JSX.Element)[], piece, i) => {
                acc.push(piece);
                if (i < pieces.length - 1) {
                    acc.push(<span key={`${h.text}-${i}`} className="bg-yellow-200 rounded px-1" style={{ backgroundColor: `${color}33` }}>{h.text}</span>);
                }
                return acc;
            }, []);
        });
    });

    return <>{result}</>;
};

export const FlowArrow = () => (
    <div className="flex flex-col items-center py-2">
        <div className="w-1 h-8 bg-zinc-900"></div>
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-zinc-900"></div>
    </div>
);

export const ImageDisplay = React.memo(({ prompt, className = "w-full h-24", description = "image" }: { prompt?: string; className?: string; description?: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const query = encodeURIComponent(prompt || 'educational illustration');
    const url = `https://image.pollinations.ai/prompt/${query}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-zinc-50 ${className}`}>
            {isLoading && <div className="absolute inset-0 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i></div>}
            <img src={url} alt={description} className={`w-full h-full object-contain transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`} onLoad={() => setIsLoading(false)} />
        </div>
    );
});
