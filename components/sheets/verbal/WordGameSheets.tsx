import React from 'react';
import { HiddenPasswordGridData, AnagramsData, WordSearchData, CrosswordData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const HiddenPasswordGridSheet: React.FC<{ data: HiddenPasswordGridData }> = ({ data }) => {
    const { gridSize = 5, itemCount = 9, cellStyle = 'square' } = data.settings || {};
    const gridColsClass = itemCount <= 3 ? "grid-cols-1" : itemCount <= 6 ? "grid-cols-2" : "grid-cols-3";
    
    return (
        <div className="w-full h-full flex flex-col bg-white p-2 font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className={`grid ${gridColsClass} gap-x-10 gap-y-12 mt-8 flex-1 content-start`}>
                {(data.grids || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center break-inside-avoid group">
                        <div className="w-14 h-14 rounded-2xl border-[3px] border-zinc-900 flex items-center justify-center font-black text-3xl bg-zinc-100 shadow-lg ring-8 ring-zinc-50 mb-6 group-hover:scale-110 transition-transform">
                            <EditableText value={item.targetLetter} tag="span" />
                        </div>
                        <div className={`bg-white shadow-xl transition-all border-[4px] border-zinc-900 ${cellStyle === 'rounded' ? 'rounded-[2rem] p-2' : ''}`}>
                            <table className="border-collapse">
                                <tbody>
                                    {item.grid.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className={`text-center font-mono font-black border border-zinc-300 w-12 h-12 text-2xl text-zinc-900 ${cellStyle === 'rounded' ? 'rounded-xl m-0.5 bg-zinc-50/50' : ''}`}>
                                                    <EditableText value={cell} tag="span" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-8 w-full max-w-[200px]">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] text-center mb-1">ŞİFREYİ ÇÖZ</p>
                            <div className="h-10 border-b-4 border-indigo-600 border-dashed bg-indigo-50/20 rounded-t-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AnagramSheet: React.FC<{ data: AnagramsData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-10 flex-1 content-start">
            {(data.anagrams || []).map((item, i) => (
                <EditableElement key={i} className="flex flex-col gap-4 p-6 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm hover:shadow-xl transition-all break-inside-avoid group">
                    <div className="text-4xl font-black tracking-[0.3em] text-indigo-600 text-center py-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 group-hover:bg-white transition-colors">
                        {item.scrambled}
                    </div>
                    <div className="h-12 border-b-4 border-zinc-900 border-dotted flex items-center justify-center text-zinc-100 font-bold uppercase text-[10px] tracking-[0.5em]">Kelimeni Yaz</div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const WordSearchSheet: React.FC<{ data: WordSearchData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-12 mt-10 items-start flex-1">
            <div className="border-[6px] border-zinc-900 bg-white p-2 rounded-2xl shadow-2xl shrink-0">
                <table className="border-collapse mx-auto font-mono">
                    <tbody>
                        {data.grid.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, c) => (
                                    <td key={c} className="w-10 h-10 border border-zinc-200 text-center font-black text-2xl uppercase text-zinc-900 hover:bg-indigo-50 transition-colors cursor-default select-none">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex-1 bg-zinc-900 text-white p-8 rounded-[3rem] border-4 border-white shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-2"><i className="fa-solid fa-list-ul"></i> KELİME LİSTESİ</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {data.words.map((w, i) => (
                        <div key={i} className="text-base font-black uppercase tracking-widest border-b border-white/10 pb-1 hover:text-indigo-300 transition-colors cursor-help">{w}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const CrosswordSheet: React.FC<{ data: CrosswordData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col gap-10 mt-8">
            <div className="p-6 bg-white border-[4px] border-zinc-900 rounded-[2.5rem] shadow-xl overflow-auto self-center">
                <table className="border-collapse mx-auto">
                    <tbody>
                        {data.grid.map((row, r) => (
                            <tr key={r}>
                                {row.map((cell, c) => (
                                    <td key={c} className={`w-10 h-10 border-2 border-zinc-200 text-center font-black text-xl ${cell === null ? 'bg-zinc-900' : 'bg-white text-zinc-900'}`}>
                                        {cell !== null && cell !== "" && cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-zinc-50 rounded-[3rem] border-2 border-zinc-100">
                {['across', 'down'].map((dir) => (
                    <div key={dir}>
                        <h4 className="font-black text-sm uppercase mb-4 text-indigo-600 border-b-2 border-indigo-100 pb-2 flex items-center gap-2">
                            <i className={`fa-solid ${dir === 'across' ? 'fa-arrows-left-right' : 'fa-arrows-up-down'}`}></i>
                            {dir === 'across' ? 'SOLDAN SAĞA' : 'YUKARIDAN AŞAĞI'}
                        </h4>
                        <div className="space-y-3">
                            {data.clues.filter(c => c.direction === dir).map(clue => (
                                <div key={clue.id} className="text-xs font-bold flex gap-3 items-start bg-white p-3 rounded-xl shadow-sm border border-zinc-100">
                                    <span className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] shrink-0">{clue.id}</span>
                                    <span className="text-zinc-700 leading-snug">{clue.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);