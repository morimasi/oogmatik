
import React from 'react';
import { NumberLogicRiddleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    
    // Yüksek yoğunluklu (20 soruya kadar) dinamik grid mantığı
    // 1-4 soru: 2 sütun
    // 5-12 soru: 3 sütun
    // 13-20 soru: 4 sütun (Ultra Kompakt)
    const gridCols = itemCount <= 4 ? 'grid-cols-2' : (itemCount <= 12 ? 'grid-cols-3' : 'grid-cols-4');
    
    // Soru sayısına göre kart içi dikey boşluk ayarı
    const cardPadding = itemCount > 12 ? 'p-2.5' : 'p-4';
    const gapSize = itemCount > 12 ? 'gap-2' : 'gap-3';
    const fontSize = itemCount > 12 ? 'text-[9px]' : 'text-[11px]';
    const iconSize = itemCount > 12 ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]';

    return (
        <div className="flex flex-col h-full bg-white text-black font-lexend p-1 overflow-hidden">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "Bilmeceleri çöz, doğru olanı işaretle."} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} ${gapSize} mt-2 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle, pIdx) => (
                    <EditableElement key={pIdx} className={`flex flex-col border-[1.2px] border-zinc-900 rounded-xl ${cardPadding} bg-white shadow-sm break-inside-avoid relative group hover:border-indigo-600 transition-all`}>
                        {/* Soru Numarası - Küçültülmüş */}
                        <div className="absolute -top-1.5 -left-1 w-6 h-6 bg-zinc-900 text-white rounded-md flex items-center justify-center font-black text-[10px] shadow-sm border border-white z-10">
                            {pIdx + 1}
                        </div>

                        {/* Bilmece Parçacıkları (Yüksek Yoğunluklu Liste) */}
                        <div className="space-y-1 mb-2">
                            {puzzle.riddleParts.map((part, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-1.5 border-b border-zinc-50 last:border-0 pb-0.5">
                                    <div className={`${iconSize} rounded bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5`}>
                                        <i className={`fa-solid ${part.icon}`}></i>
                                    </div>
                                    <p className={`${fontSize} font-bold leading-tight text-zinc-800 line-clamp-2`}>
                                        <EditableText value={part.text} tag="span" />
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Çeldirici Sayı Bulutu (Hücre Tabanlı) */}
                        <div className="flex flex-wrap gap-0.5 justify-center mb-2 opacity-30 group-hover:opacity-60 transition-opacity select-none border-t border-zinc-100 pt-1.5">
                            {(puzzle.visualDistraction || []).map((num, nIdx) => (
                                <span key={nIdx} className="text-[7px] font-mono font-black italic px-0.5">{num}</span>
                            ))}
                        </div>

                        {/* Şıklar - Yüksek Yoğunluk için Sıkıştırılmış */}
                        <div className="mt-auto grid grid-cols-2 gap-1">
                            {puzzle.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-1.5 p-1 border border-zinc-100 rounded-md hover:border-zinc-900 transition-colors cursor-pointer bg-zinc-50/50">
                                    <div className="w-3.5 h-3.5 rounded-sm border-[1px] border-zinc-300 bg-white flex items-center justify-center text-[7px] font-black shrink-0">{String.fromCharCode(65 + oIdx)}</div>
                                    <span className="text-[10px] font-black text-zinc-900 truncate">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Toplam Kontrol Paneli - Daha İnce Tasarım */}
            {data.sumTarget > 0 && (
                <div className="mt-3 border-[1.5px] border-zinc-900 rounded-2xl p-3 bg-zinc-50 flex items-center justify-between break-inside-avoid shadow-inner">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-base shadow-sm"><i className="fa-solid fa-calculator"></i></div>
                         <div>
                            <h4 className="text-xs font-black tracking-tight uppercase leading-none">Toplam Kontrolü</h4>
                            <p className="text-[8px] text-zinc-500 font-bold mt-0.5">Tüm doğru sonuçların toplamı.</p>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block">Hedef</span>
                            <div className="text-xl font-black text-indigo-600 font-mono leading-none">{data.sumTarget}</div>
                        </div>
                        <div className="w-px h-6 bg-zinc-200"></div>
                        <div className="text-center">
                            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block">Sonuç</span>
                            <div className="w-12 h-6 border-b border-dashed border-zinc-300 flex items-center justify-center font-black text-lg text-transparent">?</div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="mt-2 flex justify-between items-center text-[6px] font-black text-zinc-300 uppercase tracking-[0.4em] px-2">
                <span>Bursa Disleksi AI • Sayısal Mantık v2.2</span>
                <div className="flex gap-3">
                     <i className="fa-solid fa-brain-circuit"></i>
                     <i className="fa-solid fa-print"></i>
                </div>
            </div>
        </div>
    );
};
