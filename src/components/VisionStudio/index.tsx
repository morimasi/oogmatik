// ============================================================
// VisionStudio — Ana Bileşen (Orkestratör)
// Akış: Upload → Analyzing → Preview → Approval
// ============================================================
import React, { useState } from 'react';
import { Upload, Search, Eye, BadgeCheck, ArrowLeft } from 'lucide-react';

import { useVisionStudioStore } from '../../store/useVisionStudioStore';
import {
  persistActivityEdits,
  updateActivityStatus,
} from '../../services/visionStudio/activityRepository';
import { useAuthStore } from '../../store/useAuthStore';

import UploadStep    from './upload/UploadStep';
import PreviewStep   from './preview/PreviewStep';
import AnalyzingStep from './analysis/AnalyzingStep';
import ApprovalSentStep from './approval/ApprovalSentStep';

// ---- Adım çubuğu ----
const STEPS = [
  { key: 'upload',    label: 'Yukle',     Icon: Upload },
  { key: 'analyzing', label: 'Analiz',    Icon: Search },
  { key: 'preview',   label: 'Onizleme',  Icon: Eye },
  { key: 'approval',  label: 'Onay',      Icon: BadgeCheck },
] as const;

interface VisionStudioProps {
  onBack?: () => void;
}

export function VisionStudio({ onBack }: VisionStudioProps = {}) {
  const { step, generatedActivities, selectedActivityId } = useVisionStudioStore();
  const { user } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const selectedActivity = generatedActivities.find((a) => a.id === selectedActivityId) ?? null;

  async function handleSendForApproval() {
    if (!selectedActivity) return;
    if (!user?.id) {
      setSendError('Oturum bilgisi bulunamadi. Lutfen tekrar giris yapin.');
      return;
    }
    setIsSending(true);
    setSendError(null);
    try {
      // Önizlemedeki tıkla-düzenle değişiklikleri önce kalıcılaştırılır;
      // aksi halde yönetici AI'ın ilk halini onaylar.
      await persistActivityEdits(selectedActivity);
      await updateActivityStatus(
        selectedActivity.id,
        'pending',
        user.id,
        'teacher'
      );
      useVisionStudioStore.getState().setStep('approval');
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Bir hata olustu.');
    } finally {
      setIsSending(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">

      {/* ---- Üst Adım Çubuğu ---- */}
      <nav aria-label="Stüdyo adımları" className="relative flex items-center justify-center gap-0 border-b border-slate-200 dark:border-slate-800 py-4 px-6">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-6 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors"
            aria-label="Geri Dön"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Geri Dön
          </button>
        )}
        {STEPS.map((s, i) => {
          const isCompleted = i < stepIndex;
          const isCurrent   = s.key === step;
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full transition-colors
                    ${isCompleted ? 'bg-indigo-600 text-white' : ''}
                    ${isCurrent  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <s.Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 max-w-[60px] transition-colors ${i < stepIndex ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* ---- İçerik ---- */}
      <main className="flex-1 overflow-auto p-6">
        {step === 'upload'    && <UploadStep />}
        {step === 'analyzing' && <AnalyzingStep />}
        {step === 'preview'   && selectedActivity && (
          <>
            {sendError && (
              <div role="alert" className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
                {sendError}
              </div>
            )}
            <PreviewStep
              activity={selectedActivity}
              onSendForApproval={handleSendForApproval}
              isSending={isSending}
            />
          </>
        )}
        {step === 'approval' && <ApprovalSentStep />}
      </main>
    </div>
  );
}

export default VisionStudio;
export { VisionStudio as ActivityStudio };
