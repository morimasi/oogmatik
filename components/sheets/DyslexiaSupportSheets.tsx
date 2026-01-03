
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, HandwritingPracticeData, LetterVisualMatchingData } from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape, GridComponent, DyslexicText, HandwritingGuide, TracingText } from './common';
import { EditableElement, EditableText } from '../Editable';

// Helper for simple sheets
const SimpleSheet = ({ data, children }: { data: any, children?: React.ReactNode }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        {children || <div className="p-8 text-center text-zinc-500 italic">Görsel içerik oluşturuldu.</div>}
    </div>
);

// --- LETTER VISUAL MATCHING (NEW) ---
export const LetterVisualMatchingSheet: React.FC<{ data: LetterVisualMatchingData }> = ({ data }) => {
    const { pairs, settings } = data;
    const shuffledLetters = [...pairs].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col h-full bg-white p-2">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col md:flex-row gap-12 mt-6">
                {/* Visual Anchors Side */}
                <div className="flex-1 grid gap-6" style={{ gridTemplateColumns: `repeat(${settings.gridCols || 2}, 1fr)` }}>
                    {pairs.map((pair, i) => (
                        <EditableElement key={i} className="flex items-center gap-4 p-4 border-2 border-zinc-200 rounded-3xl bg-zinc-50 group hover:border-indigo-400 transition-all shadow-sm">
                            <div className="w-20 h-20 bg-white rounded-2xl p-1 border border-zinc-100 shrink-0 shadow-inner">
                                <ImageDisplay prompt={pair.imagePrompt} description={pair.word} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                {settings.showTracing ? (
                                    <div className="h-10 w-full"><TracingText text={pair.letter} fontSize="40px" /></div>
                                ) : (
                                    <div className="h-4 w-12 border-b-2 border-dashed border-zinc-300"></div>
                                )}
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">{pair.word}</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-400 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all"></div>
                        </EditableElement>
                    ))}
                </div>

                {/* Vertical Divider / Connection Lane */}
                <div className="hidden md:flex flex-col items-center justify-center opacity-10">
                    <div className="w-1 h-full bg-indigo-900 rounded-full"></div>
                </div>

                {/* Letters Target Side */}
                <div className="w-full md:w-32 flex flex-col justify-around gap-4">
                    {shuffledLetters.map((pair, i) => (
                        <EditableElement key={i} className="flex items-center gap-4 justify-end p-4 border-2 border-zinc-100 rounded-2xl hover:border-indigo-300 group transition-all">
                             <div className="w-4 h-4 rounded-full border-2 border-zinc-400 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all"></div>
                             <span className="text-5xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: settings.fontFamily }}>
                                 <EditableText value={pair.letter} tag="span" />
                             </span>
                        </EditableElement>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center px-10">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Harf-Nesne İlişkilendirme v1.0</p>
                <div className="flex gap-4 opacity-20">
                     <i className="fa-solid fa-eye"></i>
                     <i className="fa-solid fa-ear-listen"></i>
                </div>
            </div>
        </div>
    );
};

// --- HANDWRITING PRACTICE ---
export const HandwritingPracticeSheet: React.FC<{ data: HandwritingPracticeData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="space-y-6 mt-4">
            {(data.lines || []).map((line, i) => (
                <EditableElement key={i} className="flex gap-4 items-center break-inside-avoid">
                    {line.imagePrompt && (
                        <div className="w-20 h-20 shrink-0">
                             <ImageDisplay prompt={line.imagePrompt} description={line.text} className="w-full h-full object-contain" />
                        </div>
                    )}
                    
                    <div className="flex-1">
                        <HandwritingGuide height={100}>
                             {line.type === 'trace' ? (
                                 <TracingText text={line.text} />
                             ) : line.type === 'copy' ? (
                                 <div className="text-[60px] font-lexend leading-[100px] text-zinc-400 opacity-50"><EditableText value={line.text} tag="span" /></div>
                             ) : (
                                 // Empty line for writing
                                 null
                             )}
                        </HandwritingGuide>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// --- READING FLOW ---
export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-8">
            {/* Mode 1: Rainbow Syllables */}
            <EditableElement className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b pb-2">Renkli Heceler</h4>
                {data.text.paragraphs.map((p, i) => (
                    <div key={i} className="mb-4">
                        {p.sentences.map((s, j) => (
                            <DyslexicText key={j} text={s.syllables.map(s=>s.text).join('')} mode="rainbow" className="text-lg" />
                        ))}
                    </div>
                ))}
            </EditableElement>

            {/* Mode 2: Bionic Reading */}
            <EditableElement className="bg-zinc-50 p-6 rounded-xl border border-zinc-200">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b pb-2">Odaklı Okuma</h4>
                {data.text.paragraphs.map((p, i) => (
                    <div key={i} className="mb-4">
                        {p.sentences.map((s, j) => (
                            <DyslexicText key={j} text={s.syllables.map(s=>s.text).join('')} mode="bionic" className="text-lg" />
                        ))}
                    </div>
                ))}
            </EditableElement>
        </div>
    </SimpleSheet>
);

export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4 font-mono text-xl">
            {data.rows.map((row, i) => (
                <EditableElement key={i} className="flex justify-center gap-2 p-2 bg-white rounded border">
                    {row.letters.map((l, j) => (
                        <span key={j} className="w-8 h-8 flex items-center justify-center"><EditableText value={l} tag="span" /></span>
                    ))}
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

// Fix: Correctly mapping through data.grid which is an array of objects containing items
export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <EditableElement className="grid grid-cols-5 gap-4">
            {(data.grid || []).flatMap(row => row.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-center p-4 border rounded bg-white aspect-square">
                    {item.type === 'color' ? <div className="w-full h-full rounded-full" style={{backgroundColor: item.value}}></div> : <span className="text-2xl">{item.label}</span>}
                </div>
            ))}
        </EditableElement>
    </SimpleSheet>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.exercises.map((ex, i) => (
                <EditableElement key={i} className="p-4 border rounded bg-white">
                    <p className="font-bold mb-2"><EditableText value={ex.question} tag="span" /></p>
                    <p className="text-lg"><EditableText value={ex.word} tag="span" /></p>
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.rows.map((row, i) => (
                <EditableElement key={i} className="flex justify-center gap-4">
                    {row.items.map((item, j) => (
                        <span key={j} className={`text-2xl ${item.isMirrored ? 'text-red-500' : 'text-black'}`} style={{transform: `rotate(${item.rotation}deg)`}}>{item.letter}</span>
                    ))}
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-6">
            {data.trains.map((train, i) => (
                <EditableElement key={i} className="flex items-center gap-2">
                    {train.syllables.map((syl, j) => (
                        <div key={j} className="p-4 bg-zinc-100 border-2 border-zinc-400 rounded-lg"><EditableText value={syl} tag="span" /></div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

// --- UPDATED VISUAL TRACKING RENDERER ---
export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => (
    <div className="w-full h-full flex flex-col">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="flex-1 bg-white border-4 border-zinc-800 rounded-xl relative overflow-hidden shadow-lg m-4">
            {/* Background Grid for Expert Mode */}
            {data.showGridBackground && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{
                         backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                         backgroundSize: '20px 20px'
                     }}>
                </div>
            )}

            <svg viewBox={`0 0 ${data.width} ${data.height}`} className="w-full h-full" preserveAspectRatio="none">
                {/* 1. Draw Paths */}
                {data.paths.map((p, i) => (
                    <path 
                        key={i} 
                        d={p.d} 
                        fill="none" 
                        stroke={p.color} 
                        strokeWidth={p.strokeWidth}
                        strokeDasharray={data.lineStyle === 'dashed' ? '10,5' : data.lineStyle === 'dotted' ? '2,2' : 'none'}
                        strokeLinecap="round"
                        className="transition-all hover:stroke-[6px] hover:opacity-100"
                    />
                ))}

                {/* 2. Draw Start Points */}
                {data.paths.map((p, i) => {
                    // Extract Start Coords from 'M x y'
                    const startMatch = p.d.match(/^M\s*([\d.]+)\s+([\d.]+)/);
                    if (!startMatch) return null;
                    const x = parseFloat(startMatch[1]);
                    const y = parseFloat(startMatch[2]);
                    
                    return (
                        <g key={`start-${i}`} transform={`translate(${x}, ${y})`}>
                            <circle r="16" fill="white" stroke={p.color} strokeWidth="3" />
                            <text dy="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">{p.startLabel}</text>
                        </g>
                    );
                })}

                {/* 3. Draw End Points (Extract from last coords) */}
                {data.paths.map((p, i) => {
                     // Extract last coord pair from string (simplified regex)
                     const parts = p.d.trim().split(/[\s,]+/);
                     const y = parseFloat(parts[parts.length-1]);
                     const x = parseFloat(parts[parts.length-2]);
                     
                     if (isNaN(x) || isNaN(y)) return null;

                     return (
                         <g key={`end-${i}`} transform={`translate(${x}, ${y})`}>
                            <rect x="-14" y="-14" width="28" height="28" rx="4" fill="white" stroke={p.color} strokeWidth="3" />
                            {/* If in expert mode, maybe hide labels? No, always show for matching */}
                            <text dy="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">{p.endLabel}</text>
                        </g>
                     );
                })}
            </svg>
        </EditableElement>

        {/* Answer Key Strip for Expert Mode */}
        {data.difficultyLevel === 'expert' && (
             <div className="mt-4 p-2 bg-zinc-100 border border-zinc-300 rounded text-center text-[10px] text-zinc-500">
                <span className="font-bold">CEVAP ANAHTARI:</span> {data.paths.map(p => `${p.startLabel}➜${p.endLabel}`).join(' | ')}
             </div>
        )}
    </div>
);

// ... existing components ...
export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.items.map((item, i) => (
                <EditableElement key={i} className="flex justify-between p-4 border rounded bg-white items-center">
                    <span className="text-xl font-bold"><EditableText value={item.reversed} tag="span" /></span>
                    <div className="w-32 border-b-2 border-zinc-300"></div>
                </EditableElement>
            ))}
        </div>
    </SimpleSheet>
);

const SymbolRenderer = ({ symbol, color }: { symbol: string, color?: string }) => {
    if (symbol.startsWith('arrow')) return <i className={`fa-solid fa-${symbol} fa-2x`} style={{color}}></i>;
    return <span className="text-3xl" style={{color}}>{symbol}</span>;
}

export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <EditableElement className="mb-10 p-6 bg-zinc-100 rounded-2xl border-2 border-zinc-200">
            <div className="flex flex-wrap justify-center gap-6">
                {(data.keyMap || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-white p-3 rounded-xl border shadow-sm">
                        <SymbolRenderer symbol={item.symbol} color={item.color} />
                        <div className="w-full border-t my-1"></div>
                        <span className="text-2xl font-black">{item.value}</span>
                    </div>
                ))}
            </div>
        </EditableElement>
        <div className="space-y-8">
            {(data.codesToSolve || []).map((code, idx) => (
                <EditableElement key={idx} className="p-4 bg-white rounded-xl border border-dashed border-zinc-300">
                    <div className="flex wrap items-center gap-2 mb-4 justify-center">
                        {code.sequence.map((sym, sIdx) => (
                            <div key={sIdx} className="w-14 h-14 flex items-center justify-center bg-white border-2 rounded-lg shadow-sm">
                                <SymbolRenderer symbol={sym} color={data.keyMap.find(k=>k.symbol===sym)?.color} />
                            </div>
                        ))}
                        <div className="mx-4 text-zinc-400 text-2xl"><i className="fa-solid fa-arrow-right"></i></div>
                        <div className="flex gap-2">
                            {code.sequence.map((_, aIdx) => <div key={aIdx} className="w-14 h-14 border-b-4 border-indigo-200 bg-indigo-50 rounded-t-lg"></div>)}
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         <div className="text-center p-8 bg-zinc-50 border rounded-xl">
             <GridComponent grid={data.grid || []} cellClassName="w-10 h-10 border-zinc-300 font-bold" />
             {data.targetChars && <div className="mt-4 font-bold text-red-500">Hedefler: {data.targetChars.join(', ')}</div>}
         </div>
    </div>
);

export const AttentionDevelopmentSheet: React.FC<{ data: AttentionDevelopmentData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {data.puzzles.map((p, i) => (
                 <EditableElement key={i} className="p-6 bg-white border-2 border-zinc-300 rounded-xl shadow-sm">
                     <p className="text-lg font-bold mb-4 text-center">{p.riddle}</p>
                     <div className="flex justify-center gap-4 mb-4">
                         {p.boxes.map((b, bi) => (
                             <div key={bi} className="border p-2 bg-zinc-50">
                                 <div className="text-xs text-zinc-400 mb-1">{b.label}</div>
                                 <div className="font-mono font-bold text-lg">{b.numbers.join(', ')}</div>
                             </div>
                         ))}
                     </div>
                 </EditableElement>
             ))}
        </div>
    </div>
);

export const AttentionFocusSheet: React.FC<{ data: AttentionFocusData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-6">
            {data.puzzles.map((p, i) => (
                <EditableElement key={i} className="p-4 border rounded bg-amber-50">
                    <p className="font-bold text-amber-900">{p.riddle}</p>
                    <div className="flex gap-2 mt-2">{p.options.map(o=><span key={o} className="px-2 py-1 bg-white border rounded">{o}</span>)}</div>
                </EditableElement>
            ))}
        </div>
    </div>
);
