import React, { useState, useEffect } from 'react';
import { Student } from '../../types';

interface ProgressTrackerProps {
  phase: 'analyzing' | 'generating';
  startTime: number;
  retryCount: number;
  variantCount?: number;
  activeStudent?: Student | null;
}
export const OCRProgressTracker = ({
  phase,
  startTime,
  retryCount,
  variantCount = 1,
  activeStudent,
}: ProgressTrackerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 200);
    return () => clearInterval(timer);
  }, [startTime]);

  const estimatedTime = phase === 'analyzing' ? 8000 : 12000 * variantCount;
  const progress = Math.min(95, (elapsed / estimatedTime) * 100);
  const elapsedSec = Math.floor(elapsed / 1000);

  const phases =
    phase === 'analyzing'
      ? [
        { label: 'Görsel İşleniyor', threshold: 10 },
        { label: 'Yapısal Analiz', threshold: 35 },
        { label: 'Blueprint Çıkarılıyor', threshold: 65 },
        { label: 'Kalite Doğrulama', threshold: 90 },
      ]
      : [
        { label: 'Blueprint Okunuyor', threshold: 10 },
        { label: 'İçerik Üretiliyor', threshold: 40 },
        { label: 'Kalite Kontrolü', threshold: 75 },
        { label: 'Sayfa İnşa Ediliyor', threshold: 90 },
      ];

  const currentPhase = phases.reduce((acc, p) => (progress >= p.threshold ? p : acc), phases[0]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-10">
      <div className="relative">
        <div className="w-32 h-32 border-8 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-indigo-400">{Math.floor(progress)}%</span>
        </div>
      </div>

      <div className="w-80 space-y-3">
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between">
          {phases.map((p: { label: string; threshold: number }, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-1 text-[9px] font-bold transition-all ${progress >= p.threshold ? 'text-indigo-400' : 'text-slate-700'
                }`}
            >
              <i
                className={`fa-solid ${progress >= p.threshold ? 'fa-circle-check' : 'fa-circle'} text-[6px]`}
              ></i>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-black mb-2 tracking-tight">
          {phase === 'analyzing' ? 'DERİN DNA ANALİZİ' : 'İnşa Başladı'}
        </h3>
        <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
          {currentPhase.label}
        </p>
        <p className="text-slate-600 text-[10px] font-medium mt-2">
          {elapsedSec}s geçti
          {variantCount > 1 && phase === 'generating' && ` • ${variantCount} varyant`}
        </p>
        {retryCount > 0 && (
          <p className="text-amber-400 text-xs mt-3 font-bold">
            <i className="fa-solid fa-rotate mr-2"></i>Yeniden deneniyor ({retryCount}/2)...
          </p>
        )}
        {activeStudent && phase === 'generating' && (
          <p className="text-indigo-400/50 text-[10px] font-bold mt-3">
            <i className="fa-solid fa-user-graduate mr-1.5"></i>
            {activeStudent.name} için kişiselleştiriliyor
          </p>
        )}
      </div>
    </div>
  );
};
