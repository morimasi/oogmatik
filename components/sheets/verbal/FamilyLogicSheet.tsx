
import React from 'react';
import { FamilyLogicTestData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const FamilyLogicSheet: React.FC<{ data: FamilyLogicTestData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white p-2 text-black font-lexend overflow-visible">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Meta Info Bar */}
            <div className="flex gap-4 mb-8 no-print">
                <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-200">
                    Odak: {data.focusSide === 'mom' ? 'Anne' : data.focusSide === 'dad' ? 'Baba' : 'Karma'} Tarafı
                </div>
                <div className="px-4 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">
                    Seviye: {data.depth === 'basic' ? 'Temel' : data.depth === 'extended' ? 'Geniş' : 'Uzman'}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-5 mt-2 content-start max-w-4xl mx-auto w-full">
                {(data.statements || []).map((st, idx) => (
                    <EditableElement 
                        key={idx} 
                        className="flex items-center gap-8 p-6 border-[3px] border-zinc-900 bg-white rounded-[2.5rem] hover:bg-zinc-50 hover:border-indigo-500 transition-all group break-inside-avoid shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]"
                    >
                        {/* Selector Controls */}
                        <div className="flex gap-4 shrink-0">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-14 h-14 rounded-2xl border-[3px] border-emerald-500 bg-white flex items-center justify-center font-black text-xl text-emerald-500 shadow-sm group-hover:scale-110 transition-transform cursor-pointer">D</div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">DOĞRU</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="w-14 h-14 rounded-2xl border-[3px] border-rose-500 bg-white flex items-center justify-center font-black text-xl text-rose-500 shadow-sm group-hover:scale-110 transition-transform cursor-pointer">Y</div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">YANLIŞ</span>
                            </div>
                        </div>

                        {/* Statement Text */}
                        <div className="flex-1 border-l-4 border-zinc-100 pl-8 relative">
                            <div className="absolute -top-4 -left-1 text-[40px] text-zinc-100 font-black select-none pointer-events-none">
                                {idx + 1}
                            </div>
                            <p className="text-xl font-bold text-zinc-800 leading-snug tracking-tight relative z-10">
                                <EditableText value={st.text} tag="span" />
                            </p>
                            {st.hint && (
                                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-2 italic opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i className="fa-solid fa-lightbulb mr-1"></i> {st.hint}
                                </p>
                            )}
                        </div>

                        {/* Visual Index */}
                        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg border-2 border-white">
                            {idx + 1}
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* Bottom Strategy Box */}
            <div className="mt-12 p-10 bg-zinc-900 text-white rounded-[4rem] shadow-2xl flex items-center gap-12 border-4 border-white relative overflow-hidden break-inside-avoid">
                 <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 -translate-y-4 translate-x-4">
                     <i className="fa-solid fa-sitemap text-[15rem]"></i>
                 </div>
                 
                 <div className="w-24 h-24 bg-white/10 rounded-[2rem] backdrop-blur-md flex items-center justify-center text-4xl text-amber-400 border border-white/20 shrink-0 shadow-inner">
                     <i className="fa-solid fa-brain"></i>
                 </div>
                 
                 <div className="relative z-10">
                     <h5 className="font-black text-xs text-amber-400 uppercase tracking-[0.4em] mb-3">BİLİŞSEL STRATEJİ</h5>
                     <p className="text-base text-zinc-300 font-medium leading-relaxed italic max-w-2xl">
                         "Akrabalık ifadelerini değerlendirirken zihninde bir 'Soy Ağacı' haritası oluştur. Eğer cümle karışıksa, sondan başa doğru (Örn: Annemin kardeşi -> Dayım) basitleştirerek ilerle."
                     </p>
                 </div>
            </div>

            {/* Pro Footer */}
            <div className="mt-auto pt-10 flex justify-between items-center px-10 opacity-30">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Modül</span>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">Hiyerarşik Mantık Atölyesi v3.0</span>
                </div>
                <div className="flex items-center gap-6">
                     <i className="fa-solid fa-users-viewfinder text-3xl text-zinc-300"></i>
                     <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Nöro-Bilişsel Gelişim</p>
                </div>
            </div>
        </div>
    );
};
