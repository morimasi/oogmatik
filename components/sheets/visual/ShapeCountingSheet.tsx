
import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const SHAPE_PATHS: Record<string, string> = {
    triangle: "M 50 15 L 85 85 L 15 85 Z",
    circle: "M 50 50 m -35 0 a 35 35 0 1 0 70 0 a 35 35 0 1 0 -70 0",
    square: "M 20 20 L 80 20 L 80 80 L 20 80 Z",
    star: "M 50 10 L 61 35 L 88 35 L 66 52 L 75 78 L 50 62 L 25 78 L 34 52 L 12 35 L 39 35 Z",
    hexagon: "M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z",
    pentagon: "M 50 10 L 90 40 L 75 85 L 25 85 L 10 40 Z",
    diamond: "M 50 10 L 85 50 L 50 90 L 15 50 Z"
};

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => {
    // searchField artık bölümlerden (sections) oluşan bir dizi
    const sections = (data.searchField as any) || [];

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black p-1 overflow-hidden select-none">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Hedef Hatırlatıcı */}
            <div className="flex justify-center mb-4">
                <div className="bg-zinc-900 text-white px-6 py-2 rounded-full flex items-center gap-4 shadow-lg border-4 border-white ring-2 ring-zinc-100">
                    <span className="text-[10px] font-black uppercase tracking-widest">ARANAN HEDEF:</span>
                    <svg viewBox="0 0 100 100" className="w-6 h-6 fill-amber-400">
                        <path d={SHAPE_PATHS.triangle} />
                    </svg>
                    <span className="text-sm font-black uppercase tracking-tighter">ÜÇGEN</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 flex-1 content-start mt-2">
                {sections.map((section: any, idx: number) => (
                    <EditableElement 
                        key={idx} 
                        className="flex flex-col border-[2.5px] border-zinc-900 rounded-[2.5rem] bg-white group hover:border-indigo-600 transition-all p-4 relative overflow-hidden break-inside-avoid shadow-sm"
                    >
                        {/* Sayı Rozeti */}
                        <div className="absolute top-0 left-0 bg-zinc-900 text-white px-4 py-1.5 rounded-br-2xl font-black text-xs z-10">
                            SAHA {idx + 1}
                        </div>

                        {/* Kaotik Arama Alanı (Chaos Canvas) */}
                        <div className="flex-1 relative min-h-[300px] border-2 border-dashed border-zinc-100 rounded-[2rem] bg-zinc-50/30 overflow-hidden">
                             <svg viewBox="0 0 100 100" className="w-full h-full">
                                {section.searchField.map((item: any) => (
                                    <path 
                                        key={item.id}
                                        d={SHAPE_PATHS[item.type] || SHAPE_PATHS.triangle}
                                        fill="none"
                                        stroke="black"
                                        strokeWidth={1.5}
                                        style={{
                                            transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.size / 5})`,
                                            transformOrigin: 'center',
                                            transformBox: 'fill-box'
                                        }}
                                        className="transition-colors group-hover:stroke-zinc-400"
                                    />
                                ))}
                             </svg>
                        </div>

                        {/* Cevap Giriş Alanı */}
                        <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Kaç Üçgen Var?</span>
                            </div>
                            <div className="w-20 h-10 border-b-[3px] border-zinc-900 bg-zinc-100 rounded-t-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <EditableText value="" tag="div" placeholder="?" className="font-black text-xl text-indigo-600" />
                            </div>
                        </div>

                        {/* Gizli İpucu (Ters Yazı) */}
                        <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[9px] font-black select-none pointer-events-none">
                            ANS: {section.correctCount}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Performance Tracker / Footer */}
            <div className="mt-4 pt-4 border-t-2 border-zinc-900 flex justify-between items-end px-6 opacity-40">
                <div className="flex gap-10">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                        <span className="text-[9px] font-bold text-zinc-800 uppercase leading-none">Görsel-Uzamsal Seçicilik</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-1">Bursa Disleksi AI • Figure-Ground Testing</p>
                    <div className="flex gap-3">
                         <i className="fa-solid fa-shapes"></i>
                         <i className="fa-solid fa-eye-low-vision"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
