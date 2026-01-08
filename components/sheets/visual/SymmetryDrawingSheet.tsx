
import React from 'react';
import { SymmetryDrawingData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const gridDim = data?.gridDim || 10;
    
    // A4 Alan hesaplaması
    const maxAvailableWidth = 650;
    const cellSize = Math.min(45, Math.floor(maxAvailableWidth / gridDim));
    const totalSize = gridDim * cellSize;
    const showCoords = data?.showCoordinates;
    const axis = data?.axis || 'vertical';
    const offset = showCoords ? 30 : 15;

    // Pedagojik referans noktaları (Ghost Points)
    // Sadece başlangıç ve orta seviyede yardımcı noktalar gösterilir
    const showGhostPoints = true; 

    return (
        <div className="flex flex-col h-full bg-white p-2 font-lexend text-black">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
                {/* Teknik Çizim Etiketi */}
                <div className="absolute top-4 left-10 flex gap-4 opacity-40 select-none no-print">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Simetri Ekseni
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-3 h-3 border-2 border-indigo-200 rounded-full"></div> Referans Noktası
                    </div>
                </div>

                <EditableElement className="relative p-12 bg-zinc-50/30 rounded-[3.5rem] border-2 border-zinc-100 shadow-sm overflow-visible">
                    {/* Ana Izgara ve Çizim Alanı */}
                    <div className="bg-white p-6 border-[4px] border-zinc-900 shadow-2xl relative overflow-visible rounded-2xl">
                        <svg width={totalSize + offset * 2} height={totalSize + offset * 2} className="overflow-visible">
                            {/* Blueprint Izgarası */}
                            <g transform={`translate(${offset}, ${offset})`}>
                                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} stroke="#f1f5f9" strokeWidth="1" />
                                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} stroke="#f1f5f9" strokeWidth="1" />
                                        
                                        {showCoords && (
                                            <>
                                                <text x={i * cellSize} y="-15" textAnchor="middle" fontSize="10" fontWeight="900" className="fill-zinc-300 font-mono">
                                                    {String.fromCharCode(65 + i)}
                                                </text>
                                                <text x="-15" y={i * cellSize} dominantBaseline="middle" textAnchor="end" fontSize="10" fontWeight="900" className="fill-zinc-300 font-mono">
                                                    {i + 1}
                                                </text>
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Tüm Noktalar (Grid Points) */}
                                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                                    const r = Math.floor(i / (gridDim + 1));
                                    const c = i % (gridDim + 1);
                                    return <circle key={i} cx={c * cellSize} cy={r * cellSize} r="1.5" className="fill-zinc-200" />
                                })}

                                {/* GHOST POINTS (Yansıma Hedefleri - Pedagojik Destek) */}
                                {showGhostPoints && (data?.dots || []).map((dot, i) => {
                                    const mirroredX = axis === 'vertical' ? (gridDim - dot.x) : dot.x;
                                    const mirroredY = axis === 'vertical' ? dot.y : (gridDim - dot.y);
                                    return (
                                        <circle 
                                            key={`ghost-${i}`} 
                                            cx={mirroredX * cellSize} cy={mirroredY * cellSize} 
                                            r="4" 
                                            className="fill-indigo-50 stroke-indigo-100 stroke-1" 
                                        />
                                    );
                                })}

                                {/* SOL/ÜST TARAF (Orijinal Şekil) */}
                                {(data?.lines || []).map((l, i) => (
                                    <line 
                                        key={i} 
                                        x1={l.x1 * cellSize} y1={l.y1 * cellSize} 
                                        x2={l.x2 * cellSize} y2={l.y2 * cellSize} 
                                        stroke="#0f172a" 
                                        strokeWidth="5" 
                                        strokeLinecap="round"
                                        fill="none"
                                    />
                                ))}

                                {(data?.dots || []).map((dot, i) => (
                                    <circle key={i} cx={dot.x * cellSize} cy={dot.y * cellSize} r="5" fill="#0f172a" />
                                ))}

                                {/* SİMETRİ EKSENİ (Vurgulu) */}
                                {axis === 'vertical' ? (
                                    <g>
                                        <line x1={(gridDim / 2) * cellSize} y1="-20" x2={(gridDim / 2) * cellSize} y2={totalSize + 20} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" />
                                        <polygon points={`${(gridDim / 2) * cellSize},-30 ${(gridDim / 2) * cellSize - 6},-20 ${(gridDim / 2) * cellSize + 6},-20`} fill="#f43f5e" />
                                        <polygon points={`${(gridDim / 2) * cellSize},${totalSize + 30} ${(gridDim / 2) * cellSize - 6},${totalSize + 20} ${(gridDim / 2) * cellSize + 6},${totalSize + 20}`} fill="#f43f5e" />
                                    </g>
                                ) : (
                                    <g>
                                        <line x1="-20" y1={(gridDim / 2) * cellSize} x2={totalSize + 20} y2={(gridDim / 2) * cellSize} stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,4" />
                                        <polygon points={`${totalSize + 30},${(gridDim / 2) * cellSize} ${totalSize + 20},${(gridDim / 2) * cellSize - 6} ${totalSize + 20},${(gridDim / 2) * cellSize + 6}`} fill="#f43f5e" />
                                        <polygon points={`-30,${(gridDim / 2) * cellSize} -20,${(gridDim / 2) * cellSize - 6} -20,${(gridDim / 2) * cellSize + 6}`} fill="#f43f5e" />
                                    </g>
                                )}
                            </g>
                        </svg>
                    </div>

                    {/* Klinik Hata Analiz Paneli (Uzmanlar İçin) */}
                    <div className="mt-12 grid grid-cols-3 gap-6 w-full opacity-60 hover:opacity-100 transition-opacity no-print">
                         <div className="flex flex-col gap-2 p-3 bg-white border border-zinc-200 rounded-xl">
                             <span className="text-[8px] font-black uppercase text-zinc-400">Motor Kontrol</span>
                             <div className="flex gap-1">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 border border-zinc-300 rounded-sm"></div>)}
                             </div>
                         </div>
                         <div className="flex flex-col gap-2 p-3 bg-white border border-zinc-200 rounded-xl">
                             <span className="text-[8px] font-black uppercase text-zinc-400">Zihinsel Döndürme</span>
                             <div className="flex gap-1">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 border border-zinc-300 rounded-sm"></div>)}
                             </div>
                         </div>
                         <div className="flex flex-col gap-2 p-3 bg-white border border-zinc-200 rounded-xl">
                             <span className="text-[8px] font-black uppercase text-zinc-400">Koordinat Takibi</span>
                             <div className="flex gap-1">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 border border-zinc-300 rounded-sm"></div>)}
                             </div>
                         </div>
                    </div>
                </EditableElement>
            </div>

            {/* Footer Notu */}
            <div className="mt-auto pt-6 flex justify-between items-center border-t border-zinc-100 opacity-30">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase text-zinc-400">Analiz Modülü</span>
                    <span className="text-[9px] font-bold">Simetri & Mekansal Algı v4.0</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-compass-drafting text-xl"></i>
                        <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Bursa Disleksi AI • Nöro-Görsel Batarya</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
