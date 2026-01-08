
import React from 'react';
import { FamilyRelationsData, FamilyLogicTestData, MapInstructionData, SyllableWordBuilderData } from '../../types';
import { PedagogicalHeader, GridComponent, ImageDisplay } from './common';
import { EditableElement, EditableText } from '../Editable';

// AKRABALIK İLİŞKİLERİ EŞLEŞTİRME VE LİSTELEME
export const FamilyRelationsSheet: React.FC<{ data: FamilyRelationsData }> = ({ data }) => {
    const shuffledLabels = [...data.pairs].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 flex flex-col gap-8 mt-6">
                {/* Matching Area */}
                <div className="flex justify-between gap-12">
                    <div className="flex-1 space-y-4">
                        {data.pairs.map((pair, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="flex-1 p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-sm leading-tight group-hover:border-indigo-400 transition-colors">
                                    <EditableText value={pair.definition} tag="span" />
                                </div>
                                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:bg-indigo-500 transition-colors shrink-0"></div>
                            </div>
                        ))}
                    </div>

                    <div className="w-48 space-y-4">
                        {shuffledLabels.map((pair, idx) => (
                            <div key={idx} className="flex items-center gap-4 group justify-end">
                                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 group-hover:bg-indigo-500 transition-colors shrink-0"></div>
                                <div className="w-full p-3 bg-white border-2 border-zinc-800 rounded-xl text-center font-black text-rose-600 uppercase tracking-wider text-sm shadow-sm group-hover:scale-105 transition-transform">
                                    <EditableText value={pair.label} tag="span" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categorization Tables (Mom vs Dad Side) */}
                <div className="grid grid-cols-2 gap-8 mt-10">
                    <div className="border-[3px] border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-lg">
                        <div className="bg-zinc-900 text-white p-4 text-center">
                            <h4 className="font-black uppercase tracking-[0.2em] text-sm">Annemin Akrabaları</h4>
                        </div>
                        <div className="p-6 bg-white min-h-[250px] space-y-2">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="border-b border-zinc-100 flex items-center gap-3 py-1">
                                    <span className="text-zinc-300 font-bold">-</span>
                                    <div className="flex-1 h-5"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-[3px] border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-lg">
                        <div className="bg-zinc-900 text-white p-4 text-center">
                            <h4 className="font-black uppercase tracking-[0.2em] text-sm">Babamın Akrabaları</h4>
                        </div>
                        <div className="p-6 bg-white min-h-[250px] space-y-2">
                             {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="border-b border-zinc-100 flex items-center gap-3 py-1">
                                    <span className="text-zinc-300 font-bold">-</span>
                                    <div className="flex-1 h-5"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6 opacity-40">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Akrabalık İlişkileri v2.1</p>
                <i className="fa-solid fa-sitemap"></i>
            </div>
        </div>
    );
};

// AKRABALIK MANTIK TESTİ (DOĞRU / YANLIŞ)
export const FamilyLogicSheet: React.FC<{ data: FamilyLogicTestData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 flex flex-col gap-3 mt-6 content-start">
                {(data.statements || []).map((st, idx) => (
                    <EditableElement key={idx} className="flex items-center gap-6 p-4 border-2 border-zinc-100 bg-white rounded-3xl hover:bg-zinc-50 transition-all group break-inside-avoid">
                        <div className="flex gap-2 shrink-0">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-2xl border-[3px] border-emerald-500 bg-white flex items-center justify-center font-black text-emerald-500 shadow-sm group-hover:scale-110 transition-transform cursor-pointer">D</div>
                                <span className="text-[7px] font-black text-zinc-300 mt-1 uppercase">DOĞRU</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-2xl border-[3px] border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 shadow-sm group-hover:scale-110 transition-transform cursor-pointer">Y</div>
                                <span className="text-[7px] font-black text-zinc-300 mt-1 uppercase">YANLIŞ</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-base font-bold text-zinc-800 leading-snug">
                                <EditableText value={st.text} tag="span" />
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx + 1}
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-10 p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-[2.5rem] flex items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-2xl text-indigo-500 border border-indigo-100">
                     <i className="fa-solid fa-lightbulb"></i>
                 </div>
                 <div>
                     <h5 className="font-black text-xs text-indigo-600 uppercase tracking-widest mb-1">MANTIKSAL KONTROL</h5>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                         "Akrabalık bağlarını kurarken 'Kimin, Neyi?' sorusunu sorarak zihninde aile ağacını canlandırmaya çalış. Bu çalışma sadece okuma değil, aynı zamanda görsel-mantıksal bir analizdir."
                     </p>
                 </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6 opacity-40">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Bilişsel Muhakeme Modülü</p>
                <div className="flex gap-2">
                    <div className="w-6 h-1 bg-zinc-200 rounded-full"></div>
                    <div className="w-6 h-1 bg-amber-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// HECE DEDEKTİFİ BİLEŞENİ
export const SyllableWordBuilderSheet: React.FC<{ data: SyllableWordBuilderData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex-1 flex flex-col gap-8 mt-4">
                {/* Kelime İnşa Alanları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data.words || []).map((word, idx) => (
                        <EditableElement key={idx} className="flex items-center gap-4 p-4 border-[3px] border-zinc-900 rounded-[2rem] bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 shrink-0 overflow-hidden shadow-inner">
                                <ImageDisplay prompt={word.imagePrompt} description={word.targetWord} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    {word.syllables.map((_, sIdx) => (
                                        <div key={sIdx} className="w-12 h-10 border-b-[3px] border-dashed border-zinc-300 bg-zinc-50/50 rounded-t-lg flex items-center justify-center font-black text-lg text-zinc-200">
                                            ?
                                        </div>
                                    ))}
                                </div>
                                <div className="h-px bg-zinc-100 w-full"></div>
                                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">KELİME İNŞA ALANI</div>
                            </div>
                        </EditableElement>
                    ))}
                </div>

                {/* Hece Bankası (Bento Box style) */}
                <div className="mt-6 p-6 bg-zinc-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden break-inside-avoid border-4 border-zinc-100">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><i className="fa-solid fa-puzzle-piece text-8xl"></i></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-5 flex items-center gap-2">
                        <i className="fa-solid fa-layer-group"></i> HECE HAVUZU
                    </h4>
                    <div className="flex flex-wrap justify-center gap-3 relative z-10">
                        {(data.syllableBank || []).map((syllable, idx) => (
                            <EditableElement key={idx} className="px-4 py-2 bg-white text-zinc-900 rounded-xl font-black text-lg shadow-md border-2 border-transparent hover:border-indigo-500 hover:scale-105 transition-all cursor-default">
                                <EditableText value={syllable} tag="span" />
                            </EditableElement>
                        ))}
                    </div>
                    <div className="mt-6 text-[9px] text-zinc-500 font-bold text-center uppercase tracking-widest opacity-60 italic">
                        Doğru heceleri havuzdan bul ve resmin yanındaki kutucuklara sırasıyla yaz.
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100 flex justify-between items-center px-6">
                <p className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Fonolojik Sentez Bataryası v2.0</p>
                <div className="flex gap-4 opacity-20">
                     <i className="fa-solid fa-ear-listen"></i>
                     <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};
