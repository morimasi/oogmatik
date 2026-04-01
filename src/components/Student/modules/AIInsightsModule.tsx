import React, { useState } from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

export const AIInsightsModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState([
    'Görsel tarama testlerindeki reaksiyon süresinde %15 iyileşme gözlemlendi.',
    "Heceleme egzersizlerinde 'b' ve 'd' harflerini karıştırma sıklığı azaldı.",
    'Dikkat süresi ortalama 12 dakikadan 18 dakikaya çıktı.',
  ]);

  const handleReAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setInsights([
        ...insights,
        'Yeni Analiz: Sözel hafıza görevlerinde artan başarı trendi tespit edildi. Görsel destekli okuma parçalarına ağırlık verilmesi önerilir.',
      ]);
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-3">
              <i className="fa-solid fa-brain-circuit text-indigo-400"></i> Oogmatik AI Motoru
            </h3>
            <p className="text-indigo-200 mt-2 max-w-lg text-sm">
              Öğrencinin platform üzerindeki tüm etkileşimleri, çözdüğü testler ve öğretmen notları
              harmanlanarak oluşturulan derin analizler.
            </p>
          </div>
          <button
            onClick={handleReAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all flex items-center gap-2 border border-white/20 shrink-0"
          >
            {isAnalyzing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Analiz Ediliyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-rotate-right"></i> Verileri Güncelle
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-4 animate-in slide-in-from-bottom-4"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-sparkles"></i>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
