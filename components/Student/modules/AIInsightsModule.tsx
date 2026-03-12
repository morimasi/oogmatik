import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

export const AIInsightsModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* AI Summary Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <i className="fa-solid fa-brain-circuit text-2xl text-indigo-400"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Bilişsel Profil</h2>
              <p className="text-indigo-300 text-sm font-medium">
                Gerçek zamanlı veri analizi ve projeksiyon
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">
                Yapay Zeka Özeti
              </h3>
              <p className="text-slate-300 leading-relaxed italic">
                "{student.name}, son 30 günlük verilerine göre görsel-uzamsal algı alanında %22'lik
                bir sıçrama gerçekleştirdi. Ancak çalışma belleği kapasitesinde yorulma belirtileri
                gözlemleniyor. Önerilen strateji: Egzersiz aralarında 2 dakikalık nöro-mola
                verilmesi ve multisensöryel (işitsel destekli) okuma moduna geçilmesi."
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">
                Gelecek Projeksiyonu
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-400">Okuma Akıcılığı Hedefi</span>
                  <span className="text-lg font-black text-emerald-400">~15 Gün</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[75%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Mevcut hızda ilerlenirse BEP hedeflerine Nisan ayında ulaşılması bekleniyor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-lightbulb text-xl"></i>
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white mb-2 uppercase text-xs tracking-wider">
            Stratejik Öneri
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Görsel karmaşayı azaltmak için materyallerde "Odak Maskesi" kullanılması önerilir.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-puzzle-piece text-xl"></i>
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white mb-2 uppercase text-xs tracking-wider">
            Aktivite Uyarlaması
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Matematik problemlerinin hikayeleştirilerek (Space Theme) sunulması motivasyonu %40
            artıracaktır.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-chart-line text-xl"></i>
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white mb-2 uppercase text-xs tracking-wider">
            Zirve Performans
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Öğrencinin en verimli olduğu saat aralığı: 10:00 - 11:30 arası olarak tespit edildi.
          </p>
        </div>
      </div>

      {/* Smart Timeline */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
          <i className="fa-solid fa-timeline text-indigo-500"></i>
          Gelişim Zaman Çizelgesi
        </h3>

        <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
          <div className="relative">
            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-zinc-900 shadow-glow"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  Bugün
                </span>
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  Yeni BEP Hedefi: Akıcı Okuma
                </h4>
                <p className="text-sm text-zinc-500">
                  AI tarafından önerilen hedefler sisteme eklendi.
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                Tamamlandı
              </span>
            </div>
          </div>

          <div className="relative opacity-50">
            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900"></div>
            <div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Gelecek Hafta
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-white">Diskalkuli Tarama Testi</h4>
              <p className="text-sm text-zinc-500">Öngörülen performans skoru: %72</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
