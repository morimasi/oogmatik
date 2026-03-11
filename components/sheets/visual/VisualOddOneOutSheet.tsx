
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
                <div className="w-full h-full  flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.svg }} />
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

    // Grid sütun sayısını ayarla: Bol içerik için optimize et
    const gridCols = isUltraDense ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1";

    return (
        <div className="flex flex-col min-h-full print:min-h-0 bg-white font-sans text-black overflow-visible professional-worksheet p-8 print:p-2 print:p-3">
            <PedagogicalHeader
                title={data?.title || "GÖRSEL AYRIŞTIRMA & DİKKAT"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi bulup işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-6 print:gap-2 mt-8 print:mt-2 flex-1 content-start pb-12 print:pb-3`}>
                {(data.rows || []).map((row, i) => (
                    <EditableElement
                        key={i}
                        className={`
                            flex flex-col p-5 print:p-1 border-2 border-zinc-100 rounded-[2.5rem] bg-zinc-50/30 relative break-inside-avoid shadow-sm group
                            hover:border-indigo-200 hover:bg-white transition-all duration-300
                            ${isUltraDense ? 'p-3' : ''}
                        `}
                    >
                        {/* Üst Bilgi Satırı */}
                        <div className="flex justify-between items-center mb-4 print:mb-1">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center font-black text-sm rounded-2xl shadow-lg ring-4 ring-indigo-50">
                                    {i + 1}
                                </div>
                                {row.clinicalMeta?.targetedError && settings?.showClinicalNotes && (
                                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                        {row.clinicalMeta.targetedError.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {settings?.showClinicalNotes && row.clinicalMeta?.cognitiveLoad && (
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-1 h-3 rounded-full ${idx < (row.clinicalMeta!.cognitiveLoad! / 2) ? 'bg-amber-400' : 'bg-zinc-200'}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter">YÜK: %{row.clinicalMeta.cognitiveLoad * 10}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-around py-4 print:py-1 gap-4 print:gap-1">
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-3 flex-1">
                                    <div className={`
                                        aspect-square w-full max-w-[100px] bg-white rounded-3xl border-2 border-zinc-100 flex items-center justify-center transition-all
                                        hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer group-hover:bg-zinc-50/50
                                    `}>
                                        <ComplexShapeRenderer item={item} size={isUltraDense ? 40 : 60} />
                                    </div>
                                    <div className="w-6 h-6 rounded-xl border-2 border-zinc-200 flex items-center justify-center group-hover:border-indigo-300 transition-colors">
                                        <div className="w-2.5 h-2.5 rounded-md bg-zinc-100 group-hover:bg-indigo-400 transition-all"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settings?.showClinicalNotes && row.reason && (
                            <div className="mt-4 print:mt-1 pt-4 print:pt-1 border-t border-dashed border-zinc-200 flex items-start gap-3">
                                <div className="bg-amber-100 dark:bg-amber-900/20 p-1.5 rounded-lg">
                                    <i className="fa-solid fa-lightbulb text-amber-600 text-[10px]"></i>
                                </div>
                                <p className="text-[9px] text-zinc-500 font-bold leading-relaxed italic">
                                    <span className="text-zinc-400 mr-1 opacity-50 NOT-ITALIC font-black">ANALİZ:</span>
                                    <EditableText value={row.reason} tag="span" />
                                </p>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            {/* Premium Footer */}
            <div className="mt-auto px-8 print:px-2 py-6 print:py-2 bg-indigo-950 text-white rounded-[3.5rem] border-8 border-white flex justify-between items-center shadow-2xl">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1 items-center">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">STRATEJİK ODAK</span>
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-brain text-indigo-400"></i>
                            <span className="text-sm font-black tracking-tight">{settings?.subType?.replace('_', ' ').toUpperCase() || 'GÖRSEL AYRIŞTIRMA'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 print:gap-1">
                    <div className="text-right">
                        <span className="block text-[7px] font-black text-indigo-300 uppercase tracking-widest leading-none">PROFESYONEL ÖLÇEK</span>
                        <span className="text-[10px] font-black tracking-tighter opacity-50 uppercase">Klinik Doğrulama V3.P</span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-900 rounded-2xl flex items-center justify-center border border-indigo-800">
                        <i className="fa-solid fa-award text-indigo-400 text-lg"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};




