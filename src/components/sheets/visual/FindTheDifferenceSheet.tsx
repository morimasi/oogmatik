
import React from 'react';
import { FindTheDifferenceData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindTheDifferenceSheet = ({ data }: { data: FindTheDifferenceData & { gridA?: any[][], gridB?: any[][], diffCount?: number } }) => {
    const rows = data?.rows || [];
    const settings = data?.settings;
    const isUltraDense = settings?.layout === 'ultra_dense';
    const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;
    const isSideBySide = settings?.layout === 'side_by_side' || (data.gridA && data.gridB);

    if (isSideBySide && data.gridA && data.gridB) {
        return (
            <div className="flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-10 print:p-6 min-h-[297mm]">
                <PedagogicalHeader
                    title={data?.title || "FARK BULMACA: TABLO KARŞILAŞTIRMA"}
                    instruction={data?.instruction || `Sol taraftaki tablo ile sağ taraftaki tablo arasındaki ${data.diffCount || ''} farkı bulun.`}
                    note={data?.pedagogicalNote}
                    data={data}
                />

                <div className="flex-1 flex flex-col md:flex-row gap-12 print:gap-4 mt-12 print:mt-6 items-start justify-center px-4 print:px-0">
                    {/* Tablo A */}
                    <div className="flex-1 flex flex-col items-center gap-6 print:gap-3 w-full">
                        <div className="px-6 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl flex items-center gap-2">
                             <i className="fa-solid fa-crosshairs text-indigo-400"></i>
                             REFERANS TABLO
                        </div>
                        <div className="w-full grid gap-3 p-6 print:p-2 border-[4px] border-zinc-900 bg-white rounded-[3.5rem] shadow-[20px_20px_0px_rgba(0,0,0,0.05)]" style={{ gridTemplateColumns: `repeat(${data.gridA[0].length}, 1fr)` }}>
                            {data.gridA.flat().map((cell, i) => (
                                <div key={i} className="aspect-square border-2 border-zinc-100 rounded-2xl flex items-center justify-center font-black text-2xl bg-zinc-50/30 shadow-inner">
                                    <EditableText value={String(cell)} tag="span" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ayırıcı / Ok */}
                    <div className="self-center flex flex-col items-center opacity-10 hidden md:flex shrink-0">
                        <div className="w-16 h-16 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                             <i className="fa-solid fa-arrow-right-arrow-left text-2xl"></i>
                        </div>
                    </div>

                    {/* Tablo B */}
                    <div className="flex-1 flex flex-col items-center gap-6 print:gap-3 w-full">
                        <div className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl flex items-center gap-2">
                             <i className="fa-solid fa-magnifying-glass text-white/80"></i>
                             FARKLARI İŞARETLE
                        </div>
                        <div className="w-full grid gap-3 p-6 print:p-2 border-[4px] border-indigo-600 bg-white rounded-[3.5rem] shadow-[20px_20px_0px_rgba(79,70,229,0.05)]" style={{ gridTemplateColumns: `repeat(${data.gridB[0].length}, 1fr)` }}>
                            {data.gridB.flat().map((cell, i) => (
                                <div key={i} className="aspect-square border-2 border-indigo-100 rounded-2xl flex items-center justify-center font-black text-2xl hover:bg-indigo-50 cursor-pointer transition-all relative group bg-white shadow-sm hover:scale-[1.05] active:scale-95">
                                    <EditableText value={String(cell)} tag="span" />
                                    <div className="absolute inset-2 rounded-xl border-2 border-transparent group-hover:border-indigo-300 border-dashed animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alt Klinik Panel */}
                <div className="mt-12 pt-8 border-t-[4px] border-zinc-900 grid grid-cols-3 gap-6">
                    <div className="bg-zinc-900 text-white rounded-3xl p-5 flex flex-col justify-between h-24">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">HEDEF ANALİZ</span>
                        <span className="text-xl font-black uppercase tracking-tighter">{data.diffCount} ADET FARK</span>
                    </div>
                    <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 shadow-lg">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">İŞLEM SÜRESİ</span>
                        <span className="text-2xl font-black">__:__</span>
                    </div>
                    <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-24 shadow-lg">
                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">HATA / SKOR</span>
                       <div className="flex gap-2">
                           {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 rounded-full border-2 border-zinc-100 bg-zinc-50"></div>)}
                       </div>
                    </div>
                </div>
            </div>
        );
    }

    // Seçicilik / Ayrıştırma Modu (Rows)
    let gridCols = "grid-cols-1";
    if (isUltraDense) gridCols = "grid-cols-3";
    else if (isGridCompact) gridCols = "grid-cols-2";

    return (
        <div className="flex flex-col h-full bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative p-10 print:p-6 min-h-[297mm]">
            <PedagogicalHeader
                title={data?.title || "FARKLI OLANI BUL & AYRIŞTIRMA"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi bulun ve işaretleyin."}
                note={data?.pedagogicalNote}
                data={data}
            />

            <div className={`grid ${gridCols} gap-4 print:gap-2 mt-8 print:mt-4 flex-1 content-start`}>
                {rows.map((row, index) => {
                    const items = row?.items || [];
                    const isHard = row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
                    const meta = row?.clinicalMeta;

                    return (
                        <EditableElement
                            key={index}
                            className={`
                                flex flex-col p-5 print:p-2 border-2 border-zinc-100 rounded-[2.8rem] bg-zinc-50/40 transition-all break-inside-avoid relative group hover:bg-white hover:border-indigo-300 hover:shadow-[10px_10px_0px_rgba(79,70,229,0.05)]
                                ${isUltraDense ? 'p-3 rounded-[2rem]' : ''}
                            `}
                        >
                            <div className="absolute -top-3 -left-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-xl text-[12px] border-2 border-white z-10 transform -rotate-12 group-hover:rotate-0 transition-transform">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center justify-around w-full gap-4 py-4 print:py-1">
                                {items.map((item, itemIndex) => {
                                    const isCorrect = itemIndex === row.correctIndex;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className={`
                                                flex-1 aspect-square flex items-center justify-center border-2 border-zinc-100 rounded-[1.8rem] cursor-pointer hover:bg-indigo-50 transition-all group/item bg-white shadow-sm relative overflow-hidden
                                                ${isHard ? 'ring-2 ring-amber-500/20' : ''}
                                                ${isUltraDense ? 'rounded-2xl' : ''}
                                            `}
                                        >
                                            {typeof item === 'object' && item !== null && 'svg' in item && (item as any).svg ? (
                                                <div className="w-[85%] h-[85%] flex items-center justify-center transition-transform group-hover/item:scale-110" dangerouslySetInnerHTML={{ __html: (item as any).svg }} />
                                            ) : (
                                                <span
                                                    className={`font-black leading-none select-none text-zinc-900 font-mono transition-transform group-hover/item:scale-125
                                                        ${String(item).length > 5 ? 'text-xs' : String(item).length > 3 ? 'text-sm' : 'text-2xl'}
                                                    `}
                                                    style={{ transform: `${meta?.isMirrored && isCorrect ? 'scaleX(-1)' : ''} rotate(${meta?.rotationAngle && isCorrect ? meta.rotationAngle : 0}deg)` }}
                                                >
                                                    <EditableText value={String(item)} tag="span" />
                                                </span>
                                            )}
                                            
                                            {/* İşaretleme Alanı */}
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-50 rounded-tl-2xl border-l-2 border-t-2 border-zinc-100 group-hover/item:bg-indigo-600 group-hover/item:border-indigo-600 transition-all"></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {settings?.showClinicalNotes && meta && (
                                <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-[8px] font-black uppercase text-indigo-400 tracking-[0.15em] opacity-40 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2">
                                         <i className="fa-solid fa-fingerprint"></i>
                                         <span>{meta.errorType || 'AYRIŞTIRMA ODAKLI'}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        {meta.isMirrored && <span className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full">AYNA ETKİSİ</span>}
                                        {meta.rotationAngle && <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full">ROTASYON {meta.rotationAngle}°</span>}
                                    </div>
                                </div>
                            )}
                        </EditableElement>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-auto grid grid-cols-3 gap-6 pt-8 border-t-[4px] border-zinc-900">
                 <div className="bg-zinc-900 text-white rounded-3xl p-5 flex flex-col justify-between h-20 shadow-xl">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">BİLİŞSEL ODAK</span>
                    <span className="text-xs font-black uppercase tracking-tight">Görsel Seçicilik & Ketleme</span>
                </div>
                <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 h-20 flex items-center justify-center">
                     <i className="fa-solid fa-microscope text-3xl text-zinc-200"></i>
                </div>
                <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 flex flex-col justify-between h-20 shadow-lg">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">VERSİYON PROTOKOL</span>
                    <span className="text-[10px] font-black text-zinc-900 uppercase">DİSKRİMİNASYON v6.2.0</span>
                </div>
            </div>
        </div>
    );
};




