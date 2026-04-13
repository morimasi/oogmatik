import React from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import type { WizardStepId } from '@/types/activityStudio';

interface ActivityStudioProps {
  onBack: () => void;
}

const stepTitles: Record<WizardStepId, string> = {
  goal: '1. Hedef ve Kapsam',
  content: '2. İçerik ve Bileşen',
  customize: '3. Özelleştirme',
  preview: '4. Önizleme',
  approval: '5. Admin Onayı',
};

export const ActivityStudio: React.FC<ActivityStudioProps> = ({ onBack }) => {
  const { currentStep, steps, setStep, isGenerating, error } = useActivityStudioStore();

  const canAccessStep = (stepId: WizardStepId): boolean => {
    const order: WizardStepId[] = ['goal', 'content', 'customize', 'preview', 'approval'];
    const targetIndex = order.indexOf(stepId);
    if (targetIndex <= 0) return true;
    const previous = steps[targetIndex - 1];
    return previous?.status === 'completed' || previous?.status === 'active';
  };

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

        <div className="grid gap-3 md:grid-cols-5">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              disabled={!canAccessStep(step.id)}
              onClick={() => setStep(step.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                step.id === currentStep
                  ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-paper)] hover:border-[var(--accent-color)]/40'
              } ${!canAccessStep(step.id) ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">{step.status}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{stepTitles[step.id]}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Aktif Adim: {stepTitles[currentStep]}</h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Bu ilk dilimde altyapi entegre edildi: yeni view, sidebar girisi ve Zustand tabanli wizard state. Siradaki adimda
            tip sistemi, validator katmani ve AI ajan servisleri eklenecek.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActivityStudio;
