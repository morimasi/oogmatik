
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, VisualMathType } from '../../types';
import { PedagogicalHeader, ImageDisplay, Shape } from './common';

// --- VISUAL HELPERS ---

// 10'luk Çerçeve (Ten Frame)
const TenFrame: React.FC<{ count: number; className?: string }> = ({ count, className = "" }) => {
    const validCount = Math.min(20, Math.max(0, count || 0));
    const frames = validCount > 10 ? 2 : 1;
    
    const renderFrame = (fill: number) => (
        <div className={`grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-[120px] h-[52px] ${className}`}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-zinc-300 flex items-center justify-center relative">
                    {i < fill && <div className="w-3/4 h-3/4 bg-black rounded-full shadow-sm"></div>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-2">
            {renderFrame(Math.min(10, validCount))}
            {validCount > 10 && renderFrame(validCount - 10)}
        </div>
    );
};

// Domino
const Domino: React.FC<{ count: number }> = ({ count }) => {
    const dots = Array.from({length: 9}).map(() => false);
    const c = Math.min(9, Math.max(0, count || 0));
    
    // Standard dice patterns for 1-6, simpler for others
    if(c === 1) dots[4] = true;
    else if(c === 2) { dots[0]=true; dots[8]=true; }
    else if(c === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(c === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(c === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(c === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    else if(c === 7) { dots[0]=true; dots[2]=true; dots[3]=true; dots[4]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    else if(c === 8) { dots[0]=true; dots[1]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[7]=true; dots[8]=true; }
    else if(c === 9) { dots.fill(true); }
    
    if (count > 9) {
        return (
            <div className="w-12 h-20 border-2 border-black rounded-lg bg-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {count}
            </div>
        );
    }

    return (
        <div className="w-12 h-12 border-2 border-black rounded-lg bg-white grid grid-cols-3 grid-rows-3 p-1 gap-0.5 shadow-sm">
            {dots.map((isActive, i) => (
                <div key={i} className="flex items-center justify-center">
                    {isActive && <div className="w-2 h-2 bg-black rounded-full"></div>}
                </div>
            ))}
        </div>
    );
};

// Number Bond (Parça-Bütün)
const NumberBond: React.FC<{ whole: number | string; part1: number | string; part2: number | string | null; isAddition: boolean }> = ({ whole, part1, part2, isAddition }) => {
    return (
        <svg width="160" height="140" viewBox="0 0 160 140" className="overflow-visible">
            {/* Connections */}
            <line x1="80" y1="40" x2="40" y2="100" stroke="black" strokeWidth="2" />
            <line x1="80" y1="40" x2="120" y2="100" stroke="black" strokeWidth="2" />
            
            {/* Whole (Top) */}
            <circle cx="80" cy="30" r="25" fill={isAddition ? "#fff" : "#e0e7ff"} stroke="black" strokeWidth="2" />
            <text x="80" y="30" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold">
                {isAddition ? '?' : whole}
            </text>
            
            {/* Part 1 (Left) */}
            <circle cx="40" cy="110" r="25" fill="white" stroke="black" strokeWidth="2" />
            <text x="40" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold">{part1}</text>
            
            {/* Part 2 (Right) */}
            <circle cx="120" cy="110" r="25" fill={!isAddition && part2 === null ? "#e0e7ff" : "white"} stroke="black" strokeWidth="2" />
            <text x="120" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold">
                {part2 !== null ? part2 : '?'}
            </text>
        </svg>
    );
};

// Kesir Çubuğu (Bar Model)
const FractionBar: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const validDen = den > 0 ? den : 1; 
    const validNum = Math.max(0, num);
    
    return (
        <div className="w-full h-12 border-2 border-black rounded flex overflow-hidden bg-white shadow-sm">
            {Array.from({ length: validDen }).map((_, i) => (
                <div key={i} className={`flex-1 border-r border-black last:border-r-0 flex items-center justify-center ${i < validNum ? 'bg-indigo-400 pattern-dots' : ''}`}>
                    {/* Optional labels inside bars if widely spaced */}
                </div>
            ))}
        </div>
    );
};

// Fraction Pie Chart
const FractionPie: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const validDen = Math.max(1, den || 1);
    const validNum = Math.min(validDen, Math.max(0, num || 0));
    const radius = 40;
    const center = 50;
    
    if (validDen === 1) {
        return (
            <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible">
                <circle cx={center} cy={center} r={radius} fill={validNum === 1 ? '#6366f1' : '#fff'} stroke="black" strokeWidth="2" />
            </svg>
        );
    }

    // Generate paths for slices
    const slices = Array.from({ length: validDen }).map((_, i) => {
        const startAngle = (i * 360) / validDen;
        const endAngle = ((i + 1) * 360) / validDen;
        
        // Convert to radians
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);
        
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        
        const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        return { d, filled: i < validNum };
    });

    return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 overflow-visible">
            {slices.map((slice, i) => (
                <path 
                    key={i} 
                    d={slice.d} 
                    fill={slice.filled ? '#6366f1' : '#fff'} 
                    stroke="black" 
                    strokeWidth="2"
                />
            ))}
        </svg>
    );
};

// 100'lük Tablo (Decimal Grid)
const DecimalGrid: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    // Denominator is typically 10 or 100. We visualize based on 100 grid.
    const total = 100;
    const fillCount = den === 10 ? num * 10 : num; // Convert tenths to hundredths
    
    return (
        <div className="grid grid-cols-10 gap-px bg-zinc-300 border border-zinc-400 w-24 h-24">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`w-full h-full ${i < fillCount ? 'bg-indigo-500' : 'bg-white'}`}></div>
            ))}
        </div>
    );
};

// Estimation Jar
const EstimationJar: React.FC<{ count: number }> = ({ count }) => {
    const items = Array.from({ length: count });
    
    // Deterministic pseudo-random positions based on index to prevent re-render flickering
    const getPos = (i: number) => {
        const seed = i * 9301 + 49297;
        const x = (seed % 80) + 10; // 10-90%
        const y = ((seed * 13) % 70) + 20; // 20-90% (bottom heavy)
        return { x, y };
    };

    return (
        <div className="relative w-32 h-40 border-4 border-zinc-400 rounded-xl bg-white/50 overflow-hidden mx-auto shadow-inner">
            {/* Jar Lid */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-zinc-300 border-b-2 border-zinc-400"></div>
            {/* Items */}
            {items.map((_, i) => {
                const { x, y } = getPos(i);
                return (
                    <div 
                        key={i} 
                        className="absolute w-3 h-3 rounded-full bg-indigo-500 border border-indigo-700 shadow-sm"
                        style={{ left: `${x}%`, top: `${y}%` }}
                    ></div>
                );
            })}
        </div>
    );
};

// 3D Cubes (Isometric Stack)
const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => {
    // Simple isometric renderer using SVG
    if (!counts || !Array.isArray(counts) || counts.length === 0) return null;
    
    const dim = counts.length;
    const size = 30; // Cube size
    
    // Helper to draw one cube at x,y (grid coords), z (height)
    const drawCube = (gx: number, gy: number, gz: number) => {
        const isoX = (gx - gy) * size;
        const isoY = (gx + gy) * (size * 0.5) - (gz * size * 0.8);
        
        // Cube face paths
        const top = `M 0 0 L ${size} ${size*0.5} L 0 ${size} L ${-size} ${size*0.5} Z`;
        const left = `M ${-size} ${size*0.5} L 0 ${size} L 0 ${size*2} L ${-size} ${size*1.5} Z`;
        const right = `M 0 ${size} L ${size} ${size*0.5} L ${size} ${size*1.5} L 0 ${size*2} Z`;
        
        return (
            <g transform={`translate(${isoX + 150}, ${isoY + 100})`}>
                <path d={left} fill="#9ca3af" stroke="black" strokeWidth="1" />
                <path d={right} fill="#d1d5db" stroke="black" strokeWidth="1" />
                <path d={top} fill="#f3f4f6" stroke="black" strokeWidth="1" />
            </g>
        );
    };

    // Render order: Back to Front (Painter's Algorithm)
    // For isometric: min X+Y to max X+Y, then min Z to max Z
    const cubesToRender = [];
    for (let x = 0; x < dim; x++) {
        if (!counts[x]) continue; // Safety check
        for (let y = 0; y < dim; y++) {
            const h = counts[x][y] || 0;
            for (let z = 0; z < h; z++) {
                cubesToRender.push({x, y, z});
            }
        }
    }
    
    // Sort: primary by X+Y (depth), secondary by Z (height)
    cubesToRender.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z);

    return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            {cubesToRender.map((c, i) => (
                <React.Fragment key={i}>{drawCube(c.x, c.y, c.z)}</React.Fragment>
            ))}
        </svg>
    );
};

// --- COMPONENTS ---

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="space-y-8">
            {data.exercises.map((ex, idx) => {
                if (ex.type === 'missing' && ex.visualType === 'number-line-advanced') {
                    return (
                        <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border-2 border-zinc-200">
                            <div className="flex items-center justify-between relative h-16 px-8">
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-black -z-10"></div>
                                {ex.values.map((val, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 relative">
                                        <div className="w-0.5 h-4 bg-black"></div>
                                        {val === ex.target ? (
                                            <div className="w-10 h-10 border-2 border-indigo-600 bg-white rounded flex items-center justify-center font-bold text-indigo-600">?</div>
                                        ) : (
                                            <span className="font-bold text-lg">{val}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-sm text-zinc-500">Kural: {ex.step ? `+${ex.step}` : '?'}</p>
                            </div>
                        </div>
                    )
                }
                
                if (ex.type === 'comparison' && ex.visualType === 'ten-frame') {
                    return (
                        <div key={idx} className="flex items-center justify-around p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2">
                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[0]} />
                                <div className="w-10 h-10 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center"></div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-300 flex items-center justify-center text-2xl font-bold text-zinc-400">{'>'}</div>
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-300 flex items-center justify-center text-2xl font-bold text-zinc-400">{'='}</div>
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-300 flex items-center justify-center text-2xl font-bold text-zinc-400">{'<'}</div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[1]} />
                                <div className="w-10 h-10 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center"></div>
                            </div>
                        </div>
                    )
                }
                
                return null;
            })}
        </div>
    </div>
);

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.problems.map((prob, idx) => {
                const visual = prob.visualType || 'objects';
                
                return (
                    <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 shadow-sm flex flex-col items-center gap-4">
                        {/* Visual Representation Area */}
                        <div className="flex items-center gap-4">
                            {/* Part 1 */}
                            {visual === 'ten-frame' && <TenFrame count={prob.num1} />}
                            {visual === 'dice' && <Domino count={prob.num1} />}
                            {(visual === 'objects' || visual === 'mixed' || visual === 'blocks') && (
                                <div className="flex flex-wrap gap-1 w-24 justify-center">
                                    {Array.from({length: prob.num1}).map((_,i) => <div key={i} className="w-4 h-4 bg-indigo-500 rounded-full"></div>)}
                                </div>
                            )}
                            {visual === 'number-bond' && (
                                <NumberBond 
                                    whole={prob.operator === 'group' ? prob.answer : (prob.operator === '+' ? prob.answer : prob.num1)} 
                                    part1={prob.operator === 'group' ? prob.num1 : (prob.operator === '+' ? prob.num1 : prob.num2)} 
                                    part2={prob.operator === 'group' ? null : (prob.operator === '+' ? prob.num2 : prob.answer)} 
                                    isAddition={prob.operator === '+'} 
                                />
                            )}

                            {/* Operator (Skip for Number Bond / Grouping) */}
                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <span className="text-3xl font-bold text-zinc-400">{prob.operator}</span>
                            )}

                            {/* Part 2 (Skip for Grouping / Number Bond handled internally) */}
                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <>
                                    {visual === 'ten-frame' && <TenFrame count={prob.num2} />}
                                    {visual === 'dice' && <Domino count={prob.num2} />}
                                    {(visual === 'objects' || visual === 'mixed' || visual === 'blocks') && (
                                        <div className="flex flex-wrap gap-1 w-24 justify-center">
                                            {Array.from({length: prob.num2}).map((_,i) => <div key={i} className="w-4 h-4 bg-rose-500 rounded-full"></div>)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Equation / Answer Area */}
                        {visual !== 'number-bond' && (
                            <div className="flex items-center gap-2 text-2xl font-bold font-mono">
                                {prob.operator === 'group' ? (
                                    // Grouping Equation: "3 grup x 4 nesne = 12"
                                    <>
                                        <span>{prob.num1} grup</span>
                                        <span>x</span>
                                        <span>{prob.num2}</span>
                                        <span>=</span>
                                        <div className="w-16 h-10 border-2 border-zinc-400 rounded bg-white"></div>
                                    </>
                                ) : (
                                    // Standard Equation
                                    <>
                                        <span>{prob.num1}</span>
                                        <span>{prob.operator}</span>
                                        <span>{prob.num2}</span>
                                        <span>=</span>
                                        <div className="w-16 h-10 border-2 border-zinc-400 rounded bg-white"></div>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Special Grouping Visuals if 'group' operator */}
                        {prob.operator === 'group' && visual !== 'number-bond' && (
                            <div className="flex gap-4 mt-2">
                                {Array.from({length: prob.num1}).map((_, gIdx) => (
                                    <div key={gIdx} className="p-2 border-2 border-dashed border-zinc-300 rounded-lg">
                                        <div className="grid grid-cols-2 gap-1">
                                            {Array.from({length: prob.num2}).map((_, i) => (
                                                <div key={i} className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="flex flex-col items-center gap-12">
            {data.tasks.map((task, idx) => (
                <div key={idx} className="w-full flex flex-col items-center">
                    {/* Task specific rendering */}
                    
                    {task.type === 'count-cubes' && data.cubeData && (
                        <div className="p-8 bg-white border-2 border-zinc-200 rounded-xl shadow-lg">
                            <CubeStack counts={data.cubeData} />
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <span className="font-bold text-lg">Toplam Küp Sayısı:</span>
                                <div className="w-20 h-10 border-2 border-zinc-400 rounded bg-zinc-50"></div>
                            </div>
                        </div>
                    )}

                    {task.type === 'copy' && (
                        <div className="flex gap-8 md:gap-16">
                            {/* Source */}
                            <div>
                                <p className="text-center font-bold mb-2 text-zinc-500">Örnek</p>
                                <div className="grid gap-1 bg-zinc-800 p-1" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>
                                    {(task.grid || []).flat().map((cell, i) => (
                                        <div key={i} className={`w-10 h-10 ${cell === 'filled' ? 'bg-indigo-500' : 'bg-white'} border border-zinc-700`}></div>
                                    ))}
                                </div>
                            </div>
                            {/* Target */}
                            <div>
                                <p className="text-center font-bold mb-2 text-zinc-500">Senin Çizimin</p>
                                <div className="grid gap-1 bg-zinc-300 p-1" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>
                                    {Array.from({length: data.gridSize * data.gridSize}).map((_, i) => (
                                        <div key={i} className="w-10 h-10 bg-white border border-zinc-400"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {task.type === 'path' && (
                        <div className="flex flex-col items-center">
                            <div className="grid gap-0.5 bg-zinc-400 border-2 border-zinc-500" style={{gridTemplateColumns: `repeat(${data.gridSize}, 50px)`}}>
                                {(task.grid || []).flat().map((cell, i) => (
                                    <div key={i} className="w-[50px] h-[50px] bg-white flex items-center justify-center text-xl font-bold relative">
                                        {cell === 'S' && <div className="w-8 h-8 bg-green-500 rounded-full text-white flex items-center justify-center text-xs">BAŞLA</div>}
                                        {cell === 'E' && <div className="w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center text-xs opacity-0 print:opacity-0">BİTİŞ</div>} 
                                        {/* End is hidden for student to find */}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200 max-w-lg text-center">
                                <span className="font-bold text-indigo-800">Yönergeler:</span>
                                <p className="mt-2 text-lg leading-relaxed">{task.instruction}</p>
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
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
            {data.pairs.map((pair, idx) => {
                // Safe handling for visual codes (e.g. PIE:3:4)
                const safeItem1 = String(pair.item1 || '');
                const isVisualCode = safeItem1.includes(':') && ['PIE','BAR','GRID','CLOCK','MONEY','RULER','SHAPE'].some(k => safeItem1.startsWith(k));
                
                let visualComponent = null;
                if (isVisualCode) {
                    const parts = safeItem1.split(':');
                    const type = parts[0];
                    
                    if (type === 'PIE') {
                        visualComponent = <FractionPie num={parseInt(parts[1]) || 0} den={parseInt(parts[2]) || 1} />;
                    } else if (type === 'BAR') {
                        visualComponent = <div className="w-32"><FractionBar num={parseInt(parts[1]) || 0} den={parseInt(parts[2]) || 1} /></div>;
                    } else if (type === 'GRID') {
                        visualComponent = <DecimalGrid num={parseInt(parts[1]) || 0} den={parseInt(parts[2]) || 100} />;
                    } else if (type === 'CLOCK') {
                        // Simple clock face placeholder or use svg logic if complex
                        visualComponent = <div className="w-24 h-24 rounded-full border-4 border-zinc-600 relative bg-white shadow-sm">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold">12</div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold">6</div>
                            {/* Hands logic would go here based on h:m */}
                            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        </div>;
                    } else if (type === 'MONEY') {
                        visualComponent = <div className="w-16 h-16 rounded-full border-4 border-amber-400 bg-amber-100 flex items-center justify-center font-bold text-amber-700 shadow-sm">₺</div>;
                    } else if (type === 'RULER') {
                        visualComponent = <div className="w-32 h-8 border border-black bg-yellow-100 relative">
                            {Array.from({length:10}).map((_,k) => <div key={k} className="absolute top-0 h-2 w-px bg-black" style={{left: `${k*10}%`}}></div>)}
                        </div>;
                    } else if (type === 'SHAPE') {
                        visualComponent = <Shape name={'circle'} className="w-16 h-16 text-indigo-500" />; // Fallback/Placeholder
                    }
                }

                return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-700/50 rounded-xl border shadow-sm">
                        {/* Left Side (Item 1) */}
                        <div className="flex-1 flex justify-center">
                            {visualComponent ? visualComponent : (
                                <span className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">{pair.item1}</span>
                            )}
                        </div>
                        
                        {/* Connector Area */}
                        <div className="w-16 flex items-center justify-center">
                            <div className="w-full h-0.5 border-t-2 border-dashed border-zinc-400"></div>
                        </div>

                        {/* Right Side (Item 2 or Empty for user) */}
                        <div className="flex-1 flex justify-center">
                            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 min-w-[80px] text-center">
                                <span className="text-xl font-medium text-zinc-600 dark:text-zinc-400">{pair.item2}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {data.items.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-6 p-6 bg-white dark:bg-zinc-700/50 rounded-2xl shadow-sm border-2 border-zinc-200">
                    <div className="relative">
                        {/* Custom Estimation Jar Component Logic can be ported here if complex, using simple dots for now */}
                        <div className="w-48 h-64 border-4 border-zinc-300 rounded-2xl bg-white relative overflow-hidden shadow-inner">
                            {/* Lid */}
                            <div className="absolute top-0 left-0 right-0 h-4 bg-zinc-400 z-10"></div>
                            {/* Items */}
                            {Array.from({length: item.count}).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="absolute w-3 h-3 rounded-full bg-indigo-500 shadow-sm"
                                    style={{
                                        left: `${Math.random() * 80 + 10}%`,
                                        top: `${Math.random() * 80 + 10}%`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="w-full">
                        <p className="text-center font-bold mb-4 text-zinc-500">Tahminin hangisi?</p>
                        <div className="flex justify-center gap-4">
                            {item.options.map((opt, i) => (
                                <button key={i} className="w-16 h-16 rounded-full border-2 border-indigo-200 hover:bg-indigo-50 font-bold text-xl text-indigo-700 transition-colors">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
