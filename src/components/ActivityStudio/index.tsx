import React from 'react';
import { useActivityStudioStore } from '../../store/useActivityStudioStore';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useToastStore } from '../../store/useToastStore';
import { WizardContainer } from './wizard/WizardContainer';
import { usePedagogicGates } from './hooks/usePedagogicGates';
import { ActivityType } from '../../types';

interface ActivityStudioProps {
  onBack: () => void;
}

export const ActivityStudio: React.FC<ActivityStudioProps> = ({ onBack }) => {
  const { wizardData, isGenerating, error } = useActivityStudioStore();
  const { validateGoal } = usePedagogicGates();
  const gateSummary = validateGoal(wizardData.goal);

  return (
    <section className="h-full w-full overflow-y-auto bg-[var(--bg-primary)] font-lexend">
      <div className="w-full p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between bg-[var(--bg-paper)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-[var(--accent-color)] italic uppercase tracking-tighter">Ultra Etkinlik Üretim Stüdyosu</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Pedagojik AI Altyapısı & Bireyselleştirilmiş İçerik
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const { addItem, items } = useFascicleStore.getState();
                const studioState = useActivityStudioStore.getState();
                addItem({
                  id: crypto.randomUUID(),
                  type: ActivityType.ACTIVITY_STUDIO,
                  difficulty: 'Orta',
                  pageCount: 1,
                  order: items.length,
                  content: { 
                    wizardData: studioState.wizardData,
                    content: studioState.content,
                    pedagogicalNote: studioState.pedagogicalNote
                  },
                  pedagogicalNote: 'Etkinlik Stüdyosu\'ndan eklendi.'
                });
                useToastStore.getState().success('Fasiküle başarıyla eklendi!');
              }}
              className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-layer-group"></i>
              Fasiküle Ekle
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-primary)] transition-all active:scale-95"
            >
              Geri Dön
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="mb-6 rounded-2xl border border-[var(--accent-color)]/30 bg-[var(--accent-muted)] px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--accent-color)] animate-pulse">
            <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
            AI içerik üretimi devam ediyor...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-red-500">
            <i className="fa-solid fa-triangle-exclamation mr-3"></i>
            {error}
          </div>
        )}

        <div className="mb-8 rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-paper)] px-6 py-4 shadow-sm">
          <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1">Pedagojik Kontrol Kapısı</p>
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            {gateSummary.valid
              ? '✅ Pedagojik kriterler uygun, üretime hazır.'
              : `⚠️ ${gateSummary.errors.length} kritik hata, ${gateSummary.warnings.length} uyarı tespit edildi.`}
          </p>
        </div>

        <div className="w-full">
          <WizardContainer />
        </div>
      </div>
    </section>
  );
};

export default ActivityStudio;
