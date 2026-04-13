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
    <section className="h-full w-full overflow-y-auto bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Ultra Etkinlik Üretim Stüdyosu</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Wizard tabanlı ilk entegrasyon aktif. Sonraki fazlarda AI ajan orkestrasyonu ve admin onay pipeline'ı eklenecek.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-paper)]"
          >
            Geri Dön
          </button>
        </div>

        {isGenerating && (
          <div className="mb-4 rounded-2xl border border-[var(--accent-color)]/30 bg-[var(--accent-muted)] px-4 py-3 text-sm text-[var(--text-primary)]">
            AI içerik üretimi devam ediyor...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-4 py-3">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Pedagojik Kapilar</p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">
            {gateSummary.valid
              ? 'Gecis uygun gorunuyor.'
              : `${gateSummary.errors.length} hata, ${gateSummary.warnings.length} uyari bulundu.`}
          </p>
        </div>

        <WizardContainer />

        {onAddToWorkbook && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                onAddToWorkbook({
                  id: `activity-studio-${Date.now()}`,
                  type: 'activity-studio',
                  data: wizardData,
                })
              }
              className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              Calisma Kitapcigina Ekle
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityStudio;
