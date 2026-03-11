
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

    const gridCols = layout === 'grid_2x1' ? 'grid-cols-2' : (layout === 'grid_2x2' ? 'grid-cols-2' : 'grid-cols-1');

    return (
<<<<<<< HEAD
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
=======
        <div className="flex flex-col h-full print:h-0 bg-white font-sans text-black overflow-visible professional-worksheet">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
            <PedagogicalHeader
                title={data.title || "FİGÜR-ZEMİN & SEÇİCİ DİKKAT"}
                instruction={data.instruction || "Aşağıdaki karmaşık alanda hedef şekli bulup kaç adet olduğunu yazın."}
                note={data.pedagogicalNote}
            />

            {/* Hedef Hatırlatıcı Panel - Premium */}
            <div className="flex justify-center my-6 print:my-2">
                <div className="bg-zinc-900 text-white px-10 print:px-3 py-4 print:py-1 rounded-[2.5rem] flex items-center gap-8 print:gap-2 print:gap-3 print:p-3 shadow-2xl border-4 border-white ring-8 ring-zinc-50 transform hover:scale-105 transition-transform">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">ARANAN HEDEF</span>
                        <span className="text-xl font-black uppercase tracking-tighter">{settings?.targetShape || 'ÜÇGEN'}</span>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center p-2 border border-white/20">
<<<<<<< HEAD
                        <svg viewBox="0 0 100 100" className="w-full h-full  fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
=======
                        <svg viewBox="0 0 100 100" className="w-full h-full print:h-0 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                            <path d={SHAPE_PATHS[settings?.targetShape || 'triangle']} />
                        </svg>
                    </div>
                </div>
            </div>

            <div className={`grid ${gridCols} gap-6 print:gap-2 mt-4 print:mt-1 flex-1 content-start items-start pb-10 print:pb-3`}>
                {sections.map((section, idx) => (
                    <EditableElement
                        key={idx}
                        className="flex flex-col border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/50 group p-6 print:p-2 relative overflow-visible shadow-sm break-inside-avoid hover:border-indigo-200 hover:bg-white transition-all"
                    >
                        {/* Bölüm Başlığı */}
                        <div className="absolute -top-3 left-10 px-4 print:px-1 py-1 bg-zinc-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest z-10 shadow-lg border-2 border-white">
                            {section.title || `GÖRSEL SAHA ${idx + 1}`}
                        </div>

                        {/* Arama Alanı - High Quality */}
                        <div className="relative aspect-video border-2 border-zinc-200 rounded-[2.5rem] bg-white overflow-hidden mb-6 print:mb-2 shadow-inner ring-4 ring-zinc-50">
<<<<<<< HEAD
                            <svg viewBox="0 0 100 100" className="w-full h-full ">
=======
                            <svg viewBox="0 0 100 100" className="w-full h-full print:h-0">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
                                {section.searchField.map((item: any) => (
                                    <path
                                        key={item.id}
                                        d={SHAPE_PATHS[item.type] || SHAPE_PATHS.triangle}
                                        fill={settings?.overlapping ? "rgba(79, 70, 229, 0.08)" : "none"}
                                        stroke="black"
                                        strokeWidth={1.5}
                                        style={{
                                            transform: `translate(${item.x}%, ${item.y}%) rotate(${item.rotation}deg) scale(${item.size / 8})`,
                                            transformOrigin: 'center',
                                            transformBox: 'fill-box'
                                        }}
                                        className="mix-blend-multiply opacity-80"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Cevap & Klinik Bilgi */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4 print:gap-1">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Toplam:</span>
                                <div className="w-20 h-14 border-b-4 border-zinc-900 bg-zinc-100 rounded-t-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                    <EditableText value="" tag="div" placeholder="?" className="font-black text-3xl text-zinc-900" />
                                </div>
                            </div>

                            {settings?.showClinicalNotes && section.clinicalMeta && (
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[7px] font-black uppercase text-indigo-400 tracking-tighter mb-0.5">F/G İndeksi: {section.clinicalMeta.figureGroundComplexity}</span>
                                    <span className="text-[7px] font-black uppercase text-indigo-400 tracking-tighter">İç İçe Geçme: %{Math.round(section.clinicalMeta.overlappingRatio * 100)}</span>
                                </div>
                            )}
                        </div>

                        {/* Hidden Solution */}
                        <div className="absolute bottom-2 right-8 opacity-0 group-hover:opacity-5 transition-opacity rotate-180 text-[7px] font-black select-none pointer-events-none">
                            ÇİS: {section.correctCount}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Alt Bilgi - Klinik Tracker */}
            <div className="mt-auto p-6 print:p-2 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">BİLİŞSEL HEDEF</span>
                        <span className="text-xs font-black uppercase">Figür-Zemin & Ketleme</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                    <span className="text-[8px] font-bold tracking-[0.2em]">OKÜLER DİKKAT TESTİ v2.2</span>
                    <i className="fa-solid fa-eye text-indigo-400 text-xs shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};



<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
