import React, { useEffect } from 'react';
import { STTargetScope } from '../components/SuperTurkceV2/STTargetScope';
import { STPalette } from '../components/SuperTurkceV2/STPalette';
import { STCanvas } from '../components/SuperTurkceV2/STCanvas';
import { STSettings } from '../components/SuperTurkceV2/STSettings';
import { useSuperTurkceV2Store } from '../store/useSuperTurkceV2Store';
import { generateSuperTurkceModules } from '../services/superTurkceAiService';

export const SuperTurkceV2Page: React.FC = () => {
  const {
    modules,
    isGenerating,
    gradeLevel,
    unit,
    bloomLevel,
    studentProfile,
    setGenerating,
    setGeneratedData,
    setError,
  } = useSuperTurkceV2Store();

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

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const data = await generateSuperTurkceModules(modules, {
        grade: gradeLevel,
        unit,
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
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black font-lexend">
      <STTargetScope />

      <div className="flex flex-1 min-h-0 relative">
        <STPalette />

        <div className="flex-1 flex flex-col relative bg-zinc-950">
          <div className="absolute top-6 right-8 z-30 flex gap-4">
            <button
              onClick={() => window.print()}
              disabled={modules.length === 0 || isGenerating}
              className="w-12 h-12 bg-white text-zinc-800 rounded-2xl shadow-xl flex items-center justify-center text-xl hover:bg-zinc-100 transition-colors border-2 border-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
              title="Yazdır / PDF"
            >
              <i className="fa-solid fa-print"></i>
            </button>
            <button
              disabled={modules.length === 0 || isGenerating}
              onClick={handleGenerate}
              className={`
                                px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 border-2 
                                ${
                                  modules.length === 0
                                    ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                                    : 'bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95'
                                }
                            `}
            >
              <i className="fa-solid fa-brain"></i> ST V2 ile Üret
            </button>
          </div>

          <STCanvas />
        </div>

        <STSettings />
      </div>
    </div>
  );
};
