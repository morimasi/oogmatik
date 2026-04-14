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
    <section className="h-full w-full overflow-y-auto bg-zinc-950">
      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-amber-400">Ultra Etkinlik Üretim Stüdyosu</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Wizard tabanlı ilk entegrasyon aktif. Sonraki fazlarda AI ajan orkestrasyonu ve admin onay pipeline'ı eklenecek.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Geri Dön
          </button>
        </div>

        {isGenerating && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            AI içerik üretimi devam ediyor...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-amber-500">Pedagojik Kapılar</p>
          <p className="mt-1 text-sm text-zinc-300">
            {gateSummary.valid
              ? 'Geçiş uygun görünüyor.'
              : `${gateSummary.errors.length} hata, ${gateSummary.warnings.length} uyarı bulundu.`}
          </p>
        </div>

        <WizardContainer />

        {onAddToWorkbook && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                onAddToWorkbook({
                  id: `activity-studio-${Date.now()}`,
                  type: 'activity-studio',
                  data: wizardData,
                })
              }
              className="rounded-xl border border-amber-500 border-b-[3px] bg-amber-400 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-300 transition-all active:border-b active:translate-y-[2px]"
            >
              Çalışma Kitapçığına Ekle
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityStudio;
