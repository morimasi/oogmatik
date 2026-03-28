import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { _LineChart } from '../../LineChart';

interface OverviewModuleProps {
    student: AdvancedStudent;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ student }) => {
    // Mock veri simülasyonu (Gerçek veri yoksa gösterim amaçlı)
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const performanceTrend = [65, 78, 72, 85, 82, 88, 92];

    const getCognitiveScore = () => {
        const total = (student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) || 0);
        const count = student.iep?.goals?.length || 1;
        return Math.round(total / count);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Üst Karşılama ve Hızlı Durum */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sol: Gelişim Radarı / Ana Skor (Bento Card Large) */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[3.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase mb-2">Genel Gelişim</h3>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Kümülatif Başarı Endeksi</p>
                            </div>
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                                <i className="fa-solid fa-chart-line-up text-2xl"></i>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-zinc-100 dark:text-zinc-800" />
                                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * getCognitiveScore()) / 100} className="text-indigo-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-zinc-900 dark:text-white">%{getCognitiveScore()}</span>
                                    <span className="text-[10px] font-black uppercase text-zinc-400">Skor</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-zinc-500">Bilişsel Esneklik</span>
                                        <span className="text-xs font-black text-emerald-500">+12%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[75%] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-zinc-500">Hafıza Kapasitesi</span>
                                        <span className="text-xs font-black text-indigo-500">+8%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[62%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ: AI Insight Highlight (Bento Card High Intensity) */}
                <div className="w-full lg:w-96 bg-gradient-to-br from-zinc-900 via-indigo-950 to-black rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm mb-6">
                            <i className="fa-solid fa-sparkles text-indigo-400 text-[10px]"></i>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">AI Öngörüsü</span>
                        </div>
                        <h4 className="text-2xl font-black mb-4 leading-tight">Yapay Zeka Destekli Modülasyon</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1">
                            "Öğrencinin son 7 günlük dijital ayak izi, akşam seanslarında performansının sabah saatlerine göre %15 daha düşük olduğunu gösteriyor."
                        </p>
                    </div>

                    <div className="mt-8 space-y-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Önerilen Aksiyon</p>
                            <p className="text-xs font-medium text-indigo-50">Sabah seanslarında 'Sözel Mantık' ağırlıklı çalışılmalı.</p>
                        </div>
                        <button className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40">
                            Stratejiyi Uygula
                        </button>
                    </div>
                </div>
            </div>

            {/* Orta Katman: Aktivite Trendi ve Kritik Uyarılar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Son Aktiviteler (Bento Card Tall) */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[3.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-10 px-2">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Performans Trendi</h3>
                        <div className="flex gap-2">
                            {['7G', '30G', '12A'].map(t => (
                                <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${t === '7G' ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-3 h-48 px-2">
                        {performanceTrend.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl relative overflow-hidden h-40">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-2xl transition-all duration-1000 ease-out group-hover/bar:from-indigo-600 group-hover/bar:to-indigo-400 cursor-help"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute top-2 left-0 right-0 text-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-black text-white">%{h}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{weekDays[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kritik Gözlemler (Bento Card Contextual) */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8">Kritik Gözlemler</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                            <div className="flex gap-4 items-center mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                </div>
                                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">Dikkat Dağınıklığı</span>
                            </div>
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                                Son 3 sesli okuma aktivitesinde satır atlama eğilimi gözlemlendi.
                            </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex gap-4 items-center mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                                    <i className="fa-solid fa-star"></i>
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">Güçlü Odak</span>
                            </div>
                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                Matematik mantık bulmacalarında 'Zor' seviye rekor sürede tamamlandı.
                            </p>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all">
                        Tüm Notları İncele
                    </button>
                </div>
            </div>

            {/* Alt Katman: Son Eğitim Materyalleri */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Dijital Portfolyo</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Son Hazırlanan Eğitim Materyalleri</p>
                    </div>
                    <button className="px-8 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                        Tüm Arşive Git
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="group/item relative bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-6 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${i === 1 ? 'bg-indigo-50 text-indigo-600' :
                                        i === 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    } group-hover/item:scale-110 transition-transform`}>
                                    <i className={`fa-solid ${i === 1 ? 'fa-book-open' : i === 2 ? 'fa-calculator' : 'fa-brain'}`}></i>
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase">{i} Gün Önce</span>
                            </div>
                            <h4 className="text-lg font-black text-zinc-900 dark:text-white uppercase mb-2">
                                {i === 1 ? 'Akıcı Okuma Seti v2' : i === 2 ? 'Görsel Matematik #4' : 'Dikkat Geliştirme #12'}
                            </h4>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg text-[9px] font-black text-zinc-500 uppercase">Seviye 2</span>
                                <span className="px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg text-[9px] font-black text-zinc-500 uppercase">12 Sayfa</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
