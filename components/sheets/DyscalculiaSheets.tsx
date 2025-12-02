
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, VisualMathType } from '../../types';
import { PedagogicalHeader, Shape } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- SHARED COMPONENTS ---

const StudentInfoStrip = () => (
    <div className="flex flex-wrap justify-between border-b-2 border-black pb-2 mb-6 text-black font-bold uppercase text-[10px] tracking-wider gap-4 print:flex w-full">
        <div className="flex-1 min-w-[150px] flex flex-col justify-end">
            <span className="text-zinc-500 mb-1">Adı Soyadı:</span>
            <div className="border-b border-black border-dashed w-full h-6"></div>
        </div>
        <div className="w-24 flex flex-col justify-end">
            <span className="text-zinc-500 mb-1">Tarih:</span>
            <div className="border-b border-black border-dashed w-full h-6"></div>
        </div>
        <div className="w-24 flex flex-col justify-end">
            <span className="text-zinc-500 mb-1">Süre:</span>
            <div className="border-b border-black border-dashed w-full h-6"></div>
        </div>
        <div className="w-24 flex flex-col justify-end">
            <span className="text-zinc-500 mb-1">Puan:</span>
            <div className="border-b border-black border-dashed w-full h-6"></div>
        </div>
    </div>
);

// --- VISUAL MATH HELPERS ---

// 10'luk Çerçeve (Ten Frame)
const TenFrame: React.FC<{ count: number; className?: string }> = ({ count, className = "" }) => {
    const validCount = Math.min(20, Math.max(0, count || 0));
    
    const renderFrame = (fill: number) => (
        <div className={`grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-[100px] h-[44px] ${className}`}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-black flex items-center justify-center relative">
                    {i < fill && <div className="w-3/4 h-3/4 bg-black rounded-full"></div>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-1">
            {renderFrame(Math.min(10, validCount))}
            {validCount > 10 && renderFrame(validCount - 10)}
        </div>
    );
};

// Domino / Dice
const Domino: React.FC<{ count: number }> = ({ count }) => {
    const dots = Array.from({length: 9}).map(() => false);
    const c = Math.min(9, Math.max(0, count || 0));
    
    // Dice patterns
    if(c === 1) dots[4] = true;
    else if(c === 2) { dots[0]=true; dots[8]=true; }
    else if(c === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(c === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(c === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(c === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    else if(c > 6) { return <div className="w-10 h-10 border-2 border-black rounded bg-white flex items-center justify-center text-xl font-bold">{c}</div>; }

    return (
        <div className="w-10 h-10 border-2 border-black rounded bg-white grid grid-cols-3 grid-rows-3 p-0.5 gap-0.5">
            {dots.map((isActive, i) => (
                <div key={i} className="flex items-center justify-center">
                    {isActive && <div className="w-1.5 h-1.5 bg-black rounded-full"></div>}
                </div>
            ))}
        </div>
    );
};

// Number Bond (Parça-Bütün)
const NumberBond: React.FC<{ whole: number | string; part1: number | string; part2: number | string | null; isAddition: boolean }> = ({ whole, part1, part2, isAddition }) => {
    return (
        <svg width="120" height="100" viewBox="0 0 160 140" className="overflow-visible">
            <line x1="80" y1="40" x2="40" y2="100" stroke="black" strokeWidth="3" />
            <line x1="80" y1="40" x2="120" y2="100" stroke="black" strokeWidth="3" />
            
            <circle cx="80" cy="30" r="28" fill="white" stroke="black" strokeWidth="3" />
            <text x="80" y="30" dominantBaseline="middle" textAnchor="middle" className="text-2xl font-bold fill-black">
                {isAddition ? '?' : whole}
            </text>
            
            <circle cx="40" cy="110" r="28" fill="white" stroke="black" strokeWidth="3" />
            <text x="40" y="110" dominantBaseline="middle" textAnchor="middle" className="text-2xl font-bold fill-black">{part1}</text>
            
            <circle cx="120" cy="110" r="28" fill="white" stroke="black" strokeWidth="3" />
            <text x="120" y="110" dominantBaseline="middle" textAnchor="middle" className="text-2xl font-bold fill-black">
                {part2 !== null ? part2 : '?'}
            </text>
        </svg>
    );
};

// Fraction Pie
const FractionPie: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const validDen = Math.max(1, den || 1);
    const validNum = Math.min(validDen, Math.max(0, num || 0));
    const radius = 40;
    const center = 50;
    
    if (validDen === 1) {
        return (
            <svg viewBox="0 0 100 100" className="w-16 h-16 overflow-visible">
                <circle cx={center} cy={center} r={radius} fill={validNum === 1 ? '#e5e7eb' : '#fff'} stroke="black" strokeWidth="2" />
            </svg>
        );
    }

    const slices = Array.from({ length: validDen }).map((_, i) => {
        const startAngle = (i * 360) / validDen;
        const endAngle = ((i + 1) * 360) / validDen;
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
        <svg viewBox="0 0 100 100" className="w-16 h-16 overflow-visible">
            {slices.map((slice, i) => (
                <path key={i} d={slice.d} fill={slice.filled ? '#d4d4d8' : '#fff'} stroke="black" strokeWidth="2" />
            ))}
        </svg>
    );
};

// Decimal Grid (100lük)
const DecimalGrid: React.FC<{ num: number; den: number }> = ({ num, den }) => {
    const total = 100;
    const fillCount = den === 10 ? num * 10 : num;
    return (
        <div className="grid grid-cols-10 gap-px bg-black border-2 border-black w-16 h-16">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`w-full h-full ${i < fillCount ? 'bg-zinc-400' : 'bg-white'}`}></div>
            ))}
        </div>
    );
};

// Isometric Cube Stack
const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => {
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
            <g transform={`translate(${isoX + 150}, ${isoY + 120})`}>
                <path d={left} fill="#9ca3af" stroke="black" strokeWidth="1.5" />
                <path d={right} fill="#d1d5db" stroke="black" strokeWidth="1.5" />
                <path d={top} fill="#f3f4f6" stroke="black" strokeWidth="1.5" />
            </g>
        );
    };

    const cubesToRender: {x:number, y:number, z:number}[] = [];
    for (let x = 0; x < dim; x++) {
        if (!counts[x]) continue;
        for (let y = 0; y < dim; y++) {
            const h = counts[x][y] || 0;
            for (let z = 0; z < h; z++) {
                cubesToRender.push({x, y, z});
            }
        }
    }
    cubesToRender.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z);

    return (
        <svg width="300" height="250" viewBox="0 0 300 250" className="overflow-visible mx-auto">
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
        <StudentInfoStrip />
        
        <div className="dynamic-grid">
            {data.exercises.map((ex, idx) => {
                if (ex.type === 'missing' && ex.visualType === 'number-line-advanced') {
                    return (
                        <EditableElement key={idx} className="p-6 bg-white rounded-xl border-2 border-black break-inside-avoid shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h4 className="text-xs font-bold uppercase mb-4">Sayı Doğrusu (Kural: +{ex.step})</h4>
                            <div className="flex items-center justify-between relative h-16 px-4">
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-black -z-10"></div>
                                {ex.values.map((val, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 relative bg-white px-1">
                                        <div className="w-0.5 h-3 bg-black"></div>
                                        {val === ex.target ? (
                                            <div className="w-10 h-10 border-2 border-black bg-white rounded flex items-center justify-center font-bold text-lg">?</div>
                                        ) : (
                                            <span className="font-bold text-xl font-mono">{val}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    )
                }
                
                if (ex.type === 'comparison' && ex.visualType === 'ten-frame') {
                    return (
                        <EditableElement key={idx} className="flex items-center justify-around p-4 bg-white rounded-xl border-2 border-black break-inside-avoid">
                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[0]} />
                                <span className="font-bold text-xl">{ex.values[0]}</span>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xl font-bold cursor-pointer hover:bg-black hover:text-white">{'>'}</div>
                                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xl font-bold cursor-pointer hover:bg-black hover:text-white">{'='}</div>
                                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xl font-bold cursor-pointer hover:bg-black hover:text-white">{'<'}</div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[1]} />
                                <span className="font-bold text-xl">{ex.values[1]}</span>
                            </div>
                        </EditableElement>
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
        <StudentInfoStrip />
        
        <div className="dynamic-grid">
            {data.problems.map((prob, idx) => {
                const visual = prob.visualType || 'objects';
                return (
                    <EditableElement key={idx} className="p-4 bg-white rounded-xl border-2 border-black flex flex-col items-center gap-4 break-inside-avoid shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 w-full justify-center">
                            {visual === 'ten-frame' && <TenFrame count={prob.num1} />}
                            {visual === 'dice' && <Domino count={prob.num1} />}
                            {(visual === 'objects' || visual === 'mixed' || visual === 'blocks') && (
                                <div className="flex flex-wrap gap-1 w-20 justify-center">
                                    {Array.from({length: prob.num1}).map((_,i) => <div key={i} className="w-3 h-3 bg-black rounded-full"></div>)}
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

                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <span className="text-3xl font-black">{prob.operator}</span>
                            )}

                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <>
                                    {visual === 'ten-frame' && <TenFrame count={prob.num2} />}
                                    {visual === 'dice' && <Domino count={prob.num2} />}
                                    {(visual === 'objects' || visual === 'mixed' || visual === 'blocks') && (
                                        <div className="flex flex-wrap gap-1 w-20 justify-center">
                                            {Array.from({length: prob.num2}).map((_,i) => <div key={i} className="w-3 h-3 bg-white border border-black rounded-full"></div>)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {visual !== 'number-bond' && (
                            <div className="flex items-center gap-2 text-2xl font-bold font-mono border-t border-black w-full justify-center pt-2">
                                {prob.operator === 'group' ? (
                                    <><span>{prob.num1} grup</span><span>x</span><span>{prob.num2}</span><span>=</span><div className="w-16 h-10 border-2 border-black rounded bg-white"></div></>
                                ) : (
                                    <><span>{prob.num1}</span><span>{prob.operator}</span><span>{prob.num2}</span><span>=</span><div className="w-16 h-10 border-2 border-black rounded bg-white"></div></>
                                )}
                            </div>
                        )}
                        
                        {prob.operator === 'group' && visual !== 'number-bond' && (
                            <div className="flex gap-2 mt-1">
                                {Array.from({length: prob.num1}).map((_, gIdx) => (
                                    <div key={gIdx} className="p-1 border border-black rounded bg-zinc-50">
                                        <div className="grid grid-cols-2 gap-0.5">
                                            {Array.from({length: prob.num2}).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black rounded-full"></div>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </EditableElement>
                );
            })}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="dynamic-grid justify-items-center">
            {data.tasks.map((task, idx) => (
                <EditableElement key={idx} className="w-full flex flex-col items-center break-inside-avoid p-4 border-2 border-black rounded-xl">
                    {task.type === 'count-cubes' && data.cubeData && (
                        <div className="w-full">
                            <CubeStack counts={data.cubeData} />
                            <div className="mt-4 flex items-center justify-center gap-4">
                                <span className="font-bold text-lg uppercase">Toplam Küp:</span>
                                <div className="w-16 h-10 border-2 border-black rounded bg-white"></div>
                            </div>
                        </div>
                    )}

                    {task.type === 'copy' && (
                        <div className="flex gap-8 md:gap-16">
                            <div>
                                <p className="text-center font-bold mb-1 text-xs uppercase">Örnek</p>
                                <div className="grid gap-0.5 bg-black border-2 border-black p-0.5" style={{gridTemplateColumns: `repeat(${data.gridSize}, 24px)`}}>
                                    {(task.grid || []).flat().map((cell, i) => (
                                        <div key={i} className={`w-6 h-6 ${cell === 'filled' ? 'bg-black' : 'bg-white'}`}></div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-center font-bold mb-1 text-xs uppercase">Senin Çizimin</p>
                                <div className="grid gap-0.5 bg-black border-2 border-black p-0.5" style={{gridTemplateColumns: `repeat(${data.gridSize}, 24px)`}}>
                                    {Array.from({length: data.gridSize * data.gridSize}).map((_, i) => (
                                        <div key={i} className="w-6 h-6 bg-white"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {task.type === 'path' && (
                        <div className="flex flex-col items-center">
                            <div className="grid gap-0 border-2 border-black" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>
                                {(task.grid || []).flat().map((cell, i) => (
                                    <div key={i} className="w-10 h-10 bg-white flex items-center justify-center text-sm font-bold border border-zinc-200">
                                        {cell === 'S' && <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[8px]">BAŞLA</div>}
                                        {cell === 'E' && <div className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center text-[8px]">BİTİŞ</div>} 
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-2 w-full text-center border-t-2 border-black border-dashed">
                                <span className="font-bold text-sm block mb-1">YÖNERGELER:</span>
                                <p className="text-xs font-mono">{task.instruction}</p>
                            </div>
                        </div>
                    )}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="dynamic-grid max-w-4xl mx-auto">
            {data.pairs.map((pair, idx) => {
                const safeItem1 = String(pair.item1 || '');
                const isVisualCode = safeItem1.includes(':') && ['PIE','BAR','GRID','CLOCK','MONEY','RULER','SHAPE'].some(k => safeItem1.startsWith(k));
                
                let visualComponent = null;
                if (isVisualCode) {
                    const parts = safeItem1.split(':');
                    const type = parts[0];
                    if (type === 'PIE') visualComponent = <FractionPie num={parseInt(parts[1])} den={parseInt(parts[2])} />;
                    else if (type === 'GRID') visualComponent = <DecimalGrid num={parseInt(parts[1])} den={parseInt(parts[2])} />;
                    else if (type === 'CLOCK') {
                        visualComponent = (
                            <div className="w-16 h-16 rounded-full border-2 border-black relative bg-white">
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold">12</div>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold">6</div>
                                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-black origin-bottom -translate-x-1/2 -translate-y-full" style={{transform: `rotate(${((parseInt(parts[1])%12)*30) + (parseInt(parts[2])/2)}deg) translateX(-50%)`}}></div>
                                <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-black origin-bottom -translate-x-1/2 -translate-y-full" style={{transform: `rotate(${parseInt(parts[2])*6}deg) translateX(-50%)`}}></div>
                            </div>
                        );
                    }
                }

                return (
                    <EditableElement key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-black break-inside-avoid">
                        <div className="flex-1 flex justify-center">
                            {visualComponent ? visualComponent : <span className="text-2xl font-bold">{pair.item1}</span>}
                        </div>
                        <div className="w-12 flex items-center justify-center">
                            <div className="w-full h-0.5 border-t-2 border-dashed border-black"></div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="px-4 py-2 border-2 border-zinc-300 rounded min-w-[80px] text-center bg-white">
                                <span className="text-lg font-medium">{pair.item2}</span>
                            </div>
                        </div>
                    </EditableElement>
                )
            })}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <StudentInfoStrip />
        
        <div className="dynamic-grid">
            {data.items.map((item, idx) => (
                <EditableElement key={idx} className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl border-2 border-black break-inside-avoid">
                    <div className="relative w-32 h-40 border-4 border-black rounded-xl bg-white overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-zinc-200 border-b-2 border-black z-10"></div>
                        {Array.from({length: item.count}).map((_, i) => (
                            <div 
                                key={i} 
                                className="absolute w-2 h-2 rounded-full bg-black"
                                style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 70 + 20}%`
                                }}
                            ></div>
                        ))}
                    </div>
                    
                    <div className="w-full">
                        <p className="text-center font-bold mb-2 text-xs uppercase">Tahminin hangisi?</p>
                        <div className="flex justify-center gap-2">
                            {item.options.map((opt, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-bold text-lg hover:bg-black hover:text-white cursor-pointer transition-colors">
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);
