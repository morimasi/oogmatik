import React from 'react';
import { FiveWOneHData } from '../../../types';

interface Props {
    data: FiveWOneHData;
}

export const FiveWOneHSheet: React.FC<Props> = ({ data }) => {
    // Uygulanan disleksi dostu fontlar
    const fontFamily = data.settings?.fontFamily || 'Lexend';

    return (
        <div className="w-full h-full p-10 print:p-6 flex flex-col bg-white overflow-hidden text-zinc-800 border-none relative" style={{ fontFamily }}>
            {/* DEKORATİF ARKA PLAN ÖĞELERİ (Sadece görsel zenginlik için) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 print:hidden"></div>
            
            {/* ETKİNLİK ÜST BİLGİ PLAKASI */}
            <div className="relative z-10 flex justify-between items-start border-b-2 border-indigo-100 pb-6 mb-8 print:mb-4">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i className="fa-solid fa-file-signature text-3xl"></i>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-indigo-950 tracking-tight uppercase leading-none">
                            {data.content.title || '5N1K OKUMA ANLAMA'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md uppercase">Stüdyo: 5N1K</span>
                             <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase">Konu: {data.settings?.topic || 'Genel'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-12 text-right">TARİH:</span>
                        <div className="w-32 border-b border-slate-200 h-4"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-12 text-right">ÖĞRENCİ:</span>
                        <div className="w-48 border-b-2 border-slate-300 h-5"></div>
                    </div>
                </div>
            </div>

            {/* ANA İÇERİK MİMARİSİ */}
            <div className="relative z-10 flex-1 flex flex-col gap-6 print:gap-4 overflow-hidden">
                
                {/* 1. OKUMA PANELİ - ULTRA COMPACT */}
                <section className="bg-slate-50/80 rounded-[2.5rem] p-8 print:p-6 border border-slate-200 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-900 pointer-events-none">
                        <i className="fa-solid fa-quote-right text-8xl"></i>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                            <i className="fa-solid fa-book-open text-sm"></i>
                        </div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide border-b-2 border-indigo-500 pb-1">HİKAYEYİ OKUYALIM</h2>
                    </div>

                    <article className="space-y-4 text-justify px-2 leading-[1.8] print:leading-[1.6]">
                        {data.content.paragraphs.map((para, i) => (
                            <p key={i} className="text-xl print:text-lg font-medium text-slate-700 indent-10 first-letter:text-3xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-1">
                                {para}
                            </p>
                        ))}
                    </article>
                </section>

                {/* 2. SORULAR PANELİ - HIGH DENSITY 2-COLUMN GRID */}
                <div className="flex-1 flex flex-col pt-2 print:pt-0">
                    <div className="flex items-center justify-between mb-6 print:mb-4 border-l-4 border-rose-500 pl-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">ANALİZ VE ANLAMA SORULARI</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Metne göre aşağıdaki soruları dikkatle cevaplandıralım.</p>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                            <i className="fa-solid fa-comment-dots text-xl"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-10 print:gap-x-8 print:gap-y-6 flex-1 px-4 print:px-0">
                        {data.questions.map((q, idx) => (
                            <div key={q.id || idx} className="flex flex-col gap-2 relative group page-break-inside-avoid">
                                {/* Soru Numarası Rozeti */}
                                <div className="absolute -left-6 top-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs transition-colors group-hover:bg-indigo-600 group-hover:text-white print:bg-slate-50">
                                    {idx + 1}
                                </div>
                                
                                <h3 className="text-[17px] print:text-[15px] font-bold text-slate-900 leading-snug pl-4">
                                    {q.questionText}
                                </h3>

                                {/* Çoktan Seçmeli (Test) Stili */}
                                {q.answerType === 'multiple_choice' && q.options && (
                                    <div className="grid grid-cols-1 gap-1.5 pl-6 mt-1">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center text-[9px] font-black text-slate-500 bg-white">
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <span className="text-[15px] print:text-[13px] text-slate-600 font-medium">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Açık Uçlu (Satır Yazma) Stili */}
                                {(q.answerType === 'open_ended' || q.answerType === 'fill_in_the_blank') && (
                                    <div className="mt-2 pl-4 space-y-3">
                                        <div className="border-b-2 border-slate-100 h-6 w-full flex items-end">
                                            <span className="text-[8px] text-slate-300 font-bold mb-1 uppercase tracking-widest">Cevap:</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PEDAGOJİK NOT (ÖĞRETMEN NOTU) - Sayfa Altında Çok Küçük */}
            {data.pedagogicalNote && (
                <div className="mt-6 pt-4 border-t border-slate-100 print:mt-2">
                    <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 print:bg-transparent print:border-none print:p-0">
                        <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-graduation-cap text-[10px] text-amber-600"></i>
                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">Pedagojik Not (Eğitmen İçin):</span>
                        </div>
                        <p className="text-[11px] print:text-[9px] leading-relaxed text-slate-500 font-medium italic">
                            {data.pedagogicalNote}
                        </p>
                    </div>
                </div>
            )}

            {/* MARKA VE TELİF FOOTER */}
            <footer className="mt-4 pt-2 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] relative z-10">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    <span>Neuro-Oogmatik EdTech Solutions</span>
                </div>
                <span>© 2026 • Tüm Hakları Saklıdır</span>
            </footer>
        </div>
    );
};
