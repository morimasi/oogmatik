
import React from 'react';
import { FamilyLogicTestData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FamilyLogicSheet: React.FC<{ data: FamilyLogicTestData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Context Info Bar */}
            <div className="flex gap-4 mb-8 no-print border-b border-zinc-100 pb-4">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Odak Soy</span>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">
                        {data.focusSide === 'mom' ? 'ANNE TARAFINDAN' : data.focusSide === 'dad' ? 'BABA TARAFINDAN' : 'KARMA SOYBAĞI'}
                    </span>
                </div>
                <div className="w-px h-6 bg-zinc-200 self-center mx-2"></div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Derinlik Seviyesi</span>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        {data.depth === 'basic' ? '1. DERECE (TEMEL)' : data.depth === 'extended' ? '2. DERECE (GENİŞ)' : 'UZMANLIK (KARMAŞIK)'}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 mt-2 content-start max-w-4xl mx-auto w-full">
                {(data.statements || []).map((st, idx) => (
                    <EditableElement 
                        key={idx} 
                        className="flex items-center gap-10 p-7 border-[3.5px] border-zinc-900 bg-white rounded-[3rem] hover:bg-zinc-50 hover:border-indigo-500 transition-all group break-inside-avoid shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]"
                    >
                        {/* Interactive Markers */}
                        <div className="flex gap-4 shrink-0">
                            <div className="flex flex-col items-center gap-1.5 group/d">
                                <div className="w-16 h-16 rounded-2xl border-[3px] border-emerald-500 bg-white flex items-center justify-center font-black text-2xl text-emerald-500 shadow-sm group-hover/d:scale-110 group-hover/d:bg-emerald-500 group-hover/d:text-white transition-all cursor-pointer">D</div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">DOĞRU</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 group/y">
                                <div className="w-16 h-16 rounded-2xl border-[3px] border-rose-500 bg-white flex items-center justify-center font-black text-2xl text-rose-500 shadow-sm group-hover/y:scale-110 group-hover/y:bg-rose-500 group-hover/y:text-white transition-all cursor-pointer">Y</div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">YANLIŞ</span>
                            </div>
                        </div>

                        {/* Statement Body */}
                        <div className="flex-1 border-l-4 border-zinc-100 pl-10 relative py-2">
                            <div className="absolute -top-6 -left-2 text-[50px] text-zinc-50 font-black select-none pointer-events-none -z-10 group-hover:text-indigo-50 transition-colors">
                                {idx + 1}
                            </div>
                            <p className="text-2xl font-bold text-zinc-800 leading-tight tracking-tight">
                                <EditableText value={st.text} tag="span" />
                            </p>
                            {st.hint && (
                                <div className="mt-3 flex items-center gap-2 text-indigo-400">
                                    <i className="fa-solid fa-lightbulb text-[10px]"></i>
                                    <p className="text-[10px] font-black uppercase italic tracking-wider">İpucu: {st.hint}</p>
                                </div>
                            )}
                        </div>

                        {/* Complexity Badge */}
                        <div className="hidden md:flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black text-zinc-400 uppercase">{st.complexity || 'standard'}</span>
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                                <i className={`fa-solid ${st.complexity === 'syllogism' ? 'fa-diagram-project' : 'fa-brain'}`}></i>
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Strategy Anchor */}
            <div className="mt-12 p-10 bg-zinc-900 text-white rounded-[4rem] shadow-2xl flex items-center gap-12 border-4 border-white relative overflow-hidden break-inside-avoid">
                 <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 -translate-y-4 translate-x-4 pointer-events-none">
                     <i className="fa-solid fa-sitemap text-[18rem]"></i>
                 </div>
                 
                 <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] backdrop-blur-md flex items-center justify-center text-5xl text-amber-400 border border-white/20 shrink-0 shadow-inner">
                     <i className="fa-solid fa-brain-circuit"></i>
                 </div>
                 
                 <div className="relative z-10 flex-1">
                     <h5 className="font-black text-xs text-amber-400 uppercase tracking-[0.5em] mb-3">PROFESYONEL STRATEJİ</h5>
                     <p className="text-lg text-zinc-300 font-medium leading-relaxed italic max-w-2xl">
                        "Eğer cümlenin mantığı karmaşık gelirse, sondan başa doğru (Örn: 'Annemin babası' -> 'Dede') sadeleştirerek ilerle. Zihninde bir soy ağacı resmi çizmek sana yardımcı olacaktır."
                     </p>
                 </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-10 flex justify-between items-center px-10 opacity-30 border-t border-zinc-100">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Müfredat Alanı</span>
                    <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-tighter">Hiyerarşik Muhakeme & Sosyal Zeka v4.0</span>
                </div>
                <div className="flex items-center gap-8">
                     <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                         <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                         <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                     </div>
                     <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.6em]">Bursa Disleksi AI • Uzman Modülü</p>
                </div>
            </div>
        </div>
    );
};
