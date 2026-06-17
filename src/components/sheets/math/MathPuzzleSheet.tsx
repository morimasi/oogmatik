
import React from 'react';
import { MathPuzzleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface Props {
  data: MathPuzzleData;
  settings?: Record<string, unknown>;
}

// Basit nesne emoji haritası — ImageDisplay yerine inline render
const OBJECT_EMOJI: Record<string, string> = {
  'Elma': '🍎', 'Armut': '🍐', 'Portakal': '🍊', 'Çilek': '',
  'Muz': '🍌', 'Karpuz': '', 'Üzüm': '🍇', 'Kiraz': '',
  'Kavun': '🍈', 'Şeftali': '🍑', 'Limon': '', 'Elmas': '💎',
  'Yıldız': '⭐', 'Kalp': '❤️', 'Top': '⚽', 'Araba': '',
  'Kelebek': '', 'Kedi': '', 'Köpek': '', 'Balık': '',
  'Kuş': '', 'Güneş': '️', 'Ay': '', 'Bulut': '☁️',
  'Ağaç': '', 'Çiçek': '🌸', 'Ev': '🏠', 'Kitap': '📚',
  'Kalem': '✏️', 'Silgi': '🧹', 'Saat': '⏰', 'Para': '',
};

const getObjectEmoji = (name: string): string => {
  return OBJECT_EMOJI[name] || '🔵';
};

const EquationRow = ({ eq, objects, compact = false }: { eq: Record<string, unknown>; objects: Array<Record<string, unknown>>; compact?: boolean }) => {
    const leftSide = (eq.leftSide as Array<Record<string, unknown>>) || [];
    const rightSide = eq.rightSide;
    const operator = (eq.operator as string) || '+';

    return (
        <div className={`flex items-center justify-center gap-1 print:gap-0.5 py-0.5 ${compact ? 'border-b border-zinc-100/50' : 'border-b border-zinc-100'} last:border-0`}>
            <div className="flex items-center gap-0.5 flex-wrap justify-center">
                {leftSide.map((item: Record<string, unknown>, i: number) => {
                    const obj = objects.find((o: Record<string, unknown>) => o.name === item.objectName);
                    const emoji = obj ? getObjectEmoji(obj.name as string) : '🔵';
                    const multiplier = item.multiplier as number;

                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-zinc-400 font-bold text-xs print:text-[10px] mx-0.5">{operator}</span>}
                            <div className="flex items-center gap-0.5">
                                {multiplier > 1 && (
                                    <span className={`font-black text-indigo-600 leading-none ${compact ? 'text-[9px] print:text-[7px]' : 'text-xs print:text-[9px]'}`}>
                                        {multiplier}×
                                    </span>
                                )}
                                <span className={`${compact ? 'text-base print:text-sm' : 'text-lg print:text-base'} leading-none`}>
                                    {emoji}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <span className={`font-black text-zinc-900 mx-1 ${compact ? 'text-sm print:text-xs' : 'text-base print:text-sm'}`}>=</span>
            <div className={`font-mono font-black ${compact ? 'text-sm print:text-xs' : 'text-base print:text-sm'} bg-zinc-900 text-white min-w-[1.5rem] print:min-w-[1.2rem] text-center px-1.5 print:px-1 py-0.5 print:py-0.5 rounded-md shadow-sm`}>
                {String(rightSide)}
            </div>
        </div>
    );
};

const PuzzleCard = ({ puzzle, index, compact }: { puzzle: Record<string, unknown>; index: number; compact: boolean }) => {
    const equations = (puzzle.equations as Array<Record<string, unknown>>) || [];
    const objects = (puzzle.objects as Array<Record<string, unknown>>) || [];
    const finalQuestion = puzzle.finalQuestion as string;

    return (
        <EditableElement
            className={`flex flex-col border border-zinc-300 ${compact ? 'rounded-lg' : 'rounded-xl'} bg-white overflow-hidden break-inside-avoid`}
        >
            {/* Başlık */}
            <div className={`bg-zinc-800 ${compact ? 'px-2 py-0.5' : 'px-3 py-1'} flex justify-between items-center text-white`}>
                <span className={`${compact ? 'text-[7px]' : 'text-[9px]'} font-black uppercase tracking-wider opacity-70`}>
                    #{index + 1}
                </span>
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                </div>
            </div>

            {/* İpuçları Bölümü */}
            <div className={`${compact ? 'px-1.5 pt-1' : 'px-2 pt-1.5'}`}>
                <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[6px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1 py-0.5 rounded leading-none">İpuçları</span>
                    <div className="flex-1 border-t border-dashed border-zinc-200" />
                </div>
            </div>
            <div className={`${compact ? 'p-1.5 print:p-1 pt-0.5' : 'p-2 print:p-1.5 pt-0.5'} space-y-0.5`}>
                {equations.map((eq: Record<string, unknown>, eIdx: number) => (
                    <EquationRow key={eIdx} eq={eq} objects={objects} compact={compact} />
                ))}
            </div>

            {/* Final Soru (Yeni Kombinasyon) */}
            <div className={`${compact ? 'mx-1.5 mb-1.5 p-1.5' : 'mx-2 mb-2 p-2'} bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex flex-col items-center gap-0.5 shadow-md`}>
                <span className="text-[7px] font-black text-white/80 uppercase tracking-widest">➡ Gerçek Soru</span>
                <div className="flex items-center gap-1.5">
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-black text-white`}>{finalQuestion}</span>
                    <span className="text-white font-black text-sm">=</span>
                    <div className={`w-7 h-5 print:w-5 print:h-4 border-2 border-white/50 bg-white/20 rounded flex items-center justify-center ${compact ? 'text-xs' : 'text-sm'} font-black text-transparent`}>
                        ?
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

    const gridCols = puzzleCount > 8 ? (isLandscape ? 'grid-cols-4' : 'grid-cols-3') :
                     puzzleCount > 6 ? (isLandscape ? 'grid-cols-3' : 'grid-cols-2') :
                     puzzleCount > 2 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div className="flex flex-col h-full font-lexend text-black bg-white">
            {/* Header */}
            <div className={`${compact ? 'px-3 pt-1.5 pb-1' : 'px-4 pt-2 pb-1.5'} border-b border-zinc-200`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-base">🧩</span>
                        <div>
                            <EditableText
                                value={data?.title || "Matematik Bulmacaları"}
                                tag="h1"
                                className={`font-black text-zinc-900 leading-tight ${compact ? 'text-sm print:text-xs' : 'text-base print:text-sm'}`}
                            />
                            <EditableText
                                value={data?.instruction || "Denklemleri çöz, gizli sayıları bul."}
                                tag="p"
                                className={`text-zinc-500 leading-tight ${compact ? 'text-[9px] print:text-[7px]' : 'text-[10px] print:text-[8px]'}`}
                            />
                        </div>
                    </div>
                    {fastMode && (
                        <span className="text-[7px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                            ⚡ Hızlı
                        </span>
                    )}
                </div>
            </div>

            {/* Pedagogical Note */}
            {data?.pedagogicalNote && (
                <div className={`mx-3 ${compact ? 'mt-1 mb-1.5' : 'mt-1.5 mb-2'} p-1.5 bg-amber-50 rounded-lg border border-amber-100`}>
                    <p className={`text-amber-700 leading-tight ${compact ? 'text-[7px] print:text-[6px]' : 'text-[8px] print:text-[7px]'}`}>
                        <span className="font-black">📝 Not:</span> {data.pedagogicalNote}
                    </p>
                </div>
            )}

            {/* Bulmaca Grid */}
            <div className={`grid ${gridCols} ${compact ? 'gap-1.5 print:gap-1' : 'gap-2 print:gap-1.5'} ${compact ? 'mt-1.5' : 'mt-2'} flex-1 content-start px-3 print:px-2`}>
                {puzzles.map((puzzle: Record<string, unknown>, index: number) => (
                    <PuzzleCard
                        key={index}
                        puzzle={puzzle}
                        index={index}
                        compact={compact}
                    />
                ))}
            </div>

            {/* Footer */}
            {puzzleCount > 0 && (
                <div className={`mt-1 print:mt-0.5 py-1 border-t border-dashed border-zinc-200 flex justify-between items-center opacity-50 px-3 print:px-2`}>
                    <span className="text-[6px] print:text-[5px] font-medium">bdmind · Matematik Bulmacaları</span>
                    <div className="flex gap-2">
                        <span className="text-[6px] print:text-[5px]">🎯 Görsel Mantık</span>
                        <span className="text-[6px] print:text-[5px]"> {puzzleCount} Bulmaca</span>
                    </div>
                </div>
            )}
        </div>
    );
};
