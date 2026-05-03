import React from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { WizardContainer } from '@/components/ActivityStudio/wizard/WizardContainer';
import { usePedagogicGates } from '@/components/ActivityStudio/hooks/usePedagogicGates';

interface ActivityStudioProps {
  onBack: () => void;
  onAddToWorkbook?: (item: unknown) => void;
}

export const ActivityStudio: React.FC<ActivityStudioProps> = ({ onBack, onAddToWorkbook }) => {
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
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-primary)] transition-all active:scale-95"
          >
            Geri Dön
          </button>
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

        {onAddToWorkbook && (
          <div className="mt-12 flex justify-end">
            <button
              type="button"
              onClick={() =>
                onAddToWorkbook({
                  id: `activity-studio-${Date.now()}`,
                  type: 'activity-studio',
                  data: wizardData,
                })
              }
              className="rounded-2xl bg-[var(--accent-color)] px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-[var(--accent-muted)] hover:bg-[var(--accent-hover)] transition-all active:scale-95 flex items-center gap-3"
            >
              <i className="fa-solid fa-book-medical"></i>
              Çalışma Kitapçığına Ekle
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityStudio;
