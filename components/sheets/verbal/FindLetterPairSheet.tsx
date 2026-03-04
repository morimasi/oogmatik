
import React from 'react';
import { FindLetterPairData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => {
    const { grids, settings } = data;
    
    // Grid yerleşimi: Öğe sayısına göre sütun belirleme
    const gridColsClass = grids.length === 1 ? 'grid-cols-1' : (grids.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2');

    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className={`grid ${gridColsClass} gap-x-12 gap-y-16 mt-8 flex-1 content-start`}>
                {(grids || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center break-inside-avoid group">
                        {/* HEDEF GÖSTERGESİ */}
                        <EditableElement className="mb-6 flex flex-col items-center">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">HEDEF İKİLİ</span>
                            <div className="px-12 py-4 bg-zinc-900 text-white rounded-[1.5rem] font-black text-4xl shadow-xl border-4 border-white ring-8 ring-zinc-50 transform group-hover:scale-110 transition-transform duration-500">
                                <EditableText value={item.targetPair} tag="span" />
                            </div>
                        </EditableElement>

                        {/* HARF TABLOSU */}
                        <div className="bg-white border-[5px] border-zinc-900 p-4 rounded-[2.5rem] shadow-2xl overflow-hidden relative group-hover:border-indigo-500 transition-colors">
                            <table className="border-collapse">
                                <tbody>
                                    {item.grid.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => (
                                                <td 
                                                    key={cIdx} 
                                                    className={`
                                                        border border-zinc-100 text-center font-black transition-all hover:bg-indigo-50 cursor-default select-none text-zinc-900
                                                        ${settings.gridSize > 12 ? 'w-8 h-8 text-sm' : (settings.gridSize > 8 ? 'w-11 h-11 text-xl' : 'w-14 h-14 text-2xl')}
                                                    `}
                                                >
                                                    <EditableText value={cell} tag="span" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PUANLAMA / İSTATİSTİK ŞERİDİ */}
                        <div className="mt-8 flex gap-6 w-full max-w-[220px]">
                            <div className="flex-1 text-center">
                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">BULUNAN</span>
                                <div className="h-10 border-b-2 border-dashed border-zinc-200 flex items-center justify-center font-bold text-zinc-200 italic text-sm">/ {settings.gridSize > 10 ? '12+' : '8'}</div>
                            </div>
                            <div className="flex-1 text-center">
                                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">SÜRE</span>
                                <div className="h-10 border-b-2 border-dashed border-zinc-200 flex items-center justify-center font-bold text-zinc-200 italic text-sm">00:00</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center px-10 border-t border-zinc-100 opacity-30">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">Görsel Tarama & Dikkat v1.0</span>
                </div>
                <div className="flex gap-4">
                    <i className="fa-solid fa-eye text-xl"></i>
                    <i className="fa-solid fa-brain text-xl"></i>
                </div>
            </div>
        </div>
    );
};
