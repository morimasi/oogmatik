import React from 'react';
import { FiveWOneHData } from '../../../types';

interface Props {
    data: FiveWOneHData;
}

export const FiveWOneHSheet: React.FC<Props> = ({ data }) => {
    // Uygulanan disleksi dostu fontlar
    const fontFamily = data.settings?.fontFamily || 'Comic Sans MS';

    return (
        <div className="w-full h-full p-8 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-800 print:p-0 print:border-none border border-zinc-200" style={{ fontFamily }}>
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b-4 border-indigo-400 pb-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase">{data.content.title}</h1>
                    <p className="text-sm font-bold text-indigo-500/70 mt-1 uppercase tracking-widest">{data.settings?.topic} • 5N1K Çözümlemesi</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-slate-400">TARİH: ___/___/20__</div>
                    <div className="text-sm font-black text-slate-400 mt-2 border-b-2 border-slate-300 w-48 mx-auto pb-1 text-left">İSİM:</div>
                </div>
            </div>

            {/* MİMARİ A4 YERLEŞİMİ : ÜSTTE METİN, ALTTA SORULAR */}
            <div className="flex-1 flex flex-col gap-10 print:p-4">
                {/* 1. OKUMA ALANI */}
                <div className="bg-indigo-50/50 rounded-[2rem] p-8 print:p-3 border-2 border-indigo-100 relative">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200">
                        <i className="fa-solid fa-book-open"></i>
                    </div>
                    <h2 className="text-xl font-black text-indigo-800 mb-4 ml-6 uppercase underline decoration-indigo-300 decoration-4 underline-offset-4">Hikayeyi Oku</h2>

                    <div className="space-y-4 text-justify px-4">
                        {data.content.paragraphs.map((p, i) => (
                            <p key={i} className="text-2xl leading-[2.5] font-medium text-slate-800 indent-12">
                                {data.settings?.syllableColoring ?
                                    (
                                        // Basit bir renklendirme simülasyonu (Hece ayırmak gerçekte AI veya library ile yapılır, görsel simüle)
                                        p.split(' ').map((word, wi) => (
                                            <span key={wi} className="mr-3 inline-block">
                                                {word.length > 4 ? (
                                                    <><span className="text-red-600">{word.substring(0, Math.ceil(word.length / 2))}</span><span className="text-blue-600">{word.substring(Math.ceil(word.length / 2))}</span></>
                                                ) : <span className="text-zinc-800">{word}</span>}
                                            </span>
                                        ))
                                    )
                                    : p}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 2. SORULAR ALANI (Kompakt Grid) */}
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white text-lg"><i className="fa-solid fa-circle-question"></i></span>
                        Soruları Cevapla
                    </h2>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        {data.questions.map((q, idx) => (
                            <div key={q.id || idx} className="space-y-3 relative page-break-inside-avoid">
                                <div className="absolute -left-6 top-1 text-slate-300 font-black text-xl">{idx + 1}.</div>
                                <h3 className="text-lg font-bold text-slate-800 leading-snug">{q.questionText}</h3>

                                {/* Şıklı Soru ise */}
                                {q.answerType === 'multiple_choice' && q.options && (
                                    <div className="space-y-2 pl-2">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-400">
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <span className="text-base text-slate-600 font-medium pt-0.5">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Açık Uçlu (Boşluk Yazma) ise */}
                                {(q.answerType === 'open_ended' || q.answerType === 'fill_in_the_blank') && (
                                    <div className="mt-4 pt-4 border-b-2 border-dashed border-slate-300 w-full relative">
                                        <i className="fa-solid fa-pen text-slate-200 absolute right-0 -top-2"></i>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-8 pt-4 border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: 5N1K Okuma-Anlama • Seviye: {data.settings?.difficulty.toUpperCase()}</span>
            </div>
        </div>
    );
};

