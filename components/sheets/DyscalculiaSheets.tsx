import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData } from '../../types';
import { PedagogicalHeader, ImageDisplay } from './common';

// --- VISUAL HELPERS ---

// 10'luk Çerçeve (Ten Frame) - Diskalkuli için en önemli araç
const TenFrame: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
    return (
        <div className={`grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-[120px] h-[50px] ${className}`}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-zinc-300 flex items-center justify-center relative">
                    {i < count && <div className="w-3/4 h-3/4 bg-black rounded-full shadow-sm"></div>}
                </div>
            ))}
        </div>
    );
};

// Domino Görseli
const Domino: React.FC<{ count: number }> = ({ count }) => {
    // Basit domino pattern mantığı (0-9 arası)
    const dots = Array.from({length: 9}).map(() => false);
    if(count === 1) dots[4] = true;
    else if(count === 2) { dots[0]=true; dots[8]=true; }
    else if(count === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(count === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(count === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(count === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    // ...basitlik için 6'ya kadar, üzeri için sayı yazarız
    
    if (count > 6) {
        return (
            <div className="w-10 h-16 border-2 border-black rounded bg-white flex items-center justify-center text-xl font-bold">
                {count}
            </div>
        );
    }

    return (
        <div className="w-10 h-16 border-2 border-black rounded bg-white grid grid-cols-3 grid-rows-3 p-1 gap-0.5 shadow-sm">
            {dots.map((isActive, i) => (
                <div key={i} className="flex items-center justify-center">
                    {isActive && <div className="w-1.5 h-1.5 bg-black rounded-full"></div>}
                </div>
            ))}
        </div>
    );
};

// Kesir Çubuğu (Fraction Bar)
const FractionBar: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const validDen = den > 0 ? den : 1; // Prevent division by zero or negative length
    const validNum = Math.max(0, num);
    
    return (
        <div className="w-full h-10 border-2 border-black rounded flex overflow-hidden bg-white">
            {Array.from({ length: validDen }).map((_, i) => (
                <div key={i} className={`flex-1 border-r border-zinc-400 last:border-r-0 ${i < validNum ? 'bg-indigo-400 pattern-dots' : ''}`}>
                </div>
            ))}
        </div>
    );
};

// Advanced SVG Number Line
const NumberLineSVG: React.FC<{ start: number; end: number; target?: number; missing?: boolean; step?: number }> = ({ start, end, target, missing, step = 1 }) => {
    const range = end - start;
    const safeStep = step || 1;
    const totalTicks = Math.floor(range / safeStep) + 1;
    const width = 600;
    const margin = 40;
    // Prevent division by zero if totalTicks is 1
    const tickSpacing = totalTicks > 1 ? (width - 2 * margin) / (totalTicks - 1) : 0;

    return (
        <svg width="100%" viewBox={`0 0 ${width} 120`} className="overflow-visible">
            {/* Main Line */}
            <line x1={margin} y1="80" x2={width - margin} y2="80" stroke="black" strokeWidth="3" markerEnd="url(#arrow)" markerStart="url(#arrow-rev)" />
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                </marker>
                <marker id="arrow-rev" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 10 0 L 0 5 L 10 10 z" fill="black" />
                </marker>
            </defs>

            {Array.from({ length: totalTicks }).map((_, i) => {
                const val = start + i * safeStep;
                const x = margin + i * tickSpacing;
                const isTarget = val === target;
                
                return (
                    <g key={i} transform={`translate(${x}, 80)`}>
                        <line y1="-10" y2="10" stroke="black" strokeWidth="2" />
                        {isTarget && missing ? (
                            <g transform="translate(-15, 20)">
                                <rect width="30" height="30" rx="4" fill="#e0e7ff" stroke="#4338ca" strokeWidth="2" />
                                <text x="15" y="20" textAnchor="middle" dominantBaseline="middle" className="font-bold text-indigo-700 text-lg">?</text>
                            </g>
                        ) : (
                            <text y="35" textAnchor="middle" className="font-bold font-mono text-lg fill-zinc-800">{val}</text>
                        )}
                        
                        {/* Jump Arcs */}
                        {i < totalTicks - 1 && (
                            <path 
                                d={`M 0 -15 Q ${tickSpacing/2} -50 ${tickSpacing} -15`} 
                                fill="none" 
                                stroke="#9ca3af" 
                                strokeWidth="2" 
                                strokeDasharray="4 4" 
                                markerEnd="url(#arrow)"
                            />
                        )}
                        {i < totalTicks - 1 && (
                            <text x={tickSpacing/2} y="-55" textAnchor="middle" className="text-xs fill-zinc-400 font-bold">+{safeStep}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

// Estimation Jar with randomly scattered items
const EstimationJar: React.FC<{ count: number; itemType?: string }> = ({ count, itemType = 'circle' }) => {
    // Seeded random positions would be better to avoid overlap, but simple random is fine for offline generator visual
    const items = React.useMemo(() => {
        // Safety check for NaN count
        const safeCount = isNaN(count) ? 0 : count;
        return Array.from({ length: safeCount }).map((_, i) => ({
            x: Math.random() * 160 + 20, // Jar width 200, padding 20
            y: Math.random() * 220 + 40, // Jar height 300, padding top 40 (lid) bottom 20
            rotation: Math.random() * 360,
            color: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 5)]
        }));
    }, [count]);

    return (
        <svg width="200" height="300" viewBox="0 0 200 300" className="overflow-visible">
            {/* Jar Body */}
            <path d="M 30 20 L 170 20 L 190 50 L 190 280 Q 190 300 170 300 L 30 300 Q 10 300 10 280 L 10 50 L 30 20 Z" 
                  fill="white" stroke="#9ca3af" strokeWidth="4" fillOpacity="0.5" />
            
            {/* Lid */}
            <rect x="25" y="5" width="150" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            
            {/* Items */}
            {items.map((item, i) => (
                <g key={i} transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation})`}>
                    {itemType === 'star' ? (
                        <polygon points="0,-8 2,-2 8,-2 4,2 6,8 0,4 -6,8 -4,2 -8,-2 -2,-2" fill={item.color} stroke="black" strokeWidth="1" />
                    ) : (
                        <circle r="8" fill={item.color} stroke="black" strokeWidth="1" />
                    )}
                </g>
            ))}
            
            {/* Shine/Reflection */}
            <path d="M 170 60 Q 180 150 170 240" stroke="white" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
    );
};

// Isometric 3D Cube Stack
const CubeStack: React.FC<{ grid: number[][] }> = ({ grid }) => {
    const cubes = [];
    // Safety check for grid
    if (!grid || !Array.isArray(grid) || grid.length === 0) return null;

    const rows = grid.length;
    // Safety check for grid[0]
    if (!grid[0]) return null;
    const cols = grid[0].length;
    
    const centerX = 150;
    const centerY = 50;

    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            const h = grid[x][y];
            for (let z = 0; z < h; z++) {
                // Screen coords
                const sx = centerX + (y - x) * 20;
                const sy = centerY + (y + x) * 12 - (z * 24);
                cubes.push({ sx, sy, x, y, z });
            }
        }
    }

    return (
        <svg width="300" height="250" viewBox="0 0 300 250" className="overflow-visible">
            {cubes.map((c, i) => (
                <g key={i}>
                    {/* Top Face */}
                    <path d={`M ${c.sx} ${c.sy} L ${c.sx + 20} ${c.sy - 12} L ${c.sx} ${c.sy - 24} L ${c.sx - 20} ${c.sy - 12} Z`} fill="#e0e7ff" stroke="black" strokeWidth="1" />
                    {/* Right Face */}
                    <path d={`M ${c.sx} ${c.sy} L ${c.sx + 20} ${c.sy - 12} L ${c.sx + 20} ${c.sy + 12} L ${c.sx} ${c.sy + 24} Z`} fill="#818cf8" stroke="black" strokeWidth="1" />
                    {/* Left Face */}
                    <path d={`M ${c.sx} ${c.sy} L ${c.sx - 20} ${c.sy - 12} L ${c.sx - 20} ${c.sy + 12} L ${c.sx} ${c.sy + 24} Z`} fill="#4f46e5" stroke="black" strokeWidth="1" />
                </g>
            ))}
        </svg>
    );
};

const VisualCounter: React.FC<{ count: number; type: string; className?: string }> = ({ count, type, className }) => {
    if (type === 'ten-frame') {
        const frames = Math.ceil(count / 10) || 1;
        return (
            <div className={`flex flex-col gap-1 ${className}`}>
                {Array.from({ length: frames }).map((_, i) => {
                    const currentCount = Math.min(10, Math.max(0, count - (i * 10)));
                    return <TenFrame key={i} count={currentCount} />;
                })}
            </div>
        );
    }
    
    if (type === 'domino') {
        return <Domino count={count} />;
    }

    if (type === 'dots') {
        return (
            <div className={`flex flex-wrap gap-1 justify-center max-w-[100px] ${className}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-zinc-800 rounded-full"></div>
                ))}
            </div>
        );
    }

    // Default to stars
    return (
        <div className={`flex flex-wrap gap-1 justify-center max-w-[120px] ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <i key={i} className="fa-solid fa-star text-amber-400 text-lg drop-shadow-sm"></i>
            ))}
        </div>
    );
};

// --- SHEETS ---

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 gap-8">
            {data.exercises.map((ex, i) => (
                <div key={i} className="flex flex-col p-6 bg-white border-2 border-zinc-300 rounded-xl shadow-sm break-inside-avoid">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                        <h4 className="text-lg font-bold text-zinc-700">
                            {ex.type === 'missing' ? 'Eksik sayıyı bul.' : 'Hangi grup daha fazla?'}
                        </h4>
                    </div>

                    {ex.type === 'missing' && ex.visualType === 'number-line-advanced' ? (
                        <div className="my-4 px-4">
                            <NumberLineSVG 
                                start={ex.values[0]} 
                                end={ex.values[ex.values.length-1]} 
                                target={ex.target} 
                                missing={true}
                                step={ex.step || 1}
                            />
                        </div>
                    ) : ex.type === 'missing' ? (
                        <div className="flex gap-2 justify-center items-center text-2xl font-mono">
                            {ex.values.map((v, idx) => (
                                <div key={idx} className={`w-12 h-12 flex items-center justify-center border-2 rounded ${v === -1 ? 'border-dashed border-indigo-500 bg-indigo-50 text-transparent' : 'border-zinc-400'}`}>
                                    {v !== -1 ? v : '?'}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-around items-center gap-8 mt-2">
                            <div className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-300 rounded-xl">
                                <VisualCounter count={ex.values[0]} type={ex.visualType || 'ten-frame'} />
                                <p className="text-2xl font-black mt-2">{ex.values[0]}</p>
                            </div>
                            <span className="text-zinc-300 font-bold text-xl">VS</span>
                            <div className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-300 rounded-xl">
                                <VisualCounter count={ex.values[1]} type={ex.visualType || 'ten-frame'} />
                                <p className="text-2xl font-black mt-2">{ex.values[1]}</p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {data.problems.map((prob, i) => (
                <div key={i} className="relative p-6 bg-white border-4 border-zinc-200 rounded-2xl break-inside-avoid shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-md">
                        {i + 1}
                    </div>
                    
                    {/* Visual Layer */}
                    <div className="flex justify-center items-center gap-4 mb-6 min-h-[80px]">
                        <div className="flex flex-col items-center">
                            <VisualCounter count={prob.num1} type={prob.visualType} />
                        </div>
                        <div className="text-3xl font-black text-zinc-400">
                            {prob.operator === 'group' ? '' : prob.operator}
                        </div>
                        <div className="flex flex-col items-center">
                            <VisualCounter count={prob.num2} type={prob.visualType} />
                        </div>
                    </div>

                    {/* Numerical Layer */}
                    <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4 border-2 border-zinc-100">
                        <div className="flex items-center gap-3 text-4xl font-black text-zinc-800 font-mono">
                            <span>{prob.num1}</span>
                            <span className="text-indigo-500">{prob.operator}</span>
                            <span>{prob.num2}</span>
                            <span>=</span>
                        </div>
                        <div className="w-20 h-16 bg-white border-2 border-zinc-400 rounded-lg shadow-inner"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-12 items-center">
                {data.tasks.map((task, i) => (
                    <div key={i} className="p-6 bg-zinc-50 border-2 border-zinc-200 rounded-2xl break-inside-avoid w-full max-w-2xl">
                        {task.type === 'count-cubes' && data.cubeData ? (
                            <div className="flex flex-col items-center">
                                <div className="mb-6 transform scale-110">
                                    <CubeStack grid={data.cubeData} />
                                </div>
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                                    <span className="text-lg font-bold">Kaç küp var?</span>
                                    <div className="w-20 h-10 border-b-2 border-black"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                <div className="flex-1 text-center">
                                    <h4 className="font-bold text-zinc-500 mb-2 uppercase tracking-wider">Örnek</h4>
                                    <div className="grid gap-0.5 bg-zinc-800 border-4 border-zinc-800 inline-grid" style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}>
                                        {task.grid.map((row, r) => row.map((cell, c) => (
                                            <div key={`ref-${r}-${c}`} className={`w-[40px] h-[40px] bg-white flex items-center justify-center text-xl font-bold relative`}>
                                                {cell === 'start' && <div className="w-4 h-4 bg-green-500 rounded-full"></div>}
                                                {cell === 'filled' && <div className="w-full h-full bg-zinc-800"></div>}
                                            </div>
                                        )))}
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center text-zinc-300"><i className="fa-solid fa-arrow-right text-4xl"></i></div>
                                <div className="flex-1 text-center">
                                    <h4 className="font-bold text-zinc-500 mb-2 uppercase tracking-wider">Senin Çizimin</h4>
                                    <div className="grid gap-0.5 bg-zinc-300 border-4 border-zinc-300 inline-grid" style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}>
                                        {Array.from({length: data.gridSize}).map((_, r) => Array.from({length: data.gridSize}).map((_, c) => (
                                            <div key={`target-${r}-${c}`} className="w-[40px] h-[40px] bg-white border border-zinc-100"></div>
                                        )))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6 max-w-3xl mx-auto">
            {data.pairs.map((pair, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-2 border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                    <div className="w-1/3 flex justify-center items-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                        {pair.type === 'fraction' ? (
                            <div className="flex flex-col items-center gap-2 w-full">
                                {(() => {
                                    const strVal = typeof pair.item1 === 'string' ? pair.item1 : String(pair.item1 || "");
                                    const parts = strVal.split('/');
                                    const num = parts[0] ? parseInt(parts[0]) : 1;
                                    const den = parts[1] ? parseInt(parts[1]) : 2;
                                    return (
                                        <FractionBar num={isNaN(num) ? 1 : num} den={isNaN(den) ? 2 : den} />
                                    );
                                })()}
                                <span className="font-bold text-xl font-mono">{pair.item1}</span>
                            </div>
                        ) : (
                            <span className="text-4xl font-bold">{pair.item1}</span>
                        )}
                    </div>
                    <div className="flex-1 border-b-4 border-dotted border-zinc-300 mx-6 relative h-0">
                        <i className="fa-solid fa-scissors absolute left-1/2 -top-3 text-zinc-400 bg-white px-2"></i>
                    </div>
                    <div className="w-1/3 flex justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                        <span className="text-xl font-bold text-center text-zinc-800">{pair.item2}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        {/* Reference Jar if applicable (e.g. "Here is 10") */}
        <div className="flex justify-center mb-12">
            <div className="flex flex-col items-center opacity-70 scale-75 origin-bottom">
                <EstimationJar count={10} />
                <span className="mt-2 font-bold bg-zinc-200 px-2 rounded text-sm">Referans: 10 Adet</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {data.items.map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="relative">
                        <EstimationJar count={item.count} itemType={i % 2 === 0 ? 'star' : 'circle'} />
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">{i+1}</div>
                    </div>
                    
                    <div className="mt-6 w-full max-w-[200px]">
                        <p className="text-center font-bold text-zinc-500 mb-2 text-sm">Tahmin Et:</p>
                        <div className="flex justify-between gap-2">
                            {item.options.map(opt => (
                                <div key={opt} className="flex-1 py-2 border-2 border-zinc-300 rounded-lg text-center font-bold hover:border-indigo-500 cursor-pointer">
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);