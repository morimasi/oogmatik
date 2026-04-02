import React, { useState, useEffect } from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { RadarChart } from '../../RadarChart';
import { aiStudentService, CognitiveProfileResult } from '../../../services/aiStudentService';

export const AIInsightsModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
  const [data, setData] = useState<CognitiveProfileResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const result = await aiStudentService.generateCognitiveInsight(student);
        if (active) setData(result);
      } catch (err) {
        console.error('Bilişsel analiz yüklenemedi', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInsight();
    return () => { active = false; };
  }, [student]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Üst: AI Profili ve Radar Grafik (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol: AI Analiz Özeti */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/10 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xl">
                <i className="fa-solid fa-brain-circuit text-2xl text-indigo-400"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Bilişsel Matris</h2>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Yapay Zeka Destekli Profilleme</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Derin Öğrenme Özeti</h3>
                <p className="text-slate-300 leading-relaxed italic text-sm md:text-base">
                  "{data.summary}"
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {data.strengths.map((str, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-4 py-2 border rounded-xl ${str.trend === 'up' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    str.trend === 'down' ? 'bg-rose-500/10 border-rose-500/20' :
                      'bg-amber-500/10 border-amber-500/20'
                    }`}>
                    {str.trend === 'up' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {str.trend === 'stable' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                    {str.trend === 'down' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                    <span className={`text-[10px] font-black uppercase ${str.trend === 'up' ? 'text-emerald-400' :
                      str.trend === 'down' ? 'text-rose-400' :
                        'text-amber-400'
                      }`}>{str.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Radar Grafik Kartı */}
        <div className="bg-[var(--panel-bg-solid)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-8 w-full text-center">Beceriler Analiz Radarı</h3>
          <div className="scale-110 lg:scale-[1.2]">
            <RadarChart data={data.radarData} />
          </div>
        </div>
      </div>

      {/* Orta: Stratejik Öneriler (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.strategies.map((item, i) => (
          <div key={i} className="bg-[var(--panel-bg-solid)] p-8 rounded-[3rem] border border-[var(--border-color)] shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center text-${item.color}-600 mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
              <i className={`fa-solid ${item.icon} text-2xl`}></i>
            </div>
            <h4 className="font-black text-[var(--text-primary)] mb-2 uppercase text-xs tracking-wider">
              {item.title}
            </h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Alt: Akıllı Zaman Çizelgesi */}
      <div className="bg-[var(--panel-bg-solid)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <i className="fa-solid fa-timeline text-9xl"></i>
        </div>

        <h3 className="text-2xl font-black text-[var(--text-primary)] mb-10 uppercase tracking-tighter flex items-center gap-3">
          <i className="fa-solid fa-bolt-lightning text-indigo-500"></i>
          Dinamik Müdahale Akışı
        </h3>

        <div className="relative pl-10 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-indigo-500 before:via-zinc-200 before:to-transparent dark:before:via-zinc-800">
          {data.timeline.map((step, i) => (
            <div key={i} className={`relative group/step ${!step.isPast ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
              <div className={`absolute -left-[45px] top-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 ${step.isPast ? 'bg-indigo-600 shadow-xl group-hover/step:scale-125 transition-transform' : 'bg-zinc-300 dark:bg-zinc-800 shadow-sm'}`}></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${step.isPast ? 'text-indigo-500' : 'text-zinc-400'}`}>
                    {step.title}
                  </span>
                  <h4 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tight">{step.desc}</h4>
                </div>
                {step.isPast && (
                  <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                    Öngörüldü
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
