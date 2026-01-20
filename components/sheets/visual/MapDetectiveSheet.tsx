
import React from 'react';
import { MapInstructionData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const CompassRose = () => (
    <div className="flex flex-col items-center opacity-70 scale-110">
        <div className="w-16 h-16 border-[3px] border-zinc-900 rounded-full flex items-center justify-center relative bg-white shadow-xl">
            <span className="absolute -top-1.5 text-[12px] font-black bg-white px-1 leading-none">K</span>
            <span className="absolute -bottom-1.5 text-[12px] font-black bg-white px-1 leading-none">G</span>
            <span className="absolute -left-2 text-[12px] font-black bg-white px-1 leading-none">B</span>
            <span className="absolute -right-2 text-[12px] font-black bg-white px-1 leading-none">D</span>
            <div className="w-0.5 h-full bg-zinc-900 absolute left-1/2 -translate-x-1/2"></div>
            <div className="h-0.5 w-full bg-zinc-900 absolute top-1/2 -translate-y-1/2"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full z-10 border-2 border-white"></div>
        </div>
    </div>
);

const MapMarker = ({ type }: { type: string }) => {
    switch (type) {
        case 'star': return <i className="fa-solid fa-star text-indigo-600 text-[12px]"></i>;
        case 'target': return <i className="fa-solid fa-crosshairs text-indigo-600 text-[12px]"></i>;
        case 'dot': return <circle r="4" fill="#000" />;
        case 'none': return null;
        default: return (
            <g>
                <circle r="8" fill="indigo" fillOpacity="0.2" className="animate-pulse" />
                <circle r="4" fill="#000" stroke="white" strokeWidth="1.5" />
            </g>
        );
    }
};

export const MapDetectiveSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => {
    // Öncelik: Kullanıcı tarafından yüklenen harita görseli > Wikimedia Fallback
    const isCustomMap = !!data.imageBase64;
    const mapSource = data.imageBase64 || "https://upload.wikimedia.org/wikipedia/commons/1/12/Turkey_provinces_blank_map.svg";
    
    // Eğer özel bir harita ise koordinatları orantılamak gerekebilir (0-1000 range varsayılıyor)
    const isRegionFocused = data.cities && data.cities.length < 50;

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* HARİTA KANVASI */}
            <div className="relative w-full aspect-[1000/500] bg-white border-[6px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl mb-10 group min-h-[450px]">
                
                {/* Zemin Harita Katmanı */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4 bg-white z-10">
                     <img 
                        src={mapSource} 
                        alt="Türkiye Haritası" 
                        crossOrigin={isCustomMap ? undefined : "anonymous"}
                        className={`w-full h-full object-contain ${isCustomMap ? '' : 'mix-blend-multiply'} transition-all duration-700 ${isRegionFocused ? 'scale-110 opacity-80' : 'opacity-100'}`}
                    />
                </div>
                
                {/* Konumsal Overlay (Dinamik AI İşaretçileri) */}
                <svg viewBox="0 0 1000 500" className="w-full h-full absolute inset-0 z-20 pointer-events-none drop-shadow-md">
                    {(data.cities || []).map((city: any) => (
                        <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                            <MapMarker type={data.settings?.markerStyle || 'circle'} />
                            {data.settings?.showCityNames !== false && (
                                <text 
                                    y="-16" 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="900" 
                                    className="fill-zinc-900 font-sans tracking-tight"
                                    style={{ 
                                        paintOrder: 'stroke', 
                                        stroke: 'white', 
                                        strokeWidth: '4px', 
                                        strokeLinejoin: 'round'
                                    }}
                                >
                                    {city.name}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>

                {/* Pusula & Araçlar Overlay */}
                <div className="absolute bottom-8 right-10 flex items-end gap-10 z-30 no-print">
                    <CompassRose />
                </div>

                {/* Manuel Harita Modu Rozeti */}
                {isCustomMap && (
                    <div className="absolute top-8 right-10 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border-2 border-white z-40 animate-in fade-in">
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>AI Analiz Aktif
                    </div>
                )}
            </div>

            {/* YÖNERGE LİSTESİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 p-8 bg-zinc-50 rounded-[4rem] border-2 border-zinc-100 shadow-inner">
                {(data.instructions || []).map((inst, i) => (
                    <EditableElement key={i} className="flex items-start gap-5 p-5 bg-white rounded-[2rem] border border-zinc-200 shadow-sm hover:border-indigo-500 hover:shadow-indigo-100 transition-all group cursor-default">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                            {i + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="text-[15px] font-bold text-zinc-800 leading-snug tracking-tight">
                                <EditableText value={inst} tag="span" />
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-2xl border-[3px] border-zinc-100 shrink-0 mt-0.5 cursor-pointer hover:bg-emerald-500 hover:border-emerald-600 transition-all shadow-inner flex items-center justify-center group/check no-print">
                            <i className="fa-solid fa-check text-white opacity-0 group-hover/check:opacity-100 text-base"></i>
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-10 flex justify-between items-center px-10 border-t border-zinc-100 opacity-30">
                <div className="flex gap-12">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sistem</span>
                        <span className="text-[11px] font-bold text-zinc-800 uppercase">Manuel Görsel Entegrasyonu</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Motor</span>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase">Multimodal AI Vizyon</span>
                     </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-1 text-right">Bursa Disleksi AI • Uzman Serisi</p>
                    <div className="flex gap-4">
                        <i className="fa-solid fa-map-location-dot"></i>
                        <i className="fa-solid fa-brain"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
