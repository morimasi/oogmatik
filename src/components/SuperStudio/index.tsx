import React, { useEffect, useCallback } from 'react';
import { MainSettingsPanel } from './components/MainSettingsPanel';
import { TemplateMenu } from './components/TemplateMenu';
import { ConfiguratorCascade } from './components/ConfiguratorCascade';
import { A4PreviewPanel } from './components/A4PreviewPanel';
import { useSuperStudioStore } from '../../store/useSuperStudioStore';
import { useToastStore } from '../../store/useToastStore';
import { generateSuperStudioContent } from '../../services/generators/superStudioGenerator';

import { logInfo, logError, logWarn } from '../../utils/logger.js';

interface SuperStudioProps {
}

const WIZARD_STEPS = [
  { key: 'settings' as const, label: 'Amaç', icon: 'fa-bullseye' },
  { key: 'templates' as const, label: 'Şablonlar', icon: 'fa-layer-group' },
  { key: 'preview' as const, label: 'Önizleme', icon: 'fa-eye' },
];

export const SuperStudio: React.FC<SuperStudioProps> = () => {
  const {
    isGenerating,
    selectedTemplates,
    templateSettings,
    grade,
    topic,
    difficulty,
    studentId,
    generationParams,
    generationProgress,
    generationStep,
    generationHistory,
    wizardStep,
    addGeneratedContent,
    clearGeneratedContents,
    setIsGenerating,
    setGenerationProgress,
    setGenerationStep,
    setCurrentTemplate,
    setWizardStep,
    goNextWizardStep,
    goPrevWizardStep,
    addToHistory,
  } = useSuperStudioStore();
  const { show: addToast } = useToastStore();

  const handleGenerate = useCallback(async () => {
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
    setGenerationProgress(0);
    setGenerationStep('prompt');

    try {
      const total = selectedTemplates.length;

      for (let i = 0; i < total; i++) {
        const tpl = selectedTemplates[i];
        setCurrentTemplate(tpl);
        setGenerationStep('api');
        setGenerationProgress(Math.round(((i) / total) * 70));

        const results = await generateSuperStudioContent({
          templates: [tpl],
          settings: templateSettings,
          mode: 'ai',
          grade,
          topic: topic || 'Genel',
          difficulty,
          studentId: studentId || null,
        });

        setGenerationStep('processing');
        setGenerationProgress(Math.round(((i + 0.5) / total) * 90));

        results.forEach((content) => {
          addGeneratedContent(content);
          addToHistory({
            id: content.id,
            templateId: tpl,
            prompt: topic || 'Genel',
            temperature: generationParams.temperature,
            topP: generationParams.topP,
            thinkingBudget: generationParams.thinkingBudget,
            difficulty,
            grade,
            topic,
            createdAt: Date.now(),
            output: content,
          });
        });

        setGenerationStep('saving');
      }

      setGenerationStep('done');
      setGenerationProgress(100);
      setWizardStep('preview');
      addToast(`${total} sayfa başarıyla üretildi!`, 'success');
    } catch (error: any) {
      logError('Üretim hatası:', error);
      addToast(error?.userMessage || 'AI üretim başarısız. Tekrar deneyin.', 'error');
      setGenerationStep('idle');
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplates, templateSettings, grade, topic, difficulty, studentId, generationParams, addToast, setIsGenerating, clearGeneratedContents, addGeneratedContent, setGenerationProgress, setGenerationStep, setCurrentTemplate, addToHistory, setWizardStep]);

  // Keyboard shortcuts - motor.md Faz 3.2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleGenerate();
      }
      if (e.key === 'Escape' && isGenerating) {
        setIsGenerating(false);
        setGenerationStep('idle');
        setGenerationProgress(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, isGenerating, setIsGenerating, setGenerationStep, setGenerationProgress]);

  const progressSteps = [
    { key: 'idle', label: 'Hazır', icon: 'fa-circle' },
    { key: 'prompt', label: 'Prompt', icon: 'fa-file-lines' },
    { key: 'api', label: 'API', icon: 'fa-cloud' },
    { key: 'processing', label: 'İşleme', icon: 'fa-gear' },
    { key: 'saving', label: 'Kaydetme', icon: 'fa-floppy-disk' },
    { key: 'done', label: 'Tamam', icon: 'fa-check' },
  ] as const;

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-lexend">
      {/* Sol Panel: Ayarlar ve Düzenleme */}
      <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-paper)] shadow-xl relative z-10">
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-paper)]">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--accent-color)]">
            Super Türkçe Stüdyosu
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Premium İçerik Üretim Merkezi</p>
          {/* Klavye kısayol ipucu */}
          <div className="mt-2 flex gap-2 text-[10px] text-slate-500">
            <span className="bg-slate-800/50 px-1.5 py-0.5 rounded">Ctrl+Enter</span>
            <span className="text-slate-600">Üret</span>
            <span className="bg-slate-800/50 px-1.5 py-0.5 rounded ml-1">Esc</span>
            <span className="text-slate-600">İptal</span>
          </div>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50">
          {WIZARD_STEPS.map((step, idx) => {
            const stepKeys = WIZARD_STEPS.map(s => s.key);
            const currentIdx = stepKeys.indexOf(wizardStep);
            const isActive = step.key === wizardStep;
            const isDone = idx < currentIdx;
            return (
              <button
                key={step.key}
                onClick={() => {
                  if (idx <= currentIdx + 1 && !isGenerating) setWizardStep(step.key);
                }}
                disabled={isGenerating}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isDone
                    ? 'text-emerald-400 bg-emerald-900/10'
                    : isActive
                      ? 'text-teal-300 bg-teal-900/10 border-b-2 border-teal-400'
                      : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <i className={`fa-solid ${step.icon} ${isActive ? 'fa-beat' : ''}`}></i>
                <span>{step.label}</span>
                {isDone && <i className="fa-solid fa-check text-[8px] ml-0.5"></i>}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-4 space-y-8 pb-8">
            {/* Generation Progress Bar - motor.md Faz 1.3 */}
            {isGenerating && (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin text-teal-400"></i>
                    <span className="text-sm font-medium text-slate-200">Üretiliyor...</span>
                  </div>
                  <span className="text-xs font-mono text-teal-400">{generationProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                {/* Step indicator */}
                <div className="flex justify-between text-[10px]">
                  {progressSteps.map((step) => {
                    const stepIndex = progressSteps.findIndex(s => s.key === step.key);
                    const currentIndex = progressSteps.findIndex(s => s.key === generationStep);
                    const isActive = stepIndex === currentIndex;
                    const isDone = stepIndex < currentIndex;
                    return (
                      <div
                        key={step.key}
                        className={`flex flex-col items-center gap-1 transition-colors ${
                          isDone ? 'text-emerald-400' : isActive ? 'text-teal-300' : 'text-slate-600'
                        }`}
                      >
                        <i className={`fa-solid ${step.icon} text-xs`}></i>
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Cancel button */}
                <button
                  onClick={() => {
                    setIsGenerating(false);
                    setGenerationStep('idle');
                    setGenerationProgress(0);
                  }}
                  className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-800/50 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  <i className="fa-solid fa-ban mr-1"></i>
                  İptal
                </button>
              </div>
            )}

            {/* Adım 1: Amaç Ayarları */}
            {wizardStep === 'settings' && (
              <MainSettingsPanel />
            )}

            {/* Adım 1 → 2 geçiş butonu */}
            {wizardStep === 'settings' && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!topic.trim()) {
                      addToast('Lütfen bir konu başlığı girin.', 'warning');
                      return;
                    }
                    goNextWizardStep();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Şablon Seçimine Geç</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            )}

            {/* Adım 2: Şablon Seçimi + Ayarlar */}
            {wizardStep === 'templates' && (
              <>
                <TemplateMenu />
                <div className="border-t border-[var(--border-color)] pt-8">
                  <ConfiguratorCascade />
                </div>
              </>
            )}

            {/* Adım 2 navigasyon */}
            {wizardStep === 'templates' && (
              <div className="flex items-center justify-between">
                <button
                  onClick={goPrevWizardStep}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Geri</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedTemplates.length === 0) {
                      addToast('En az bir şablon seçmelisiniz.', 'warning');
                      return;
                    }
                    goNextWizardStep();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Önizlemeye Geç</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            )}

            {/* Adım 3: Önizleme (sadece navigasyon, A4 sağ panelde) */}
            {wizardStep === 'preview' && (
              <div className="space-y-4">
                <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-check-circle text-emerald-400 text-lg"></i>
                    <div>
                      <p className="text-sm font-bold text-emerald-300">İçerikler Hazır</p>
                      <p className="text-xs text-slate-400">
                        {selectedTemplates.length} şablon üretildi. Sağ panelde önizleyebilir, kaydedebilir veya yazdırabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={goPrevWizardStep}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Ayarlara Dön</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ÜRET BUTONU (Sabit Alt Kısım) — sadece templates adımında */}
        {wizardStep !== 'preview' && (
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
        )}
      </div>

      {/* Sağ Panel: A4 Önizleme ve Operasyonlar */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)] relative overflow-hidden">
        <A4PreviewPanel />
      </div>
    </div>
  );
};

export default SuperStudio;
