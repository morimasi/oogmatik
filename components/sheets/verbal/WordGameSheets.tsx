import React from 'react';
import { HiddenPasswordGridData, AnagramsData, WordSearchData, CrosswordData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const HiddenPasswordGridSheet = ({ data }: { data: HiddenPasswordGridData }) => {
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

export const AnagramSheet = ({ data }: { data: AnagramsData }) => (
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

export const WordSearchSheet = ({ data }: { data: WordSearchData }) => {
    const settings = data?.settings;
    const isUltraDense = settings?.layout === 'ultra_dense';
    const isCompact = settings?.layout === 'compact' || isUltraDense;

    // Grid Boyutu Dinamik Hesaplama
    const gridLen = data.grid.length;
    const cellSize = isUltraDense ? Math.min(32, Math.floor(450 / gridLen)) : Math.min(42, Math.floor(550 / gridLen));

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />

            <div className={`flex flex-col md:flex-row gap-8 mt-6 items-start flex-1`}>
                {/* Bulmaca Alanı */}
                <div className="border-[4px] border-zinc-900 bg-white p-1 rounded-xl shadow-sm shrink-0">
                    <table className="border-collapse mx-auto font-mono">
                        <tbody>
                            {data.grid.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td
                                            key={c}
                                            style={{ width: cellSize, height: cellSize }}
                                            className="border border-zinc-100 text-center font-black text-xl uppercase text-zinc-900 cursor-default select-none hover:bg-zinc-50 transition-colors"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Yan Panel: Kelime Listesi */}
                <div className="flex-1 w-full md:max-w-xs flex flex-col gap-4">
                    <div className="bg-zinc-900 text-white p-6 rounded-[2rem] border-2 border-zinc-900 shadow-md">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-list-check"></i> KELİME LİSTESİ
                        </h4>
                        <div className={`grid ${data.words.length > 10 ? 'grid-cols-2' : 'grid-cols-1'} gap-x-4 gap-y-2`}>
                            {data.words.map((w, i) => (
                                <div key={i} className="text-sm font-black uppercase tracking-tight border-b border-white/5 pb-1 flex items-center gap-2 group cursor-help">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></div>
                                    <span className="group-hover:text-indigo-300 transition-colors">{w}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {settings?.showClinicalNotes && data.clinicalMeta && (
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                            <div className="flex justify-between border-b border-zinc-200 pb-1 mb-1">
                                <span>Kesişim Oranı:</span>
                                <span className="text-zinc-900">{data.clinicalMeta.intersections}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200 pb-1 mb-1">
                                <span>Ters Kelime:</span>
                                <span className="text-zinc-900">{data.clinicalMeta.reversals}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Yoğunluk:</span>
                                <span className="text-zinc-900">%{Math.round(data.clinicalMeta.density * 100)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CrosswordSheet = ({ data }: { data: CrosswordData }) => (
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