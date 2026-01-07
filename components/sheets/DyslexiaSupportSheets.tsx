
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
                                // High contrast pedagogical colors
                                const colors = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed'];
                                const color = colors[sIdx % colors.length];
                                return (
                                    <div key={sIdx} className="px-2 py-1 rounded-md border-[1.5px] border-zinc-900 shadow-sm" style={{ backgroundColor: `${color}15`, borderColor: color }}>
                                        <span className="text-base font-black tracking-tight" style={{ color }}>
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
                <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Hece Laboratuvarı v4.0 (Yoğun)</p>
            </div>
        </div>
    );
};

// --- LETTER VISUAL MATCHING ---
/**
 * Fix: Added LetterVisualMatchingSheet implementation
 */
export const LetterVisualMatchingSheet: React.FC<{ data: LetterVisualMatchingData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {(data.pairs || []).map((pair, idx) => (
                    <EditableElement key={idx} className="bg-white border-2 border-zinc-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-20 h-20 bg-zinc-50 rounded-2xl overflow-hidden shrink-0">
                            <ImageDisplay prompt={pair.imagePrompt} base64={pair.imageBase64} description={pair.word} className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-3xl font-black text-indigo-600 mb-1">
                                <EditableText value={pair.letter} tag="span" />
                            </h4>
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-100 pt-1">
                                <EditableText value={pair.word} tag="span" />
                            </p>
                        </div>
                    </EditableElement>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- READING FLOW ---
/**
 * Fix: Added ReadingFlowSheet implementation
 */
export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="mt-8 bg-white border-2 border-zinc-50 p-8 rounded-[3rem] shadow-sm leading-[2.8] text-2xl font-dyslexic text-zinc-800">
                {(data.text?.paragraphs || []).map((para, pIdx) => (
                    <div key={pIdx} className="mb-8 last:mb-0">
                        {para.sentences.map((sent, sIdx) => (
                            <span key={sIdx} className="mr-2">
                                {sent.syllables.map((syl, syIdx) => (
                                    <span 
                                        key={syIdx} 
                                        className={`px-0.5 rounded ${syIdx % 2 === 0 ? 'text-indigo-600' : 'text-rose-500'} font-bold`}
                                    >
                                        <EditableText value={syl.text} tag="span" />
                                    </span>
                                ))}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- PHONOLOGICAL AWARENESS ---
/**
 * Fix: Added PhonologicalAwarenessSheet implementation
 */
export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="space-y-6 mt-8">
                {(data.exercises || []).map((ex, idx) => (
                    <EditableElement key={idx} className="p-6 bg-zinc-50 rounded-2xl border-2 border-white shadow-sm flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-zinc-100">
                            <i className="fa-solid fa-ear-listen"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-bold text-zinc-800 mb-2">
                                <EditableText value={ex.question} tag="span" />
                            </p>
                            <div className="w-full h-10 border-b-2 border-dashed border-zinc-300"></div>
                        </div>
                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black text-sm uppercase hidden print:block">
                            {ex.word}
                        </div>
                    </EditableElement>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- RAPID NAMING ---
/**
 * Fix: Added RapidNamingSheet implementation
 */
export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="grid gap-4 mt-8">
                {(data.grid || []).map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-between items-center gap-4">
                        {row.items.map((item, iIdx) => (
                            <EditableElement key={iIdx} className="flex-1 aspect-square bg-white border-2 border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm hover:border-indigo-400 transition-all">
                                {item.type === 'object' ? (
                                    <ImageDisplay prompt={item.value} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl font-black text-zinc-900" style={{ color: item.type === 'color' ? item.value : undefined }}>
                                        <EditableText value={item.label || item.value} tag="span" />
                                    </span>
                                )}
                            </EditableElement>
                        ))}
                    </div>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- LETTER DISCRIMINATION ---
/**
 * Fix: Added LetterDiscriminationSheet implementation
 */
export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="bg-white border-2 border-zinc-100 rounded-[2rem] p-8 shadow-sm mt-8">
                <div className="flex gap-4 mb-8 justify-center">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Aranacaklar:</span>
                    {(data.targetLetters || []).map((l, i) => (
                        <span key={i} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">{l}</span>
                    ))}
                </div>
                <div className="space-y-4">
                    {(data.rows || []).map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-center gap-4 font-mono text-2xl tracking-[0.4em] font-bold text-zinc-700 hover:bg-zinc-50 transition-colors py-2 rounded-lg">
                            {(row.letters || []).map((l, lIdx) => (
                                <span key={lIdx} className="hover:text-indigo-600 cursor-default select-none">{l}</span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </SimpleSheet>
    );
};

// --- MIRROR LETTERS ---
/**
 * Fix: Added MirrorLettersSheet implementation
 */
export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="mt-8 space-y-6">
                <div className="flex justify-center mb-10">
                    <div className="px-8 py-3 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl flex items-center gap-4">
                        <span className="text-xs uppercase opacity-60">Hedef:</span>
                        {data.targetPair}
                    </div>
                </div>
                {(data.rows || []).map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-around items-center p-6 bg-white border-2 border-zinc-50 rounded-[2rem] shadow-sm">
                        {row.items.map((item, iIdx) => (
                            <EditableElement key={iIdx} className="flex flex-col items-center gap-3 group">
                                <div 
                                    className="text-5xl font-black text-zinc-900 transition-transform duration-500 group-hover:scale-110"
                                    style={{ transform: `rotate(${item.rotation}deg) ${item.isMirrored ? 'scaleX(-1)' : ''}` }}
                                >
                                    <EditableText value={item.letter} tag="span" />
                                </div>
                                <div className="w-6 h-6 border-2 border-zinc-200 rounded-full group-hover:border-indigo-500 transition-colors"></div>
                            </EditableElement>
                        ))}
                    </div>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- SYLLABLE TRAIN ---
/**
 * Fix: Added SyllableTrainSheet implementation
 */
export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="space-y-12 mt-12">
                {(data.trains || []).map((train, tIdx) => (
                    <div key={tIdx} className="flex items-end gap-1 overflow-x-auto pb-4 px-4">
                        <div className="w-24 h-20 bg-zinc-900 rounded-l-3xl rounded-tr-xl shrink-0 flex items-center justify-center text-white relative">
                            <i className="fa-solid fa-train text-3xl"></i>
                            <div className="absolute -bottom-4 left-4 flex gap-4">
                                <div className="w-6 h-6 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                                <div className="w-6 h-6 bg-zinc-800 rounded-full border-2 border-zinc-600"></div>
                            </div>
                        </div>
                        {train.syllables.map((syl, sIdx) => (
                            <div key={sIdx} className="w-24 h-20 bg-indigo-50 border-2 border-zinc-900 rounded-xl flex items-center justify-center relative shrink-0">
                                <span className="text-xl font-black text-indigo-700">
                                    <EditableText value={syl} tag="span" />
                                </span>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                                     <div className="w-6 h-6 bg-zinc-100 rounded-full border-2 border-zinc-300"></div>
                                </div>
                                {sIdx < train.syllables.length - 1 && <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-1 bg-zinc-900"></div>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- VISUAL TRACKING LINES ---
/**
 * Fix: Added VisualTrackingLinesSheet implementation
 */
export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="mt-8 flex flex-col items-center justify-center">
                <div className="relative border-4 border-zinc-900 rounded-3xl bg-white p-4 shadow-xl overflow-hidden" style={{ width: data.width || 600, height: data.height || 400 }}>
                    <svg viewBox={`0 0 ${data.width || 600} ${data.height || 400}`} className="w-full h-full">
                        {(data.paths || []).map((path, i) => (
                            <path 
                                key={path.id} 
                                d={path.d} 
                                stroke={path.color} 
                                strokeWidth={path.strokeWidth || 3} 
                                fill="none" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            />
                        ))}
                    </svg>
                    {/* Node Labels */}
                    {(data.paths || []).map((path) => (
                        <React.Fragment key={`nodes-${path.id}`}>
                            <div className="absolute" style={{ left: 10, top: 10 + (path.id * 50) }}>
                                <span className="bg-zinc-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">{path.startLabel}</span>
                            </div>
                            <div className="absolute" style={{ right: 10, top: 10 + (path.id * 50) }}>
                                <span className="bg-zinc-100 border-2 border-zinc-900 text-zinc-900 w-8 h-8 rounded-lg flex items-center justify-center font-bold">{path.endLabel}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </SimpleSheet>
    );
};

// --- BACKWARD SPELLING ---
/**
 * Fix: Added BackwardSpellingSheet implementation
 */
export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {(data.items || []).map((item, idx) => (
                    <EditableElement key={idx} className="p-6 bg-white border-2 border-zinc-100 rounded-2xl shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-2xl font-black text-indigo-600 tracking-widest uppercase">
                                <EditableText value={item.original} tag="span" />
                            </h4>
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <i className="fa-solid fa-arrow-right-arrow-left"></i>
                            </div>
                        </div>
                        <div className="h-12 border-b-4 border-zinc-800 border-dashed bg-zinc-50 rounded-t flex items-center px-4">
                            <span className="text-zinc-200 font-mono text-xl">Tersten yaz...</span>
                        </div>
                    </EditableElement>
                ))}
            </div>
        </SimpleSheet>
    );
};

// --- CODE READING ---
/**
 * Fix: Added CodeReadingSheet implementation
 */
export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="mt-8 space-y-10">
                {/* Key Map */}
                <div className="p-6 bg-zinc-900 rounded-[2rem] shadow-xl border-4 border-white flex flex-wrap justify-center gap-6">
                    {(data.keyMap || []).map((k, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-3xl shadow-inner" style={{ color: k.color }}>
                                <EditableText value={k.symbol} tag="span" />
                            </div>
                            <span className="text-white font-black text-lg">{k.value}</span>
                        </div>
                    ))}
                </div>
                {/* Challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(data.codesToSolve || []).map((code, idx) => (
                        <div key={idx} className="p-6 bg-white border-2 border-zinc-100 rounded-3xl shadow-sm space-y-6">
                            <div className="flex justify-center gap-3">
                                {code.sequence.map((sym, si) => (
                                    <div key={si} className="text-3xl font-bold p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                        <EditableText value={sym} tag="span" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 h-12 border-b-4 border-indigo-500 bg-indigo-50/30 rounded-t flex items-center justify-center">
                                     <span className="text-indigo-200 text-sm font-bold uppercase tracking-widest">ÇÖZÜM</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SimpleSheet>
    );
};

// --- ATTENTION TO QUESTION ---
/**
 * Fix: Added AttentionToQuestionSheet implementation
 */
export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            {data.subType === 'letter-cancellation' && data.grid && (
                <div className="mt-8 p-6 bg-white border-4 border-zinc-900 rounded-[2.5rem] shadow-xl">
                    <div className="flex justify-center gap-6 mb-8">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Karalanacak:</span>
                        {(data.targetChars || []).map((c, i) => (
                            <span key={i} className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white ring-4 ring-rose-100">{c}</span>
                        ))}
                    </div>
                    <GridComponent grid={data.grid} cellClassName="w-12 h-12 text-2xl font-black font-mono hover:bg-zinc-50 transition-colors" />
                </div>
            )}
            {data.subType === 'path-finding' && data.pathGrid && (
                <div className="mt-8 flex flex-col items-center">
                     <div className="p-4 bg-white border-8 border-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
                        <GridComponent grid={data.pathGrid} cellClassName="w-14 h-14 text-xl border-zinc-200" />
                     </div>
                </div>
            )}
        </SimpleSheet>
    );
};

// --- HANDWRITING PRACTICE ---
/**
 * Fix: Added HandwritingPracticeSheet implementation
 */
export const HandwritingPracticeSheet: React.FC<{ data: HandwritingPracticeData }> = ({ data }) => {
    return (
        <SimpleSheet data={data}>
            <div className="space-y-12 mt-12">
                {(data.lines || []).map((line, idx) => (
                    <EditableElement key={idx} className="flex flex-col gap-4 break-inside-avoid">
                        <div className="flex items-center justify-between">
                             {line.imagePrompt && (
                                <div className="w-20 h-20 bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
                                    <ImageDisplay prompt={line.imagePrompt} description={line.text} className="w-full h-full object-contain" />
                                </div>
                             )}
                             <div className="flex-1 ml-6">
                                 <HandwritingGuide>
                                     {line.type === 'trace' ? (
                                         <TracingText text={line.text} />
                                     ) : line.type === 'copy' ? (
                                         <span className="text-4xl text-zinc-800 font-medium">
                                             <EditableText value={line.text} tag="span" />
                                         </span>
                                     ) : (
                                         <div className="w-full h-full"></div>
                                     )}
                                 </HandwritingGuide>
                             </div>
                        </div>
                        {/* Empty practice line below each sample if it's not an empty line task already */}
                        {line.type !== 'empty' && (
                            <HandwritingGuide height={80}>
                                <div className="w-full h-full"></div>
                            </HandwritingGuide>
                        )}
                    </EditableElement>
                ))}
            </div>
        </SimpleSheet>
    );
};
