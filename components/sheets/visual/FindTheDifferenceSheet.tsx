
import React from 'react';
import { FindTheDifferenceData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => {
    const rows = data?.rows || [];
    const isSingleColumn = rows.length <= 6;

    return (
        <div className="flex flex-col h-full bg-white p-2 font-sans text-black overflow-visible">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
            
            <div className={`grid ${isSingleColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mt-2 flex-1 content-start`}>
                {rows.map((row, index) => {
                    const items = row?.items || [];
                    const isHard = row?.visualDistractionLevel === 'high' || row?.visualDistractionLevel === 'extreme';
                    
                    return (
                        <EditableElement 
                            key={index} 
                            className={`flex flex-col p-6 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-all break-inside-avoid relative group`}
                        >
                            <div className="absolute -top-3 -left-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg text-sm border-4 border-white z-10 transition-transform group-hover:scale-110">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center justify-around w-full gap-4 py-2">
                                {items.map((item, itemIndex) => (
                                    <div 
                                        key={itemIndex} 
                                        className={`
                                            flex-1 aspect-square max-h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors relative group/item
                                            ${isHard ? 'bg-zinc-50' : 'bg-white'}
                                        `}
                                    >
                                        <span className={`
                                            font-black leading-none select-none text-zinc-900
                                            ${item.length > 5 ? 'text-lg' : item.length > 3 ? 'text-2xl' : 'text-4xl'}
                                            ${isHard ? 'tracking-tighter' : 'tracking-normal'}
                                            font-mono
                                        `}>
                                            <EditableText value={item} tag="span" />
                                        </span>
                                        <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full border-2 border-zinc-200 bg-white group-hover/item:border-indigo-500 transition-colors shadow-sm"></div>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                })}
            </div>
        </div>
    );
};
