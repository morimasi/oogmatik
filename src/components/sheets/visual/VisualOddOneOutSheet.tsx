
import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem } from '../../../types';
import { PedagogicalHeader, SegmentDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const SvgFromPaths = ({ paths }: { paths: any[] }) => {
    if (!paths || paths.length === 0) return null;
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full p-2" preserveAspectRatio="xMidYMid meet">
            {paths.map((p, i) => (
                <path 
                    key={i} 
                    d={p.d} 
                    fill={p.fill || 'none'} 
                    stroke={p.stroke || '#18181b'} 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
            ))}
        </svg>
    );
};

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
            {item.svgPaths ? (
                <SvgFromPaths paths={item.svgPaths} />
            ) : item.svg ? (
                <div className="w-full h-full  flex items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: item.svg }} />
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
    const isUltraFull = settings?.layout === 'ultra_full';
    const isUltraDense = settings?.layout === 'ultra_dense' || isUltraFull;
    const isPremium = settings?.aestheticMode === 'premium' || settings?.aestheticMode === 'glassmorphism';

    // Grid sütun sayısını ayarla: Bol içerik için optimize et
    const gridCols = isUltraFull ? "grid-cols-2 lg:grid-cols-4" : isUltraDense ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1";

    return (
        <div className={`
            flex flex-col min-h-full print:min-h-0 font-sans text-black overflow-visible professional-worksheet 
             p-8 print:p-2 print:p-3
            ${isPremium ? 'bg-slate-50/50' : 'bg-white'}
        `}>
            <PedagogicalHeader
                title={data?.title || "GÖRSEL AYRIŞTIRMA & DİKKAT"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi bulup işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-4 print:gap-1 mt-6 print:mt-1 flex-1 content-start pb-12 print:pb-3`}>
                {(data.rows || []).map((row, i) => (
                    <EditableElement
                        key={i}
                        className={`
                            flex flex-col p-4 print:p-1 border-[1.5px] relative break-inside-avoid transition-all duration-300 group
                            ${isPremium 
                                ? 'bg-white/80 backdrop-blur-sm border-zinc-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-400' 
                                : 'bg-zinc-50/30 border-zinc-100 rounded-2xl hover:bg-white hover:border-zinc-200'}
                            ${isUltraFull ? 'p-2' : ''}
                        `}
                    >
                        {/* Üst Bilgi Satırı */}
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`
                                    w-7 h-7 flex items-center justify-center font-black text-xs rounded-xl shadow-md transition-all group-hover:scale-110
                                    ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}
                                `}>
                                    {i + 1}
                                </div>
                                {row.clinicalMeta?.targetedError && settings?.showClinicalNotes && !isUltraFull && (
                                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200">
                                        {row.clinicalMeta.targetedError.replace('_', ' ')}
                                    </span>
                                )}
                            </div>

                            {!isUltraFull && settings?.showClinicalNotes && row.clinicalMeta?.cognitiveLoad && (
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-0.5 h-2 rounded-full ${idx < (row.clinicalMeta!.cognitiveLoad! / 2) ? 'bg-amber-400' : 'bg-zinc-200'}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="text-[6px] font-black text-zinc-400 uppercase tracking-tighter">YÜK: %{row.clinicalMeta.cognitiveLoad * 10}</span>
                                </div>
                            )}
                        </div>

                        <div className={`flex items-center justify-around py-2 gap-2 ${isUltraFull ? 'scale-90 origin-center' : ''}`}>
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                                    <div className={`
                                        aspect-square w-full bg-white rounded-2xl border-[1.5px] flex items-center justify-center transition-all
                                        hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer 
                                        ${isPremium ? 'border-zinc-100' : 'border-zinc-200'}
                                    `}>
                                        <ComplexShapeRenderer item={item} size={isUltraDense ? 35 : 55} />
                                    </div>
                                    <div className="w-5 h-5 rounded-lg border-2 border-zinc-100 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                                        <div className="w-2 h-2 rounded-sm bg-zinc-50 group-hover:bg-indigo-400/20 transition-all"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settings?.showClinicalNotes && row.reason && !isUltraFull && (
                            <div className="mt-2 pt-2 border-t border-dashed border-zinc-100 flex items-start gap-2">
                                <p className="text-[7px] text-zinc-500 font-bold leading-tight uppercase">
                                    <EditableText value={row.reason} tag="span" />
                                </p>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>

            {/* Premium Footer */}
            <div className={`
                mt-auto px-8 print:px-4 py-5 print:py-2 rounded-[2.5rem] border-4 border-white flex justify-between items-center shadow-2xl
                ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-950 text-white'}
            `}>
                <div className="flex gap-8 items-center">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1">PROGRAMMATİK ODAK</span>
                        <div className="flex items-center gap-2">
                            <i className={`fa-solid fa-microchip ${isPremium ? 'text-indigo-400' : 'text-zinc-400'}`}></i>
                            <span className="text-xs font-black tracking-tight">{settings?.subType?.replace('_', ' ').toUpperCase() || 'GÖRSEL AYRIŞTIRMA TESTİ'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-[6px] font-black text-zinc-500 uppercase tracking-widest leading-none">PROFESYONEL ÖLÇEK</span>
                        <span className="text-[9px] font-black tracking-tighter opacity-70 uppercase">Klinik Tanılama • Ultra Paket</span>
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isPremium ? 'bg-zinc-900 border-zinc-800' : 'bg-indigo-900 border-indigo-800'}`}>
                        <i className={`fa-solid fa-shield-halved ${isPremium ? 'text-indigo-400' : 'text-zinc-500'} text-base`}></i>
                    </div>
                </div>
            </div>
        </div>
    );
};




