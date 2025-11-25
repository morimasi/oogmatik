import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData } from '../../types';
import { PedagogicalHeader } from './common';

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