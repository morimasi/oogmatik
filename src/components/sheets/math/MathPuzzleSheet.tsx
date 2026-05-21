
import React from 'react';
import { MathPuzzleData } from '../../../types';
import { ImageDisplay, PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface Props {
  data: MathPuzzleData;
  settings?: Record<string, unknown>;
}

const EquationRow = ({ eq, objects, compact = false }: { eq: Record<string, unknown>; objects: Array<Record<string, unknown>>; compact?: boolean }) => {
    const leftSide = (eq.leftSide as Array<Record<string, unknown>>) || [];
    const rightSide = eq.rightSide;
    const fontSize = compact ? 'text-sm' : 'text-base';
    const iconSize = compact ? 'w-6 h-6 print:w-5 print:h-5' : 'w-8 h-8 print:w-6 print:h-6';

    return (
        <div className={`flex items-center justify-center gap-1.5 print:gap-1 py-1 ${compact ? 'border-b border-zinc-100/60' : 'border-b border-zinc-100'} last:border-0`}>
            <div className="flex items-center gap-1">
                {leftSide.map((item: Record<string, unknown>, i: number) => {
                    const obj = objects.find((o: Record<string, unknown>) => o.name === item.objectName);
                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-zinc-400 font-bold text-[10px] print:text-[8px]">+</span>}
                            <div className="flex items-center gap-0.5">
                                {(item.multiplier as number) > 1 && (
                                    <span className="text-[8px] print:text-[7px] font-black text-indigo-600 bg-indigo-50 px-0.5 rounded leading-none">
                                        {item.multiplier}x
                                    </span>
                                )}
                                <div className={`${iconSize} flex items-center justify-center`}>
                                    <ImageDisplay
                                        prompt={obj?.imagePrompt as string | undefined}
                                        description={obj?.name as string | undefined}
                                        className="w-full h-full object-contain filter drop-shadow-sm"
                                    />
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <span className={`font-black text-zinc-900 ${compact ? 'text-sm print:text-xs' : 'text-base'}`}>=</span>
            <div className={`font-mono font-black ${fontSize} bg-zinc-900 text-white min-w-[1.8rem] print:min-w-[1.4rem] text-center px-1.5 print:px-1 py-0.5 print:py-0.5 rounded-lg print:rounded-md shadow-sm`}>
                {String(rightSide)}
            </div>
        </div>
    );
};

const PuzzleCard = ({ puzzle, index, compact, total }: { puzzle: Record<string, unknown>; index: number; compact: boolean; total: number }) => {
    const equations = (puzzle.equations as Array<Record<string, unknown>>) || [];
    const objects = (puzzle.objects as Array<Record<string, unknown>>) || [];
    const finalQuestion = puzzle.finalQuestion as string;

    const cardPadding = compact ? 'p-2 print:p-1.5' : 'p-3 print:p-2';
    const headerPadding = compact ? 'px-2 py-1' : 'px-3 py-1.5';
    const borderRadius = compact ? 'rounded-xl' : 'rounded-2xl';
    const borderWidth = compact ? 'border' : 'border-2';
    const headerTextSize = compact ? 'text-[7px]' : 'text-[9px]';

    return (
        <EditableElement
            className={`flex flex-col ${borderWidth} border-zinc-900 ${borderRadius} bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-md transition-all duration-200 break-inside-avoid`}
        >
            {/* Başlık Çubuğu */}
            <div className={`bg-zinc-900 ${headerPadding} flex justify-between items-center text-white`}>
                <span className={`${headerTextSize} font-black uppercase tracking-[0.15em] opacity-80`}>
                    #{index + 1}
                </span>
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
            </div>

            {/* İçerik */}
            <div className={`${cardPadding} flex-1 flex flex-col justify-between gap-2 print:gap-1.5`}>
                {/* Denklemler */}
                <div className="space-y-0.5">
                    {equations.map((eq: Record<string, unknown>, eIdx: number) => (
                        <EquationRow key={eIdx} eq={eq} objects={objects} compact={compact} />
                    ))}
                </div>

                {/* Final Soru */}
                <div className={`mt-1 ${compact ? 'p-2 print:p-1.5' : 'p-3 print:p-2'} bg-indigo-50/50 rounded-xl print:rounded-lg border border-dashed border-indigo-200 flex flex-col items-center gap-1 relative overflow-hidden`}>
                    <span className={`text-[7px] print:text-[6px] font-black text-indigo-400 uppercase tracking-widest leading-none`}>SONUÇ</span>
                    <div className="flex items-center gap-1.5">
                        <EditableText value={finalQuestion} tag="span" className={`${compact ? 'text-xs print:text-[11px]' : 'text-sm'} font-black text-zinc-800`} />
                        <span className="text-indigo-600 font-black text-sm print:text-xs">=</span>
                        <div className={`w-8 h-6 print:w-6 print:h-5 border border-indigo-600 bg-white rounded-md shadow-inner flex items-center justify-center text-sm print:text-xs text-transparent font-black`}>
                            ?
                        </div>
                    </div>
                    <div className="absolute -right-1 -bottom-1 opacity-10 rotate-12">
                        <div className={`w-6 h-6 print:w-5 print:h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white ${compact ? 'text-xs' : 'text-sm'} font-black`}>?</div>
                    </div>
                </div>
            </div>
        </EditableElement>
    );
};

export const MathPuzzleSheet: React.FC<Props> = ({ data, settings: globalSettings }) => {
    const puzzles = (data.puzzles as Array<Record<string, unknown>>) || [];
    const puzzleCount = puzzles.length;
    const compact = (globalSettings?.compactLayout as boolean) ?? true;
    const fastMode = (globalSettings?.fastMode as boolean) ?? false;
    const isLandscape = globalSettings?.orientation === 'landscape';

    // Kompakt modda daha fazla kolon
    const gridCols = puzzleCount > 8 ? (isLandscape ? 'grid-cols-4' : 'grid-cols-3') :
                     puzzleCount > 6 ? (isLandscape ? 'grid-cols-3' : 'grid-cols-2') :
                     puzzleCount > 4 ? (isLandscape ? 'grid-cols-2' : 'grid-cols-2') :
                     'grid-cols-1';

    const gapSize = compact ? 'gap-2 print:gap-1.5' : 'gap-3 print:gap-2';
    const mtSize = compact ? 'mt-2 print:mt-1' : 'mt-3 print:mt-2';

    return (
        <div className={`flex flex-col h-full font-lexend text-black bg-white ${compact ? 'text-[11px]' : ''}`}>
            {/* Kompakt Header */}
            <div className={`${compact ? 'px-3 pt-2 pb-1' : 'px-4 pt-3 pb-2'} border-b border-zinc-100`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg print:text-base">🧩</span>
                        <div>
                            <EditableText
                                value={data?.title || "Matematik Bulmacaları"}
                                tag="h1"
                                className={`font-black text-zinc-900 leading-tight ${compact ? 'text-base print:text-sm' : 'text-lg print:text-base'}`}
                            />
                            <EditableText
                                value={data?.instruction || "Denklemleri çöz, gizli sayıları bul."}
                                tag="p"
                                className={`text-zinc-500 leading-tight ${compact ? 'text-[10px] print:text-[8px]' : 'text-xs print:text-[10px]'}`}
                            />
                        </div>
                    </div>
                    {fastMode && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ⚡ Hızlı
                        </span>
                    )}
                </div>
            </div>

            {/* Pedagogical Note - Kompakt Badge */}
            {data?.pedagogicalNote && (
                <div className={`mx-3 ${compact ? 'mt-1 mb-2' : 'mt-2 mb-3'} p-2 bg-amber-50/60 rounded-lg border border-amber-100`}>
                    <p className="text-[8px] print:text-[7px] text-amber-700 leading-tight">
                        <span className="font-black">📝 Öğretmene Not:</span> {data.pedagogicalNote}
                    </p>
                </div>
            )}

            {/* Bulmaca Grid - Kompakt ve Dolu Dolu */}
            <div className={`grid ${gridCols} ${gapSize} ${mtSize} flex-1 content-start px-3 print:px-2`}>
                {puzzles.map((puzzle: Record<string, unknown>, index: number) => (
                    <PuzzleCard
                        key={index}
                        puzzle={puzzle}
                        index={index}
                        compact={compact}
                        total={puzzleCount}
                    />
                ))}
            </div>

            {/* Alt Bilgi - Minimal */}
            {puzzleCount > 0 && (
                <div className={`mt-2 print:mt-1 py-1.5 print:py-1 border-t border-dashed border-zinc-200 flex justify-between items-center opacity-60 px-3 print:px-2`}>
                    <span className="text-[7px] print:text-[6px] font-medium">Oogmatik · Matematik Bulmacaları</span>
                    <div className="flex gap-3">
                        <span className="text-[7px] print:text-[6px]">🎯 Görsel Mantık</span>
                        <span className="text-[7px] print:text-[6px]">🧩 {puzzleCount} Bulmaca</span>
                    </div>
                </div>
            )}
        </div>
    );
};
