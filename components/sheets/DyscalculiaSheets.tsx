
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
    return (
        <div className="w-full h-10 border-2 border-black rounded flex overflow-hidden bg-white">
            {Array.from({ length: den }).map((_, i) => (
                <div key={i} className={`flex-1 border-r border-zinc-400 last:border-r-0 ${i < num ? 'bg-indigo-400 pattern-dots' : ''}`}>
                </div>
            ))}
        </div>
    );
};

const VisualCounter: React.FC<{ count: number; type: string; className?: string }> = ({ count, type, className }) => {
    if (type === 'ten-frame') {
        // 20'ye kadar desteklemek için birden fazla frame
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

    // Default Objects
    return (
        <div className={`flex flex-wrap gap-1 justify-center max-w-[120px] ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <i key={i} className="fa-solid fa-star text-amber-400 text-lg drop-shadow-sm"></i>
            ))}
        </div>
    );
};

const NumberLine: React.FC<{ start: number, end: number, target?: number, missing?: boolean }> = ({ start, end, target, missing }) => {
    const range = end - start + 1;
    return (
        <div className="w-full flex items-end justify-between relative h-16 mt-2 px-2">
            <div className="absolute bottom-2 left-0 w-full h-0.5 bg-black"></div>
            {Array.from({ length: range }).map((_, i) => {
                const val = start + i;
                const isTarget = val === target;
                return (
                    <div key={i} className="flex flex-col items-center z-10 relative">
                        {isTarget && missing && (
                            <div className="absolute -top-8 bg-indigo-100 border-2 border-indigo-500 text-indigo-700 rounded px-2 py-1 text-lg font-bold shadow-sm animate-bounce">?</div>
                        )}
                        <div className="w-0.5 h-3 bg-black mb-1"></div>
                        <span className={`text-lg font-bold font-mono ${isTarget && missing ? 'opacity-0' : 'text-zinc-800'}`}>
                            {val}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// --- SHEETS ---

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 gap-6">
            {data.exercises.map((ex, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center justify-between p-6 bg-white border-2 border-zinc-300 rounded-xl shadow-sm break-inside-avoid">
                    
                    {ex.type === 'missing' && (
                        <div className="w-full">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                                <h4 className="text-lg font-bold text-zinc-700">Eksik olan sayıyı bul ve kutuya yaz.</h4>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                                <NumberLine start={Math.min(...ex.values.filter(x=>x!==-1))} end={Math.max(...ex.values)} target={ex.target} missing={true} />
                            </div>
                            <div className="mt-4 flex justify-center items-center gap-2">
                                <span className="font-bold text-xl">Cevap:</span>
                                <div className="w-16 h-12 border-2 border-zinc-400 rounded bg-white"></div>
                            </div>
                        </div>
                    )}

                    {ex.type === 'comparison' && (
                        <div className="w-full">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                                <h4 className="text-lg font-bold text-zinc-700">Hangi grup daha {ex.target === Math.max(...ex.values) ? 'ÇOK' : 'AZ'}? Daire içine al.</h4>
                            </div>
                            <div className="flex justify-around items-center gap-8">
                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-300 rounded-xl hover:border-indigo-400 transition-colors cursor-pointer">
                                    <VisualCounter count={ex.values[0]} type={ex.visualType || 'ten-frame'} />
                                    <p className="text-3xl font-black mt-4 text-zinc-800">{ex.values[0]}</p>
                                </div>
                                
                                <div className="text-2xl font-bold text-zinc-300">VS</div>

                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-zinc-300 rounded-xl hover:border-indigo-400 transition-colors cursor-pointer">
                                    <VisualCounter count={ex.values[1]} type={ex.visualType || 'ten-frame'} />
                                    <p className="text-3xl font-black mt-4 text-zinc-800">{ex.values[1]}</p>
                                </div>
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
    // This component handles visual copying tasks
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-12">
                {data.tasks.map((task, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-8 p-6 bg-zinc-50 border-2 border-zinc-200 rounded-2xl break-inside-avoid">
                        <div className="flex-1 text-center">
                            <h4 className="font-bold text-zinc-500 mb-2 uppercase tracking-wider">Örnek</h4>
                            <div 
                                className="grid gap-0.5 bg-zinc-800 border-4 border-zinc-800 inline-grid" 
                                style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}
                            >
                                {task.grid.map((row, r) => 
                                    row.map((cell, c) => (
                                        <div key={`ref-${r}-${c}`} className={`w-[40px] h-[40px] bg-white flex items-center justify-center text-xl font-bold relative`}>
                                            {cell === 'start' && <div className="w-4 h-4 bg-green-500 rounded-full"></div>}
                                            {cell === 'X' && <i className="fa-solid fa-xmark text-red-600 text-2xl"></i>}
                                            {/* If task type is copy/pattern, cell might be a color or shape */}
                                            {cell === 'filled' && <div className="w-full h-full bg-zinc-800"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center text-zinc-300">
                            <i className="fa-solid fa-arrow-right text-4xl"></i>
                        </div>

                        <div className="flex-1 text-center">
                            <h4 className="font-bold text-zinc-500 mb-2 uppercase tracking-wider">Senin Çizimin</h4>
                            <div 
                                className="grid gap-0.5 bg-zinc-300 border-4 border-zinc-300 inline-grid" 
                                style={{ gridTemplateColumns: `repeat(${data.gridSize}, 40px)` }}
                            >
                                {Array.from({length: data.gridSize}).map((_, r) => 
                                    Array.from({length: data.gridSize}).map((_, c) => (
                                        <div key={`target-${r}-${c}`} className="w-[40px] h-[40px] bg-white border border-zinc-100"></div>
                                    ))
                                )}
                            </div>
                        </div>
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
                                <FractionBar num={parseInt(pair.item1.split('/')[0])} den={parseInt(pair.item1.split('/')[1])} />
                                <span className="font-bold text-xl font-mono">{pair.item1}</span>
                            </div>
                        ) : pair.type === 'time' ? (
                            <div className="w-24 h-24 rounded-full border-4 border-zinc-800 relative bg-white shadow-inner">
                                {/* Simple Analog Clock CSS */}
                                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
                                {/* Hands would need calculating rotation based on time string */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold">12</div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold">6</div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold">3</div>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold">9</div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-zinc-100 px-1 rounded">{pair.item1}</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.items.map((item, i) => (
                <div key={i} className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-lg border-4 border-zinc-100">
                    <div className="w-56 h-56 border-4 border-zinc-300 rounded-full flex items-center justify-center overflow-hidden bg-zinc-50 relative mb-6 shadow-inner">
                        {/* Randomly scattered dots */}
                        {Array.from({ length: item.count }).map((_, k) => (
                            <div 
                                key={k} 
                                className="absolute w-4 h-4 bg-indigo-500 rounded-full shadow-sm border border-indigo-600"
                                style={{ 
                                    top: `${Math.random() * 80 + 10}%`, 
                                    left: `${Math.random() * 80 + 10}%` 
                                }}
                            ></div>
                        ))}
                    </div>
                    
                    <div className="w-full text-center">
                        <p className="font-bold mb-4 text-lg text-zinc-600">Bu kavanozda kaç tane var?</p>
                        <div className="flex gap-3 justify-center">
                            {item.options.map(opt => (
                                <div key={opt} className="flex items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-zinc-400 rounded-full"></div>
                                    <span className="text-xl font-bold font-mono">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
