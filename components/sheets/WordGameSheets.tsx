
import React from 'react';
import { HiddenPasswordGridData, AnagramsData, WordSearchData, CrosswordData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

const SHEET_CONTAINER = "w-full h-full flex flex-col bg-white p-8";

export const HiddenPasswordGridSheet: React.FC<{ data: HiddenPasswordGridData }> = ({ data }) => {
    const { gridSize = 5, itemCount = 9, cellStyle = 'square' } = data.settings || {};
    
    const gridColsClass = itemCount <= 3 ? "grid-cols-1" : itemCount <= 6 ? "grid-cols-2" : "grid-cols-3";
    
    return (
        <div className={SHEET_CONTAINER}>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className={`grid ${gridColsClass} gap-x-8 gap-y-10 mt-6 flex-1 content-start`}>
                {(data.grids || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center break-inside-avoid group">
                        <EditableElement className="mb-4">
                            {/* Hedef Harf (Daire içindeki çeldirici) */}
                            <div className="w-12 h-12 rounded-full border-[3px] border-zinc-900 flex items-center justify-center font-black text-2xl bg-zinc-100 shadow-sm ring-4 ring-zinc-200">
                                <EditableText value={item.targetLetter} tag="span" className="text-zinc-900" />
                            </div>
                        </EditableElement>

                        <div className={`bg-white shadow-sm transition-all ${
                            cellStyle === 'minimal' ? 'border-none' : 
                            cellStyle === 'rounded' ? 'border-[3px] border-zinc-800 rounded-3xl p-2' : 
                            'border-[4px] border-zinc-900'
                        }`}>
                            <table className="border-collapse">
                                <tbody>
                                    {item.grid.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => (
                                                <td 
                                                    key={cIdx} 
                                                    className={`
                                                        text-center font-mono font-bold relative transition-all text-zinc-900
                                                        ${gridSize > 5 ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl'}
                                                        ${cellStyle === 'minimal' ? 'border-b border-r border-zinc-300 last:border-r-0' : 'border border-zinc-400'}
                                                        ${cellStyle === 'rounded' ? 'rounded-lg m-0.5 border-2 border-zinc-200 bg-zinc-50/30' : ''}
                                                    `}
                                                >
                                                    <EditableText value={cell} tag="span" className="text-zinc-900" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 w-full max-w-[180px]">
                            <div className="h-0.5 bg-zinc-300 w-full relative">
                                <div className="absolute -top-7 left-0 w-full text-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] opacity-60">ŞİFREYİ YAZ</div>
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-full text-center">
                                     <EditableText value="" tag="div" placeholder="..." className="font-black text-indigo-700 text-lg tracking-[0.3em]" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-auto pt-6 text-center border-t border-zinc-100">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Kişiselleştirilmiş Dikkat Atölyesi</p>
            </div>
        </div>
    );
};

export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-8 mt-10">
            {data.anagrams.map((item, i) => (
                <EditableElement key={i} className="flex flex-col gap-3 p-4 border-2 border-zinc-100 rounded-2xl bg-zinc-50 shadow-sm">
                    <div className="text-3xl font-black tracking-widest text-indigo-600 text-center py-4 bg-white rounded-xl border-2 border-zinc-200">
                        {item.scrambled}
                    </div>
                    <div className="h-10 border-b-4 border-zinc-800 border-dashed"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const WordSearchSheet: React.FC<{ data: WordSearchData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-10 mt-8 items-start">
            <div className="flex-1 border-4 border-zinc-900 bg-white p-2">
                <table className="border-collapse mx-auto">
                    <tbody>
                        {data.grid.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, c) => (
                                    <td key={c} className="w-10 h-10 border border-zinc-300 text-center font-mono font-bold text-xl uppercase text-zinc-900">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="w-full md:w-64 bg-zinc-50 p-6 rounded-3xl border-2 border-zinc-100">
                <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-4">Kelimeler</h4>
                <div className="flex flex-wrap md:flex-col gap-3">
                    {data.words.map((w, i) => (
                        <div key={i} className="text-sm font-bold text-zinc-700 uppercase tracking-widest border-b border-zinc-200 pb-1">{w}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => (
    <div className={SHEET_CONTAINER}>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col gap-8 mt-6">
            <div className="flex-1 bg-white p-4 border-2 border-zinc-100 shadow-sm overflow-auto">
                <table className="border-collapse mx-auto">
                    <tbody>
                        {data.grid.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, c) => (
                                    <td key={c} className={`w-9 h-9 border border-zinc-400 text-center font-bold text-lg ${cell === null ? 'bg-zinc-800' : 'bg-white text-zinc-900'}`}>
                                        {cell !== null && cell !== "" && cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['across', 'down'].map((dir) => (
                    <div key={dir}>
                        <h4 className="font-black text-sm uppercase mb-4 text-indigo-600 border-b-2 border-indigo-100 pb-1">
                            {dir === 'across' ? 'Soldan Sağa' : 'Yukarıdan Aşağı'}
                        </h4>
                        <div className="space-y-3">
                            {data.clues.filter(c => c.direction === dir).map(clue => (
                                <div key={clue.id} className="text-xs font-medium flex gap-2">
                                    <span className="font-black text-indigo-500">{clue.id}.</span>
                                    <span className="text-zinc-700">{clue.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
