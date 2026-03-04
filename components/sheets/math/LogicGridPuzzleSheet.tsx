
import React from 'react';
import { LogicGridPuzzleData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div className="flex flex-col font-lexend">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="flex flex-col gap-10 mt-4">
            <EditableElement className="text-base border-[3px] border-zinc-900 p-8 bg-zinc-50 rounded-[3rem] shadow-sm">
                <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-indigo-600 mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-lightbulb animate-pulse"></i> İPUÇLARI VE VERİLER
                </h4>
                <ul className="space-y-4">
                    {(data?.clues || []).map((clue, i) => (
                        <li key={i} className="flex gap-4 text-zinc-700 leading-relaxed font-bold">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2.5 shrink-0"></span>
                            <EditableText value={clue} tag="span" />
                        </li>
                    ))}
                </ul>
            </EditableElement>
            
            <div className="overflow-x-auto p-2">
                <table className="w-full border-collapse border-[4px] border-zinc-900 text-xs bg-white shadow-2xl rounded-[2rem] overflow-hidden">
                    <thead>
                        <tr>
                            <th className="border-2 border-zinc-900 bg-zinc-100 p-6"></th>
                            {(data?.categories || []).flatMap(c => (c?.items || []).map(i => (
                                <th key={i?.name} className="border-2 border-zinc-900 p-4 h-40 w-16 relative bg-zinc-50">
                                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                                        {i.imagePrompt && <div className="w-10 h-10 mb-4 opacity-40"><ImageDisplay prompt={i.imagePrompt} description={i.name} className="w-full h-full object-contain" /></div>}
                                        <span className="writing-vertical font-black uppercase text-zinc-600 tracking-tighter text-[10px]"><EditableText value={i?.name} tag="span" /></span>
                                    </div>
                                </th>
                            )))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.people || []).map((person, i) => (
                            <tr key={i}>
                                <td className="border-2 border-zinc-900 p-6 font-black bg-zinc-100 uppercase text-zinc-700 text-sm"><EditableText value={person} tag="span" /></td>
                                {data?.categories?.flatMap(c => (c?.items || []).map(item => (
                                    <td key={item?.name} className="border-2 border-zinc-900 h-16 hover:bg-indigo-50 cursor-pointer transition-colors relative group">
                                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-200">
                                             <i className="fa-solid fa-xmark text-2xl"></i>
                                         </div>
                                    </td>
                                )))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
