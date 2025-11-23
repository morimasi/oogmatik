
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData } from '../../types';
import { ImageDisplay, PedagogicalHeader } from './common';

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 leading-loose text-2xl font-medium font-dyslexic">
            {data.text.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="mb-6">
                    {para.sentences.map((sentence, sIdx) => (
                        <React.Fragment key={sIdx}>
                            {sentence.syllables.map((syl, sylIdx) => (
                                <span key={sylIdx} style={{ color: syl.color }}>{syl.text}</span>
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
                <div key={rIdx} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-700/50 rounded-lg border-2 border-zinc-100 dark:border-zinc-600 text-3xl font-dyslexic tracking-[0.5em]">
                    <div className="flex-1 text-center">
                        {row.letters.join('  ')}
                    </div>
                    <div className="w-12 h-12 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center text-sm text-zinc-400 ml-4">
                        {/* Placeholder for user count */}
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
        <div className="grid grid-cols-5 gap-6 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
            {data.grid.items.map((item, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center border border-zinc-100 dark:border-zinc-700 rounded-lg">
                    {item.type === 'color' ? (
                        <div className="w-12 h-12 rounded-full border-2 border-zinc-200" style={{ backgroundColor: item.value }}></div>
                    ) : item.type === 'icon' ? (
                        <span className="text-4xl">{item.value}</span>
                    ) : (
                        <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-200">{item.value}</span>
                    )}
                </div>
            ))}
        </div>
        <div className="mt-8 flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-blue-800 dark:text-blue-200 font-bold"><i className="fa-solid fa-stopwatch mr-2"></i>Süre:</span>
            <div className="w-32 h-8 border-b-2 border-blue-300 dark:border-blue-700"></div>
        </div>
    </div>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.exercises.map((ex, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 flex flex-col items-center text-center">
                    <div className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">{ex.word}</div>
                    <p className="mb-4 text-zinc-600 dark:text-zinc-300">{ex.question}</p>
                    
                    {ex.type === 'syllable-counting' && (
                        <div className="flex gap-4 mt-auto">
                            {(ex.options as number[]).map(opt => (
                                <div key={opt} className="w-10 h-10 rounded-full border-2 border-zinc-300 flex items-center justify-center font-bold cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 transition-colors">
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        <div className="mb-6 flex justify-center items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-800 dark:text-amber-200">Hedef:</span>
            <span className="text-4xl font-bold text-amber-600">{data.targetPair.split('/')[0]}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {data.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-around items-center border-b border-dashed border-zinc-200 dark:border-zinc-700 last:border-0 pb-4 last:pb-0">
                    {row.items.map((item, iIdx) => (
                        <div 
                            key={iIdx} 
                            className="w-12 h-12 flex items-center justify-center text-3xl font-bold cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                            style={{ 
                                transform: `rotate(${item.rotation}deg) scaleX(${item.isMirrored ? -1 : 1})`,
                                color: item.isMirrored ? '#ef4444' : '#22c55e' // Visual hint for dev/debug (remove colors in prod if needed hard)
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
        <div className="space-y-12">
            {data.trains.map((train, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800">
                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-xl border-2 border-sky-200 flex items-center justify-center shrink-0 shadow-sm">
                        <ImageDisplay base64={train.imageBase64} description={train.word} className="w-16 h-16" />
                    </div>
                    
                    <div className="flex items-center flex-wrap gap-1">
                        {/* Locomotive */}
                        <div className="relative h-16 min-w-[60px] bg-sky-500 rounded-l-lg rounded-r-md flex items-center justify-center text-white shadow-md mr-1">
                            <i className="fa-solid fa-train text-2xl"></i>
                            <div className="absolute -bottom-2 left-2 w-3 h-3 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 right-2 w-3 h-3 bg-black rounded-full"></div>
                        </div>
                        
                        {/* Wagons */}
                        {train.syllables.map((syl, sIdx) => (
                            <div key={sIdx} className="relative h-16 min-w-[80px] px-4 bg-white dark:bg-zinc-700 border-2 border-sky-400 rounded-md flex items-center justify-center shadow-md">
                                <span className="text-2xl font-bold text-sky-900 dark:text-sky-100">{syl}</span>
                                {/* Wheels */}
                                <div className="absolute -bottom-2 left-2 w-3 h-3 bg-black rounded-full"></div>
                                <div className="absolute -bottom-2 right-2 w-3 h-3 bg-black rounded-full"></div>
                                {/* Connector */}
                                {sIdx > 0 && <div className="absolute top-1/2 -left-2 w-2 h-1 bg-black"></div>}
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
        
        <div className="relative bg-white dark:bg-zinc-800 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden" style={{ height: data.height }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="none">
                {data.paths.map((path, idx) => (
                    <path 
                        key={idx} 
                        d={path.d} 
                        fill="none" 
                        stroke={path.color} 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        className="opacity-70 hover:opacity-100 hover:stroke-[6px] transition-all cursor-pointer"
                    />
                ))}
            </svg>
            
            {/* Labels */}
            <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-around px-2 py-4 h-full">
                {data.paths.map((path, idx) => (
                    <div key={`start-${idx}`} className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold shadow-sm z-10" style={{ borderColor: path.color, color: path.color }}>
                        {path.startLabel}
                    </div>
                ))}
            </div>
            
            <div className="absolute top-0 bottom-0 right-0 flex flex-col justify-around px-2 py-4 h-full">
                {Array.from({length: data.paths.length}).map((_, i) => {
                    const label = String.fromCharCode(65 + i);
                    return (
                        <div key={`end-${i}`} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-zinc-400 flex items-center justify-center font-bold shadow-sm z-10 text-zinc-600">
                            {label}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);
