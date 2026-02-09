
import React from 'react';
import { NumberLogicRiddleData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const NumberLogicRiddleSheet: React.FC<{ data: NumberLogicRiddleData }> = ({ data }) => {
    const itemCount = data.puzzles?.length || 0;
    const hintCount = data.puzzles?.[0]?.riddleParts?.length || 0;
    
    // Yoğunluk Analizi: A4'ü en verimli kullanacak grid yapısı
    const gridCols = itemCount <= 4 ? 'grid-cols-2' : (itemCount <= 12 ? 'grid-cols-3' : 'grid-cols-4');
    
    // İpucu sayısına göre font ve boşluk optimizasyonu (Klinik Sıkıştırma)
    const isUltraDense = hintCount > 5 || itemCount > 12;
    const fontSize = hintCount > 7 ? 'text-[8px]' : (hintCount > 4 ? 'text-[9px]' : 'text-[11px]');
    const iconSize = hintCount > 7 ? 'w-3 h-3 text-[6px]' : 'w-4 h-4 text-[8px]';
    const cardPadding = isUltraDense ? 'p-2.5' : 'p-4';
    const gapSize = isUltraDense ? 'gap-1.5' : 'gap-3';

    return (
        <div className="flex flex-col h-full bg-white text-black font-lexend p-1 overflow-hidden select-none">
            <PedagogicalHeader 
                title={data.title || "Sayısal Mantık Bilmeceleri"} 
                instruction={data.instruction || "İpuçlarını dikkatle analiz et ve doğru sayıyı bul."} 
                note={data.pedagogicalNote} 
            />
            
            <div className={`grid ${gridCols} ${gapSize} mt-1 flex-1 content-start`}>
                {(data.puzzles || []).map((puzzle, pIdx) => {
                    // GÜVENLİ PARSE: riddle yoksa riddleParts'tan metin oluştur
                    const rawRiddle = puzzle.riddle || (puzzle.riddleParts?.map(rp => rp.text).join('. ') || '');
                    const hintList = rawRiddle ? rawRiddle.split(/(?<=[.?!])\s+/) : [];

                    return (
                        <EditableElement key={pIdx} className={`flex flex-col border-[1.2px] border-zinc-900 rounded-xl ${cardPadding} bg-white shadow-sm break-inside-avoid relative group hover:border-indigo-600 transition-all`}>
                            {/* Soru Numarası */}
                            <div className="absolute -top-1.5 -left-1 w-5 h-5 bg-zinc-900 text-white rounded flex items-center justify-center font-black text-[9px] shadow-sm z-10 border border-white">
                                {pIdx + 1}
                            </div>

                            {/* İpuçları Listesi */}
                            <div className="space-y-1 mb-2">
                                <h5 className="text-[7px] font-black text-indigo-500 uppercase tracking-widest opacity-60 mb-1 flex items-center gap-1">
                                    <i className="fa-solid fa-fingerprint"></i> Analiz Verileri
                                </h5>
                                {hintList.map((hint, hIdx) => (
                                    <div key={hIdx} className="flex items-start gap-1.5 py-0.5 border-b border-zinc-50 last:border-0">
                                        <div className={`${iconSize} rounded bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5`}>
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </div>
                                        <p className={`${fontSize} font-bold leading-[1.1] text-zinc-800 line-clamp-2`}>
                                            <EditableText value={hint} tag="span" />
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Seçenekler - Kompakt Bento Izgarası */}
                            <div className="mt-auto grid grid-cols-2 gap-1">
                                {puzzle.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1.5 p-1 border border-zinc-100 rounded-lg bg-zinc-50/50 hover:bg-white hover:border-zinc-900 transition-all cursor-pointer group/opt">
                                        <div className="w-3.5 h-3.5 rounded-sm border-[0.5px] border-zinc-300 bg-white flex items-center justify-center text-[7px] font-black text-zinc-400 group-hover/opt:text-indigo-600 shrink-0">
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <span className="text-[9px] font-black text-zinc-900 truncate">
                                            <EditableText value={opt} tag="span" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                })}
            </div>

            {/* Toplam Kontrolü */}
            {data.sumTarget > 0 && (
                <div className="mt-2 border-[1.5px] border-zinc-900 rounded-2xl p-2.5 bg-zinc-50 flex items-center justify-between break-inside-avoid shadow-inner">
                    <div className="flex items-center gap-3">
                         <div className="w-7 h-7 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xs shadow-sm"><i className="fa-solid fa-calculator"></i></div>
                         <div>
                            <h4 className="text-[10px] font-black uppercase tracking-tight leading-none">Toplam Hedef</h4>
                            <p className="text-[7px] text-zinc-400 font-bold uppercase mt-0.5 tracking-widest">Tüm sonuçları topla</p>
                         </div>
                         <div className="text-xl font-black text-indigo-600 font-mono ml-4 drop-shadow-sm">
                            {data.sumTarget}
                         </div>
                    </div>
                </div>
            )}
            
            <div className="mt-1 flex justify-between items-center text-[5.5px] font-black text-zinc-300 uppercase tracking-[0.4em] px-2">
                <span>Bursa Disleksi AI • Sayısal Muhakeme Laboratuvarı v2.5</span>
            </div>
        </div>
    );
};
