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

export const CrosswordSheet = ({ data }: { data: CrosswordData }) => {
    const settings = data?.settings;
    const theme = settings?.theme || 'classic';
    const gridLen = data.grid.length;
    const cellSize = Math.min(42, Math.floor(520 / gridLen));

    // Belirli bir hücredeki ipucu numarasını bulma
    const getClueId = (r: number, c: number) => {
        const clue = data.clues.find(clue => clue.row === r && clue.col === c);
        return clue ? clue.id : null;
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader title={data.title || "ÇENGEL BULMACA"} instruction={data.instruction} note={data.pedagogicalNote} />

            <div className="flex flex-col gap-10 mt-8 flex-1">
                {/* Bulmaca Tablosu */}
                <div className="p-3 bg-white border-[6px] border-zinc-900 rounded-[2.5rem] shadow-2xl self-center overflow-visible">
                    <table className="border-collapse mx-auto">
                        <tbody>
                            {data.grid.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td
                                            key={c}
                                            style={{ width: cellSize, height: cellSize }}
                                            className={`relative border border-zinc-200 text-center font-black text-xl leading-none transition-colors ${cell === null ? 'bg-zinc-900 border-zinc-900' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                                        >
                                            {cell !== null && (
                                                <>
                                                    {getClueId(r, c) && (
                                                        <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-zinc-400 leading-none">
                                                            {getClueId(r, c)}
                                                        </span>
                                                    )}
                                                    <span className="uppercase">{cell !== "" && cell}</span>
                                                </>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* İpuçları Paneli */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-zinc-900 text-white rounded-[4rem] border-4 border-white shadow-2xl relative overflow-visible">
                    {/* Estetik Dekor */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl ring-4 ring-white"> İPUÇLARI </div>

                    {['across', 'down'].map((dir) => (
                        <div key={dir} className="flex flex-col gap-5">
                            <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-indigo-400 border-b border-indigo-400/20 pb-2 flex items-center gap-3">
                                <i className={`fa-solid ${dir === 'across' ? 'fa-arrow-right-long' : 'fa-arrow-down-long'}`}></i>
                                {dir === 'across' ? 'SOLDAN SAĞA' : 'YUKARIDAN AŞAĞI'}
                            </h4>
                            <div className="grid gap-3">
                                {data.clues.filter(c => c.direction === dir).sort((a, b) => a.id - b.id).map(clue => (
                                    <div key={clue.id} className="text-sm font-bold flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                                        <span className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">{clue.id}</span>
                                        <span className="text-zinc-200 leading-relaxed pt-1">{clue.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Klinik Metrikler */}
                {settings?.showClinicalNotes && data.clinicalMeta && (
                    <div className="mt-auto pt-6 border-t-2 border-zinc-100 flex justify-between items-center px-6 opacity-40 italic font-medium text-[9px]">
                        <div className="flex gap-8">
                            <span>Bağlanabilirlik: %{Math.round(data.clinicalMeta.connectivityIndex * 100)}</span>
                            <span>İpucu Zorluğu: {data.clinicalMeta.clueComplexity}/10</span>
                        </div>
                        <span className="uppercase tracking-widest text-zinc-900 font-bold">Kelime Dağarcığı: {data.clinicalMeta.vocabularyLevel}</span>
                    </div>
                )}
            </div>
        </div>
    );
};