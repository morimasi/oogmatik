
import React, { useMemo, useState, useEffect } from 'react';
import { ShapeType, BaseActivityData } from '../../types';
import { EMOJI_MAP, simpleSyllabify } from '../../services/offlineGenerators/helpers';
import { EditableElement, EditableText } from '../Editable'; 

// --- COLOR CONSTANTS FOR 5W1H ---
export const QUESTION_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
    who: { label: 'KİM?', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    what: { label: 'NE?', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    where: { label: 'NEREDE?', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    when: { label: 'NE ZAMAN?', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    why: { label: 'NEDEN?', color: '#a855f7', bg: '#faf5ff', border: '#e9d5ff' },
    how: { label: 'NASIL?', color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
};

export const ReadingRuler = () => (
    <div className="absolute left-0 right-0 h-12 bg-yellow-200/20 border-y border-yellow-400/30 pointer-events-none z-20 no-print" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded text-yellow-900 uppercase tracking-widest shadow-sm">Okuma Cetveli</div>
    </div>
);

export const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => {
    if (!counts || !Array.isArray(counts) || counts.length === 0) return null;
    const dim = counts.length;
    const size = 30; 
    
    const drawCube = (gx: number, gy: number, gz: number) => {
        const isoX = (gx - gy) * size;
        const isoY = (gx + gy) * (size * 0.5) - (gz * size * 0.8);
        const top = `M 0 0 L ${size} ${size*0.5} L 0 ${size} L ${-size} ${size*0.5} Z`;
        const left = `M ${-size} ${size*0.5} L 0 ${size} L 0 ${size*2} L ${-size} ${size*1.5} Z`;
        const right = `M 0 ${size} L ${size} ${size*0.5} L ${size} ${size*1.5} L 0 ${size*2} Z`;
        return (
            <g transform={`translate(${isoX + 150}, ${isoY + 100})`} key={`${gx}-${gy}-${gz}`}>
                <path d={left} fill="#9ca3af" stroke="black" strokeWidth="1" />
                <path d={right} fill="#d1d5db" stroke="black" strokeWidth="1" />
                <path d={top} fill="#f3f4f6" stroke="black" strokeWidth="1" />
            </g>
        );
    };

    const cubesToRender: {x:number, y:number, z:number}[] = [];
    for (let x = 0; x < dim; x++) {
        for (let y = 0; y < dim; y++) {
            const h = counts[x][y] || 0;
            for (let z = 0; z < h; z++) cubesToRender.push({x, y, z});
        }
    }
    cubesToRender.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z);

    return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            {cubesToRender.map((c) => drawCube(c.x, c.y, c.z))}
        </svg>
    );
};

export const StoryHighlighter = ({ text, highlights }: { text: string; highlights: { text: string; type: string }[] }) => {
    if (!text) return null;
    if (!highlights || highlights.length === 0) return <div>{text}</div>;
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${sortedHighlights.map(h => escapeRegExp(h.text)).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <div className="leading-relaxed text-justify">
            {parts.map((part, index) => {
                const highlight = sortedHighlights.find(h => h.text.toLowerCase() === part.toLowerCase());
                if (highlight) {
                    const style = QUESTION_TYPES[highlight.type];
                    return (
                        <span 
                            key={index} 
                            className="px-1 py-0.5 rounded mx-0.5 font-bold border-b-2"
                            style={{ 
                                backgroundColor: style?.bg || '#f3f4f6', 
                                color: style?.color || 'black',
                                borderColor: style?.color || 'transparent'
                            }}
                        >
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};

interface ImageDisplayProps {
    base64?: string;
    description?: string | number;
    prompt?: string;
    className?: string;
}

export const ImageDisplay = React.memo(({ base64, description, prompt, className = "w-full h-24" }: ImageDisplayProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const safeDesc = useMemo(() => description ? String(description) : '', [description]);

    const sourceContent = useMemo(() => {
        if (!base64 && !prompt && !description) return null;
        if (base64) {
            if (base64.includes('<svg') || base64.startsWith('data:image')) {
                return base64;
            }
        }
        const seed = Math.floor(Math.random() * 1000000);
        const query = encodeURIComponent(prompt || safeDesc || 'educational icon');
        return `https://image.pollinations.ai/prompt/${query}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;
    }, [base64, prompt, safeDesc]);

    if (!sourceContent) {
        return (
            <div className={`${className} bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-300`}>
                <i className="fa-solid fa-image text-2xl opacity-20"></i>
            </div>
        );
    }

    if (typeof sourceContent === 'string' && sourceContent.includes('<svg')) {
        return (
            <div 
                className={`${className} flex items-center justify-center p-2`} 
                dangerouslySetInnerHTML={{ __html: sourceContent }} 
            />
        );
    }

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50 z-10">
                    <i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i>
                </div>
            )}
            <img 
                src={sourceContent} 
                alt={safeDesc}
                crossOrigin="anonymous" 
                className={`w-full h-full object-contain transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
            />
        </div>
    );
});

export const Base10Visualizer: React.FC<{ number: number; className?: string }> = ({ number, className }) => {
    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;
    const size = 15;
    const drawUnit = (x: number, y: number) => <rect x={x} y={y} width={size} height={size} fill="#fbbf24" stroke="#d97706" strokeWidth="1" />;
    const drawRod = (x: number, y: number) => <g>{Array.from({length: 10}).map((_, i) => <rect key={i} x={x} y={y + i * size} width={size} height={size} fill="#60a5fa" stroke="#2563eb" strokeWidth="1" />)}</g>;
    const drawFlat = (x: number, y: number) => (
        <g>
            <rect x={x} y={y} width={size * 10} height={size * 10} fill="#4ade80" stroke="#16a34a" strokeWidth="2" />
            {Array.from({length: 9}).map((_, i) => (
                <React.Fragment key={i}>
                    <line x1={x + (i+1)*size} y1={y} x2={x + (i+1)*size} y2={y + size*10} stroke="#16a34a" strokeWidth="0.5" />
                    <line x1={x} y1={y + (i+1)*size} x2={x + size*10} y2={y + (i+1)*size} stroke="#16a34a" strokeWidth="0.5" />
                </React.Fragment>
            ))}
        </g>
    );
    return (
        <div className={`flex flex-wrap items-end gap-4 p-2 ${className}`}>
            {Array.from({length: hundreds}).map((_, i) => <svg key={`h-${i}`} width={size * 10} height={size * 10} className="overflow-visible">{drawFlat(0, 0)}</svg>)}
            {Array.from({length: tens}).map((_, i) => <svg key={`t-${i}`} width={size} height={size * 10} className="overflow-visible">{drawRod(0, 0)}</svg>)}
            {ones > 0 && <div className="flex flex-col-reverse flex-wrap gap-1" style={{height: size * 10, alignContent: 'flex-start'}}>{Array.from({length: ones}).map((_, i) => <svg key={`o-${i}`} width={size} height={size} className="overflow-visible block">{drawUnit(0, 0)}</svg>)}</div>}
        </div>
    );
};

export const AnalogClock: React.FC<{ hour: number; minute: number; showNumbers?: boolean; showTicks?: boolean; showHands?: boolean; className?: string }> = ({ hour, minute, showNumbers = true, showTicks = true, showHands = true, className = "w-32 h-32" }) => {
    const radius = 45; const center = 50; const minuteAngle = minute * 6; const hourAngle = ((hour % 12) + minute / 60) * 30;
    
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <circle cx={center} cy={center} r={radius} fill="white" stroke="black" strokeWidth="3" />
            {showTicks && Array.from({length: 60}).map((_, i) => {
                const isHour = i % 5 === 0;
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const x1 = center + (radius - (isHour ? 5 : 2)) * Math.cos(angle);
                const y1 = center + (radius - (isHour ? 5 : 2)) * Math.sin(angle);
                const x2 = center + (radius - 1) * Math.cos(angle);
                const y2 = center + (radius - 1) * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={isHour ? 1.5 : 0.5} />;
            })}
            {showNumbers && Array.from({length: 12}).map((_, i) => {
                const num = i + 1; const angle = (num * 30 - 90) * (Math.PI / 180);
                const x = center + (radius - 10) * Math.cos(angle); const y = center + (radius - 10) * Math.sin(angle);
                return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="900" fill="black" style={{fontFamily: 'Lexend, sans-serif'}}>{num}</text>
            })}
            {showHands && (
                <>
                    <line x1={center} y1={center} x2={center + (radius - 12) * Math.cos((minuteAngle - 90) * Math.PI / 180)} y2={center + (radius - 12) * Math.sin((minuteAngle - 90) * Math.PI / 180)} stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1={center} y1={center} x2={center + (radius - 22) * Math.cos((hourAngle - 90) * Math.PI / 180)} y2={center + (radius - 22) * Math.sin((hourAngle - 90) * Math.PI / 180)} stroke="black" strokeWidth="4" strokeLinecap="round" />
                    <circle cx={center} cy={center} r="3" fill="black" stroke="white" strokeWidth="0.5" />
                </>
            )}
        </svg>
    );
};

export const NumberLine: React.FC<{ start: number; end: number; step?: number; missing?: number[]; className?: string }> = ({ start, end, step = 1, missing = [], className = "w-full" }) => {
    const items = []; for (let i = start; i <= end; i += step) items.push(i);
    return (
        <div className={`relative h-16 flex items-center px-4 ${className}`}>
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-black -z-10"></div>
            <div className="flex justify-between w-full px-4">
                {items.map((val) => (
                    <div key={val} className="flex flex-col items-center gap-2 relative">
                        <div className="w-0.5 h-3 bg-black"></div>
                        {missing.includes(val) ? <div className="w-8 h-8 border-2 border-indigo-600 bg-white rounded flex items-center justify-center font-bold text-indigo-600 text-sm">?</div> : <span className="font-bold text-sm">{val}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TenFrame: React.FC<{ count: number; className?: string }> = ({ count, className = "" }) => {
    const validCount = Math.min(20, Math.max(0, count || 0));
    const renderFrame = (fill: number) => (
        <div className={`grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-[120px] h-[52px] ${className}`}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-zinc-300 flex items-center justify-center relative">{i < fill && <div className="w-3/4 h-3/4 bg-black rounded-full shadow-sm"></div>}</div>
            ))}
        </div>
    );
    return <div className="flex flex-col gap-2">{renderFrame(Math.min(10, validCount))}{validCount > 10 && renderFrame(validCount - 10)}</div>;
};

export const Domino: React.FC<{ count: number }> = ({ count }) => {
    const dots = Array.from({length: 9}).map(() => false);
    const c = Math.min(9, Math.max(0, count || 0));
    if(c === 1) dots[4] = true;
    else if(c === 2) { dots[0]=true; dots[8]=true; }
    else if(c === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(c === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(c === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(c === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    return <div className="w-12 h-12 border-2 border-black rounded-lg bg-white grid grid-cols-3 grid-rows-3 p-1 gap-0.5 shadow-sm">{dots.map((isActive, i) => <div key={i} className="flex items-center justify-center">{isActive && <div className="w-2 h-2 bg-black rounded-full"></div>}</div>)}</div>;
};

export const NumberBond: React.FC<{ whole: number | string; part1: number | string; part2: number | string | null; isAddition: boolean }> = ({ whole, part1, part2, isAddition }) => (
    <svg width="160" height="140" viewBox="0 0 160 140" className="overflow-visible">
        <line x1="80" y1="40" x2="40" y2="100" stroke="black" strokeWidth="2" />
        <line x1="80" y1="40" x2="120" y2="100" stroke="black" strokeWidth="2" />
        <circle cx="80" cy="30" r="25" fill={isAddition ? "#fff" : "#e0e7ff"} stroke="black" strokeWidth="2" /><text x="80" y="30" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold" fill="black">{isAddition ? '?' : whole}</text>
        <circle cx="40" cy="110" r="25" fill="white" stroke="black" strokeWidth="2" /><text x="40" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold" fill="black">{part1}</text>
        <circle cx="120" cy="110" r="25" fill={!isAddition && part2 === null ? "#e0e7ff" : "white"} stroke="black" strokeWidth="2" /><text x="120" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold" fill="black">{part2 !== null ? part2 : '?'}</text>
    </svg>
);

export const PedagogicalHeader = React.memo(({ title, instruction, note, data }: { title: string; instruction: string; note?: string; data?: BaseActivityData }) => (
    <div className="mb-4 w-full break-inside-avoid pedagogical-header">
        <div className="flex items-start justify-between gap-4 border-b-2 border-zinc-800 pb-2 mb-2">
            <div className="flex-1">
                <EditableElement style={{ display: 'var(--display-title)' }}><EditableText tag="h3" value={title} className="text-xl font-black text-black uppercase tracking-tight leading-none mb-1" /></EditableElement>
                <EditableElement style={{ display: 'var(--display-instruction)' }}><EditableText tag="p" value={instruction} className="text-sm font-medium text-zinc-700 leading-tight" /></EditableElement>
            </div>
            {(data?.imagePrompt || data?.imageBase64) && (
                <EditableElement className="w-16 h-16 shrink-0 border border-zinc-200 rounded p-1" style={{ display: 'var(--display-image)' }}>
                    <ImageDisplay base64={data.imageBase64} prompt={data.imagePrompt} description={data.title} className="w-full h-full object-contain" />
                </EditableElement>
            )}
        </div>
        {note && <EditableElement style={{ display: 'var(--display-pedagogical-note)' }}><p className="text-[10px] text-zinc-500 italic"><i className="fa-solid fa-info-circle mr-1"></i><EditableText tag="span" value={note} /></p></EditableElement>}
    </div>
));

export const Shape = React.memo(({ name, className = "w-8 h-8" }: { name: ShapeType; className?: string }) => {
    const props = { stroke: "currentColor", strokeWidth: "2", fill: "transparent", className };
    switch (name) {
        case 'circle': return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="45" /></svg>;
        case 'square': return <svg viewBox="0 0 100 100" {...props}><rect x="5" y="5" width="90" height="90" /></svg>;
        case 'triangle': return <svg viewBox="0 0 100 100" {...props}><polygon points="50,5 95,95 5,95" /></svg>;
        default: return <svg viewBox="0 0 100 100" {...props}><circle cx="50" cy="50" r="30" /></svg>;
    }
});

export const GridComponent = React.memo(({ grid, cellClassName = 'w-8 h-8' }: { grid: any[][]; cellClassName?: string }) => {
    if (!grid || !Array.isArray(grid) || grid.length === 0) return null;
    return (
        <EditableElement>
        <table className="border-collapse border border-black mx-auto">
            <tbody>{grid.map((row, r) => (<tr key={r}>{Array.isArray(row) && row.map((cell, c) => (<td key={c} className={`border border-black text-center ${cellClassName} p-0 m-0 leading-none`}><EditableText value={cell || ''} tag="span" /></td>))}</tr>))}</tbody>
        </table>
        </EditableElement>
    )
});

// --- NEWLY ADDED COMPONENTS FOR COMPATIBILITY ---

/**
 * Kendoku ve Kafesli Bulmacalar için SVG ızgara bileşeni.
 */
export const CagedGridSvg: React.FC<{ size: number; cages?: any[] }> = ({ size, cages = [] }) => {
    const cellSize = 200 / size;
    return (
        <svg width="200" height="200" viewBox="0 0 200 200" className="border-2 border-black bg-white">
            {Array.from({length: size + 1}).map((_, i) => (
                <React.Fragment key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1={i * cellSize} x2="200" y2={i * cellSize} stroke="#e5e7eb" strokeWidth="1" />
                </React.Fragment>
            ))}
        </svg>
    );
};

/**
 * Birden fazla geometrik şekli yan yana gösteren bileşen.
 */
export const ShapeDisplay: React.FC<{ shapes: ShapeType[] }> = ({ shapes }) => (
    <div className="flex gap-2 items-center justify-center">
        {shapes.map((s, i) => <Shape key={i} name={s} className="w-6 h-6" />)}
    </div>
);

/**
 * 7-segment veya nokta matrisi tarzı görselleştirme.
 */
export const SegmentDisplay: React.FC<{ segments: boolean[] }> = ({ segments }) => (
    <div className="grid grid-cols-3 gap-1 w-12 h-16 bg-zinc-50 p-2 border border-zinc-200 rounded">
        {segments.map((active, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${active ? 'bg-indigo-600 shadow-sm' : 'bg-zinc-200'}`}></div>
        ))}
    </div>
);

/**
 * Kibrit çöpü modelleri için çizgi bileşeni.
 */
export const Matchstick: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string }> = ({ x1, y1, x2, y2, color }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color || '#8b4513'} strokeWidth="5" strokeLinecap="round" />
);

/**
 * Bağlantı noktaları (Matching vb.) için daire bileşeni.
 */
export const ConnectionDot: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color }) => (
    <circle cx={x} cy={y} r="6" fill={color || 'black'} stroke="white" strokeWidth="2" />
);

/**
 * Disleksi dostu font ile metin gösterimi.
 */
export const DyslexicText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
    <span className={`font-dyslexic ${className}`}>{text}</span>
);

/**
 * Yazı çalışmaları için kılavuz çizgiler.
 */
export const HandwritingGuide: React.FC<{ height: number; children?: React.ReactNode }> = ({ height, children }) => (
    <div className="relative w-full border-t border-b border-zinc-300 bg-zinc-50/30" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="h-px w-full bg-zinc-200"></div>
            <div className="h-px w-full bg-zinc-200 border-dashed border-t"></div>
            <div className="h-px w-full bg-zinc-200"></div>
        </div>
        <div className="relative z-10 flex items-center h-full px-4">
            {children}
        </div>
    </div>
);

/**
 * Kopya etme veya üzerinden geçme (tracing) çalışmaları için soluk metin.
 */
export const TracingText: React.FC<{ text: string; fontSize: string }> = ({ text, fontSize }) => (
    <span className="font-handwriting opacity-20 select-none pointer-events-none border-b border-dashed border-zinc-300" style={{ fontSize }}>
        {text}
    </span>
);

/**
 * Kesirlerin daire veya çubuk üzerinde görselleştirilmesi.
 */
export const FractionVisual: React.FC<{ num: number; den: number; type?: 'circle' | 'bar' }> = ({ num, den, type = 'circle' }) => {
    if (type === 'bar') {
        return (
            <div className="w-16 h-4 border-2 border-black flex overflow-hidden rounded">
                {Array.from({ length: den }).map((_, i) => (
                    <div key={i} className={`flex-1 border-r last:border-r-0 border-black ${i < num ? 'bg-indigo-400' : 'bg-white'}`}></div>
                ))}
            </div>
        );
    }
    return (
        <svg width="40" height="40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="black" strokeWidth="3" />
            {Array.from({ length: den }).map((_, i) => {
                const angle = (i * 360 / den) - 90;
                const rad = angle * Math.PI / 180;
                const x = 50 + 45 * Math.cos(rad);
                const y = 50 + 45 * Math.sin(rad);
                return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="black" strokeWidth="2" />;
            })}
            {Array.from({ length: num }).map((_, i) => {
                const startAngle = (i * 360 / den) - 90;
                const endAngle = ((i + 1) * 360 / den) - 90;
                const x1 = 50 + 45 * Math.cos(startAngle * Math.PI / 180);
                const y1 = 50 + 45 * Math.sin(startAngle * Math.PI / 180);
                const x2 = 50 + 45 * Math.cos(endAngle * Math.PI / 180);
                const y2 = 50 + 45 * Math.sin(endAngle * Math.PI / 180);
                return (
                    <path 
                        key={i}
                        d={`M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`} 
                        fill="indigo" 
                        fillOpacity="0.3" 
                    />
                );
            })}
        </svg>
    );
};
