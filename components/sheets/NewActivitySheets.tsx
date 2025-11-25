
import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData } from '../../types';
import { PedagogicalHeader, ImageDisplay } from './common';

// --- TURKEY MAP COMPONENT ---
// Simplified schematic map for visual reference
const TurkeyMapSVG = ({ cities }: { cities: { name: string, x: number, y: number }[] }) => {
    return (
        <svg viewBox="0 0 100 60" className="w-full h-auto drop-shadow-lg">
            {/* Abstract Outline of Turkey */}
            <path d="M 2 15 Q 10 10 20 5 L 40 2 L 80 2 L 95 5 L 98 20 L 95 45 L 70 55 L 30 58 L 5 45 Z" fill="#f8fafc" stroke="#334155" strokeWidth="0.5" />
            
            {/* Cities */}
            {(cities || []).map((city, i) => (
                <g key={i} transform={`translate(${city.x}, ${city.y})`}>
                    <circle r="1.5" fill="#ef4444" stroke="white" strokeWidth="0.2" />
                    <text y="-2" fontSize="2.5" textAnchor="middle" className="fill-slate-800 font-bold">{city.name}</text>
                </g>
            ))}
            
            {/* Regions Text Overlay (Approximate) */}
            <text x="50" y="25" fontSize="6" fill="rgba(0,0,0,0.05)" textAnchor="middle" fontWeight="bold">ANADOLU</text>
        </svg>
    );
};

export const FamilyRelationsSheet: React.FC<{ data: FamilyRelationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-between gap-16 max-w-4xl mx-auto my-8 relative">
            {/* Center Line for matching */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <div className="w-px h-full border-r-2 border-dashed border-zinc-200"></div>
            </div>

            <div className="flex-1 space-y-6">
                {(data.leftColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-zinc-200 shadow-sm relative">
                        <span className="text-lg font-medium text-zinc-700">{item.text}</span>
                        <div className="absolute -right-3 w-6 h-6 bg-white border-2 border-zinc-400 rounded-full"></div>
                    </div>
                ))}
            </div>

            <div className="flex-1 space-y-6">
                {(data.rightColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-zinc-200 shadow-sm relative flex-row-reverse text-right">
                        <span className="text-lg font-bold text-indigo-600">{item.text}</span>
                        <div className="absolute -left-3 w-6 h-6 bg-white border-2 border-zinc-400 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const LogicDeductionSheet: React.FC<{ data: LogicDeductionData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.questions || []).map((q, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border-2 border-zinc-300 shadow-sm break-inside-avoid">
                    <div className="mb-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-lg leading-relaxed font-medium text-zinc-800">
                        {q.riddle}
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {(q.options || []).map((opt, idx) => {
                            const letter = String.fromCharCode(97 + idx); // a, b, c...
                            return (
                                <div key={idx} className="flex items-center gap-2 px-4 py-2 border-2 border-zinc-200 rounded-lg">
                                    <span className="font-bold text-zinc-400">{letter})</span>
                                    <span className="font-bold">{opt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
        {data.scoringText && (
            <div className="mt-8 text-center p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200">
                {data.scoringText}
            </div>
        )}
    </div>
);

export const NumberBoxLogicSheet: React.FC<{ data: NumberBoxLogicData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-12">
            {(data.puzzles || []).map((puzzle, i) => (
                <div key={i} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-200 break-inside-avoid">
                    <div className="flex justify-center gap-12 mb-8">
                        <div className="p-6 bg-white rounded-2xl border-4 border-indigo-200 shadow-sm text-center min-w-[150px]">
                            <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2">Sol Kutu</h4>
                            <div className="grid grid-cols-2 gap-4 text-3xl font-black text-indigo-600">
                                {(puzzle.box1 || []).map((n, j) => <span key={j}>{n}</span>)}
                            </div>
                        </div>
                        <div className="p-6 bg-white rounded-2xl border-4 border-rose-200 shadow-sm text-center min-w-[150px]">
                            <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2">Sağ Kutu</h4>
                            <div className="grid grid-cols-2 gap-4 text-3xl font-black text-rose-600">
                                {(puzzle.box2 || []).map((n, j) => <span key={j}>{n}</span>)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {(puzzle.questions || []).map((q, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="mb-3 font-medium">{q.text}</p>
                                <div className="flex gap-4">
                                    {(q.options || []).map((opt, optIdx) => (
                                        <div key={optIdx} className="px-4 py-2 border rounded-lg text-sm font-bold cursor-pointer hover:bg-zinc-50">
                                            {String.fromCharCode(97 + optIdx)}) {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MapInstructionSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="mb-8 p-4 bg-blue-50 rounded-2xl border-4 border-blue-100">
            <TurkeyMapSVG cities={data.cities} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.instructions || []).map((inst, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                    <div className="w-6 h-6 rounded border-2 border-zinc-400 flex-shrink-0"></div>
                    <p className="text-zinc-700 font-medium">{inst}</p>
                </div>
            ))}
        </div>
    </div>
);
