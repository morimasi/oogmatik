
import React from 'react';
import { ReadingSudokuData } from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingSudokuSheet: React.FC<{ data: ReadingSudokuData }> = ({ data }) => {
    const size = data.settings.size || 4;
    const isBig = size > 4;

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex flex-col md:flex-row gap-12 items-center justify-center mt-12 flex-1">
                <div className="border-[4px] border-black bg-black shadow-2xl rounded-lg overflow-hidden shrink-0">
                    <table className="border-collapse bg-white">
                        <tbody>
                            {data.grid.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row.map((cell, cIdx) => {
                                        const isRightEdge = (cIdx + 1) % (size === 4 ? 2 : 3) === 0 && cIdx !== size - 1;
                                        const isBottomEdge = (rIdx + 1) % (size === 9 ? 3 : 2) === 0 && rIdx !== size - 1;
                                        
                                        return (
                                            <td 
                                                key={cIdx} 
                                                className={`
                                                    border border-zinc-300 text-center relative
                                                    ${isBig ? 'w-14 h-14 text-lg' : 'w-24 h-24 text-3xl'}
                                                    ${isRightEdge ? 'border-r-[4px] border-r-black' : ''}
                                                    ${isBottomEdge ? 'border-b-[4px] border-b-black' : ''}
                                                `}
                                                style={{ fontFamily: data.settings.fontFamily }}
                                            >
                                                {cell ? (
                                                    <span className="font-black text-zinc-900">
                                                        <EditableText value={cell} tag="span" />
                                                    </span>
                                                ) : <div className="absolute inset-0 bg-zinc-50/20"></div>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="w-full md:w-56 space-y-8">
                    <div className="p-6 bg-zinc-900 text-white rounded-[2.5rem] shadow-xl border-4 border-white">
                        <h5 className="text-[10px] font-black uppercase tracking-widest mb-6 text-indigo-400 text-center">SEMBOL HAVUZU</h5>
                        <div className={`grid ${size === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                            {data.symbols.map((sym, idx) => (
                                <div key={idx} className="aspect-square bg-white rounded-2xl flex items-center justify-center border-2 border-zinc-700 shadow-inner group">
                                    {sym.imagePrompt ? (
                                        <div className="w-full h-full p-1.5"><ImageDisplay prompt={sym.imagePrompt} className="w-full h-full" /></div>
                                    ) : (
                                        <span className="text-zinc-900 font-black text-lg uppercase">{sym.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                        <p className="text-[10px] font-bold text-zinc-400 text-center leading-relaxed">
                            Her satır ve sütunda tüm sembolleri sadece bir kez kullanmalısın.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
