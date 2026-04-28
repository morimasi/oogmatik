import React from 'react';
import { MainSettingsPanel } from './components/MainSettingsPanel';
import { TemplateMenu } from './components/TemplateMenu';
import { ConfiguratorCascade } from './components/ConfiguratorCascade';
import { A4PreviewPanel } from './components/A4PreviewPanel';
import { useSuperStudioStore } from '../../store/useSuperStudioStore';
import { useToastStore } from '../../store/useToastStore';
import { generateSuperStudioContent } from '../../services/generators/superStudioGenerator';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
export const SuperStudio: React.FC = () => {
  const {
    isGenerating,
    selectedTemplates,
    templateSettings,
    grade,
    topic,
    difficulty,
    studentId,
    addGeneratedContent,
    clearGeneratedContents,
    setIsGenerating,
  } = useSuperStudioStore();
  const { addToast } = useToastStore();

  const handleGenerate = async () => {
    if (selectedTemplates.length === 0) {
      addToast('Lütfen sol panelden en az bir şablon seçin.', 'warning');
      return;
    }
    if (!grade) {
      addToast('Lütfen sınıf seviyesi seçin.', 'warning');
      return;
    }

    setIsGenerating(true);
    clearGeneratedContents();

    try {
      const results = await generateSuperStudioContent({
        templates: selectedTemplates,
        settings: templateSettings,
        mode: 'ai',
        grade,
        topic: topic || 'Genel',
        difficulty,
        studentId: studentId || null,
      });

      results.forEach((content) => addGeneratedContent(content));
      addToast(`${results.length} sayfa başarıyla üretildi!`, 'success');
    } catch (error: any) {
      logError('Üretim hatası:', error);
      addToast(error?.userMessage || 'AI üretim başarısız. Tekrar deneyin.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-inter">
      {/* Sol Panel: Ayarlar ve Düzenleme */}
      <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-md shadow-xl relative z-10">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-accent/80 to-accent bg-clip-text text-transparent">
            Super Türkçe Stüdyosu
          </h1>
          <p className="text-sm text-slate-400 mt-1">Premium İçerik Üretim Merkezi</p>
        </div>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-4 space-y-8 pb-8">
            {/* Ana Ayarlar */}
            <MainSettingsPanel />

            {/* Şablon Seçimi */}
            <div className="border-t border-slate-700/50 pt-8">
              <TemplateMenu />
            </div>

            {/* Seçilen Şablonların Ayarları */}
            <div className="border-t border-slate-700/50 pt-8">
              <ConfiguratorCascade />
            </div>
          </div>
        </div>

        {/* ÜRET BUTONU (Sabit Alt Kısım) */}
        <div className="p-6 bg-slate-800/90 border-t border-slate-700/50 backdrop-blur-md shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedTemplates.length === 0}
            className={`w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${isGenerating ? 'animate-pulse' : ''}`}
          >
            <i
              className={`fa-solid ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}
            ></i>
            {isGenerating ? 'AI İçerik Üretiyor...' : '🚀 AI ile Seçili Şablonları Üret'}
          </button>
        </div>
      </div>

      {/* Sağ Panel: A4 Önizleme ve Operasyonlar */}
      <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        <A4PreviewPanel />
      </div>
    </div>
  );
};

export default SuperStudio;
