
import React from 'react';
import { 
    ReadingFlowData, 
    LetterDiscriminationData, 
    RapidNamingData, 
    PhonologicalAwarenessData, 
    MirrorLettersData, 
    SyllableTrainData, 
    VisualTrackingLineData, 
    BackwardSpellingData, 
    CodeReadingData, 
    AttentionToQuestionData, 
    HandwritingPracticeData, 
    PseudowordReadingData, 
    MorphologicalAnalysisData 
} from '../../types';
import { ImageDisplay, PedagogicalHeader, DyslexicText, HandwritingGuide, TracingText } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- PSEUDOWORD READING SHEET (PROFESSIONAL CLINIC VERSION) ---
export const PseudowordReadingSheet: React.FC<{ data: PseudowordReadingData }> = ({ data }) => {
    const words = data.words || [];
    const { columns = 4, fontSize = 24 } = data.settings || {};
    
    return (
        <div className="flex flex-col h-full bg-white font-sans">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Professional Grid Layout */}
            <div 
                className="flex-1 grid gap-x-4 gap-y-6 mt-8 content-start px-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
                {words.map((word, i) => (
                    <EditableElement key={i} className="flex items-center gap-4 group">
                        <span className="text-[10px] font-mono text-zinc-300 w-4 border-r border-zinc-100">{i + 1}</span>
                        <div className="flex-1">
                            <DyslexicText 
                                text={word} 
                                mode={data.visualMode || 'standard'} 
                                className={`font-black tracking-[0.1em] text-zinc-900 uppercase`}
                                style={{ fontSize: `${fontSize}px` }}
                            />
                        </div>
                        {/* Scoring checkmarks (for physical use) */}
                        <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity no-print">
                            <div className="w-3 h-3 rounded-full border border-green-500"></div>
                            <div className="w-3 h-3 rounded-full border border-red-500"></div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Professional Assessment Footer */}
            {data.scoringTable && (
                <div className="mt-auto pt-8 border-t-4 border-zinc-900 break-inside-avoid">
                    <div className="grid grid-cols-4 gap-8 bg-zinc-50 p-6 rounded-[2.5rem] border-2 border-zinc-200 shadow-inner">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Toplam Süre</span>
                            <div className="h-10 border-b-2 border-zinc-800 flex items-end pb-1 font-mono font-bold text-xl text-zinc-400">____ : ____</div>
                            <p className="text-[8px] text-zinc-400 italic">Hız (RAN) Analizi</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Hata Adedi</span>
                            <div className="h-10 border-b-2 border-zinc-800 flex items-end pb-1 font-mono font-bold text-xl text-zinc-400">/ {words.length}</div>
                            <p className="text-[8px] text-zinc-400 italic">Doğruluk Oranı</p>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Klinik Gözlem Notları</span>
                            <div className="h-10 border-b-2 border-zinc-300 border-dashed"></div>
                            <div className="h-6 border-b-2 border-zinc-300 border-dashed"></div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center text-[8px] text-zinc-300 font-bold uppercase tracking-[0.5em]">
                        <span>Bursa Disleksi AI • Fonolojik Kod Çözme Bataryası</span>
                        <div className="flex gap-1">
                             <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                             <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MORPHOLOGICAL ANALYSIS SHEET ---
export const MorphologicalAnalysisSheet: React.FC<{ data: MorphologicalAnalysisData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white font-sans text-black">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 space-y-12 mt-6 content-start px-4">
                {(data.rootSets || []).map((set, i) => (
                    <div key={i} className="break-inside-avoid relative">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-zinc-900 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl ring-8 ring-zinc-50 uppercase">
                                {set.root}
                            </div>
                            <div className="flex-1 border-b-4 border-zinc-900 pb-2">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">TEMEL ANLAM</span>
                                <p className="text-xl font-bold italic"><EditableText value={set.meaning} tag="span" /></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-zinc-50 rounded-[2.5rem] p-8 border-2 border-dashed border-zinc-200">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <i className="fa-solid fa-boxes-stacked"></i> MİMARİ PARÇALAR (EKLER)
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {set.suffixes.map((s, si) => (
                                        <div key={si} className="px-6 py-3 bg-white border-2 border-zinc-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-default">
                                            {s.text}
                                        </div>
                                    ))}
                                    {set.distractors?.map((d, di) => (
                                        <div key={di} className="px-6 py-3 bg-zinc-200 border-2 border-zinc-400 rounded-xl font-bold text-xl text-zinc-500 opacity-50">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">İNŞA EDİLEN KELİMELER</h4>
                                {set.correctDerivations.map((d, di) => (
                                    <EditableElement key={di} className="flex flex-col p-4 bg-white border-2 border-zinc-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xl font-black text-indigo-600 uppercase tracking-tight">{d.word}</span>
                                            <div className="w-6 h-6 rounded-full border-2 border-zinc-200"></div>
                                        </div>
                                        <p className="text-xs text-zinc-500 italic"><EditableText value={d.meaning} tag="span" /></p>
                                    </EditableElement>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-8 text-center border-t border-zinc-100">
                <p className="text-[8px] text-zinc-300 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Morfolojik Analiz Atölyesi</p>
            </div>
        </div>
    );
};

// ... ReadingFlow, RapidNaming, vb. aynı kalır ...
export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="prose max-w-none mt-4">
            {data.text?.paragraphs?.map((p, i) => (
                <p key={i} className="text-xl leading-relaxed">
                    {p.sentences.map((s, j) => (
                        <span key={j}>{s.syllables.map(syl => syl.text).join('')} </span>
                    ))}
                </p>
            ))}
        </div>
    </div>
);

export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-4 mt-6">
            {data.rows?.map((row, i) => (
                <div key={i} className="flex justify-between text-2xl font-mono border-b pb-2">
                    {row.letters.map((l, j) => <span key={j} className="px-2">{l}</span>)}
                </div>
            ))}
        </div>
    </div>
);

export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-5 gap-6 mt-8">
            {data.grid?.flatMap(row => row.items).map((item, i) => (
                <div key={i} className="aspect-square flex items-center justify-center bg-zinc-50 border-2 border-zinc-200 rounded-xl text-3xl">
                    {item.value}
                </div>
            ))}
        </div>
    </div>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 mt-6">
            {data.exercises?.map((ex, i) => (
                <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <p className="font-bold text-lg mb-2">{ex.question}</p>
                    <div className="flex gap-4">
                        <span className="text-2xl font-black text-indigo-600">{ex.word}</span>
                        <div className="flex-1 border-b-2 border-dashed border-zinc-300"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-6 mt-8">
            {data.rows?.map((row, i) => (
                <div key={i} className="flex justify-around text-4xl font-mono bg-zinc-50 p-4 rounded-xl">
                    {row.items.map((item, j) => (
                        <span key={j} style={{ transform: `rotate(${item.rotation}deg) ${item.isMirrored ? 'scaleX(-1)' : ''}` }}>
                            {item.letter}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-12 mt-12">
            {data.trains?.map((train, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <div className="w-12 h-12 bg-zinc-900 text-white rounded-lg flex items-center justify-center"><i className="fa-solid fa-train"></i></div>
                    {train.syllables.map((syl, j) => (
                        <div key={j} className="flex-1 h-12 border-4 border-zinc-800 rounded-xl flex items-center justify-center font-bold text-xl">
                            {syl}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-8 mt-10">
            {data.items?.map((item, i) => (
                <div key={i} className="p-6 border-4 border-zinc-200 rounded-3xl text-center">
                    <span className="text-3xl font-black tracking-widest text-zinc-400">{item.reversed}</span>
                    <div className="mt-4 h-10 border-b-4 border-zinc-800 border-dashed"></div>
                </div>
            ))}
        </div>
    </div>
);

export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="bg-zinc-50 p-6 rounded-3xl border-2 mb-8 flex justify-center gap-6">
            {data.keyMap?.map((k, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-2xl" style={{ color: k.color }}>{k.symbol}</span>
                    <span className="font-bold border-t-2 border-zinc-300 pt-1">{k.value}</span>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6">
            {data.codesToSolve?.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-2 rounded-2xl">
                    <div className="flex gap-2 text-2xl">
                        {c.sequence.map((s, j) => <span key={j}>{s}</span>)}
                    </div>
                    <i className="fa-solid fa-arrow-right text-zinc-300"></i>
                    <div className="flex-1 h-10 border-b-2 border-dashed border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {data.subType === 'letter-cancellation' && (
            <div className="font-mono text-2xl tracking-[0.5em] leading-loose text-center mt-10">
                {data.grid?.map((row, i) => <div key={i}>{row.join('')}</div>)}
            </div>
        )}
    </div>
);

export const HandwritingPracticeSheet: React.FC<{ data: HandwritingPracticeData }> = ({ data }) => (
    <div className="p-4">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-4 mt-8">
            {data.lines?.map((line, i) => (
                <HandwritingGuide key={i} height={80}>
                    {line.type === 'trace' ? <TracingText text={line.text} fontSize="40px" /> : null}
                </HandwritingGuide>
            ))}
        </div>
    </div>
);
