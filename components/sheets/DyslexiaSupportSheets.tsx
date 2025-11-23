
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';
import { ImageDisplay, PedagogicalHeader } from './common';

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 leading-loose text-2xl font-medium font-dyslexic">
            {data.text.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="mb-6 text-justify" style={{ lineHeight: '2.5' }}>
                    {para.sentences.map((sentence, sIdx) => (
                        <React.Fragment key={sIdx}>
                            {sentence.syllables.map((syl, sylIdx) => (
                                <span key={sylIdx} style={{ color: syl.color }} className="px-[1px]">{syl.text}</span>
                            ))}
                            <span> </span> 
                        </React.Fragment>
                    ))}
                </p>
            ))}
        </div>
    </div>
);

export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {data.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-700/50 rounded-lg border-2 border-zinc-100 dark:border-zinc-600 shadow-sm">
                    <div className="flex-1 text-center text-3xl font-dyslexic tracking-[0.5em] text-zinc-800 dark:text-zinc-200">
                        {row.letters.map((l, i) => (
                            <span key={i} className="cursor-pointer hover:text-indigo-600 transition-colors">{l}</span>
                        ))}
                    </div>
                    <div className="w-16 h-12 border-2 border-dotted border-zinc-300 rounded-lg flex items-center justify-center text-xs text-zinc-400 ml-4 bg-zinc-50">
                        ___
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-5 gap-4 md:gap-6 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border-2 border-zinc-100 dark:border-zinc-700">
            {data.grid.items.map((item, idx) => (
                <div key={idx} className="aspect-square flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    {item.type === 'color' ? (
                        <div className="w-14 h-14 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: item.value }}></div>
                    ) : item.type === 'icon' ? (
                        <span className="text-4xl filter drop-shadow-sm">{item.value}</span>
                    ) : (
                        <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-200 font-mono">{item.value}</span>
                    )}
                </div>
            ))}
        </div>
        <div className="mt-8 flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100">
            <span className="text-blue-800 dark:text-blue-200 font-bold flex items-center"><i className="fa-solid fa-stopwatch mr-2"></i>Süre:</span>
            <div className="w-32 h-8 border-b-2 border-blue-300 dark:border-blue-700 border-dashed"></div>
        </div>
    </div>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.exercises.map((ex, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 flex flex-col items-center text-center shadow-sm">
                    {ex.imagePrompt && <ImageDisplay base64={undefined} description={ex.word} className="w-24 h-24 mb-4" />}
                    <div className="text-3xl font-bold mb-2 text-indigo-600 dark:text-indigo-400 capitalize">{ex.word}</div>
                    <p className="mb-6 text-zinc-600 dark:text-zinc-300 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">{ex.question}</p>
                    
                    <div className="flex gap-4 mt-auto flex-wrap justify-center">
                        {(ex.options || []).map((opt, i) => (
                            <div key={i} className="min-w-[40px] h-10 px-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-500 flex items-center justify-center font-bold cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 transition-all shadow-sm bg-white dark:bg-zinc-800">
                                {opt}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="mb-8 flex justify-center items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border-2 border-amber-200 border-dashed">
            <span className="font-bold text-amber-800 dark:text-amber-200">Hedef Harf:</span>
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border-2 border-amber-400 text-3xl font-bold text-amber-600 shadow-sm">
                {data.targetPair.split(/[\/-]/)[0]}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-8 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 shadow-inner">
            {data.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-around items-center">
                    {row.items.map((item, iIdx) => (
                        <div 
                            key={iIdx} 
                            className="w-14 h-14 flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-all font-dyslexic select-none"
                            style={{ 
                                transform: `rotate(${item.rotation}deg) scaleX(${item.isMirrored ? -1 : 1})`,
                                color: '#333' // Keep uniform color to force visual discrimination
                            }}
                        >
                            {item.letter}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-12 mt-8">
            {data.trains.map((train, idx) => (
                <div key={idx} className="flex flex-col items-start gap-4 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border-b-4 border-sky-200 dark:border-sky-800">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-xl border-2 border-sky-200 flex items-center justify-center shrink-0 shadow-sm">
                            <ImageDisplay base64={train.imageBase64} description={train.word} className="w-14 h-14" />
                        </div>
                        <span className="font-bold text-sky-800 dark:text-sky-200 text-lg uppercase tracking-wider">{train.word}</span>
                    </div>
                    
                    <div className="flex items-center flex-wrap gap-1 w-full overflow-x-auto pb-2">
                        {/* Locomotive */}
                        <div className="relative h-16 min-w-[70px] bg-sky-500 rounded-l-xl rounded-r-md flex items-center justify-center text-white shadow-md mr-1 border-b-4 border-sky-700">
                            <i className="fa-solid fa-train text-3xl"></i>
                            <div className="absolute -bottom-3 left-2 w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                            <div className="absolute -bottom-3 right-2 w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                        </div>
                        
                        {/* Wagons */}
                        {train.syllables.map((syl, sIdx) => (
                            <div key={sIdx} className="relative h-16 min-w-[90px] px-4 bg-white dark:bg-zinc-700 border-2 border-sky-400 rounded-md flex items-center justify-center shadow-md group hover:scale-105 transition-transform">
                                <span className="text-2xl font-bold text-sky-900 dark:text-sky-100">{syl}</span>
                                {/* Wheels */}
                                <div className="absolute -bottom-3 left-3 w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                                <div className="absolute -bottom-3 right-3 w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                                {/* Connector */}
                                {sIdx > 0 && <div className="absolute top-1/2 -left-2.5 w-3 h-2 bg-zinc-800 rounded-full"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="relative bg-white dark:bg-zinc-800 rounded-xl border-4 border-zinc-200 dark:border-zinc-600 overflow-hidden shadow-inner" style={{ height: data.height }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="none">
                {data.paths.map((path, idx) => (
                    <path 
                        key={idx} 
                        d={path.d} 
                        fill="none" 
                        stroke={path.color} 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        className="opacity-60 hover:opacity-100 hover:stroke-[8px] transition-all cursor-pointer"
                        style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
                    />
                ))}
            </svg>
            
            {/* Start Points */}
            <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-around px-4 py-4 h-full">
                {data.paths.map((path, idx) => (
                    <div key={`start-${idx}`} className="w-10 h-10 rounded-full bg-white border-4 flex items-center justify-center font-bold shadow-md z-10 text-lg transform hover:scale-110 transition-transform" style={{ borderColor: path.color, color: path.color }}>
                        {path.startLabel}
                    </div>
                ))}
            </div>
            
            {/* End Points */}
            <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-around px-4 py-4 h-full">
                {Array.from({length: data.paths.length}).map((_, i) => {
                    const label = String.fromCharCode(65 + i);
                    return (
                        <div key={`end-${i}`} className="w-10 h-10 rounded-lg bg-zinc-100 border-2 border-zinc-400 flex items-center justify-center font-bold shadow-md z-10 text-zinc-600 text-lg">
                            {label}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.items?.map((item, idx) => (
                <div key={idx} className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                    {item.imageBase64 ? (
                        <div className="mr-4 flex-shrink-0">
                            <ImageDisplay base64={item.imageBase64} description={item.correct} className="w-20 h-20 rounded-lg object-cover border" />
                        </div>
                    ) : (
                        <div className="mr-4 flex-shrink-0 w-20 h-20 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                            <i className="fa-solid fa-font text-2xl"></i>
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg mb-3 text-center border border-zinc-200">
                            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] inline-block" style={{ direction: 'rtl', unicodeBidi: 'bidi-override' }}>
                                {item.reversed}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-pen text-zinc-300 text-xs"></i>
                            <div className="border-b-2 border-dashed border-zinc-400 dark:border-zinc-600 h-8 w-full"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
