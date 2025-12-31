
import React from 'react';
import { MapInstructionData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

const CompassRose = () => (
    <div className="flex flex-col items-center opacity-70 scale-110">
        <div className="w-16 h-16 border-[3px] border-zinc-900 rounded-full flex items-center justify-center relative bg-white shadow-xl">
            <span className="absolute -top-1.5 text-[12px] font-black bg-white px-1">K</span>
            <span className="absolute -bottom-1.5 text-[12px] font-black bg-white px-1">G</span>
            <span className="absolute -left-2 text-[12px] font-black bg-white px-1">B</span>
            <span className="absolute -right-2 text-[12px] font-black bg-white px-1">D</span>
            <div className="w-0.5 h-full bg-zinc-900 absolute left-1/2 -translate-x-1/2"></div>
            <div className="h-0.5 w-full bg-zinc-900 absolute top-1/2 -translate-y-1/2"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full z-10 border-2 border-white"></div>
        </div>
    </div>
);

export const MapDetectiveSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => {
    // Gerçekçi, profesyonel bir Türkiye İdari Haritası URL'i (Wikimedia Commons tabanlı)
    const REAL_ADMIN_MAP = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Turkey_administrative_divisions_map.svg/1200px-Turkey_administrative_divisions_map.svg.png";

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* HARİTA KANVASI */}
            <div className="relative w-full aspect-[1000/500] bg-zinc-50 border-[6px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl mb-10 group">
                {/* Zemin Harita */}
                <img 
                    src={REAL_ADMIN_MAP} 
                    alt="Türkiye İdari Haritası" 
                    className="absolute inset-0 w-full h-full object-contain p-4"
                />
                
                {/* Konumsal Overlay (Görünmez ama referans noktaları) */}
                <svg viewBox="0 0 1000 500" className="w-full h-full absolute inset-0 z-10 pointer-events-none opacity-20">
                    {(data.cities || []).map((city: any) => (
                        <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                            <circle r="6" fill="indigo" className="animate-pulse" />
                            <circle r="2" fill="#000" />
                        </g>
                    ))}
                </svg>

                {/* Pusula & Ölçek Araçları */}
                <div className="absolute bottom-8 right-10 flex items-end gap-10">
                    <div className="flex flex-col items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-zinc-900 shadow-lg">
                        <div className="h-1 w-32 bg-zinc-900 mb-2"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Ölçek: 0 - 200 KM</span>
                    </div>
                    <CompassRose />
                </div>

                {/* Lejant */}
                <div className="absolute top-8 right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl border-2 border-zinc-900 shadow-lg space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <span className="text-[9px] font-black uppercase">İl Sınırı</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-1 bg-zinc-400"></div>
                        <span className="text-[9px] font-black uppercase">Bölge Hattı</span>
                    </div>
                </div>
            </div>

            {/* YÖNERGE KONTROL MERKEZİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 p-10 bg-zinc-50 rounded-[4.5rem] border-2 border-zinc-100 shadow-inner">
                {data.instructions.map((inst, i) => (
                    <EditableElement key={i} className="flex items-start gap-6 p-6 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-indigo-500 hover:shadow-indigo-100 transition-all group cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-base font-black shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                            {i + 1}
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-[16px] font-bold text-zinc-800 leading-relaxed tracking-tight">
                                <EditableText value={inst} tag="span" />
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="h-1 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-emerald-500 group-hover:w-full transition-all duration-1000"></div>
                                </div>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Görev Bekliyor</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl border-[3px] border-zinc-100 shrink-0 mt-1 cursor-pointer hover:bg-emerald-500 hover:border-emerald-600 transition-all shadow-inner flex items-center justify-center group/check">
                            <i className="fa-solid fa-check text-white opacity-0 group-hover/check:opacity-100 text-lg"></i>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* PROFESYONEL ALT BİLGİ */}
            <div className="mt-auto pt-10 flex justify-between items-center px-10 border-t border-zinc-100">
                <div className="flex gap-12">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                        <span className="text-[12px] font-bold text-zinc-800 uppercase">Mekansal Akıl Yürütme</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Modül</span>
                        <span className="text-[12px] font-bold text-indigo-600 uppercase">Coğrafi Dikkat Analizi</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-1">Bursa Disleksi AI • Uzman Serisi</p>
                    <div className="flex gap-2">
                        <i className="fa-solid fa-brain text-zinc-200"></i>
                        <i className="fa-solid fa-map text-zinc-200"></i>
                        <i className="fa-solid fa-shield-halved text-zinc-200"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
