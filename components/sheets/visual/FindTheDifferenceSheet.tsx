
import React from 'react';
import { FindTheDifferenceData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindTheDifferenceSheet = ({ data }: { data: FindTheDifferenceData }) => {
    const rows = data?.rows || [];
    const settings = data?.settings;
    const isUltraDense = settings?.layout === 'ultra_dense';
    const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;

    // Grid sütun sayısını ayarla
    let gridCols = "grid-cols-1";
    if (isUltraDense) gridCols = "grid-cols-3";
    else if (isGridCompact) gridCols = "grid-cols-2";

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data?.title || "FARKLI OLANI BUL & AYRIŞTIRMA"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi bulun ve işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-4 mt-6 flex-1 content-start pb-10`}>
                {rows.map((row, index) => {
                    const items = row?.items || [];
                    const isHard = row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
                    const meta = row?.clinicalMeta;

                    return (
                        <EditableElement
                            key={index}
                            className={`
                                flex flex-col p-4 border-2 border-zinc-100 rounded-[2.5rem] bg-zinc-50/30 transition-all break-inside-avoid relative group hover:bg-white hover:border-indigo-200 hover:shadow-lg
                                ${isUltraDense ? 'p-3' : ''}
                            `}
                        >
                            {/* Soru Numarası - Professional Badge */}
                            <div className="absolute -top-3 -left-2 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg text-[11px] border-2 border-white z-10">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center justify-around w-full gap-3 py-2">
                                {items.map((item, itemIndex) => {
                                    const isCorrect = itemIndex === row.correctIndex;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className={`
                                                flex-1 aspect-square flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-[1.5rem] cursor-pointer hover:bg-indigo-50 transition-all group/item bg-white
                                                ${isHard ? 'ring-2 ring-zinc-50' : ''}
                                                ${isUltraDense ? 'rounded-xl' : ''}
                                            `}
                                        >
                                            {/* İçerik Render */}
                                            {typeof item === 'object' && item.svg ? (
                                                <div className="w-[85%] h-[85%] flex items-center justify-center transition-transform group-hover/item:scale-110" dangerouslySetInnerHTML={{ __html: item.svg }} />
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

                                            {/* İşaretleme Çemberi (Micro-interaction) */}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-100 bg-white group-hover/item:border-indigo-500 transition-colors shadow-sm"></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Klinik Not (Analiz Paneli) */}
                            {settings?.showClinicalNotes && meta && (
                                <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center text-[7px] font-black uppercase text-indigo-400 tracking-widest opacity-60 group-hover:opacity-100">
                                    <span>{meta.errorType || 'Ayrıştırma Odaklı'}</span>
                                    <div className="flex gap-2">
                                        {meta.isMirrored && <span className="px-1.5 py-0.5 bg-indigo-50 rounded italic whitespace-nowrap">Ayna Görüntüsü</span>}
                                        {meta.rotationAngle && <span className="px-1.5 py-0.5 bg-indigo-50 rounded italic whitespace-nowrap">Rotasyon: {meta.rotationAngle}°</span>}
                                    </div>
                                </div>
                            )}
                        </EditableElement>
                    );
                })}
            </div>

            {/* Footer Protokolü */}
            <div className="mt-auto p-6 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">KLİNİK MODÜL</span>
                        <span className="text-xs font-black uppercase">Görsel Seçicilik & Ketleme</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                    <span className="text-[8px] font-bold tracking-[0.2em]">DİSKRİMİNASYON BATARYASI v6.0</span>
                    <i className="fa-solid fa-microscope text-indigo-400 text-xs shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};
