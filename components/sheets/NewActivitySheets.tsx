
import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData } from '../../types';
import { PedagogicalHeader, GridComponent } from './common';

// --- TURKEY MAP COMPONENT ---
const TurkeyMapSVG = ({ cities }: { cities: { name: string, x: number, y: number }[] }) => {
    // A simplified SVG path for Turkey's outline
    const simplifiedPath = "M426 116 l -25 -20 l -45 -4 l -30 18 l -35 2 l -26 -16 l -30 5 l -22 18 l -33 -1 l -20 12 l -15 28 l -38 10 l -14 22 l -28 6 l -8 18 l 10 20 l 25 10 l 18 -8 l 40 2 l 30 20 l 55 8 l 40 -12 l 30 -25 l 15 -30 l 10 -40 Z";

    return (
        <svg viewBox="0 0 500 250" className="w-full h-auto border-2 border-zinc-200 rounded-lg bg-sky-50 shadow-inner">
            <path d={simplifiedPath} fill="#f0fdf4" stroke="#4ade80" strokeWidth="2" />
            {(cities || []).map(city => (
                <g key={city.name} transform={`translate(${city.x * 4.5}, ${city.y * 2.2})`}>
                    <circle cx="0" cy="0" r="4" fill="#ef4444" className="cursor-pointer hover:r-6 transition-all" />
                    <text x="6" y="4" fontSize="8" className="font-bold fill-zinc-700 pointer-events-none select-none">{city.name}</text>
                </g>
            ))}
        </svg>
    );
};

export const FamilyRelationsSheet: React.FC<{ data: FamilyRelationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="flex justify-center gap-16 mt-8 relative">
            <div className="w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Tanımlar</h4>
                {(data.leftColumn || []).map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16 justify-between">
                        <span className="flex-1 text-sm text-zinc-700">{item.text}</span>
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                    </div>
                ))}
            </div>
            <div className="w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Akrabalar</h4>
                 {(data.rightColumn || []).map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16">
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                        <span className="flex-1 text-center font-bold text-lg capitalize text-zinc-800">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const LogicDeductionSheet: React.FC<{ data: LogicDeductionData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6">
            {(data.questions || []).map((q, index) => (
                <div key={index} className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm break-inside-avoid">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">{index + 1}</span>
                        <p className="font-medium text-base pt-1 text-zinc-700">{q.riddle}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                        {(q.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center group cursor-pointer p-2 border rounded-lg hover:bg-zinc-50 transition-colors">
                                <div className="w-5 h-5 border-2 border-zinc-300 rounded-full mr-3 group-hover:border-indigo-500"></div>
                                <label className="text-base cursor-pointer group-hover:text-indigo-600 capitalize">{option}</label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        {data.scoringText && (
            <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 text-center rounded-r-lg">
                <p className="font-bold text-amber-800">{data.scoringText}</p>
            </div>
        )}
    </div>
);

export const NumberBoxLogicSheet: React.FC<{ data: NumberBoxLogicData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-12">
            {(data.puzzles || []).map((puzzle, pIdx) => (
                <div key={pIdx} className="break-inside-avoid p-4 bg-zinc-50 rounded-xl border">
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div className="p-4 border-4 border-blue-300 rounded-xl bg-blue-50 shadow-md">
                            <h4 className="font-bold text-center text-blue-800 border-b-2 border-blue-200 pb-2 mb-2">Kutu 1</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-blue-900">
                                {(puzzle.box1 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm">{n}</div>)}
                            </div>
                        </div>
                         <div className="p-4 border-4 border-red-300 rounded-xl bg-red-50 shadow-md">
                            <h4 className="font-bold text-center text-red-800 border-b-2 border-red-200 pb-2 mb-2">Kutu 2</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-red-900">
                                 {(puzzle.box2 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm">{n}</div>)}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {(puzzle.questions || []).map((q, qIdx) => (
                            <div key={qIdx} className="p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                <p className="font-semibold mb-3 text-zinc-700">{q.text}</p>
                                <div className="flex justify-around flex-wrap gap-3">
                                    {(q.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-400"></div>
                                            <span className="font-bold">{opt}</span>
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
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="order-last lg:order-first">
                <h4 className="font-bold border-b-2 pb-2 mb-4 text-zinc-700">Yönergeler</h4>
                <ul className="space-y-3">
                    {(data.instructions || []).map((inst, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">{i + 1}</span>
                            <span className="text-sm text-zinc-800">{inst}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <TurkeyMapSVG cities={data.cities || []} />
            </div>
        </div>
    </div>
);

export const MindGamesSheet: React.FC<{ data: MindGamesData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.puzzles.map((puzzle, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center break-inside-avoid">
                    <h4 className="font-bold text-indigo-600 mb-4 uppercase tracking-wide text-sm">Bulmaca {idx + 1}</h4>
                    
                    {/* Shape Math Type */}
                    {puzzle.type === 'shape_math' && (
                        <div className="relative w-48 h-40 mb-4">
                            {puzzle.shape === 'triangle' && (
                                <svg viewBox="0 0 100 86" className="w-full h-full overflow-visible">
                                    <polygon points="50,0 100,86 0,86" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-800 dark:text-zinc-200" />
                                    {/* Corners */}
                                    <circle cx="50" cy="0" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                    <text x="50" y="0" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{puzzle.numbers?.[0]}</text>
                                    
                                    <circle cx="0" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                    <text x="0" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{puzzle.numbers?.[1]}</text>
                                    
                                    <circle cx="100" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                    <text x="100" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{puzzle.numbers?.[2]}</text>
                                    
                                    {/* Center Target */}
                                    <circle cx="50" cy="50" r="15" fill="#e0e7ff" stroke="currentColor" className="text-indigo-600" />
                                    <text x="50" y="50" dominantBaseline="central" textAnchor="middle" className="text-lg font-bold text-indigo-800">{puzzle.numbers?.[3] || '?'}</text>
                                </svg>
                            )}
                        </div>
                    )}

                    {/* Matrix Logic Type */}
                    {puzzle.type === 'matrix_logic' && puzzle.grid && (
                        <div className="mb-4">
                             <div className="border-4 border-zinc-800 dark:border-zinc-400 inline-block rounded-lg overflow-hidden">
                                 <GridComponent grid={puzzle.grid as any} cellClassName="w-14 h-14 text-2xl font-bold flex items-center justify-center" showLetters={false} />
                             </div>
                        </div>
                    )}

                    {/* Number Pyramid Type */}
                    {puzzle.type === 'number_pyramid' && puzzle.numbers && (
                         <div className="flex flex-col items-center gap-1 mb-4">
                            {/* Top */}
                            <div className="flex gap-1">
                                <div className="w-12 h-12 border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center font-bold rounded shadow-sm">{puzzle.numbers[5]}</div>
                            </div>
                            {/* Mid */}
                            <div className="flex gap-1">
                                <div className="w-12 h-12 border-2 border-zinc-300 bg-white flex items-center justify-center font-bold rounded">{puzzle.numbers[3]}</div>
                                <div className="w-12 h-12 border-2 border-zinc-300 bg-white flex items-center justify-center font-bold rounded">{puzzle.numbers[4]}</div>
                            </div>
                            {/* Base */}
                            <div className="flex gap-1">
                                <div className="w-12 h-12 border-2 border-zinc-400 bg-zinc-50 flex items-center justify-center font-bold rounded">{puzzle.numbers[0]}</div>
                                <div className="w-12 h-12 border-2 border-zinc-400 bg-zinc-50 flex items-center justify-center font-bold rounded">{puzzle.numbers[1]}</div>
                                <div className="w-12 h-12 border-2 border-zinc-400 bg-zinc-50 flex items-center justify-center font-bold rounded">{puzzle.numbers[2]}</div>
                            </div>
                         </div>
                    )}
                    
                    <div className="text-center">
                        {puzzle.question && <p className="text-sm mb-2">{puzzle.question}</p>}
                        {puzzle.hint && <p className="text-xs text-zinc-400 italic">İpucu: {puzzle.hint}</p>}
                    </div>
                </div>
            ))}
        </div>
    </div>
);
