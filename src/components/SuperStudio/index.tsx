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
    <div className="flex h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-lexend">
      {/* Sol Panel: Ayarlar ve Düzenleme */}
      <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-paper)] shadow-xl relative z-10">
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-paper)]">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--accent-color)]">
            Super Türkçe Stüdyosu
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Premium İçerik Üretim Merkezi</p>
        </div>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-4 space-y-8 pb-8">
            {/* Ana Ayarlar */}
            <MainSettingsPanel />

            {/* Şablon Seçimi */}
            <div className="border-t border-[var(--border-color)] pt-8">
              <TemplateMenu />
            </div>

            {/* Seçilen Şablonların Ayarları */}
            <div className="border-t border-[var(--border-color)] pt-8">
              <ConfiguratorCascade />
            </div>
          </div>
        </div>

        {/* ÜRET BUTONU (Sabit Alt Kısım) */}
        <div className="p-6 bg-[var(--bg-paper)] border-t border-[var(--border-color)] shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedTemplates.length === 0}
            className={`w-full py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-[var(--accent-muted)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${isGenerating ? 'animate-pulse' : ''}`}
          >
            <i
              className={`fa-solid ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}
            ></i>
            {isGenerating ? 'AI İçerik Üretiyor...' : '🚀 AI ile Şablonları Üret'}
          </button>
        </div>
      </div>

      {/* Sağ Panel: A4 Önizleme ve Operasyonlar */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] relative overflow-hidden">
        <A4PreviewPanel />
      </div>
    </div>
  );
};

export default SuperStudio;
