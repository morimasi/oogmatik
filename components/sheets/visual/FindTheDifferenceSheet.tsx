
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
                title={data?.title || "FARKLI OLANI BUL"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-x-4 gap-y-3 mt-4 flex-1 content-start`}>
                {rows.map((row, index) => {
                    const items = row?.items || [];
                    const isHard = row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
                    const meta = row?.clinicalMeta;

                    return (
                        <EditableElement
                            key={index}
                            className={`
                                flex flex-col p-3 border-2 border-zinc-900 rounded-[1.5rem] bg-white shadow-sm transition-all break-inside-avoid relative group
                                ${isUltraDense ? 'p-2' : ''}
                            `}
                        >
                            {/* Soru Numarası - Kompakt */}
                            <div className="absolute -top-2.5 -left-1.5 w-7 h-7 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black shadow-sm text-[10px] border-2 border-white z-10">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center justify-around w-full gap-2 py-1">
                                {items.map((item, itemIndex) => {
                                    const isCorrect = itemIndex === row.correctIndex;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className={`
                                                flex-1 aspect-square flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors relative group/item
                                                ${isHard ? 'bg-zinc-50' : 'bg-white'}
                                                ${isUltraDense ? 'rounded-lg' : ''}
                                            `}
                                        >
                                            {/* İçerik Render (SVG veya Metin) */}
                                            {typeof item === 'object' && item.svg ? (
                                                <div className="w-[80%] h-[80%] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.svg }} />
                                            ) : (
                                                <span className={`
                                                    font-black leading-none select-none text-zinc-900 font-mono
                                                    ${String(item).length > 5 ? 'text-xs' : String(item).length > 3 ? 'text-sm' : 'text-xl'}
                                                    ${meta?.isMirrored && isCorrect ? 'scale-x-[-1]' : ''}
                                                    ${meta?.rotationAngle && isCorrect ? `rotate-[${meta.rotationAngle}deg]` : ''}
                                                `}>
                                                    <EditableText value={String(item)} tag="span" />
                                                </span>
                                            )}

                                            {/* İşaretleme Alanı */}
                                            <div className="absolute -bottom-1.5 -right-0.5 w-4 h-4 rounded-full border border-zinc-200 bg-white group-hover/item:border-indigo-500 transition-colors"></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Klinik Not (Opsiyonel) */}
                            {settings?.showClinicalNotes && meta?.errorType && (
                                <div className="mt-1 px-1 flex justify-between items-center text-[7px] font-black uppercase text-zinc-300 tracking-widest">
                                    <span>Hata Tipi: {meta.errorType}</span>
                                    {meta.isMirrored && <i className="fa-solid fa-arrows-left-right"></i>}
                                </div>
                            )}
                        </EditableElement>
                    );
                })}
            </div>
        </div>
    );
};
