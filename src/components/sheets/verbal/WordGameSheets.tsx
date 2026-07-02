import React from 'react';
import { HiddenPasswordGridData, AnagramsData, WordSearchData, CrosswordData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const HiddenPasswordGridSheet = ({ data }: { data: HiddenPasswordGridData }) => {
    const { gridSize = 5, itemCount = 6, cellStyle = 'square' } = data.settings || {};
    const gridColsClass = itemCount <= 2 ? "grid-cols-2" : itemCount <= 4 ? "grid-cols-2" : "grid-cols-3";

    return (
        <div className="w-full h-full flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet print:w-[210mm] print:h-[297mm] px-[12mm] py-[15mm]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-rose-500 to-purple-600 opacity-100"></div>
            
            <PedagogicalHeader title={data.title} instruction={data.instruction} />
            <div className={`grid ${gridColsClass} gap-x-5 gap-y-6 mt-3 print:mt-2 flex-1 content-start`}>
                {(data.grids || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center break-inside-avoid group">
                        <div className="w-11 h-11 print:w-9 print:h-9 rounded-xl border-[2.5px] border-zinc-900 flex items-center justify-center font-black text-2xl print:text-xl bg-zinc-100 shadow-md ring-6 ring-zinc-50 mb-4 print:mb-1.5 group-hover:scale-110 transition-transform">
                            <EditableText value={item.targetLetter} tag="span" />
                        </div>
                        <div className={`bg-white shadow-lg transition-all border-[3px] border-zinc-900 ${cellStyle === 'rounded' ? 'rounded-[1.5rem] p-1.5' : ''}`}>
                            <table className="border-collapse">
                                <tbody>
                                    {item.grid.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className={`text-center font-mono font-black border border-zinc-300 w-10 print:w-8 h-10 print:h-8 text-xl print:text-sm text-zinc-900 ${cellStyle === 'rounded' ? 'rounded-xl m-0.5 bg-zinc-50/50' : ''}`}>
                                                    <EditableText value={cell} tag="span" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-5 print:mt-1.5 w-full max-w-[180px]">
                            <p className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.3em] text-center mb-0.5">ŞİFRE</p>
                            <div className="h-8 print:h-6 border-b-3 border-indigo-600 border-dashed bg-indigo-50/20 rounded-t-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AnagramSheet = ({ data }: { data: AnagramsData }) => (
    <div className="flex flex-col h-full  bg-white font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 print:gap-2 print:gap-3 print:p-3 mt-10 print:mt-3 flex-1 content-start">
            {(data.anagrams || []).map((item, i) => (
                <EditableElement key={i} className="flex flex-col gap-4 print:gap-1 p-6 print:p-2 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm hover:shadow-xl transition-all break-inside-avoid group">
                    <div className="text-4xl font-black tracking-[0.3em] text-indigo-600 text-center py-6 print:py-2 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 group-hover:bg-white transition-colors">
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

    // Grid Boyutu Dinamik Hesaplama (Daha kompakt, özellikle print için)
    const gridLen = data.grid.length;
    const cellSize = isUltraDense 
        ? Math.min(24, Math.floor(380 / gridLen)) 
        : Math.min(36, Math.floor(480 / gridLen));
    const printCellSize = Math.min(20, Math.floor(320 / gridLen)); // Print için ekstra küçük

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data?.title || "KELİME BULMACA"}
                instruction={data?.instruction || "Aşağıdaki harf yığınının içine gizlenmiş kelimeleri bulun."}
            />

            {/* KELIME BANDI — Üst Satır (Kompakt) */}
            <div className="w-full bg-zinc-900 rounded-[1.5rem] p-2 print:p-1 flex flex-wrap gap-1 mt-1 mb-2 print:mb-1">
                {data.words.map((w, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-white text-[9px] print:text-[7px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                        {w}
                    </span>
                ))}
            </div>

            <div className={`flex flex-col mt-1 print:mt-0 items-center flex-1 pb-2 print:pb-1`}>
                {/* Bulmaca Alanı - Premium Frame (Kompakt) */}
                <div className="flex justify-center">
                    <div className="border-[4px] print:border-[2px] border-zinc-900 bg-white p-1 print:p-0.5 rounded-[1.5rem] shadow-xl shrink-0 ring-4 ring-zinc-50 transform hover:scale-[1.01] transition-transform">
                        <table className="border-collapse mx-auto font-mono">
                            <tbody>
                                {data.grid.map((row, r) => (
                                    <tr key={r}>
                                        {row.map((cell, c) => (
                                            <td
                                                key={c}
                                                style={{ 
                                                    width: cellSize, 
                                                    height: cellSize 
                                                }}
                                                className="border border-zinc-200 text-center font-black text-lg print:text-sm uppercase text-zinc-900 cursor-default select-none hover:bg-indigo-50 transition-colors"
                                            >
                                                <EditableText value={String(cell)} tag="span" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {settings?.showClinicalNotes && data.clinicalMeta && (
                    <div className="w-full mt-2 print:mt-1 p-2 print:p-1 bg-zinc-50 rounded-[1rem] border border-zinc-200 text-[8px] print:text-[6px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed flex gap-3 flex-wrap">
                        <div className="flex gap-1">
                            <span>Kesişim:</span>
                            <span className="text-zinc-900">{data.clinicalMeta.intersections}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="flex items-center gap-1">Ters <i className="fa-solid fa-arrows-left-right text-[6px] text-rose-400"></i></span>
                            <span className="text-zinc-900">{data.clinicalMeta.reversals}</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="flex items-center gap-1">Yoğunluk <i className="fa-solid fa-chart-area text-[6px] text-indigo-400"></i></span>
                            <span className="text-zinc-900">%{Math.round(data.clinicalMeta.density * 100)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Protokolü (Kompakt) */}
            <div className="mt-auto p-2 print:p-1 bg-zinc-900 text-white rounded-t-[1.5rem] border-x-2 border-t-2 border-white flex justify-between items-center shadow-xl mx-0.5">
                <div className="flex flex-col">
                    <span className="text-[6px] print:text-[5px] font-black text-indigo-400 uppercase tracking-[0.2em]">PROGRAM</span>
                    <span className="text-[10px] print:text-[7px] font-bold uppercase">Oküler Tarama</span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                    <span className="text-[7px] print:text-[5px] font-bold tracking-[0.15em]">SÖZEL ARAMA v3.2</span>
                    <i className="fa-solid fa-i-cursor text-indigo-400 text-xs print:text-[10px]"></i>
                </div>
            </div>
        </div>
    );
};

export const CrosswordSheet = ({ data }: { data: CrosswordData }) => {
    const settings = data?.settings;
    const gridLen = data.grid.length;
    const cellSize = Math.min(42, Math.floor(520 / gridLen));

    const getClueId = (r: number, c: number) => {
        const clue = data.clues.find(clue => clue.row === r && clue.col === c);
        return clue ? clue.id : null;
    };

    return (
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data?.title || "KARE BULMACA & SÖZEL BELLEK"}
                instruction={data?.instruction || "Aşağıdaki ipuçlarını takip ederek bulmacayı doldurun."}
            />

            <div className="flex flex-col gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1 mt-10 print:mt-3 flex-1 pb-10 print:pb-3">
                {/* Bulmaca Tablosu - Premium Shadow */}
                <div className="p-4 print:p-1 bg-zinc-900 border-[8px] border-white rounded-[3rem] shadow-2xl self-center overflow-visible ring-12 ring-zinc-50 group transform hover:scale-[1.02] transition-transform">
                    <table className="border-collapse mx-auto">
                        <tbody>
                            {data.grid.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, c) => (
                                        <td
                                            key={c}
                                            style={{ width: cellSize, height: cellSize }}
                                            className={`relative border border-white/10 text-center font-black text-xl leading-none transition-all ${cell === null ? 'bg-zinc-800' : 'bg-white text-zinc-900 hover:z-10 hover:scale-105'}`}
                                        >
                                            {cell !== null && (
                                                <>
                                                    {getClueId(r, c) && (
                                                        <span className="absolute top-1 left-1 text-[9px] font-black text-indigo-400/80 leading-none">
                                                            {getClueId(r, c)}
                                                        </span>
                                                    )}
                                                    <span className="uppercase tracking-tighter">
                                                        <EditableText value={String(cell)} tag="span" />
                                                    </span>
                                                </>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* İpuçları Paneli - Modern Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1 p-12 print:p-3 print:p-4 print:p-1 bg-zinc-900 text-white rounded-[4rem] border-4 border-white shadow-2xl relative overflow-visible mx-2">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-10 print:px-3 py-2.5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-xl ring-8 ring-white z-20"> PROTOKOL İPUÇLARI </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 print:mt-4 blur-3xl pointer-events-none"></div>

                    {['across', 'down'].map((dir) => (
                        <div key={dir} className="flex flex-col gap-6 print:gap-2 relative z-10">
                            <h4 className="font-black text-[12px] uppercase tracking-[0.4em] text-indigo-400 border-b-2 border-indigo-400/20 pb-3 flex items-center gap-4 print:gap-1">
                                <i className={`fa-solid ${dir === 'across' ? 'fa-arrow-right-long' : 'fa-arrow-down-long'} shadow-glow`}></i>
                                {dir === 'across' ? 'YATAY (SOLDAN SAĞA)' : 'DİKEY (YUKARIDAN AŞAĞI)'}
                            </h4>
                            <div className="grid gap-3.5">
                                {data.clues.filter(c => c.direction === dir).sort((a, b) => a.id - b.id).map(clue => (
                                    <div key={clue.id} className="text-[13px] font-bold flex gap-5 print:gap-1 items-start bg-white/5 p-5 print:p-1 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group/clue shadow-sm">
                                        <span className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-[14px] font-black text-white shrink-0 shadow-lg group-hover/clue:scale-110 group-hover/clue:bg-amber-400 group-hover/clue:text-black transition-all">{clue.id}</span>
                                        <span className="text-zinc-200 leading-relaxed pt-1.5 group-hover/clue:text-white transition-colors">{clue.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Klinik Analiz Metrikleri - Protocol Overlay */}
                {settings?.showClinicalNotes && data.clinicalMeta && (
                    <div className="mt-auto pt-8 print:pt-2 border-t-4 border-zinc-100 flex justify-between items-center px-10 print:px-3">
                        <div className="flex gap-12 print:gap-3 print:gap-4 print:gap-1">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Bağlanabilirlik</span>
                                <span className="text-xs font-black">%{Math.round(data.clinicalMeta.connectivityIndex * 100)} Integration</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Leksikal Zorluk</span>
                                <span className="text-xs font-black text-indigo-600">{data.clinicalMeta.clueComplexity}/10 Level</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 border-b-2 border-indigo-500 pb-1">Karakteristik: {data.clinicalMeta.vocabularyLevel}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Footer Protokolü */}
            <div className="mt-auto p-6 print:p-2 bg-zinc-900 text-white rounded-t-[3rem] border-x-4 border-t-4 border-white flex justify-between items-center shadow-2xl mx-1">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">MODÜL ADI</span>
                        <span className="text-xs font-black uppercase font-mono">Verbal Retrieval & Semantic Map</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 print:gap-1 opacity-70">
                    <span className="text-[8px] font-bold tracking-[0.2em]">SÖZEL ZEKA TESTİ v4.1</span>
                    <i className="fa-solid fa-brain text-indigo-400 text-lg shadow-glow"></i>
                </div>
            </div>
        </div>
    );
};



