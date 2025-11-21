
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData } from '../../types';
import { PedagogicalHeader } from './common';

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
