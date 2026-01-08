
import React from 'react';
import { MapInstructionData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const MapDetectiveSheet: React.FC<{ data: MapInstructionData }> = ({ data }) => {
    const isCustomMap = !!data.imageBase64;
    const COLOR_POLITICAL_MAP = data.imageBase64 || "https://upload.wikimedia.org/wikipedia/commons/1/12/Turkey_provinces_blank_map.svg";
    
    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="relative w-full aspect-[1000/500] bg-white border-[6px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl mb-10 min-h-[450px]">
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 bg-white z-10">
                     <img src={COLOR_POLITICAL_MAP} crossOrigin={isCustomMap ? undefined : "anonymous"} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <svg viewBox="0 0 1000 500" className="w-full h-full absolute inset-0 z-20 pointer-events-none drop-shadow-md">
                    {(data.cities || []).map((city: any) => (
                        <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                            <circle r="4" fill="#000" stroke="white" strokeWidth="1.5" />
                            {data.settings?.showCityNames && (
                                <text y="-16" textAnchor="middle" fontSize="12" fontWeight="900" className="fill-zinc-900 font-sans tracking-tight" style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '4px' }}>{city.name}</text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 p-8 bg-zinc-50 rounded-[4rem] border-2 border-zinc-100">
                {(data.instructions || []).map((inst, i) => (
                    <EditableElement key={i} className="flex items-start gap-5 p-5 bg-white rounded-[2rem] border border-zinc-200 shadow-sm hover:border-indigo-500 transition-all group cursor-default">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg">{i + 1}</div>
                        <div className="flex-1 pt-0.5"><p className="text-[15px] font-bold text-zinc-800 leading-snug"><EditableText value={inst} tag="span" /></p></div>
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};
