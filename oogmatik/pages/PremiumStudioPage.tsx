import React, { useEffect } from 'react';
import { TargetScopePanel } from '../components/PremiumStudio/TargetScopePanel';
import { ModulePalette } from '../components/PremiumStudio/ModulePalette';
import { StudioCanvas } from '../components/PremiumStudio/StudioCanvas';
import { SettingsPopover } from '../components/PremiumStudio/SettingsPopover';
import { usePremiumStudioStore } from '../store/usePremiumStudioStore';
import { generatePremiumModules } from '../services/premiumAiService';

export const PremiumStudioPage: React.FC = () => {
  const {
    modules,
    isGenerating,
    gradeLevel,
    subject,
    bloomLevel,
    studentProfile,
    setGenerating,
    setGeneratedData,
    setError,
  } = usePremiumStudioStore();

  // Warn before leaving if there is unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modules.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [modules]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black font-lexend">
      {/* Top Toolbar: Hedef ve Kapsam Seçimi */}
      <TargetScopePanel />

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar: Bileşen Paleti */}
        <ModulePalette />

        {/* Middle Area: A4 Çalışma Kağıdı İskeletleri */}
        <div className="flex-1 flex flex-col relative bg-zinc-950">
          {/* Üretim Butonu (Floating) */}
          <div className="absolute top-6 right-8 z-30">
            <button
              disabled={modules.length === 0 || isGenerating}
              onClick={async () => {
                try {
                  setGenerating(true);
                  setError(null);
                  const data = await generatePremiumModules(modules, {
                    grade: gradeLevel,
                    subject,
                    bloomLevel,
                    studentProfile,
                  });
                  setGeneratedData(data);
                } catch (err: any) {
                  setError(err.message || 'Üretim sırasında bir hata oluştu.');
                  alert(`Hata: ${err.message}`);
                } finally {
                  setGenerating(false);
                }
              }}
              className={`
                                px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3
                                ${
                                  modules.length === 0
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95'
                                }
                            `}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Yapay Zeka ile Üret
            </button>
          </div>

          <StudioCanvas />
        </div>

        {/* Right Sidebar: Modül Ayarları (Sadece bir modül seçiliyse açılır) */}
        <SettingsPopover />
      </div>
    </div>
  );
};
