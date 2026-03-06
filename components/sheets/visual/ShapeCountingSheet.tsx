
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

export const ShapeCountingSheet = ({ data }: { data: ShapeCountingData }) => {
    const settings = data?.settings;
    const sections = data?.sections || [];
    const layout = settings?.layout || 'single';
    const isProfessionalMode = settings?.isProfessionalMode;

    const gridCols = layout === 'grid_2x1' ? 'grid-cols-2' : (layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1');

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data.title || "ŞEKİL SAYMA & GÖRSEL SEÇİCİLİK"} instruction={data.instruction} note={data.pedagogicalNote} />

            {/* Hedef Hatırlatıcı Panel */}
            <div className="flex justify-center my-4">
                <div className="bg-zinc-900 text-white px-8 py-3 rounded-2xl flex items-center gap-6 shadow-xl border-2 border-zinc-800 ring-4 ring-zinc-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Aranan Hedef</span>
                        <span className="text-sm font-black uppercase tracking-tighter">{settings?.targetShape === 'triangle' ? 'ÜÇGEN' : settings?.targetShape}</span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center p-1.5">
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                            <path d={SHAPE_PATHS[settings?.targetShape || 'triangle']} />
                        </svg>
                    </div>
                </div>
            </div>

            <div className={`grid ${gridCols} gap-6 mt-4 flex-1 content-start items-start`}>
                {sections.map((section, idx) => (
                    <EditableElement
                        key={idx}
                        className="flex flex-col border-2 border-zinc-900 rounded-[2.5rem] bg-white group p-5 relative overflow-visible shadow-sm break-inside-avoid"
                    >
                        {/* Bölüm Başlığı */}
                        <div className="absolute -top-3 left-8 px-4 py-1 bg-zinc-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest z-10 shadow-lg">
                            {section.title || `SAHA ${idx + 1}`}
                        </div>

                        {/* Arama Alanı */}
                        <div className="relative aspect-video border-2 border-zinc-100 rounded-3xl bg-zinc-50/50 overflow-hidden mb-4">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {section.searchField.map((item: any) => (
                                    <path
                                        key={item.id}
                                        d={SHAPE_PATHS[item.type] || SHAPE_PATHS.triangle}
                                        fill={settings?.overlapping ? "rgba(0,0,0,0.05)" : "none"}
                                        stroke="black"
                                        strokeWidth={1.2}
                                        style={{
                                            transform: `translate(${item.x}%, ${item.y}%) rotate(${item.rotation}deg) scale(${item.size / 8})`,
                                            transformOrigin: 'center',
                                            transformBox: 'fill-box'
                                        }}
                                        className="mix-blend-multiply"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Cevap & Klinik Bilgi */}
                        <div className="flex items-end justify-between px-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Cevap Alanı</span>
                                <div className="w-24 h-12 border-b-4 border-zinc-900 bg-zinc-100/50 rounded-t-xl flex items-center justify-center">
                                    <EditableText value="" tag="div" placeholder="?" className="font-black text-2xl text-zinc-900" />
                                </div>
                            </div>

                            {settings?.showClinicalNotes && section.clinicalMeta && (
                                <div className="text-right flex flex-col items-end opacity-40">
                                    <span className="text-[6px] font-black uppercase text-zinc-500 tracking-tighter">Figür-Zemin Karmaşası: {section.clinicalMeta.figureGroundComplexity}</span>
                                    <span className="text-[6px] font-black uppercase text-zinc-500 tracking-tighter">İç İçe Geçme: %{Math.round(section.clinicalMeta.overlappingRatio * 100)}</span>
                                </div>
                            )}
                        </div>

                        {/* Hidden Solution */}
                        <div className="absolute bottom-2 right-6 opacity-0 group-hover:opacity-5 transition-opacity rotate-180 text-[7px] font-black select-none pointer-events-none">
                            ÇİS: {section.correctCount}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Footer / Tracker */}
            <div className="mt-8 pt-4 border-t-2 border-zinc-900/10 flex justify-between items-end opacity-30 no-print">
                <div className="flex flex-col gap-1">
                    <span className="text-[6px] font-black text-zinc-400 uppercase tracking-[0.4em]">Bursa Disleksi AI • Nöro-Görsel Modül</span>
                    <span className="text-[8px] font-bold">Görsel Seçicilik & Ketleme Testi v4.2</span>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
                </div>
            </div>
        </div>
    );
};
