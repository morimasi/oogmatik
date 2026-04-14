import React from 'react';
import { ApprovalPanel } from '@/components/ActivityStudio/approval/ApprovalPanel';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { submitApproval } from '@/services/activityStudioApi';

interface StepApprovalProps {
  onBack: () => void;
}

export const StepApproval: React.FC<StepApprovalProps> = ({ onBack }) => {
  const { wizardData, setError } = useActivityStudioStore();

  const handleSubmit = async (action: 'approve' | 'revise' | 'reject', note: string) => {
    try {
      const result = await submitApproval({
        activityId: wizardData.goal?.topic ?? `activity-${Date.now()}`,
        reviewerId: 'admin-local',
        action,
        note: note || 'Onay islemi tamamlandi.',
      });

      setError(`Onay kaydi olusturuldu: ${result.action}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Onay kaydi olusturulamadi.';
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Admin Onayı</h3>
      <ApprovalPanel sourceText={wizardData.goal?.topic ?? ''} onSubmit={handleSubmit} />
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
      >
        Önizlemeye Dön
      </button>
    </div>
  );
};
