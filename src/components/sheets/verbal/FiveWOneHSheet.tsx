import React from 'react';
import { FiveWOneHData } from '../../../types';

interface Props {
    data: FiveWOneHData;
}

export const FiveWOneHSheet: React.FC<Props> = ({ data }) => {
    // Uygulanan disleksi dostu fontlar
    const fontFamily = data.settings?.fontFamily || 'Lexend';

    return (
        <div className="w-full h-full p-6 print:p-4 flex flex-col bg-white overflow-hidden text-zinc-800 border-none relative" style={{ fontFamily }}>
            {/* DEKORATİF ARKA PLAN ÖĞELERİ - Kompakt */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 opacity-30 print:hidden"></div>
            
            {/* ETKİNLİK ÜST BİLGİ PLAKASI - Ultra Compact */}
            <div className="relative z-10 flex justify-between items-start border-b border-indigo-100 pb-3 mb-4 print:mb-3">
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i className="fa-solid fa-file-signature text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-indigo-950 tracking-tight uppercase leading-none">
                            {data.content.title || '5N1K OKUMA ANLAMA'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[8px] font-bold rounded-md uppercase">5N1K</span>
                             <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-bold rounded-md uppercase">{data.settings?.topic || 'Genel'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter w-10 text-right">TARİH:</span>
                        <div className="w-24 border-b border-slate-200 h-3"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter w-10 text-right">ÖĞRENCİ:</span>
                        <div className="w-32 border-b-2 border-slate-300 h-4"></div>
                    </div>
                </div>
            </div>

            {/* ANA İÇERİK MİMARİSİ - Ultra Compact */}
            <div className="relative z-10 flex-1 flex flex-col gap-4 print:gap-3 overflow-hidden">
                
                {/* 1. OKUMA PANELİ - COMPACT */}
                <section className="bg-slate-50/80 rounded-2xl p-4 print:p-3 border border-slate-200 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5 text-indigo-900 pointer-events-none">
                        <i className="fa-solid fa-quote-right text-6xl"></i>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                            <i className="fa-solid fa-book-open text-xs"></i>
                        </div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-indigo-500 pb-0.5">HİKAYEYİ OKUYALIM</h2>
                    </div>

                    <article className="space-y-3 text-justify px-1 leading-[1.6] print:leading-[1.5]">
                        {data.content.paragraphs.map((para, i) => (
                            <p key={i} className="text-lg print:text-base font-medium text-slate-700 indent-6 first-letter:text-2xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-1">
                                {para}
                            </p>
                        ))}
                    </article>
                </section>

                {/* 2. SORULAR PANELİ - COMPACT HIGH DENSITY */}
                <div className="flex-1 flex flex-col pt-1 print:pt-0">
                    <div className="flex items-center justify-between mb-4 print:mb-3 border-l-3 border-rose-500 pl-3">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">ANALİZ SORULARI</h2>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Metne göre soruları cevaplandırın.</p>
                        </div>
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                            <i className="fa-solid fa-comment-dots text-lg"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 print:gap-x-6 print:gap-y-4 flex-1 px-2 print:px-0">
                        {data.questions.map((q, idx) => (
                            <div key={q.id || idx} className="flex flex-col gap-1.5 relative group page-break-inside-avoid">
                                {/* Soru Numarası Rozeti - KALDIRILDI */}
                                
                                <h3 className="text-[15px] print:text-[13px] font-bold text-slate-900 leading-snug">
                                    {q.questionText}
                                </h3>

                                {/* Çoktan Seçmeli (Test) Stili - Compact */}
                                {q.answerType === 'multiple_choice' && q.options && (
                                    <div className="grid grid-cols-1 gap-1 mt-0.5">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center text-[8px] font-black text-slate-500 bg-white">
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <span className="text-[13px] print:text-[11px] text-slate-600 font-medium">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Açık Uçlu (Satır Yazma) Stili - Compact */}
                                {(q.answerType === 'open_ended' || q.answerType === 'fill_in_the_blank') && (
                                    <div className="mt-1 space-y-2">
                                        <div className="border-b-2 border-slate-100 h-5 w-full flex items-end">
                                            <span className="text-[7px] text-slate-300 font-bold mb-1 uppercase tracking-widest">Cevap:</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PEDAGOJİK NOT - Ultra Compact */}
            {data.pedagogicalNote && (
                <div className="mt-4 pt-3 border-t border-slate-100 print:mt-2">
                    <div className="bg-amber-50/30 rounded-lg p-2 border border-amber-100 print:bg-transparent print:border-none print:p-0">
                        <div className="flex items-center gap-1 mb-1">
                            <i className="fa-solid fa-graduation-cap text-[8px] text-amber-600"></i>
                            <span className="text-[8px] font-black text-amber-800 uppercase tracking-tighter">Pedagojik Not:</span>
                        </div>
                        <p className="text-[9px] print:text-[8px] leading-relaxed text-slate-500 font-medium italic">
                            {data.pedagogicalNote}
                        </p>
                    </div>
                </div>
            )}

            {/* MARKA VE TELİF FOOTER - Compact */}
            <footer className="mt-3 pt-2 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] relative z-10">
                <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                    <span>Oogmatik EdTech</span>
                </div>
                <span>© 2026</span>
            </footer>
        </div>
    );
};
