// VisionStudio — AI Analiz Bekleme Ekranı
import React from 'react';

const STAGES = [
  'Dosya işleniyor…',
  'Yapay zeka etkinliği analiz ediyor…',
  'Kazanımlar belirleniyor…',
  'Yeni varyasyonlar üretiliyor…',
];

export default function AnalyzingStep() {
  const [stageIndex, setStageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8" aria-live="polite">
      {/* Animasyonlu halka */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🔍</div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Yapay Zeka Çalışıyor
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          {STAGES[stageIndex]}
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === stageIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
