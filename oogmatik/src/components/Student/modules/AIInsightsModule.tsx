import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { RadarChart } from '../../RadarChart';

export const AIInsightsModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
  // Mock bilişsel veri - gerçek veriler gelişince buradan bağlanacak
  const cognitiveData = [
    { label: 'Dikkat', value: 75 },
    { label: 'Hafıza', value: 62 },
    { label: 'Görsel Algı', value: 88 },
    { label: 'Sözel Mantık', value: 54 },
    { label: 'İşlemsel Hız', value: 70 },
    { label: 'Yürütücü İşlev', value: 65 },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Üst: AI Profili ve Radar Grafik (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol: AI Analiz Özeti */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/10 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                <i className="fa-solid fa-brain-circuit text-2xl text-indigo-400"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Bilişsel Matris</h2>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Yapay Zeka Destekli Profilleme</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Derin Öğrenme Özeti</h3>
                <p className="text-slate-300 leading-relaxed italic text-sm md:text-base">
                  "{student.name}, görsel-uzamsal algı alanında %22'lik bir sıçrama gerçekleştirdi.
                  Ancak çalışma belleği kapasitesinde yorulma belirtileri gözlemleniyor.
                  Multisensöryel destek moduna geçilmesi kritik önem taşıyor."
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase text-emerald-400">Görsel Hafıza: Üstün</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] font-black uppercase text-amber-400">İşitsel Odak: Gelişmekte</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Radar Grafik Kartı */}
        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8 w-full text-center">Beceriler Analiz Radarı</h3>
          <div className="scale-110 lg:scale-[1.2]">
            <RadarChart data={cognitiveData} />
          </div>
        </div>
      </div>

      {/* Orta: Stratejik Öneriler (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Strateji', text: 'Materyallerde "Odak Maskesi" kullanımı görsel karmaşayı azaltır.', icon: 'fa-lightbulb', color: 'amber' },
          { title: 'Uyarlama', text: 'Matematik problemlerinin "Uzay Teması" ile sunulması motivasyonu %40 artırır.', icon: 'fa-puzzle-piece', color: 'indigo' },
          { title: 'Performans', text: 'Öğrencinin en verimli saati 10:00 - 11:30 arası olarak tespit edildi.', icon: 'fa-chart-line', color: 'emerald' }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all group">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center text-${item.color}-600 mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
              <i className={`fa-solid ${item.icon} text-2xl`}></i>
            </div>
            <h4 className="font-black text-zinc-900 dark:text-white mb-2 uppercase text-xs tracking-wider">
              {item.title}
            </h4>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Alt: Akıllı Zaman Çizelgesi */}
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <i className="fa-solid fa-timeline text-9xl"></i>
        </div>

        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-10 uppercase tracking-tighter flex items-center gap-3">
          <i className="fa-solid fa-bolt-lightning text-indigo-500"></i>
          Dinamik Müdahale Akışı
        </h3>

        <div className="relative pl-10 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-indigo-500 before:via-zinc-200 before:to-transparent dark:before:via-zinc-800">
          <div className="relative group/step">
            <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white dark:border-zinc-900 shadow-xl group-hover/step:scale-125 transition-transform"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Sistem Güncellemesi</span>
                <h4 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tight">Yeni BEP Hedefi: Diskalkuli Tarama</h4>
                <p className="text-sm text-zinc-500 mt-1">Öğrencinin sayı algısındaki gecikmeler nedeniyle sistem otomatik hedef önerdi.</p>
              </div>
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                Uygulandı
              </span>
            </div>
          </div>

          <div className="relative group/step opacity-60 hover:opacity-100 transition-opacity">
            <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-sm"></div>
            <div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Gelecek Projeksiyonu (+7 Gün)</span>
              <h4 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tight">Standardize Değerlendirme</h4>
              <p className="text-sm text-zinc-500 mt-1">Okuma hızı verileri AI tarafından valide edilecek ve raporlanacak.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
