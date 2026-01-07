
import React, { useMemo, useState } from 'react';
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

// --- MISSING COMPONENTS FOR VERBAL & VISUAL SHEETS ---

// Fix: Added ReadingRuler component for StoryComprehensionSheet
export const ReadingRuler = () => (
    <div className="absolute left-0 right-0 h-12 bg-yellow-200/20 border-y border-yellow-400/30 pointer-events-none z-20 no-print" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded text-yellow-900 uppercase tracking-widest shadow-sm">Okuma Cetveli</div>
    </div>
);

// Fix: Added Matchstick component for VisualPerceptionSheets
export const Matchstick = ({ color = "#000" }: { color?: string }) => (
    <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-red-600 mb-[-2px] relative z-10 shadow-sm"></div>
        <div className="w-1.5 h-12 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
    </div>
);

// Fix: Added ConnectionDot component for VisualPerceptionSheets
export const ConnectionDot = ({ color = "#6366f1" }: { color?: string }) => (
    <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm ring-1 ring-zinc-200" style={{ backgroundColor: color }}></div>
);

// Fix: Added CubeStack component moved from DyscalculiaSheets for shared usage
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
    if (!highlights || highlights.length === 0) return <EditableText value={text} tag="div" />;
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
    
    const safeDesc = useMemo(() => {
        try { return description ? String(description) : ''; } catch { return ''; }
    }, [description]);

    const seed = useMemo(() => {
        const str = prompt || safeDesc || 'bursa-disleksi';
        return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + Math.floor(Math.random() * 1000);
    }, [prompt, safeDesc]);

    const handleLoad = () => setIsLoading(false);
    const handleError = () => { setIsLoading(false); setHasError(true); };

    return (
        <div className={`image-display-container ${className} relative overflow-hidden bg-transparent flex items-center justify-center group`}>
            {safeDesc && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-1 text-[8px] text-center opacity-0 group-hover:opacity-100 transition-opacity z-10 edit-handle pointer-events-none text-zinc-600 font-bold">
                    <EditableText value={safeDesc} tag="span" />
                </div>
            )}
            
            {(() => {
                // 1. SVG veya Base64 kontrolü
                if (base64 && typeof base64 === 'string') {
                     if (base64.trim().startsWith('<svg') || base64.trim().startsWith('<?xml') || base64.includes('</svg>')) {
                        let cleanSvg = base64.replace(/^```xml\s*|```\s*$/g, '').replace(/^```svg\s*|```\s*$/g, '').trim();
                        cleanSvg = cleanSvg.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '');
                        const finalSvg = cleanSvg.includes('style="') 
                            ? cleanSvg.replace('style="', 'style="width:100%; height:100%; display:block; ')
                            : cleanSvg.replace('<svg', '<svg style="width:100%; height:100%; display:block;"');
                        return <div className="w-full h-full p-1 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: finalSvg }} />;
                    }
                    if (base64.startsWith('data:image') || base64.length > 100) { 
                        return <img src={base64} alt={safeDesc} className="object-contain w-full h-full" loading="lazy" />;
                    }
                }

                // 2. Pollinations AI - Geliştirilmiş Prompt ve Sınırsız Üretim
                let contentForPrompt = prompt || safeDesc;
                if (!hasError && contentForPrompt && contentForPrompt.length > 1) {
                    const encodedPrompt = encodeURIComponent(contentForPrompt.substring(0, 500));
                    // Flux modelini kullanarak daha kaliteli çıktılar alıyoruz
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;
                    
                    return (
                        <>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50">
                                    <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-xl"></i>
                                </div>
                            )}
                            <img 
                                src={imageUrl} 
                                alt={safeDesc} 
                                className={`object-contain w-full h-full mix-blend-multiply transition-all duration-700 ${isLoading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`} 
                                loading="lazy"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </>
                    );
                }

                // 3. Fallback Placeholder
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-300 bg-zinc-50/30">
                        <i className="fa-regular fa-image text-2xl mb-1 opacity-20"></i>
                        <span className="text-[9px] font-black opacity-30 px-2 text-center uppercase tracking-tighter">
                            {safeDesc || 'Görsel'}
                        </span>
                    </div>
                );
            })()}
        </div>
    );
});

export const DyslexicText: React.FC<{ text: string; mode?: 'standard' | 'bionic' | 'rainbow'; className?: string }> = ({ text, mode = 'standard', className = "" }) => {
    if (!text) return null;
    if (mode === 'standard') return <span className={className}><EditableText value={text} tag="span" /></span>;
    const words = text.split(' ');
    if (mode === 'bionic') {
        return (
            <div className={`leading-relaxed tracking-wide ${className}`}>
                {words.map((word, i) => {
                    const boldLen = Math.ceil(word.length / 2);
                    return (
                        <span key={i} className="inline-block mr-1.5">
                            <b className="font-black text-black">{word.substring(0, boldLen)}</b>
                            <span className="font-medium text-zinc-600">{word.substring(boldLen)}</span>
                        </span>
                    );
                })}
            </div>
        );
    }
    if (mode === 'rainbow') {
        return (
            <div className={`leading-loose tracking-wider ${className}`}>
                {words.map((word, i) => {
                    const syllables = simpleSyllabify(word);
                    return (
                        <span key={i} className="inline-block mr-2 bg-zinc-50 px-1 rounded">
                            {syllables.map((syl, j) => (
                                <span key={j} className={j % 2 === 0 ? "text-blue-600 font-bold" : "text-red-500 font-bold"}>{syl}</span>
                            ))}
                        </span>
                    );
                })}
            </div>
        );
    }
    return null;
};

export const HandwritingGuide: React.FC<{ width?: string, height?: number, children?: React.ReactNode }> = ({ width = "100%", height = 100, children }) => (
    <div className="relative" style={{ width, height }}>
        <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0 z-0">
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#e4e4e7" strokeWidth="2" />
            <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="6,4" />
            <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#3f3f46" strokeWidth="2" />
            <line x1="0" y1="95%" x2="100%" y2="95%" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 z-10 flex items-center pl-4" style={{ paddingTop: '5%' }}>{children}</div>
    </div>
);

export const TracingText: React.FC<{ text: string, fontSize?: string }> = ({ text, fontSize = "60px" }) => (
    <svg height="100" width="100%" className="overflow-visible">
         <text x="0" y="65" fontFamily="Lexend, sans-serif" fontSize={fontSize} fontWeight="normal" fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4,4" letterSpacing="4">{text}</text>
    </svg>
);

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

export const FractionVisual: React.FC<{ num: number; den: number; type?: 'pie' | 'bar' | 'group'; className?: string }> = ({ num, den, type = 'pie', className = "w-24 h-24" }) => {
    const validDen = Math.max(1, den || 1);
    const validNum = Math.min(validDen, Math.max(0, num || 0));
    if (type === 'pie') {
        const radius = 40; const center = 50;
        if (validDen === 1) return <svg viewBox="0 0 100 100" className={className + " overflow-visible"}><circle cx={center} cy={center} r={radius} fill={validNum === 1 ? '#6366f1' : '#fff'} stroke="black" strokeWidth="2" /></svg>;
        const slices = Array.from({ length: validDen }).map((_, i) => {
            const startAngle = (i * 360) / validDen; const endAngle = ((i + 1) * 360) / validDen;
            const startRad = (startAngle - 90) * (Math.PI / 180); const endRad = (endAngle - 90) * (Math.PI / 180);
            const x1 = center + radius * Math.cos(startRad); const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad); const y2 = center + radius * Math.sin(endRad);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            return { d: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`, filled: i < validNum };
        });
        return <svg viewBox="0 0 100 100" className={className + " overflow-visible"}>{slices.map((slice, i) => <path key={i} d={slice.d} fill={slice.filled ? '#6366f1' : '#fff'} stroke="black" strokeWidth="2" />)}</svg>;
    } 
    if (type === 'bar') return <div className={`flex border-2 border-black rounded overflow-hidden ${className}`} style={{height: '40px'}}>{Array.from({length: validDen}).map((_, i) => <div key={i} className={`flex-1 border-r border-black last:border-r-0 ${i < validNum ? 'bg-indigo-500' : 'bg-white'}`}></div>)}</div>;
    return <div className={`flex flex-wrap gap-1 p-1 justify-center ${className}`}>{Array.from({length: validDen}).map((_, i) => <div key={i} className={`w-4 h-4 rounded-full border border-black ${i < validNum ? 'bg-indigo-500' : 'bg-white'}`}></div>)}</div>;
};

export const AnalogClock: React.FC<{ hour: number; minute: number; showNumbers?: boolean; className?: string }> = ({ hour, minute, showNumbers = true, className = "w-32 h-32" }) => {
    const radius = 45; const center = 50; const minuteAngle = minute * 6; const hourAngle = ((hour % 12) + minute / 60) * 30;
    return (
        <svg viewBox="0 0 100 100" className={className}>
            <circle cx={center} cy={center} r={radius} fill="white" stroke="black" strokeWidth="3" />
            {showNumbers && Array.from({length: 12}).map((_, i) => {
                const num = i + 1; const angle = (num * 30 - 90) * (Math.PI / 180);
                const x = center + (radius - 8) * Math.cos(angle); const y = center + (radius - 8) * Math.sin(angle);
                return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="black">{num}</text>
            })}
            <line x1={center} y1={center} x2={center + (radius - 10) * Math.cos((minuteAngle - 90) * Math.PI / 180)} y2={center + (radius - 10) * Math.sin((minuteAngle - 90) * Math.PI / 180)} stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1={center} y1={center} x2={center + (radius - 20) * Math.cos((hourAngle - 90) * Math.PI / 180)} y2={center + (radius - 20) * Math.sin((hourAngle - 90) * Math.PI / 180)} stroke="black" strokeWidth="3" strokeLinecap="round" />
            <circle cx={center} cy={center} r="2" fill="black" />
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
                        {missing.includes(val) ? <div className="w-8 h-8 border-2 border-indigo-600 bg-white rounded flex items-center justify-center font-bold text-indigo-600 text-sm">?</div> : <span className="font-bold text-sm"><EditableText value={val} tag="span" /></span>}
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
    if (count > 9) return <div className="w-12 h-20 border-2 border-black rounded-lg bg-white flex items-center justify-center text-2xl font-bold"><EditableText value={count} tag="span" /></div>;
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
                <EditableElement className="w-16 h-16 shrink-0 border border-zinc-200 rounded p-1" style={{ display: 'var(--display-image)' }}><ImageDisplay base64={data.imageBase64} prompt={data.imagePrompt} description={data.title} className="w-full h-full object-contain" /></EditableElement>
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

export const SegmentDisplay = React.memo(({ segments }: { segments: boolean[] }) => (
    <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 gap-px border border-black bg-black">{segments.map((active, i) => <div key={i} className={active ? 'bg-black' : 'bg-white'}></div>)}</div>
));

export const ShapeDisplay = React.memo(({ shapes }: { shapes: ShapeType[] }) => (
    <div className="flex gap-0.5 text-black">{shapes.map((s, i) => <Shape key={i} name={s} className="w-4 h-4" />)}</div>
));

export const CagedGridSvg = React.memo(({ size, cages }: { size: number, cages: any[] }) => {
    const cellSize = 30; const totalSize = size * cellSize;
    return (
        <svg width={totalSize + 2} height={totalSize + 2} className="overflow-visible bg-white border border-black">
            {Array.from({length: size+1}).map((_, i) => (<React.Fragment key={i}><line x1={0} y1={i*cellSize} x2={totalSize} y2={i*cellSize} stroke="#e5e7eb" strokeWidth="1" /><line x1={i*cellSize} y1={0} x2={i*cellSize} y2={totalSize} stroke="#e5e7eb" strokeWidth="1" /></React.Fragment>))}
            {cages.map((cage, idx) => { const first = cage.cells[0]; return <text key={idx} x={first.col * cellSize + 2} y={first.row * cellSize + 10} fontSize="8" fontWeight="bold">{cage.target}{cage.operation}</text> })}
        </svg>
    );
});
