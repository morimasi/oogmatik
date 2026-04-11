import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { LineChart } from '../../LineChart';

interface OverviewModuleProps {
  student: AdvancedStudent;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ student }) => {
  // Mock veri simülasyonu (Gerçek veri yoksa gösterim amaçlı)
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const performanceTrend = [65, 78, 72, 85, 82, 88, 92];

  const getCognitiveScore = () => {
    const total = student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) || 0;
    const count = student.iep?.goals?.length || 1;
    return Math.round(total / count);
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500">
      {/* Üst Karşılama ve Hızlı Durum */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sol: Gelişim Radarı / Ana Skor (Bento Card Compact) */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                  Genel Gelişim
                </h3>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  Başarı Endeksi
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-chart-line-up text-sm"></i>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-zinc-100 dark:text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * getCognitiveScore()) / 100}
                    className="text-indigo-600 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    %{getCognitiveScore()}
                  </span>
                  <span className="text-[8px] font-black uppercase text-zinc-400">Skor</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-500">Bilişsel Esneklik</span>
                    <span className="text-[10px] font-black text-emerald-500">+12%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[75%] rounded-full"></div>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-500">Hafıza Kapasitesi</span>
                    <span className="text-[10px] font-black text-indigo-500">+8%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[62%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: AI Insight Highlight (Bento Card Compact) */}
        <div className="w-full lg:w-72 bg-zinc-900 dark:bg-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/5">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm mb-4">
              <i className="fa-solid fa-sparkles text-indigo-400 text-[8px]"></i>
              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-200">
                AI Öngörüsü
              </span>
            </div>
            <h4 className="text-sm font-black mb-2 leading-tight">Yapay Zeka Modülasyonu</h4>
            <p className="text-zinc-500 text-[10px] leading-relaxed italic border-l border-indigo-500 pl-3 py-0.5 mb-4">
              "Sabah seanslarında performansın %15 daha yüksek olduğu saptandı."
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] font-black uppercase text-indigo-400 mb-1">Önerilen</p>
              <p className="text-[10px] font-medium text-indigo-50">
                Sabah seanslarında 'Mantık' çalışılmalı.
              </p>
            </div>
            <button className="w-full py-2 bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg">
              Uygula
            </button>
          </div>
        </div>
      </div>

      {/* Orta: Grafik Alanı (Compact) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              Performans Grafiği
            </h3>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Son 7 Günlük Değişim
            </p>
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
          </div>
        </div>

        <div className="h-48">
          <LineChart
            data={performanceTrend}
            labels={weekDays}
            color="#4f46e5"
            tension={0.4}
            showArea={true}
            compact={true}
          />
        </div>
      </div>

      {/* Alt: Metrikler Grid (Compact) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Çözülen Soru',
            value: '1,240',
            icon: 'fa-brain',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          },
          {
            label: 'Toplam Süre',
            value: '42s',
            icon: 'fa-stopwatch',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            label: 'Başarı Oranı',
            value: '%94',
            icon: 'fa-check-double',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Aktif Gün',
            value: '18',
            icon: 'fa-calendar-check',
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center text-sm`}
            >
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-none mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
