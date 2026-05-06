
import React from 'react';
import { MathPuzzleData } from '../../../types';
import { ImageDisplay, PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface Props {
  data: MathPuzzleData;
  settings?: any;
}

const EquationRow = ({ eq, objects, fontSize = "text-xl" }: any) => {
    return (
        <div className="flex items-center justify-center gap-3 print:gap-1 py-2 border-b border-zinc-100 last:border-0 group-hover:bg-zinc-50/50 transition-colors">
            <div className="flex items-center gap-1.5">
                {eq.leftSide.map((item: any, i: number) => {
                    const obj = objects.find((o: any) => o.name === item.objectName);
                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-zinc-400 font-bold text-sm">+</span>}
                            <div className="flex items-center gap-1">
                                {item.multiplier > 1 && (
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1 rounded">
                                        {item.multiplier}x
                                    </span>
                                )}
                                <div className="w-10 h-10 print:w-8 print:h-8 flex items-center justify-center">
                                    <ImageDisplay 
                                        prompt={obj?.imagePrompt} 
                                        description={obj?.name} 
                                        className="w-full h-full object-contain filter drop-shadow-sm" 
                                    />
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <span className="text-lg font-black text-zinc-900">=</span>
            <div className={`font-mono font-black ${fontSize} bg-zinc-900 text-white min-w-[2.5rem] text-center px-3 py-1 rounded-xl shadow-sm`}>
                {eq.rightSide}
            </div>
        </div>
    );
};

export const MathPuzzleSheet: React.FC<Props> = ({ data, settings: globalSettings }: any) => {
    const puzzles = data.puzzles || [];
    const isLandscape = globalSettings?.orientation === 'landscape';
    const puzzleCount = puzzles.length;

    // Grid kolon sayısını bulmaca sayısına göre ayarla (Maksimum doluluk için)
    const gridCols = puzzleCount > 4 ? (isLandscape ? 'grid-cols-3' : 'grid-cols-2') : 
                     puzzleCount > 1 ? (isLandscape ? 'grid-cols-2' : 'grid-cols-2') : 
                     'grid-cols-1';

    return (
        <div className="flex flex-col h-full font-lexend text-black bg-white">
            <PedagogicalHeader 
                title={data?.title || "Matematik Bulmacaları"} 
                instruction={data?.instruction || "Aşağıdaki denklemleri çözerek gizli sayıları bul."} 
                note={data?.pedagogicalNote} 
                data={data} 
            />
            
            <div className={`grid ${gridCols} gap-4 print:gap-2 mt-4 print:mt-2 flex-1 content-start`}>
                {puzzles.map((puzzle: any, index: number) => (
                    <EditableElement 
                        key={index} 
                        className="flex flex-col border-2 border-zinc-900 rounded-[2rem] bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-lg transition-all duration-300 break-inside-avoid"
                    >
                        {/* Başlık Çubuğu */}
                        <div className="bg-zinc-900 px-4 py-2 flex justify-between items-center text-white">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                                Soru #{index + 1}
                            </span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            </div>
                        </div>

                        {/* İçerik Alanı */}
                        <div className="p-4 print:p-3 flex-1 flex flex-col justify-between gap-4">
                            {/* Denklem Listesi */}
                            <div className="space-y-1">
                                {puzzle.equations.map((eq: any, eIdx: number) => (
                                    <EquationRow key={eIdx} eq={eq} objects={puzzle.objects} fontSize={puzzleCount > 4 ? "text-base" : "text-lg"} />
                                ))}
                            </div>

                            {/* Final Soru Bloğu */}
                            <div className="mt-2 p-4 print:p-2 bg-indigo-50/50 rounded-[1.5rem] border-2 border-dashed border-indigo-200 flex flex-col items-center gap-2 relative overflow-hidden">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Final İşlem</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                        {/* Burada finalQuestion meyveli formatta gelebileceği için basit bir gösterim */}
                                        <EditableText value={puzzle.finalQuestion} tag="span" className="text-sm font-black text-zinc-800" />
                                    </div>
                                    <span className="text-indigo-600 font-black">=</span>
                                    <div className="w-12 h-9 border-2 border-indigo-600 bg-white rounded-lg shadow-inner flex items-center justify-center text-xl text-transparent">
                                        ?
                                    </div>
                                </div>
                                
                                {/* Dekoratif Eleman */}
                                <div className="absolute -right-2 -bottom-2 opacity-10 rotate-12">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black">?</div>
                                </div>
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Alt Bilgi - Sayfa Dolu Dolu İpucu */}
            {puzzleCount > 0 && (
                <div className="mt-4 print:mt-2 py-2 border-t border-dashed border-zinc-200 flex justify-between items-center opacity-50">
                    <span className="text-[8px] font-medium">Oogmatik Matematik Stüdyosu v2.5</span>
                    <div className="flex gap-4">
                        <span className="text-[8px]">🎯 Odak: Görsel Mantık</span>
                        <span className="text-[8px]">🧩 {puzzleCount} Farklı Bulmaca</span>
                    </div>
                </div>
            )}
        </div>
    );
};
