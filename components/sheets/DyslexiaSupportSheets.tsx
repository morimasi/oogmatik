
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ImageInterpretationTFData } from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape, GridComponent } from './common';

// Helper for simple sheets
const SimpleSheet = ({ data, children }: { data: any, children?: React.ReactNode }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        {children || <div className="p-8 text-center text-zinc-500 italic">Görsel içerik oluşturuldu.</div>}
    </div>
);

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-6 text-lg leading-loose font-dyslexic">
            {data.text.paragraphs.map((p, i) => (
                <p key={i}>
                    {p.sentences.map((s, j) => (
                        <span key={j}>
                            {s.syllables.map((syl, k) => (
                                <span key={k} style={{ color: syl.color }}>{syl.text}</span>
                            ))}
                            {j < p.sentences.length - 1 && ' '}
                        </span>
                    ))}
                </p>
            ))}
        </div>
    </SimpleSheet>
);

export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4 font-mono text-xl">
            {data.rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-2 p-2 bg-white rounded border">
                    {row.letters.map((l, j) => (
                        <span key={j} className="w-8 h-8 flex items-center justify-center">{l}</span>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="grid grid-cols-5 gap-4">
            {data.grid.items.map((item, i) => (
                <div key={i} className="flex items-center justify-center p-4 border rounded bg-white aspect-square">
                    {item.type === 'color' ? <div className="w-full h-full rounded-full" style={{backgroundColor: item.value}}></div> : <span className="text-2xl">{item.label}</span>}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.exercises.map((ex, i) => (
                <div key={i} className="p-4 border rounded bg-white">
                    <p className="font-bold mb-2">{ex.question}</p>
                    <p className="text-lg">{ex.word}</p>
                </div>
            ))}
        </div>
    </SimpleSheet>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-4">
                    {row.items.map((item, j) => (
                        <span key={j} className={`text-2xl ${item.isMirrored ? 'text-red-500' : 'text-black'}`} style={{transform: `rotate(${item.rotation}deg)`}}>{item.letter}</span>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-6">
            {data.trains.map((train, i) => (
                <div key={i} className="flex items-center gap-2">
                    {train.syllables.map((syl, j) => (
                        <div key={j} className="p-4 bg-zinc-100 border-2 border-zinc-400 rounded-lg">{syl}</div>
                    ))}
                </div>
            ))}
        </div>
    </SimpleSheet>
);

export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <svg viewBox={`0 0 ${data.width} ${data.height}`} className="border bg-white w-full">
            {data.paths.map((p, i) => (
                <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth="2" />
            ))}
        </svg>
    </SimpleSheet>
);

export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <SimpleSheet data={data}>
        <div className="space-y-4">
            {data.items.map((item, i) => (
                <div key={i} className="flex justify-between p-4 border rounded bg-white items-center">
                    <span className="text-xl font-bold">{item.reversed}</span>
                    <div className="w-32 border-b-2 border-zinc-300"></div>
                </div>
            ))}
        </div>
    </SimpleSheet>
);

const ArrowSymbol = ({ type, className }: { type: string, className?: string }) => {
    // type example: 'arrow-up', 'arrow-left'
    let rotation = 0;
    if (type.includes('right')) rotation = 0;
    if (type.includes('down')) rotation = 90;
    if (type.includes('left')) rotation = 180;
    if (type.includes('up')) rotation = 270;
    
    // Check if curved
    const isCurved = type.includes('curved');

    return (
        <div className={`flex items-center justify-center ${className}`} style={{ transform: `rotate(${rotation}deg)` }}>
            {isCurved ? (
                <i className="fa-solid fa-reply fa-2x text-zinc-700 dark:text-zinc-200"></i>
            ) : (
                <i className="fa-solid fa-arrow-right-long fa-2x text-zinc-700 dark:text-zinc-200"></i>
            )}
        </div>
    );
};

const SymbolRenderer = ({ symbol, color }: { symbol: string, color?: string }) => {
    // Check if it's an arrow
    if (symbol.startsWith('arrow')) {
        return <ArrowSymbol type={symbol} className="w-10 h-10" />;
    }
    // Check if it's a shape
    if (['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond'].includes(symbol)) {
        return (
            <div className="w-10 h-10 flex items-center justify-center text-zinc-700 dark:text-zinc-200" style={{ color: color }}>
                <Shape name={symbol as any} className="w-full h-full" />
            </div>
        );
    }
    // Fallback: Color box or Text
    if (symbol.startsWith('#')) {
        return <div className="w-10 h-10 rounded-full border-2 border-zinc-300" style={{ backgroundColor: symbol }}></div>;
    }
    
    // Emoji or Char
    return <span className="text-3xl">{symbol}</span>;
}

export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        
        {/* Key Map (Legend) */}
        <div className="mb-10 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h4 className="text-center font-bold mb-4 text-zinc-500 uppercase tracking-widest text-sm">ŞİFRE ANAHTARI</h4>
            <div className="flex flex-wrap justify-center gap-6">
                {(data.keyMap || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-white dark:bg-zinc-700 p-3 rounded-xl border shadow-sm min-w-[80px]">
                        <div className="mb-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <SymbolRenderer symbol={item.symbol} color={item.color} />
                        </div>
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-600 my-1"></div>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Codes to Solve */}
        <div className="space-y-8">
            {(data.codesToSolve || []).map((code, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-zinc-700/30 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600">
                    <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
                        {code.sequence.map((sym, sIdx) => {
                            const keyItem = data.keyMap.find(k => k.symbol === sym);
                            return (
                                <div key={sIdx} className="w-14 h-14 flex items-center justify-center bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 rounded-lg shadow-sm">
                                    <SymbolRenderer symbol={sym} color={keyItem?.color} />
                                </div>
                            );
                        })}
                        <div className="mx-4 text-zinc-400 text-2xl"><i className="fa-solid fa-arrow-right"></i></div>
                        
                        {/* Answer Boxes */}
                        <div className="flex gap-2">
                            {code.sequence.map((_, aIdx) => (
                                <div key={aIdx} className="w-14 h-14 border-b-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 rounded-t-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Helper Line */}
        <div className="mt-8 text-center text-zinc-400 text-sm italic">
            * Sembolleri anahtardan bul ve altındaki kutulara karşılığını yaz.
        </div>
    </div>
);

// Advanced SVG Pentagon Renderer for Visual Logic
const PentagonLogic = ({ item }: { item: any }) => {
    const size = 100;
    const center = size / 2;
    const radius = 40;
    
    // Pentagon vertices
    const vertices = Array.from({length: 5}).map((_, i) => {
        const angle = (i * 72 - 18) * (Math.PI / 180); // Start from top
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    });

    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
            {/* Pentagon Outline */}
            <polygon 
                points={vertices.map(v => `${v.x},${v.y}`).join(' ')} 
                fill="#fef9c3" stroke="#d97706" strokeWidth="1" 
                className="dark:fill-yellow-900/20 dark:stroke-yellow-600"
            />
            
            {/* Connections */}
            {item.shapes.map((shape: any, i: number) => {
                if (shape.connectedTo) {
                    return shape.connectedTo.map((targetIdx: number) => (
                        <line 
                            key={`${i}-${targetIdx}`}
                            x1={vertices[i].x} y1={vertices[i].y}
                            x2={vertices[targetIdx].x} y2={vertices[targetIdx].y}
                            stroke="#333" strokeWidth="2"
                        />
                    ));
                }
                return null;
            })}

            {/* Dots */}
            {vertices.map((v, i) => (
                <circle 
                    key={i} 
                    cx={v.x} cy={v.y} r="6" 
                    fill={item.shapes[i]?.color || '#ccc'} 
                    stroke="#333" strokeWidth="1"
                />
            ))}
        </svg>
    );
};

export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            {/* Sub-type: Letter Cancellation */}
            {data.subType === 'letter-cancellation' && data.grid && (
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
                        <GridComponent grid={data.grid} cellClassName="w-12 h-12 text-2xl font-bold font-dyslexic" />
                    </div>
                    {data.targetChars && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-4">
                            <span className="font-bold text-rose-700 dark:text-rose-300">Bu harflerin üzerini çiz:</span>
                            <div className="flex gap-2">
                                {data.targetChars.map((char, i) => (
                                    <span key={i} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-rose-950 border border-rose-300 rounded font-bold relative overflow-hidden">
                                        {char}
                                        <div className="absolute inset-0 border-t-2 border-l-2 border-red-500 transform rotate-45 scale-125 origin-center"></div>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.password && (
                        <div className="w-full max-w-md p-6 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 text-center">
                            <p className="text-zinc-500 text-sm mb-2 uppercase tracking-widest">Kalan Harflerden Oluşan Şifre</p>
                            <div className="flex justify-center gap-2">
                                {data.password.split('').map((_, i) => (
                                    <div key={i} className="w-10 h-12 border-b-4 border-zinc-400"></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sub-type: Path Finding */}
            {data.subType === 'path-finding' && data.pathGrid && (
                <div className="flex justify-center">
                    <div className="relative bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-lg border-2 border-zinc-300">
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data.pathGrid[0].length}, minmax(0, 1fr))` }}>
                            {data.pathGrid.map((row, r) => 
                                row.map((cell, c) => (
                                    <div key={`${r}-${c}`} className="w-12 h-12 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-2xl">
                                        {/* Simple visualization based on string content */}
                                        {cell.includes('start') ? <i className="fa-solid fa-circle-play text-green-500"></i> :
                                         cell.includes('end') ? <i className="fa-solid fa-flag-checkered text-red-500"></i> :
                                         cell.includes('star') ? <i className="fa-solid fa-star text-yellow-400"></i> :
                                         cell.includes('arrow-right') ? <i className="fa-solid fa-arrow-right text-zinc-400"></i> :
                                         cell.includes('arrow-down') ? <i className="fa-solid fa-arrow-down text-zinc-400"></i> :
                                         <i className="fa-regular fa-star text-zinc-200"></i>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-type: Visual Logic */}
            {data.subType === 'visual-logic' && data.logicItems && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.logicItems.map((item, idx) => (
                        <div key={idx} className="p-4 border-2 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-between gap-4">
                            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-zinc-500">{idx + 1}</div>
                            <PentagonLogic item={item} />
                            <div className="w-12 h-12 border-2 border-dashed border-zinc-300 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const AttentionDevelopmentSheet: React.FC<{ data: AttentionDevelopmentData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "Yönergeleri takip et ve doğru sayıyı bul."} note={data.pedagogicalNote} data={data} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.puzzles.map((puzzle, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl p-5 shadow-sm break-inside-avoid flex flex-col h-full">
                        {/* Riddle Text */}
                        <div className="bg-zinc-100 dark:bg-zinc-700/50 p-4 rounded-lg mb-4 text-center border border-zinc-200 dark:border-zinc-600">
                            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{puzzle.riddle}</p>
                        </div>

                        {/* Boxes Area */}
                        <div className="flex gap-4 justify-center mb-6 flex-1 items-center">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="border-2 border-zinc-800 dark:border-zinc-400 p-2 min-w-[80px] text-center bg-white dark:bg-zinc-900">
                                    {box.label && <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wider">{box.label}</div>}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {box.numbers.map((num, nIdx) => (
                                            <span key={nIdx} className="text-xl font-bold font-mono px-1">{num}{nIdx < box.numbers.length-1 ? ',' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="border-t pt-4 flex justify-around">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col items-center gap-1 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500 group-hover:bg-indigo-50 flex items-center justify-center font-bold text-sm text-zinc-500 group-hover:text-indigo-600 transition-all">
                                        {String.fromCharCode(97 + oIdx)}
                                    </div>
                                    <span className="font-bold text-lg">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Answer Key Strip (For Print) */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-zinc-300 hidden print:block text-center text-xs text-zinc-400">
                Cevaplar: {data.puzzles.map((p,i) => `${i+1}) ${p.answer}`).join('  |  ')}
            </div>
        </div>
    );
};

export const AttentionFocusSheet: React.FC<{ data: AttentionFocusData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || "İpuçlarını oku ve doğru cevabı bul."} note={data.pedagogicalNote} data={data} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.puzzles.map((puzzle, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 border-2 border-zinc-400 dark:border-zinc-500 rounded-xl p-5 shadow-md break-inside-avoid flex flex-col h-full relative">
                        {/* Riddle Box */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-4 text-center border border-amber-200 dark:border-amber-800">
                            <p className="text-lg font-medium text-amber-900 dark:text-amber-100 font-dyslexic">{puzzle.riddle}</p>
                        </div>

                        {/* List Boxes */}
                        <div className="flex gap-4 justify-center mb-6 flex-1 items-stretch">
                            {puzzle.boxes.map((box, bIdx) => (
                                <div key={bIdx} className="border-2 border-zinc-800 dark:border-zinc-300 p-3 min-w-[100px] text-center bg-white dark:bg-zinc-900 flex flex-col">
                                    {box.title && <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold border-b pb-1">{box.title}</div>}
                                    <ul className="flex flex-col gap-1 text-base font-bold text-zinc-800 dark:text-zinc-200">
                                        {box.items.map((item, nIdx) => (
                                            <li key={nIdx} className="py-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 flex flex-wrap justify-center gap-4">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2 cursor-pointer group bg-zinc-50 dark:bg-zinc-700/50 px-3 py-1 rounded-full border border-transparent hover:border-indigo-300 transition-all">
                                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-600 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center font-bold text-xs text-zinc-600 dark:text-zinc-300 transition-colors">
                                        {String.fromCharCode(97 + oIdx)}
                                    </div>
                                    <span className="font-bold text-sm">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Answer Key Strip (For Print) */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-zinc-300 hidden print:block text-center text-xs text-zinc-400">
                Cevaplar: {data.puzzles.map((p,i) => `${i+1}) ${p.answer}`).join('  |  ')}
            </div>
        </div>
    );
};

export const ImageInterpretationTFSheet: React.FC<{ data: ImageInterpretationTFData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            {/* Main Visual - Centered and Prominent */}
            <div className="mb-8 flex justify-center">
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-lg border-4 border-white dark:border-zinc-700 overflow-hidden relative group">
                    <ImageDisplay base64={data.imageBase64} description={data.sceneDescription || data.imagePrompt} className="w-full h-auto max-h-[400px] object-contain rounded-xl bg-zinc-50 dark:bg-zinc-900" />
                    {/* Hover Description Tooltip */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="text-white text-center font-medium text-lg leading-relaxed">{data.sceneDescription}</p>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="max-w-2xl mx-auto space-y-4 font-dyslexic text-lg">
                <div className="text-center text-rose-500 font-bold mb-4 print:block hidden">
                    Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.
                </div>
                {data.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors break-inside-avoid">
                        <div className="w-16 flex-shrink-0 flex items-center justify-center font-bold text-zinc-400">
                            ( &nbsp;&nbsp;&nbsp; )
                        </div>
                        <div className="flex-1 pt-0.5 text-zinc-800 dark:text-zinc-100 leading-normal">
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
