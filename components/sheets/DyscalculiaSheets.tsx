
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, VisualMathType } from '../../types';
import { PedagogicalHeader } from './common';

// --- VISUAL HELPERS ---

// 10'luk Çerçeve
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

// Domino
const Domino: React.FC<{ count: number }> = ({ count }) => {
    const dots = Array.from({length: 9}).map(() => false);
    if(count === 1) dots[4] = true;
    else if(count === 2) { dots[0]=true; dots[8]=true; }
    else if(count === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(count === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(count === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(count === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    
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

// Kesir Çubuğu
const FractionBar: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const validDen = den > 0 ? den : 1; 
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

// Analog Clock
const AnalogClock: React.FC<{ hour: number; minute: number }> = ({ hour, minute }) => {
    const hourAngle = (hour % 12) * 30 + minute * 0.5;
    const minuteAngle = minute * 6;

    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
            <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="2" />
            {/* Ticks */}
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30;
                const x1 = 50 + 40 * Math.sin(angle * Math.PI / 180);
                const y1 = 50 - 40 * Math.cos(angle * Math.PI / 180);
                const x2 = 50 + 35 * Math.sin(angle * Math.PI / 180);
                const y2 = 50 - 35 * Math.cos(angle * Math.PI / 180);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={i % 3 === 0 ? 2 : 1} />
            })}
            {/* Numbers */}
            {[12, 3, 6, 9].map(n => {
                const angle = n * 30;
                const x = 50 + 30 * Math.sin(angle * Math.PI / 180);
                const y = 50 - 30 * Math.cos(angle * Math.PI / 180);
                return <text key={n} x={x} y={y} dominantBaseline="middle" textAnchor="middle" className="text-xs font-bold">{n}</text>
            })}
            {/* Hands */}
            <line x1="50" y1="50" x2={50 + 25 * Math.sin(hourAngle * Math.PI / 180)} y2={50 - 25 * Math.cos(hourAngle * Math.PI / 180)} stroke="black" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="50" x2={50 + 35 * Math.sin(minuteAngle * Math.PI / 180)} y2={50 - 35 * Math.cos(minuteAngle * Math.PI / 180)} stroke="black" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="2" fill="black" />
        </svg>
    );
};

// Money Visual (Simplified TL)
const MoneyVisual: React.FC<{ amount: number }> = ({ amount }) => {
    const coins: number[] = [];
    let rem = amount;
    while (rem >= 1) { coins.push(1); rem -= 1; }
    if (rem >= 0.5) { coins.push(0.5); rem -= 0.5; }
    if (rem >= 0.25) { coins.push(0.25); rem -= 0.25; }
    
    return (
        <div className="flex flex-wrap gap-1 items-center justify-center">
            {coins.map((val, i) => (
                <div key={i} className={`rounded-full border-2 border-zinc-400 flex items-center justify-center font-bold shadow-sm bg-yellow-100 text-yellow-700 ${val === 1 ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'}`}>
                    {val === 1 ? '1₺' : `${val*100}kr`}
                </div>
            ))}
        </div>
    );
};

// Ruler Visual
const RulerVisual: React.FC<{ length: number }> = ({ length }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-[150px]">
            <div className="w-full h-4 bg-yellow-200 border border-yellow-400 rounded-sm mb-1"></div>
            <div className="w-full h-8 border border-zinc-400 bg-white relative flex items-end">
                {Array.from({length: 11}).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-zinc-300 h-full relative last:border-r-0">
                        <div className="absolute bottom-0 right-0 h-2 border-r border-black"></div>
                        <span className="absolute -bottom-4 right-0 text-[8px] transform translate-x-1/2">{i}</span>
                    </div>
                ))}
                {/* Indicator Line */}
                <div className="absolute top-0 left-0 h-1/2 border-r-2 border-red-500" style={{width: `${length * 10}%`}}></div>
            </div>
        </div>
    );
};

// Geometry Visual
const GeometryVisual: React.FC<{ shape: string }> = ({ shape }) => {
    const s = shape.toLowerCase();
    if (s.includes('kare')) return <div className="w-12 h-12 bg-blue-200 border-2 border-blue-500"></div>;
    if (s.includes('dikdörtgen')) return <div className="w-20 h-10 bg-green-200 border-2 border-green-500"></div>;
    if (s.includes('daire') || s.includes('çember')) return <div className="w-12 h-12 rounded-full bg-red-200 border-2 border-red-500"></div>;
    if (s.includes('üçgen')) return <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-yellow-400"></div>;
    return <div className="w-10 h-10 bg-zinc-200 border-2 border-zinc-400 rounded-full">?</div>;
};

// Number Line
const NumberLineSVG: React.FC<{ start: number; end: number; target?: number; missing?: boolean; step?: number }> = ({ start, end, target, missing, step = 1 }) => {
    const range = end - start;
    const safeStep = step || 1;
    const totalTicks = Math.floor(range / safeStep) + 1;
    const width = 600;
    const margin = 40;
    const tickSpacing = totalTicks > 1 ? (width - 2 * margin) / (totalTicks - 1) : 0;

    return (
        <svg width="100%" viewBox={`0 0 ${width} 120`} className="overflow-visible">
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
                        {i < totalTicks - 1 && (
                            <path 
                                d={`M 0 -15 Q ${tickSpacing/2} -50 ${tickSpacing} -15`} 
                                fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 4" 
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

// Estimation Jar
const EstimationJar: React.FC<{ count: number; itemType?: string; className?: string }> = ({ count, itemType = 'circle', className = "" }) => {
    const items = React.useMemo(() => {
        const safeCount = isNaN(count) ? 0 : count;
        return Array.from({ length: safeCount }).map((_, i) => ({
            x: Math.random() * 140 + 30, 
            y: Math.random() * 200 + 50, 
            rotation: Math.random() * 360,
            scale: 0.8 + Math.random() * 0.4,
            color: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 6)]
        }));
    }, [count]);

    return (
        <svg viewBox="0 0 200 300" className={`overflow-visible ${className}`}>
            <path d="M 30 20 L 170 20 L 190 50 L 190 280 Q 190 300 170 300 L 30 300 Q 10 300 10 280 L 10 50 L 30 20 Z" 
                  fill="#f1f5f9" stroke="#64748b" strokeWidth="3" fillOpacity="0.4" />
            {items.map((item, i) => (
                <g key={i} transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}>
                    {itemType === 'flower' ? (
                        <g>
                            <circle cx="0" cy="-5" r="3" fill={item.color} />
                            <circle cx="5" cy="0" r="3" fill={item.color} />
                            <circle cx="0" cy="5" r="3" fill={item.color} />
                            <circle cx="-5" cy="0" r="3" fill={item.color} />
                            <circle cx="0" cy="0" r="3" fill="#fff" />
                        </g>
                    ) : (
                        <circle r="8" fill={item.color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    )}
                </g>
            ))}
            <rect x="25" y="5" width="150" height="15" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
        </svg>
    );
};

// Improved 3D Cube Stack Renderer
const CubeStack: React.FC<{ grid: number[][] }> = ({ grid }) => {
    if (!grid || !grid[0]) return null;
    
    const dimX = grid.length;
    const dimY = grid[0].length;
    const cubeSize = 40;
    const originX = 150;
    const originY = 50; // Starting Top Offset

    const cubes = [];

    // Generate cubes from Back to Front (Painter's Algorithm logic for isometric)
    // x iterates 0..dim, y iterates 0..dim
    // To render correctly back-to-front:
    // Iterate x from 0 to dim
    // Iterate y from 0 to dim
    // This usually works for standard isometric projection (x-y, x+y)
    
    for (let x = 0; x < dimX; x++) {
        for (let y = 0; y < dimY; y++) {
            const h = grid[x][y];
            for (let z = 0; z < h; z++) {
                // Iso Projection
                // screenX = (x - y) * tile_width / 2
                // screenY = (x + y) * tile_height / 2 - z * height
                const sx = originX + (y - x) * (cubeSize * 0.866); // cos(30) approx
                const sy = originY + (y + x) * (cubeSize * 0.5) - (z * cubeSize);
                
                cubes.push({ sx, sy, colorBase: '#6366f1' }); // Indigo base
            }
        }
    }

    return (
        <svg width="300" height="350" viewBox="0 0 300 350" className="overflow-visible">
            {cubes.map((c, i) => {
                const size = 40;
                const topPoints = `${c.sx},${c.sy - size} ${c.sx + size*0.866},${c.sy - size*0.5} ${c.sx},${c.sy} ${c.sx - size*0.866},${c.sy - size*0.5}`;
                const rightPoints = `${c.sx + size*0.866},${c.sy - size*0.5} ${c.sx + size*0.866},${c.sy + size*0.5} ${c.sx},${c.sy + size} ${c.sx},${c.sy}`;
                const leftPoints = `${c.sx},${c.sy} ${c.sx},${c.sy + size} ${c.sx - size*0.866},${c.sy + size*0.5} ${c.sx - size*0.866},${c.sy - size*0.5}`;

                return (
                    <g key={i}>
                        {/* Left Face */}
                        <polygon points={leftPoints} fill="#4338ca" stroke="#312e81" strokeWidth="1" />
                        {/* Right Face */}
                        <polygon points={rightPoints} fill="#6366f1" stroke="#312e81" strokeWidth="1" />
                        {/* Top Face */}
                        <polygon points={topPoints} fill="#a5b4fc" stroke="#312e81" strokeWidth="1" />
                    </g>
                );
            })}
        </svg>
    );
};

const GroupDisplay: React.FC<{ itemsPerGroup: number; visualType: string }> = ({ itemsPerGroup, visualType }) => {
    const renderItems = () => {
        if (visualType === 'dice') return <Domino count={itemsPerGroup} />;
        if (visualType === 'blocks') return (
            <div className="flex flex-col-reverse gap-0.5">
                {Array.from({length: itemsPerGroup}).map((_, i) => <div key={i} className="w-8 h-6 bg-indigo-500 border border-indigo-700 rounded-sm shadow-sm"></div>)}
            </div>
        );
        return (
            <div className="relative w-24 h-20 flex items-center justify-center">
                <div className="absolute bottom-0 w-20 h-8 bg-amber-200 border-2 border-amber-400 rounded-b-3xl rounded-t-md shadow-sm z-10"></div>
                <div className="flex flex-wrap justify-center gap-1 mb-4 z-0" style={{maxWidth: '80px'}}>
                    {Array.from({length: itemsPerGroup}).map((_, i) => <div key={i} className="w-5 h-5 rounded-full bg-red-500 border border-red-700 shadow-inner"></div>)}
                </div>
            </div>
        );
    }
    return <div className="flex flex-col items-center justify-end p-2">{renderItems()}</div>;
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
                        <h4 className="text-lg font-bold text-zinc-700">{ex.type === 'missing' ? 'Eksik sayıyı bul.' : 'Hangi kavanozda daha çok var?'}</h4>
                    </div>
                    {ex.type === 'missing' && ex.visualType === 'number-line-advanced' ? (
                        <div className="my-4 px-4"><NumberLineSVG start={ex.values[0]} end={ex.values[ex.values.length-1]} target={ex.target} missing={true} step={ex.step || 1} /></div>
                    ) : (
                        <div className="flex justify-around items-end gap-8 mt-4">
                            <EstimationJar count={ex.values[0]} itemType="circle" className="w-32 h-48" />
                            <span className="text-4xl font-black text-indigo-500">VS</span>
                            <EstimationJar count={ex.values[1]} itemType="flower" className="w-32 h-48" />
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
        <div className="grid grid-cols-1 gap-y-10 max-w-3xl mx-auto">
            {data.problems.map((prob, i) => (
                <div key={i} className="relative p-6 bg-white border-4 border-zinc-200 rounded-2xl break-inside-avoid shadow-md">
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-md">{i + 1}</div>
                    {prob.operator === 'group' ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap justify-center gap-8 p-4 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-300">
                                {Array.from({length: prob.num1}).map((_, gIndex) => <GroupDisplay key={gIndex} itemsPerGroup={prob.num2} visualType={prob.visualType} />)}
                            </div>
                            <div className="flex justify-around text-sm font-bold text-zinc-600">
                                <div className="flex flex-col items-center"><span>Grup</span><div className="w-12 h-10 border-2 border-zinc-400 rounded bg-white mt-1"></div></div>
                                <div className="flex flex-col items-center"><span>Nesne</span><div className="w-12 h-10 border-2 border-zinc-400 rounded bg-white mt-1"></div></div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-2xl font-black text-zinc-800 font-mono bg-indigo-50 p-3 rounded-xl">
                                {Array.from({length: prob.num1}).map((_, idx) => (<React.Fragment key={idx}>{idx > 0 && <span className="text-indigo-400">+</span>}<div className="w-12 h-12 bg-white border-2 border-zinc-400 rounded-lg shadow-inner"></div></React.Fragment>))}
                                <span className="text-indigo-600 mx-2">=</span><div className="w-16 h-12 bg-white border-2 border-indigo-400 rounded-lg shadow-inner border-dashed"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4 border-2 border-zinc-100">
                            <div className="flex items-center gap-3 text-4xl font-black text-zinc-800 font-mono">
                                <div className="w-16 h-16 bg-white border-2 border-zinc-400 rounded-lg shadow-inner"></div>
                                <span className="text-indigo-500">{prob.operator}</span>
                                <div className="w-16 h-16 bg-white border-2 border-zinc-400 rounded-lg shadow-inner"></div>
                                <span>=</span>
                            </div>
                            <div className="w-20 h-16 bg-white border-2 border-zinc-400 rounded-lg shadow-inner"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col gap-12 items-center">
            {data.tasks.map((task, i) => (
                <div key={i} className="p-6 bg-zinc-50 border-2 border-zinc-200 rounded-2xl break-inside-avoid w-full max-w-2xl">
                    
                    {/* CUBE COUNTING TASK */}
                    {task.type === 'count-cubes' && data.cubeData ? (
                        <div className="flex flex-col items-center">
                            <div className="mb-6 transform scale-110">
                                <CubeStack grid={data.cubeData} />
                            </div>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                                <span className="text-lg font-bold">Kaç küp var?</span>
                                <div className="w-20 h-12 border-2 border-dashed border-zinc-400 rounded bg-white"></div>
                            </div>
                        </div>
                    ) : task.type === 'copy' ? (
                        /* COPY PATTERN TASK */
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="flex-1 text-center">
                                <div className="text-sm font-bold text-zinc-500 mb-2">ÖRNEK</div>
                                <div className="grid gap-0.5 bg-zinc-800 border-4 border-zinc-800 inline-grid" style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}>
                                    {task.grid.map((row, r) => row.map((cell, c) => (
                                        <div key={`ref-${r}-${c}`} className="w-[40px] h-[40px] bg-white flex items-center justify-center relative">
                                            {/* Coordinate Labels */}
                                            {r === 0 && <span className="absolute -top-6 text-[10px] font-bold text-zinc-400">{c+1}</span>}
                                            {c === 0 && <span className="absolute -left-6 text-[10px] font-bold text-zinc-400">{String.fromCharCode(65+r)}</span>}
                                            
                                            {cell === 'filled' && <div className="w-full h-full bg-zinc-800"></div>}
                                        </div>
                                    )))}
                                </div>
                            </div>
                            <div className="hidden md:flex items-center text-zinc-300"><i className="fa-solid fa-arrow-right text-4xl"></i></div>
                            <div className="flex-1 text-center">
                                <div className="text-sm font-bold text-zinc-500 mb-2">SENİN ÇİZİMİN</div>
                                <div className="grid gap-0.5 bg-zinc-300 border-4 border-zinc-300 inline-grid" style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}>
                                    {Array.from({length: data.gridSize}).map((_, r) => Array.from({length: data.gridSize}).map((_, c) => (
                                        <div key={`target-${r}-${c}`} className="w-[40px] h-[40px] bg-white border border-zinc-100"></div>
                                    )))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* PATH / DIRECTION TASK */
                        <div className="flex flex-col items-center">
                            <div className="grid gap-1 bg-zinc-200 p-1 border-2 border-zinc-300 inline-grid rounded-lg mb-6" style={{ gridTemplateColumns: `repeat(${data.gridSize}, 50px)` }}>
                                {task.grid.map((row, r) => row.map((cell, c) => (
                                    <div key={`path-${r}-${c}`} className="w-[50px] h-[50px] bg-white rounded flex items-center justify-center border border-zinc-100 text-xs font-bold text-zinc-300">
                                        {cell === 'S' ? <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">B</div> : 
                                         cell === 'E' ? <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500">?</div> : 
                                         `${String.fromCharCode(65+r)}${c+1}`}
                                    </div>
                                )))}
                            </div>
                            <div className="w-full bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                                <h4 className="font-bold text-indigo-900 mb-2">Yönergeler:</h4>
                                <p className="text-lg font-medium leading-relaxed">{task.instruction.replace('Yönergeler: ', '')}</p>
                            </div>
                            <div className="mt-6 flex items-center gap-2">
                                <span className="font-bold">Hedef Koordinat:</span>
                                <div className="w-24 h-10 border-b-2 border-zinc-500"></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6 max-w-3xl mx-auto">
            {data.pairs.map((pair, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-2 border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                    <div className="w-1/3 flex justify-center items-center p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                        {pair.type === 'fraction' ? (
                            <div className="flex flex-col items-center gap-2 w-full">
                                <FractionBar num={parseInt(pair.item1.split('/')[0])} den={parseInt(pair.item1.split('/')[1])} />
                                <span className="font-bold text-xl font-mono">{pair.item1}</span>
                            </div>
                        ) : pair.imagePrompt1 && pair.imagePrompt1.startsWith('CLOCK:') ? (
                            <AnalogClock hour={parseInt(pair.imagePrompt1.split(':')[1])} minute={parseInt(pair.imagePrompt1.split(':')[2])} />
                        ) : pair.imagePrompt1 && pair.imagePrompt1.startsWith('MONEY:') ? (
                            <MoneyVisual amount={parseFloat(pair.imagePrompt1.split(':')[1])} />
                        ) : pair.imagePrompt1 && pair.imagePrompt1.startsWith('RULER:') ? (
                            <RulerVisual length={parseInt(pair.imagePrompt1.split(':')[1])} />
                        ) : pair.imagePrompt1 && pair.imagePrompt1.startsWith('SHAPE:') ? (
                            <GeometryVisual shape={pair.imagePrompt1.split(':')[1]} />
                        ) : (
                            <span className="text-4xl font-bold">{pair.item1}</span>
                        )}
                    </div>
                    <div className="flex-1 border-b-4 border-dotted border-zinc-300 mx-6 relative h-0"><i className="fa-solid fa-scissors absolute left-1/2 -top-3 text-zinc-400 bg-white px-2"></i></div>
                    <div className="w-1/3 flex justify-center p-4 bg-zinc-50 rounded-lg border border-zinc-100"><span className="text-xl font-bold text-center text-zinc-800">{pair.item2}</span></div>
                </div>
            ))}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-center mb-12"><div className="flex flex-col items-center opacity-70 scale-75 origin-bottom"><EstimationJar count={10} /><span className="mt-2 font-bold bg-zinc-200 px-2 rounded text-sm">Referans: 10 Adet</span></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {data.items.map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="relative">
                        <EstimationJar count={item.count} itemType={i % 2 === 0 ? 'star' : 'circle'} />
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">{i+1}</div>
                    </div>
                    <div className="mt-6 w-full max-w-[200px]"><p className="text-center font-bold text-zinc-500 mb-2 text-sm">Tahmin Et:</p><div className="flex justify-between gap-2">{item.options.map(opt => (<div key={opt} className="flex-1 py-2 border-2 border-zinc-300 rounded-lg text-center font-bold hover:border-indigo-500 cursor-pointer">{opt}</div>))}</div></div>
                </div>
            ))}
        </div>
    </div>
);
