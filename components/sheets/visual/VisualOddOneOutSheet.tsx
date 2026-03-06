
import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem } from '../../../types';
import { PedagogicalHeader, SegmentDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const ComplexShapeRenderer = ({ item, size = 80 }: { item: VisualOddOneOutItem, size?: number }) => {
    if (!item) return null;

    return (
        <div
            className="transition-all duration-300 flex items-center justify-center p-1"
            style={{
                transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
                width: '100%',
                height: '100%'
            }}
        >
            {item.svg ? (
                <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.svg }} />
            ) : item.label ? (
                <span className={`font-black text-zinc-900 select-none font-mono ${size < 40 ? 'text-lg' : 'text-4xl'}`}>
                    {item.label}
                </span>
            ) : item.segments ? (
                <SegmentDisplay segments={item.segments} />
            ) : (
                <div className="w-8 h-8 border-2 border-zinc-200 rounded-full"></div>
            )}
        </div>
    );
};

export const VisualOddOneOutSheet = ({ data }: { data: VisualOddOneOutData }) => {
    const settings = data.settings;
    const isUltraDense = settings?.layout === 'ultra_dense';
    const isProtocol = settings?.layout === 'protocol';
    const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;

    // Grid sütun sayısını ayarla
    let gridCols = "grid-cols-1";
    if (isUltraDense) gridCols = "grid-cols-3";
    else if (isGridCompact) gridCols = "grid-cols-2";

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data?.title || (isProtocol ? "GÖRSEL AYRIŞTIRMA PROTOKOLÜ" : "GÖRSEL FARKLIYI BUL")}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi bulup işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-4 mt-6 flex-1 content-start pb-8`}>
                {(data.rows || []).map((row, i) => (
                    <EditableElement
                        key={i}
                        className={`
                            flex flex-col p-4 border-2 border-zinc-100 rounded-[2rem] bg-zinc-50/50 relative break-inside-avoid shadow-sm group
                            hover:border-indigo-200 hover:bg-white transition-all
                            ${isUltraDense ? 'p-2' : ''}
                            ${isProtocol ? 'border-l-[6px] border-l-zinc-900 border-r-2 border-y-2' : ''}
                        `}
                    >
                        {/* Sıra Numarası ve Klinik Etiket */}
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className="bg-zinc-900 text-white w-7 h-7 flex items-center justify-center font-black text-xs rounded-xl shadow-lg border-2 border-white ring-1 ring-zinc-900">
                                    {i + 1}
                                </div>
                                {settings?.subType && (
                                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                        {settings.subType.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            {settings?.showClinicalNotes && row.clinicalMeta && (
                                <div className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
                                    Faktör: {row.clinicalMeta.discriminationFactor} • {row.clinicalMeta.isMirrorTask ? 'Ayna Görüntüsü' : 'Detay Farkı'}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-around py-2 gap-3">
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`
                                        aspect-square w-full bg-white rounded-2xl border-2 border-zinc-100 flex items-center justify-center transition-all
                                        hover:border-indigo-500 hover:shadow-md cursor-pointer
                                    `}>
                                        <ComplexShapeRenderer item={item} size={isUltraDense ? 30 : (isProtocol ? 60 : 50)} />
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover:border-zinc-300">
                                        <div className="w-2 h-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settings?.showClinicalNotes && row.reason && (
                            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2">
                                <i className="fa-solid fa-microscope text-indigo-400 text-[8px]"></i>
                                <span className="text-[8px] text-zinc-500 font-bold italic leading-none">
                                    Hedef Analiz: <EditableText value={row.reason} tag="span" />
                                </span>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            {/* Alt Bilgi Paneli */}
            <div className="mt-auto px-6 py-4 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-8 items-center">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-0.5">Zorluk Seviyesi</span>
                        <span className="text-xs font-black uppercase">{settings?.difficulty || 'Standard'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 opacity-60">
                    <span className="text-[8px] font-bold tracking-[0.2em]">PROFESYONEL AYRIŞTIRMA MODÜLÜ v3.2</span>
                    <i className="fa-solid fa-crosshairs text-indigo-400 text-xs shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};
