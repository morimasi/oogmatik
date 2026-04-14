import React from 'react';
import { useSariKitapStore } from '../../store/useSariKitapStore';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { ACTIVITY_GENERATOR_REGISTRY } from '../../services/generators/registry';
import { ActivityType } from '../../types';
import { AppError } from '../../utils/AppError';

interface SariKitapStudioProps {
  onBack: () => void;
  onSave?: (name: string, activityType: any, data: any) => Promise<any>;
  onAddToWorkbook?: (item: any) => void;
}

/**
 * OOGMATIK — Sarı Kitap Etkinlik Stüdyosu
 * 
 * PDF analizi ve hızlı mod seçenekleriyle özel eğitim materyali üretim stüdyosu.
 */
export const SariKitapStudio: React.FC<SariKitapStudioProps> = ({
  onBack,
  onSave,
  onAddToWorkbook,
}) => {
  const {
    selectedActivity,
    mode,
    params,
    result,
    isGenerating,
    error,
    setResult,
    setIsGenerating,
    setError,
    setParams,
  } = useSariKitapStore();

  const handleGenerate = async () => {
    if (!selectedActivity) {
      setError('Lütfen bir etkinlik türü seçin.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const mapping = ACTIVITY_GENERATOR_REGISTRY[selectedActivity];
      if (!mapping) throw new AppError('Jeneratör bulunamadı.', 'NOT_FOUND', 404);

      // AI veya Offline (Quick) mod seçimi
      const generator = mode === 'AI' ? mapping.ai : mapping.offline;
      if (!generator) throw new AppError('Seçili mod için jeneratör bulunamadı.', 'NOT_FOUND', 404);

      const response = await generator({
        topic: params.topic,
        difficulty: params.difficulty,
        studentAge: params.ageGroup,
        profile: params.profile,
        count: 5, // Varsayılan madde sayısı
      });

      setResult(response);
    } catch (err: any) {
      console.error('Üretim hatası:', err);
      setError(err.userMessage || 'İçerik üretilirken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B1120] text-slate-200 overflow-hidden font-inter">
      {/* Üst Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: 'Lexend' }}>
            Sarı Kitap <span className="text-white/50 font-normal ml-2 tracking-widest uppercase text-xs">Etkinlik Stüdyosu</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Premium Mod</span>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel: Konfigürasyon */}
        <LeftPanel onGenerate={handleGenerate} />

        {/* Orta Panel: Önizleme */}
        <CenterPanel />

        {/* Sağ Panel: Aksiyonlar */}
        <RightPanel 
          onSave={onSave}
          onAddToWorkbook={onAddToWorkbook}
        />
      </div>
    </div>
  );
};
