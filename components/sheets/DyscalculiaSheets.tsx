
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData } from '../../types';
import { PedagogicalHeader, ImageDisplay } from './common';

// --- VISUAL HELPERS ---

const VisualCounter: React.FC<{ count: number; type: string; className?: string; imagePrompt?: string }> = ({ count, type, className, imagePrompt }) => {
    const items = Array.from({ length: count });
    
    if (type === 'dots') {
        return (
            <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
                {items.map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-indigo-600 rounded-full shadow-sm"></div>
                ))}
            </div>
        );
    }
    
    if (type === 'fingers') {
        return <div className={`text-4xl ${className}`}>🖐️ x {count}</div>;
    }

    // Objects: Try to use ImageDisplay for specific items or fallback to a generic star/apple
    // Note: Ideally 'imagePrompt' comes from the generator. If it's "Apple", ImageDisplay handles emoji conversion.
    return (
        <div className={`flex flex-wrap gap-1 justify-center ${className}`}>
            {items.map((_, i) => (
                <div key={i} className="w-8 h-8">
                    {/* Pass the type (e.g., 'elma', 'star') as description to trigger smart emoji lookup */}
                    <ImageDisplay base64={undefined} description={imagePrompt || 'Yıldız'} className="w-full h-full object-contain !bg-transparent !border-0 !p-0 !shadow-none" />
                </div>
            ))}
        </div>
    );
};

const PieChart: React.FC<{ fraction: string }> = ({ fraction }) => {
    const [num, den] = fraction.split('/').map(Number);
    if (isNaN(num) || isNaN(den) || den === 0) return null;
    
    const percent = (num / den) * 100;
    return (
        <div className="w-24 h-24 rounded-full bg-zinc-200 border-2 border-zinc-400 relative overflow-hidden" 
             style={{ background: `conic-gradient(#4f46e5 0% ${percent}%, #e4e4e7 ${percent}% 100%)` }}>
        </div>
    );
};

const NumberLine: React.FC<{ start: number, end: number, target?: number, missing?: boolean }> = ({ start, end, target, missing }) => {
    const range = end - start + 1;
    return (
        <div className="w-full flex items-center justify-between relative h-12 mt-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800"></div>
            {Array.from({ length: range }).map((_, i) => {
                const val = start + i;
                const isTarget = val === target;
                return (
                    <div key={i} className="flex flex-col items-center z-10">
                        <div className="w-0.5 h-4 bg-zinc-800"></div>
                        <span className={`mt-1 font-bold ${isTarget && missing ? 'text-transparent border-b-2 border-zinc-800 min-w-[20px]' : ''}`}>
                            {isTarget && missing ? '?' : val}
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
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="space-y-8">
            {data.exercises.map((ex, i) => (
                <div key={i} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 shadow-sm">
                    {ex.type === 'missing' && (
                        <div className="text-center">
                            <h4 className="text-lg font-bold mb-4 text-zinc-500">Eksik Sayıyı Bul</h4>
                            <div className="flex justify-center gap-4 text-3xl font-mono">
                                {ex.values.map((v, idx) => (
                                    <div key={idx} className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 ${v === -1 ? 'border-dashed border-indigo-500 bg-indigo-50' : 'border-zinc-300'}`}>
                                        {v === -1 ? '?' : v}
                                    </div>
                                ))}
                            </div>
                            {ex.visualType === 'number-line' && <NumberLine start={Math.min(...ex.values.filter(x=>x!==-1))} end={Math.max(...ex.values)} target={ex.target} missing={true} />}
                        </div>
                    )}
                    {ex.type === 'comparison' && (
                        <div className="flex justify-around items-center">
                            <div className="text-center">
                                <VisualCounter count={ex.values[0]} type={ex.visualType || 'objects'} imagePrompt="Elma" />
                                <p className="text-2xl font-bold mt-2">{ex.values[0]}</p>
                            </div>
                            <div className="w-12 h-12 border-2 border-zinc-400 rounded-full flex items-center justify-center text-2xl font-bold bg-white">?</div>
                            <div className="text-center">
                                <VisualCounter count={ex.values[1]} type={ex.visualType || 'objects'} imagePrompt="Elma" />
                                <p className="text-2xl font-bold mt-2">{ex.values[1]}</p>
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
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.problems.map((prob, i) => (
                <div key={i} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-zinc-50 p-2 rounded border">
                            <VisualCounter count={prob.num1} type={prob.visualType} imagePrompt={prob.imagePrompt || 'Yıldız'} />
                            <p className="text-center font-bold mt-1">{prob.num1}</p>
                        </div>
                        <span className="text-3xl font-bold text-indigo-500">{prob.operator === 'group' ? 'grup' : prob.operator}</span>
                        <div className="bg-zinc-50 p-2 rounded border">
                            <VisualCounter count={prob.num2} type={prob.visualType} imagePrompt={prob.imagePrompt || 'Yıldız'} />
                            <p className="text-center font-bold mt-1">{prob.num2}</p>
                        </div>
                    </div>
                    <div className="w-full border-t-2 border-zinc-300 pt-2 flex justify-center items-center gap-2">
                        <span className="text-2xl font-bold">=</span>
                        <div className="w-16 h-12 border-2 border-dashed border-zinc-400 rounded bg-white"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.tasks.map((task, i) => (
                <div key={i} className="flex flex-col items-center">
                    <p className="mb-2 font-medium text-center bg-indigo-50 px-3 py-1 rounded text-indigo-800">{task.instruction}</p>
                    <div 
                        className="grid gap-1 bg-zinc-300 p-1" 
                        style={{ gridTemplateColumns: `repeat(${data.gridSize}, 50px)` }}
                    >
                        {task.grid.map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="w-[50px] h-[50px] bg-white flex items-center justify-center text-2xl font-bold border border-zinc-200">
                                    {cell === 'start' ? <i className="fa-solid fa-location-dot text-red-500"></i> : (cell === 'X' ? '❌' : cell)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="space-y-6 max-w-2xl mx-auto">
            {data.pairs.map((pair, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm">
                    <div className="w-1/3 flex justify-center items-center">
                        {pair.type === 'fraction' ? <PieChart fraction={pair.item1 as string} /> : 
                         pair.type === 'time' && pair.imagePrompt1 ? <ImageDisplay base64={undefined} description={pair.imagePrompt1 || 'Saat'} className="w-24 h-24" /> :
                         <span className="text-4xl font-bold">{pair.item1}</span>}
                    </div>
                    <div className="flex-1 border-b-2 border-dashed border-zinc-300 mx-4"></div>
                    <div className="w-1/3 flex justify-center">
                        <span className="text-xl font-medium text-center">{pair.item2}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.items.map((item, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border">
                    <div className="w-48 h-48 border-4 border-zinc-300 rounded-full flex items-center justify-center overflow-hidden bg-zinc-50 relative mb-4">
                        {/* Randomly scattered dots visual simulation */}
                        {Array.from({ length: item.count }).map((_, k) => (
                            <div 
                                key={k} 
                                className="absolute w-3 h-3 bg-red-500 rounded-full"
                                style={{ 
                                    top: `${Math.random() * 80 + 10}%`, 
                                    left: `${Math.random() * 80 + 10}%` 
                                }}
                            ></div>
                        ))}
                    </div>
                    <p className="font-bold mb-2">Tahmin et, kaç tane?</p>
                    <div className="flex gap-3">
                        {item.options.map(opt => (
                            <button key={opt} className="px-4 py-2 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 font-bold">{opt}</button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
