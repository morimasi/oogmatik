
import React from 'react';
import { HiddenPasswordGridData, AnagramsData, WordSearchData, CrosswordData } from '../../types';
import { PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

const SHEET_CONTAINER = "w-full h-full flex flex-col bg-white p-8";

export const HiddenPasswordGridSheet: React.FC<{ data: HiddenPasswordGridData }> = ({ data }) => {
    const { gridSize = 5, itemCount = 6, cellStyle = 'square' } = data.settings || {};
    
    // Adaptive Layout: More items = more columns, but grid size also matters
    const gridColsClass = itemCount <= 3 ? "grid-cols-1" : itemCount <= 6 ? "grid-cols-2" : "grid-cols-3";
    
    // Cell size decreases as matrix grows to fit A4
    const cellSizeClass = gridSize > 6 ? 'w-8 h-8 text-base' : gridSize > 4 ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl';

    return (
        <div className={SHEET_CONTAINER}>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className={`grid ${gridColsClass} gap-x-12 gap-y-12 mt-6 flex-1 content-start`}>
                {(data.grids || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center break-inside-avoid group relative">
                        {/* Target Hub */}
                        <div className="flex gap-2 mb-4 justify-center items-center">
                            {(item.targetLetters || []).map((target, tIdx) => (
                                <EditableElement key={tIdx} className="relative">
                                    <div className="w-10 h-10 rounded-2xl border-[3px] border-zinc-900 flex items-center justify-center font-black text-xl bg-amber-100 shadow-sm ring-4 ring-white">
                                        <EditableText value={target} tag="span" className="text-zinc-900" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <i className="fa-solid fa-xmark text-[8px] text-white"></i>
                                    </div>
                                </EditableElement>
                            ))}
                        </div>

                        {/* Responsive Matrix */}
                        <div className={`bg-white shadow-xl transition-all duration-500 group-hover:rotate-1 ${
                            cellStyle === 'minimal' ? 'border-none' : 
                            cellStyle === 'rounded' ? 'border-[3px] border-zinc-800 rounded-[2.5rem] p-3' : 
                            'border-[4px] border-zinc-900 rounded-xl'
                        }`}>
                            <table className="border-collapse">
                                <tbody>
                                    {item.grid.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => (
                                                <td 
                                                    key={cIdx} 
                                                    className={`
                                                        text-center font-mono font-black relative transition-all text-zinc-900 cursor-pointer hover:bg-zinc-50
                                                        ${cellSizeClass}
                                                        ${cellStyle === 'minimal' ? 'border-b border-r border-zinc-300 last:border-r-0' : 'border border-zinc-300'}
                                                        ${cellStyle === 'rounded' ? 'rounded-lg m-0.5 border-2 border-zinc-100 bg-zinc-50/20' : ''}
                                                    `}
                                                >
                                                    <EditableText value={cell} tag="span" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 pointer-events-none">
                                                        <div className="w-full h-0.5 bg-red-600 rotate-45"></div>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Solution Area */}
                        <div className="mt-6 w-full max-w-[200px]">
                            <div className="bg-zinc-900 text-white p-2 rounded-t-xl text-[9px] font-black uppercase text-center tracking-widest opacity-80">
                                Şifre Girişi
                            </div>
                            <div className="border-x-4 border-b-4 border-zinc-900 rounded-b-xl p-3 bg-zinc-50 h-12 flex items-center justify-center">
                                 <EditableText value="" tag="div" placeholder="..." className="font-black text-indigo-700 text-lg tracking-[0.4em] uppercase" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-auto pt-8 flex justify-between items-center border-t border-zinc-100">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Uzman Muhakeme Atölyesi</p>
                <div className="flex gap-2">
                    <div className="w-10 h-2 bg-amber-400 rounded-full"></div>
                    <div className="w-10 h-2 bg-zinc-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// ... Anagram, WordSearch ve Crossword componentleri aynı kalır ...
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
