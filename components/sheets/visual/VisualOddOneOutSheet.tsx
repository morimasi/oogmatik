
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
    const isGridCompact = settings?.layout === 'grid_compact' || isUltraDense;

    // Grid sütun sayısını ayarla
    let gridCols = "grid-cols-1";
    if (isUltraDense) gridCols = "grid-cols-3";
    else if (isGridCompact) gridCols = "grid-cols-2";

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data?.title || "GÖRSEL FARKLIYI BUL"}
                instruction={data?.instruction || "Diğerlerinden farklı olan öğeyi işaretleyin."}
                note={data?.pedagogicalNote}
            />

            <div className={`grid ${gridCols} gap-x-3 gap-y-2 mt-4 flex-1 content-start`}>
                {(data.rows || []).map((row, i) => (
                    <EditableElement
                        key={i}
                        className={`
                            flex flex-col p-2 border-2 border-zinc-900 rounded-[1.2rem] bg-white relative break-inside-avoid shadow-sm
                            ${isUltraDense ? 'p-1' : ''}
                        `}
                    >
                        <div className="absolute -top-2 -left-2 bg-zinc-900 text-white w-6 h-6 flex items-center justify-center font-black text-[10px] rounded-lg shadow-sm border-2 border-white z-10">
                            {i + 1}
                        </div>

                        <div className="flex items-center justify-around py-1 px-1 gap-1">
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-1 flex-1">
                                    <div className={`
                                        aspect-square w-full bg-white rounded-lg border border-dashed border-zinc-200 flex items-center justify-center transition-all
                                        hover:border-indigo-500
                                    `}>
                                        <ComplexShapeRenderer item={item} size={isUltraDense ? 30 : 50} />
                                    </div>
                                    <div className="w-3 h-3 rounded-full border border-zinc-200 flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-transparent"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {settings?.showClinicalNotes && row.reason && (
                            <div className="px-1 py-0.5 border-t border-zinc-50 mt-1">
                                <span className="text-[6px] text-zinc-400 font-bold uppercase tracking-tighter">
                                    Hedef: {row.reason}
                                </span>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
