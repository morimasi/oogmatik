import React from 'react';
import { LogicErrorHunterData } from '../../../types/verbal';

interface Props {
    data: LogicErrorHunterData;
}

export const LogicErrorHunterSheet: React.FC<Props> = ({ data }) => {
    const story = data.content?.story || '';
    const errors = data.content?.errors || [];

    return (
<<<<<<< HEAD
        <div className="w-full h-full  p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
=======
        <div className="w-full h-full print:h-0 p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
            {/* BAŞLIK */}
            <div className="flex justify-between items-center border-b-4 border-fuchsia-500 pb-4 print:pb-1 mb-6 print:mb-2">
                <div>
                    <h1 className="text-4xl font-black text-fuchsia-900 tracking-tighter uppercase">{data.content?.title || "Mantık Hataları Avcısı"}</h1>
                    <p className="text-sm font-bold text-fuchsia-600 mt-1 uppercase tracking-widest">Hataları Bul ve Düzelt • Zorluk: {data.settings?.difficulty.toUpperCase()}</p>
                </div>
                <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-fuchsia-100">
                    <i className="fa-solid fa-bug-slash"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 print:gap-2">

                {/* YÖNERGE & OKUMA METNİ */}
                <div className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-[2rem] p-6 print:p-2 shadow-sm relative page-break-inside-avoid">
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-4 print:px-1 py-1.5 rounded-full text-xs font-black shadow-sm flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        Bu metinde tam {errors.length} adet mantık hatası var!
                    </div>

                    <h3 className="text-sm font-black text-zinc-400 tracking-widest uppercase mb-4 print:mb-1">Okuma Metni</h3>

                    {/* Disleksi Dostu Geniş Satır Aralığı ve Büyük Font */}
                    <div className="text-xl md:text-2xl font-medium text-zinc-800 leading-loose md:leading-[2.5] tracking-wide text-justify indent-8">
                        {story}
                    </div>
                </div>

                {/* HATA TESPİT VE DÜZELTME TABLOSU / KARTLARI */}
                <div className="flex-1 mt-4 print:mt-1">
                    <h3 className="text-sm font-black text-fuchsia-800 tracking-widest uppercase mb-4 print:mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check"></i> Tespit Raporu
                    </h3>

                    <div className="space-y-4">
                        {errors.map((error, idx) => (
                            <div key={idx} className="w-full bg-white border-2 border-fuchsia-100 rounded-2xl p-4 print:p-1 shadow-sm flex gap-4 print:gap-1 page-break-inside-avoid relative overflow-hidden">
                                {/* Sol Numara */}
                                <div className="w-12 flex flex-col items-center justify-center bg-fuchsia-50 rounded-xl border border-fuchsia-100">
                                    <span className="text-fuchsia-300 text-[10px] font-black uppercase mb-1">Hata</span>
                                    <span className="text-2xl font-black text-fuchsia-600">{idx + 1}</span>
                                </div>

                                {/* Form Alanları */}
                                <div className="flex-1 grid grid-cols-[1fr_1.5fr] gap-6 print:gap-2">
                                    {/* Hata Nedir */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-zinc-500 uppercase tracking-wide">Mantıksız Bölüm:</label>
                                        <div className="flex-1 border-b-2 border-dashed border-zinc-300 min-h-[40px]"></div>
                                    </div>

                                    {/* Doğrusu Nedir */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-emerald-600 uppercase tracking-wide">Sen Olsan Ne Yazardın?</label>
                                        <div className="flex-1 border-b-2 border-dashed border-emerald-200 min-h-[40px]"></div>
                                    </div>

                                    {/* Eğitimci Çözümü (Opsiyonel - Kağıt üzerinde ters veya küçük yazılabilir, şimdilik sadece dijitalde gizli ya da bottoma eklenecek, burası çocuğa ait boşluk) */}
                                    <div className="col-span-2 pt-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Neden Mantıksız Çıkarımın:</label>
                                        <div className="w-full border-b-2 border-dashed border-zinc-200 h-6 mt-2"></div>
                                    </div>
                                </div>

                                {/* Arka plan filigranı */}
                                <i className="fa-solid fa-bug absolute -right-4 -bottom-4 text-fuchsia-50 text-6xl opacity-30 rotate-12 pointer-events-none"></i>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* FOOTER & TEACHER KEY (Eğitmen Anahtarı) */}
            <div className="pt-4 print:pt-1 mt-auto border-t-2 border-zinc-100 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                    <span>Modül: Absürt Hikayeler • Hatalar: {errors.length}</span>
                </div>
                {/* Öğretmen için mini cevap anahtarı */}
                <div className="text-[6px] font-mono text-zinc-300 leading-tight flex gap-4 print:gap-1 text-justify print:opacity-50 line-clamp-2">
                    {errors.map((e, i) => (
                        <span key={i}>[{i + 1}] {e.faultyWordOrPhrase} &rarr; {e.correction}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};


<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
