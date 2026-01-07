
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, HandwritingPracticeData, LetterVisualMatchingData, SyllableMasterLabData } from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape, GridComponent, DyslexicText, HandwritingGuide, TracingText } from './common';
import { EditableElement, EditableText } from '../Editable';

// Helper for simple sheets
const SimpleSheet = ({ data, children }: { data: any, children?: React.ReactNode }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} data={data} />
        {children || <div className="p-8 text-center text-zinc-500 italic">İçerik yüklendi.</div>}
    </div>
);

// --- SYLLABLE MASTER LAB (POLYMORPHIC - COMPACT MOD) ---
export const SyllableMasterLabSheet: React.FC<{ data: SyllableMasterLabData }> = ({ data }) => {
    const { mode, items } = data;

    const renderItem = (item: any, idx: number) => {
        const isSplit = mode === 'split';
        const isCombine = mode === 'combine';
        const isComplete = mode === 'complete';
        const isRainbow = mode === 'rainbow';
        const isScrambled = mode === 'scrambled';

        return (
            <EditableElement key={idx} className="flex flex-col gap-1 p-2 border-[1.5px] border-zinc-900 rounded-[1.2rem] bg-white group hover:border-indigo-500 transition-all shadow-sm break-inside-avoid relative overflow-hidden">
                <div className="flex-1">
                    {/* MODE: SPLIT */}
                    {isSplit && (
                        <div className="flex flex-col gap-1.5">
                            <h4 className="text-base font-black tracking-widest text-zinc-800 uppercase text-center">{item.word}</h4>
                            <div className="flex gap-1 justify-center">
                                {item.syllables.map((_:string, sIdx:number) => (
                                    <div key={sIdx} className="w-8 h-7 border-[1.5px] border-zinc-900 rounded-md flex items-center justify-center bg-zinc-50">
                                        <div className="w-3 h-0.5 bg-zinc-200"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MODE: COMBINE */}
                    {isCombine && (
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="flex gap-0.5 flex-wrap justify-center">
                                {item.syllables.map((s:string, sIdx:number) => (
                                    <div key={sIdx} className="px-1.5 py-0.5 bg-zinc-900 text-white rounded-md font-black text-[10px]">
                                        <EditableText value={s} tag="span" />
                                    </div>
                                ))}
                            </div>
                            <div className="w-full h-7 border-b-[1.5px] border-dashed border-zinc-300 bg-zinc-50 rounded-t-md"></div>
                        </div>
                    )}

                    {/* MODE: COMPLETE */}
                    {isComplete && (
                        <div className="flex items-center justify-center gap-0.5 py-1">
                             {item.syllables.map((s:string, sIdx:number) => {
                                 const isMissing = sIdx === item.missingIndex;
                                 return (
                                     <div key={sIdx} className={`px-1.5 py-1 rounded-md font-black text-xs border-[1.5px] ${isMissing ? 'border-dashed border-indigo-400 bg-indigo-50 text-transparent' : 'border-zinc-900 bg-white text-zinc-800'}`}>
                                         {isMissing ? '..' : <EditableText value={s} tag="span" />}
                                     </div>
                                 );
                             })}
                        </div>
                    )}

                    {/* MODE: RAINBOW */}
                    {isRainbow && (
                        <div className="flex items-center justify-center gap-0.5 flex-wrap py-1">
                            {item.syllables.map((s:string, sIdx:number) => {
                                // Yüksek kontrastlı klinik renk paleti
                                const colors = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];
                                const color = colors[sIdx % colors.length];
                                return (
                                    <div key={sIdx} className="px-2 py-1 rounded-md border-[2px] shadow-sm" style={{ backgroundColor: `${color}33`, borderColor: color }}>
                                        <span className="text-base font-black tracking-tight" style={{ color: color }}>
                                            <EditableText value={s} tag="span" />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* MODE: SCRAMBLED */}
                    {isScrambled && (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-0.5 flex-wrap justify-center">
                                {item.scrambledIndices?.map((origIdx: number) => (
                                    <div key={origIdx} className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded-full font-bold text-[9px] text-zinc-600 shadow-xs">
                                        <EditableText value={item.syllables[origIdx]} tag="span" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-0.5 px-1">
                                {item.syllables.map((_:string, i:number) => (
                                    <div key={i} className="flex-1 h-5 border-b-[1.5px] border-zinc-900 bg-zinc-50/50"></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </EditableElement>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white font-lexend p-1">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 content-start">
                {items.map((item, i) => renderItem(item, i))}
            </div>
            <div className="mt-auto pt-2 border-t border-zinc-100 flex justify-between items-center px-4 opacity-40">
                <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Hece Laboratuvarı v4.1 (Yazım Denetimli)</p>
            </div>
        </div>
    );
};

// Added missing LetterVisualMatchingSheet component
export const LetterVisualMatchingSheet: React.FC<{ data: LetterVisualMatchingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="grid grid-cols-2 gap-4 mt-4">
            {(data.pairs || []).map((pair, idx) => (
                <EditableElement key={idx} className="p-4 border-2 border-zinc-200 rounded-xl flex items-center gap-4 bg-white shadow-sm">
                    <div className="w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center text-4xl font-black text-indigo-600">
                        <EditableText value={pair.letter} tag="span" />
                    </div>
                    <div className="flex-1">
                        <ImageDisplay prompt={pair.imagePrompt} className="w-full h-24 mb-2" />
                        <div className="h-6 border-b border-zinc-300 border-dashed"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing ReadingFlowSheet component
export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="p-6 bg-white border-2 border-zinc-100 rounded-2xl shadow-sm">
            {(data.text?.paragraphs || []).map((p, pIdx) => (
                <div key={pIdx} className="mb-6 last:mb-0">
                    {(p.sentences || []).map((s, sIdx) => (
                        <p key={sIdx} className="text-xl leading-loose font-dyslexic text-zinc-800 mb-2">
                            {(s.syllables || []).map((syl, sylIdx) => (
                                <span key={sylIdx} className="hover:text-indigo-600 cursor-pointer">{syl.text}</span>
                            ))}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing PhonologicalAwarenessSheet component
export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4 mt-4">
            {(data.exercises || []).map((ex, idx) => (
                <EditableElement key={idx} className="p-4 border-2 border-zinc-200 rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div className="flex-1">
                        <p className="font-bold text-lg text-zinc-800"><EditableText value={ex.question} tag="span" /></p>
                        <p className="text-sm text-zinc-500 font-mono mt-1">Kelime: {ex.word}</p>
                    </div>
                    <div className="w-32 h-10 border-b-2 border-zinc-300 border-dashed bg-zinc-50"></div>
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing RapidNamingSheet component
export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="grid grid-cols-1 gap-6 mt-6">
            {(data.grid || []).map((row, rIdx) => (
                <div key={rIdx} className="flex justify-around items-center p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100">
                    {row.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex flex-col items-center">
                            <span className="text-4xl">{item.value}</span>
                            {item.label && <span className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">{item.label}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing LetterDiscriminationSheet component
export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="mt-4 p-4 border-2 border-zinc-200 rounded-2xl bg-white shadow-sm overflow-x-auto">
            <div className="mb-4 flex gap-4 justify-center">
                <span className="text-xs font-bold text-zinc-400 uppercase">Hedefler:</span>
                {(data.targetLetters || []).map((l, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-black text-lg">{l}</span>
                ))}
            </div>
            <div className="font-mono text-2xl tracking-[0.4em] leading-loose text-center">
                {(data.rows || []).map((row, i) => (
                    <div key={i} className="mb-2 border-b border-zinc-50 pb-1">{row.letters.join('')}</div>
                ))}
            </div>
        </div>
    </SimpleSheet>
);

// Added missing MirrorLettersSheet component
export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="mt-4 text-center mb-6">
            <span className="px-6 py-2 bg-rose-100 text-rose-700 rounded-full font-black text-xl border-2 border-rose-200">Hedef Çift: {data.targetPair}</span>
        </div>
        <div className="space-y-4">
            {(data.rows || []).map((row, i) => (
                <div key={i} className="flex justify-around items-center p-4 border-2 border-zinc-100 rounded-2xl bg-zinc-50">
                    {row.items.map((item, j) => (
                        <div 
                            key={j} 
                            className="text-4xl font-black text-zinc-800"
                            style={{ transform: `rotate(${item.rotation}deg) ${item.isMirrored ? 'scaleX(-1)' : ''}` }}
                        >
                            {item.letter}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing SyllableTrainSheet component
export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-8 mt-6">
            {(data.trains || []).map((train, i) => (
                <div key={i} className="flex items-center gap-2 overflow-x-auto pb-4">
                    <div className="w-16 h-16 bg-zinc-900 rounded-l-2xl flex items-center justify-center text-white text-2xl shrink-0 shadow-lg">
                        <i className="fa-solid fa-train"></i>
                    </div>
                    {train.syllables.map((syl, j) => (
                        <div key={j} className="flex items-center gap-1 shrink-0">
                            <div className="w-20 h-16 bg-white border-2 border-zinc-800 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                                <EditableText value={syl} tag="span" />
                            </div>
                            {j < train.syllables.length - 1 && <div className="w-4 h-1 bg-zinc-400"></div>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing VisualTrackingLinesSheet component
export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="mt-4 relative bg-white border-2 border-zinc-200 rounded-[2.5rem] p-8 shadow-inner overflow-hidden aspect-video">
            <svg viewBox={`0 0 ${data.width} ${data.height}`} className="w-full h-full overflow-visible">
                {data.paths.map((path) => (
                    <g key={path.id}>
                        <path 
                            d={path.d} 
                            fill="none" 
                            stroke={path.color} 
                            strokeWidth={path.strokeWidth} 
                            strokeLinecap="round"
                            opacity="0.6"
                        />
                        {/* Start Node */}
                        <circle cx="20" cy={path.id * 50 + 20} r="12" fill="white" stroke={path.color} strokeWidth="2" />
                        <text x="20" y={path.id * 50 + 24} textAnchor="middle" fontSize="10" fontWeight="bold">{path.startLabel || path.id}</text>
                        {/* End Node placeholder */}
                        <circle cx={data.width - 20} cy={path.id * 40 + 60} r="15" fill="none" stroke="#e5e7eb" strokeDasharray="4 2" />
                    </g>
                ))}
            </svg>
        </div>
    </SimpleSheet>
);

// Added missing BackwardSpellingSheet component
export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {(data.items || []).map((item, i) => (
                <EditableElement key={i} className="p-4 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm flex flex-col gap-3">
                    <p className="text-xl font-black text-zinc-900 text-center tracking-widest bg-zinc-50 py-3 rounded-xl border border-zinc-200">
                        <EditableText value={item.original} tag="span" />
                    </p>
                    <div className="h-10 border-b-2 border-zinc-300 border-dashed text-center flex items-center justify-center text-zinc-200 font-bold">
                        Geriye Doğru Yaz
                    </div>
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing CodeReadingSheet component
export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="bg-zinc-50 p-6 rounded-3xl border-2 border-zinc-200 mb-8 mt-4">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Şifre Anahtarı</h4>
            <div className="flex flex-wrap gap-4 justify-center">
                {(data.keyMap || []).map((m, i) => (
                    <div key={i} className="flex flex-col items-center p-2 bg-white border border-zinc-200 rounded-xl shadow-sm min-w-[50px]">
                        <span className="text-2xl" style={{ color: m.color }}>{m.symbol}</span>
                        <div className="w-full h-px bg-zinc-100 my-1"></div>
                        <span className="font-black text-lg">{m.value}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="space-y-6">
            {(data.codesToSolve || []).map((code, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {code.sequence.map((sym, j) => (
                            <div key={j} className="w-10 h-10 border-2 border-zinc-800 rounded-lg flex items-center justify-center text-xl bg-white shadow-sm">
                                {sym}
                            </div>
                        ))}
                    </div>
                    <i className="fa-solid fa-arrow-right text-zinc-300"></i>
                    <div className="flex-1 h-10 border-b-2 border-zinc-800 border-dashed"></div>
                </div>
            ))}
        </div>
    </SimpleSheet>
);

// Added missing AttentionToQuestionSheet component
export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => (
    <SimpleSheet data={data}>
        {data.subType === 'letter-cancellation' && data.grid && (
            <div className="mt-4">
                <div className="mb-4 flex gap-4 justify-center">
                    <span className="text-xs font-bold text-zinc-400">Aranacaklar:</span>
                    {data.targetChars?.map((c, i) => <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full font-black">{c}</span>)}
                </div>
                <GridComponent grid={data.grid} />
            </div>
        )}
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-sm text-amber-800">
            Hata kontrolü yapmayı unutma!
        </div>
    </SimpleSheet>
);

// Added missing HandwritingPracticeSheet component
export const HandwritingPracticeSheet: React.FC<{ data: HandwritingPracticeData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-10 mt-6">
            {(data.lines || []).map((line, i) => (
                <div key={i} className="flex gap-4 items-start break-inside-avoid">
                    {line.imagePrompt && (
                        <div className="w-16 h-16 shrink-0 border rounded-lg bg-zinc-50 overflow-hidden">
                            <ImageDisplay prompt={line.imagePrompt} className="w-full h-full" />
                        </div>
                    )}
                    <div className="flex-1">
                        <HandwritingGuide height={80}>
                            {line.type === 'trace' ? (
                                <TracingText text={line.text} fontSize="40px" />
                            ) : line.type === 'copy' ? (
                                <span className="text-4xl font-handwriting opacity-80 pl-2">{line.text}</span>
                            ) : null}
                        </HandwritingGuide>
                        <div className="mt-2 opacity-30"><HandwritingGuide height={80} /></div>
                    </div>
                </div>
            ))}
        </div>
    </SimpleSheet>
);
