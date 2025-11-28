
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData } from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape, ShapeDisplay } from './common';

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
    // Map simplified types to font-awesome classes or SVG
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