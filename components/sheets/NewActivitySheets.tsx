
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
            
            <div className="flex-1 flex flex-col gap-10 mt-6">
                {/* Matching Area - High Contrast Vertical Layout */}
                <div className="flex justify-between gap-16 items-start">
                    <div className="flex-1 space-y-6">
                         <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 border-b-2 border-indigo-50 pb-1">TANIMLAR</h4>
                        {data.pairs.map((pair, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 p-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl font-bold text-base leading-snug group-hover:border-indigo-400 transition-colors shadow-sm">
                                    <EditableText value={pair.definition} tag="span" />
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:bg-indigo-500 transition-all shrink-0 shadow-inner"></div>
                            </div>
                        ))}
                    </div>

                    <div className="w-56 space-y-6">
                         <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 border-b-2 border-rose-50 pb-1">AKRABALIK ADI</h4>
                        {shuffledLabels.map((pair, idx) => (
                            <div key={idx} className="flex items-center gap-4 group justify-end">
                                <div className="w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:bg-rose-500 transition-all shrink-0 shadow-inner"></div>
                                <div className="w-full p-4 bg-white border-[3px] border-zinc-900 rounded-2xl text-center font-black text-rose-600 uppercase tracking-wider text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                                    <EditableText value={pair.label} tag="span" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categorization Tables (Mom vs Dad Side) */}
                <div className="grid grid-cols-2 gap-10 mt-6">
                    <div className="border-[3px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl group hover:border-indigo-500 transition-colors">
                        <div className="bg-zinc-900 group-hover:bg-indigo-600 text-white p-5 text-center transition-colors">
                            <h4 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                                <i className="fa-solid fa-venus"></i> Annemin Akrabaları
                            </h4>
                        </div>
                        <div className="p-8 bg-white min-h-[300px] space-y-3">
                            {Array.from({length: 6}).map((_, i) => (
                                <div key={i} className="border-b-2 border-zinc-50 flex items-center gap-4 py-2">
                                    <span className="text-zinc-200 font-black text-xl">{i+1}.</span>
                                    <div className="flex-1 h-6 bg-zinc-50/50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-[3px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl group hover:border-amber-500 transition-colors">
                        <div className="bg-zinc-900 group-hover:bg-amber-600 text-white p-5 text-center transition-colors">
                            <h4 className="font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                                <i className="fa-solid fa-mars"></i> Babamın Akrabaları
                            </h4>
                        </div>
                        <div className="p-8 bg-white min-h-[300px] space-y-3">
                             {Array.from({length: 6}).map((_, i) => (
                                <div key={i} className="border-b-2 border-zinc-50 flex items-center gap-4 py-2">
                                    <span className="text-zinc-200 font-black text-xl">{i+1}.</span>
                                    <div className="flex-1 h-6 bg-zinc-50/50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center px-10 opacity-30">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kategori</span>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">Hiyerarşik Mantık v2.2</span>
                </div>
                <div className="flex items-center gap-4">
                     <i className="fa-solid fa-sitemap text-2xl text-indigo-500"></i>
                     <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Bilişsel Gelişim Laboratuvarı</p>
                </div>
            </div>
        </div>
    );
};

// AKRABALIK MANTIK TESTİ (DOĞRU / YANLIŞ)
export const FamilyLogicSheet: React.FC<{ data: FamilyLogicTestData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 flex flex-col gap-4 mt-6 content-start max-w-4xl mx-auto w-full">
                {(data.statements || []).map((st, idx) => (
                    <EditableElement key={idx} className="flex items-center gap-8 p-5 border-2 border-zinc-100 bg-white rounded-[2rem] hover:bg-zinc-50 hover:border-indigo-200 transition-all group break-inside-avoid shadow-sm">
                        <div className="flex gap-3 shrink-0">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl border-[3px] border-emerald-500 bg-white flex items-center justify-center font-black text-emerald-500 shadow-md group-hover:scale-110 transition-transform cursor-pointer">D</div>
                                <span className="text-[8px] font-black text-zinc-400 mt-1 uppercase">DOĞRU</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl border-[3px] border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 shadow-md group-hover:scale-110 transition-transform cursor-pointer">Y</div>
                                <span className="text-[8px] font-black text-zinc-400 mt-1 uppercase">YANLIŞ</span>
                            </div>
                        </div>
                        <div className="flex-1 border-l-4 border-zinc-100 pl-6">
                            <p className="text-lg font-bold text-zinc-800 leading-snug tracking-tight">
                                <EditableText value={st.text} tag="span" />
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            {idx + 1}
                        </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-12 p-8 bg-zinc-900 text-white rounded-[3.5rem] shadow-2xl flex items-center gap-10 border-4 border-white relative overflow-hidden break-inside-avoid">
                 <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><i className="fa-solid fa-brain text-[12rem]"></i></div>
                 <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center text-3xl text-indigo-400 border border-white/10 shrink-0 shadow-inner">
                     <i className="fa-solid fa-lightbulb"></i>
                 </div>
                 <div className="relative z-10">
                     <h5 className="font-black text-xs text-indigo-400 uppercase tracking-[0.4em] mb-2">UZMAN STRATEJİSİ</h5>
                     <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">
                         "Akrabalık ifadelerini değerlendirirken zihninde bir 'Soy Ağacı' simülasyonu oluşturmaya çalış. Bu, uzamsal bellek ve mantıksal çıkarsama yollarını eşzamanlı olarak aktif edecektir."
                     </p>
                 </div>
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center px-10 opacity-30">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Bilişsel Muhakeme Modülü</p>
                <div className="flex gap-4">
                    <div className="w-8 h-2 bg-zinc-200 rounded-full"></div>
                    <div className="w-8 h-2 bg-indigo-500 rounded-full"></div>
                    <div className="w-8 h-2 bg-zinc-200 rounded-full"></div>
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
