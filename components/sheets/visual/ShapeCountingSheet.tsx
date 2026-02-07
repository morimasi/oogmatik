
import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => {
    const items = data.searchField || [];
    const count = items.length;
    
    // Sayfa Düzeni Optimizasyonu
    const gridCols = count <= 2 ? 'grid-cols-1' : (count <= 4 ? 'grid-cols-2' : 'grid-cols-3');
    const gapSize = count > 6 ? 'gap-2' : 'gap-6';

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black p-1 overflow-hidden select-none">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className={`grid ${gridCols} ${gapSize} mt-4 flex-1 content-start`}>
                {items.map((item: any, idx) => (
                    <EditableElement 
                        key={idx} 
                        className="flex flex-col border-[2.5px] border-zinc-900 rounded-[2.5rem] bg-white group hover:border-indigo-600 transition-all p-6 relative overflow-hidden break-inside-avoid shadow-sm"
                    >
                        {/* Sayı Rozeti */}
                        <div className="absolute top-0 left-0 bg-zinc-900 text-white px-4 py-1.5 rounded-br-2xl font-black text-xs z-10">
                            {idx + 1}
                        </div>

                        {/* Geometrik Çizim Alanı */}
                        <div className="flex-1 flex items-center justify-center min-h-[180px] py-4">
                            <svg viewBox="0 0 100 100" className="w-full h-full max-w-[220px] drop-shadow-sm">
                                {item.svgPaths?.map((path: any, pIdx: number) => (
                                    <path 
                                        key={pIdx}
                                        d={path.d}
                                        fill={path.fill}
                                        stroke={path.stroke}
                                        strokeWidth={path.strokeWidth}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="transition-colors group-hover:stroke-indigo-600"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Cevap Giriş Alanı */}
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tahmin</span>
                                <span className="text-[8px] text-zinc-300 font-bold uppercase italic leading-none">Toplam Sayı</span>
                            </div>
                            <div className="w-16 h-12 border-b-[3px] border-zinc-900 bg-zinc-50 rounded-t-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <EditableText value="" tag="div" placeholder="?" className="font-black text-2xl text-indigo-600" />
                            </div>
                        </div>

                        {/* Gizli İpucu (Ters Yazı) */}
                        <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[9px] font-black select-none pointer-events-none">
                            ANS: {item.correctCount}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Performance Tracker / Footer */}
            <div className="mt-6 pt-6 border-t-2 border-zinc-900 flex justify-between items-end px-6 opacity-40">
                <div className="flex gap-10">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                        <span className="text-[10px] font-bold text-zinc-800 uppercase leading-none">Görsel Analitik</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Zorluk</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase leading-none">{data.settings.difficulty}</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-1">Bursa Disleksi AI • Geometrik Algı</p>
                    <div className="flex gap-4">
                         <i className="fa-solid fa-shapes"></i>
                         <i className="fa-solid fa-microscope"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
