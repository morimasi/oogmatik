
import React from 'react';
import { VisualOddOneOutData, VisualOddOneOutItem } from '../../../types';
import { PedagogicalHeader, SegmentDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const ComplexShapeRenderer = ({ item, size = 80 }: { item: VisualOddOneOutItem, size?: number }) => {
    if (!item) return null;
    
    return (
        <div 
            className="transition-all duration-300 flex items-center justify-center"
            style={{ 
                transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1}) ${item.isMirrored ? 'scaleX(-1)' : ''}`,
                width: size,
                height: size
            }}
        >
            {item.label ? (
                <span className="text-5xl font-black text-zinc-900 select-none font-mono">
                    {item.label}
                </span>
            ) : item.svgPaths ? (
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {item.svgPaths.map((p, i) => (
                        <path 
                            key={i} 
                            d={p.d} 
                            fill={p.fill || "none"} 
                            stroke={p.stroke || "#0f172a"} 
                            strokeWidth={p.strokeWidth || 3} 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    ))}
                </svg>
            ) : item.segments ? (
                <SegmentDisplay segments={item.segments} />
            ) : (
                <div className="w-10 h-10 border-4 border-zinc-200 rounded-full animate-pulse"></div>
            )}
        </div>
    );
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => {
    const isExtreme = data.distractionLevel === 'extreme';
    const itemsPerRow = data.rows?.[0]?.items?.length || 4;
    
    const containerClass = itemsPerRow > 12 ? 'gap-1' : (itemsPerRow > 6 ? 'gap-3' : 'gap-6');
    const itemBoxSize = itemsPerRow > 15 ? 'w-8 h-8' : (itemsPerRow > 10 ? 'w-12 h-12' : 'w-24 h-24');
    const rendererSize = itemsPerRow > 15 ? 24 : (itemsPerRow > 10 ? 40 : 80);

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 space-y-4 mt-2 content-start">
                {(data.rows || []).map((row, i) => (
                    <EditableElement 
                        key={i} 
                        className={`flex flex-col p-4 border-[2px] border-zinc-900 rounded-[2.5rem] bg-white relative overflow-visible transition-all hover:bg-zinc-50 hover:border-indigo-600 group break-inside-avoid shadow-sm`}
                    >
                        <div className="absolute -top-3 -left-3 bg-zinc-900 text-white w-8 h-8 flex items-center justify-center font-black text-xs rounded-xl shadow-lg border-2 border-white z-10">
                            {i + 1}
                        </div>

                        <div className={`flex items-center justify-around py-2 px-2 ${containerClass}`}>
                            {(row.items || []).map((item, j) => (
                                <div key={j} className="flex flex-col items-center gap-2 group/item">
                                    <div className={`
                                        ${itemBoxSize} bg-white rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center shadow-xs transition-all duration-500
                                        group-hover/item:border-indigo-500 group-hover/item:scale-110
                                    `}>
                                        <ComplexShapeRenderer item={item} size={rendererSize} />
                                    </div>
                                    <div className="w-5 h-5 rounded-lg border-2 border-zinc-200 cursor-pointer hover:border-indigo-600 transition-colors bg-white shadow-inner flex items-center justify-center">
                                        <div className="w-1 h-1 rounded-full bg-transparent group-hover/item:bg-indigo-600"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {isExtreme && (
                            <div className="absolute top-2 right-4">
                                <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Klinik Zorluk</span>
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
