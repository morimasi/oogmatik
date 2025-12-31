
import React from 'react';
import { FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData, MindGames56Data } from '../../types';
import { PedagogicalHeader, GridComponent, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

// GELİŞMİŞ TÜRKİYE HARİTASI BİLEŞENİ
const TurkeyMapSVG = ({ cities, showNames }: { cities: any[], showNames: boolean }) => {
    const realTurkeyPath = "M172,69 L227,53 L336,44 L460,42 L578,44 L677,53 L732,69 L752,95 L755,125 L735,150 L690,165 L630,175 L580,180 L545,215 L490,225 L440,220 L385,235 L335,245 L285,235 L245,220 L205,200 L160,185 L125,170 L95,145 L85,115 L125,95 Z";

    return (
        <div className="relative w-full aspect-[2/1] bg-white rounded-3xl border-[4px] border-zinc-900 overflow-hidden shadow-sm">
            {/* Arka Plan Yazıları (Denizler) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-3xl text-indigo-900/20 uppercase tracking-[1em] pointer-events-none">Karadeniz</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-3xl text-indigo-900/20 uppercase tracking-[1em] pointer-events-none">Akdeniz</div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 font-black text-3xl text-indigo-900/20 uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180 pointer-events-none">Ege Denizi</div>

            <svg viewBox="0 0 1000 400" className="w-full h-full absolute inset-0 p-4">
                {/* Türkiye Sınırı */}
                <path d={realTurkeyPath} fill="#fff" stroke="#000" strokeWidth="4" transform="scale(1.15, 1.2) translate(-10, -10)" />
                
                {/* Şehir İşaretçileri */}
                {(cities || []).map(city => (
                    <g key={city.id} transform={`translate(${city.x}, ${city.y})`} className="group">
                        <circle cx="0" cy="0" r="10" fill="none" stroke="#000" strokeWidth="1.5" className="opacity-40" />
                        <circle cx="0" cy="0" r="3" fill="#000" />
                        
                        {showNames && (
                            <text x="0" y="-12" fontSize="12" textAnchor="middle" fontWeight="bold" fill="#000" className="select-none pointer-events-none font-sans">
                                {city.name}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
            
            {/* Pusula */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center opacity-30">
                <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center font-black text-xs">K</div>
                <div className="w-0.5 h-4 bg-black"></div>
            </div>
        </div>
    );
};

export const MapInstructionSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        
        <div className="flex-1 flex flex-col gap-8">
            <EditableElement>
                <TurkeyMapSVG cities={data.cities || []} showNames={data.settings?.showCityNames !== false} />
            </EditableElement>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 p-6 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-100 shadow-inner">
                {(data.instructions || []).map((inst, i) => (
                    <EditableElement key={i} className="flex items-start gap-4 p-3 bg-white rounded-2xl border border-zinc-200 shadow-sm transition-all hover:border-indigo-400">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-800 leading-snug pt-1">
                                <EditableText value={inst} tag="span" />
                            </p>
                            <div className="mt-2 flex gap-1 items-center opacity-20">
                                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                                <div className="h-px flex-1 bg-zinc-200"></div>
                            </div>
                        </div>
                        <div className="w-6 h-6 rounded border-2 border-zinc-200 shrink-0 mt-1"></div>
                    </EditableElement>
                ))}
            </div>
        </div>

        <div className="mt-auto pt-6 text-center border-t border-zinc-100">
            <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Görsel-Uzamsal Akıl Yürütme</p>
        </div>
    </div>
);

export const FamilyRelationsSheet: React.FC<{ data: FamilyRelationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col md:flex-row justify-center gap-16 mt-8 relative">
            <div className="w-full md:w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Tanımlar</h4>
                {(data.leftColumn || []).map(item => (
                    <EditableElement key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16 justify-between">
                        <span className="flex-1 text-sm text-zinc-700"><EditableText value={item.text} tag="span" /></span>
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                    </EditableElement>
                ))}
            </div>
            <div className="w-full md:w-2/5 space-y-6">
                <h4 className="font-bold text-center border-b-2 pb-2 text-zinc-600">Akrabalar</h4>
                 {(data.rightColumn || []).map(item => (
                    <EditableElement key={item.id} className="flex items-center gap-4 p-3 border-2 border-zinc-200 rounded-lg bg-white shadow-sm h-16">
                        <div className="w-4 h-4 bg-zinc-700 rounded-full cursor-pointer"></div>
                        <span className="flex-1 text-center font-bold text-lg capitalize text-zinc-800"><EditableText value={item.text} tag="span" /></span>
                    </EditableElement>
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
                <EditableElement key={index} className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm break-inside-avoid">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">{index + 1}</span>
                        <p className="font-medium text-base pt-1 text-zinc-700"><EditableText value={q.riddle} tag="span" /></p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                        {(q.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center group cursor-pointer p-2 border rounded-lg hover:bg-zinc-50 transition-colors">
                                <div className="w-5 h-5 border-2 border-zinc-300 rounded-full mr-3 group-hover:border-indigo-500"></div>
                                <label className="text-base cursor-pointer group-hover:text-indigo-600 capitalize"><EditableText value={option} tag="span" /></label>
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const NumberBoxLogicSheet: React.FC<{ data: NumberBoxLogicData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-12">
            {(data.puzzles || []).map((puzzle, pIdx) => (
                <div key={pIdx} className="break-inside-avoid p-4 bg-zinc-50 rounded-xl border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <EditableElement className="p-4 border-4 border-blue-300 rounded-xl bg-blue-50 shadow-md">
                            <h4 className="font-bold text-center text-blue-800 border-b-2 border-blue-200 pb-2 mb-2">Kutu 1</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-blue-900">
                                {(puzzle.box1 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm"><EditableText value={n} tag="span" /></div>)}
                            </div>
                        </EditableElement>
                         <EditableElement className="p-4 border-4 border-red-300 rounded-xl bg-red-50 shadow-md">
                            <h4 className="font-bold text-center text-red-800 border-b-2 border-red-200 pb-2 mb-2">Kutu 2</h4>
                            <div className="grid grid-cols-2 gap-2 text-center text-3xl font-bold text-red-900">
                                 {(puzzle.box2 || []).map((n, i) => <div key={i} className="p-3 bg-white rounded-lg shadow-sm"><EditableText value={n} tag="span" /></div>)}
                            </div>
                        </EditableElement>
                    </div>
                    <div className="space-y-4">
                        {(puzzle.questions || []).map((q, qIdx) => (
                            <EditableElement key={qIdx} className="p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                <p className="font-semibold mb-3 text-zinc-700"><EditableText value={q.text} tag="span" /></p>
                                <div className="flex justify-around flex-wrap gap-3">
                                    {(q.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-5 h-5 rounded-full border-2 border-zinc-400"></div>
                                            <span className="font-bold"><EditableText value={opt} tag="span" /></span>
                                        </div>
                                    ))}
                                </div>
                            </EditableElement>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MindGamesSheet: React.FC<{ data: MindGamesData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center break-inside-avoid relative overflow-hidden min-h-[300px]">
                    <div className="absolute top-0 left-0 bg-zinc-100 dark:bg-zinc-700 px-4 py-1 rounded-br-xl text-xs font-bold text-zinc-500 border-b border-r border-zinc-200">
                        #{idx + 1}
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full my-4">
                         <div className="text-center font-bold text-zinc-400 italic">Akıl Oyunu Görseli</div>
                    </div>
                    <EditableElement className="text-center w-full bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700 mt-auto">
                        {puzzle.question && <p className="text-sm font-semibold mb-1 text-zinc-700 dark:text-zinc-300"><EditableText value={puzzle.question} tag="span" /></p>}
                        {puzzle.hint && <p className="text-xs text-zinc-500 dark:text-zinc-400 italic"><i className="fa-solid fa-lightbulb text-yellow-500 mr-1"></i><EditableText value={puzzle.hint} tag="span" /></p>}
                    </EditableElement>
                </div>
            ))}
        </div>
    </div>
);

export const MindGames56Sheet: React.FC<{ data: MindGames56Data }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} data={data} />
        <div className="space-y-6">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-800 rounded-2xl border-l-8 border-indigo-500 shadow-md p-6 break-inside-avoid">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                            {idx + 1}
                        </div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-100"><EditableText value={puzzle.title} tag="span" /></h4>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <EditableElement className="flex-1 space-y-4">
                            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line text-base leading-relaxed">
                                <EditableText value={puzzle.question} tag="span" />
                            </p>
                        </EditableElement>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
