import React from 'react';
import { useActivityStudioStore } from '../../../store/useActivityStudioStore';

interface StepApprovalProps {
  onBack: () => void;
}

export const StepApproval: React.FC<StepApprovalProps> = ({ onBack }) => {
  const { wizardData, setError } = useActivityStudioStore();

  const handleSave = () => {
    setError('Etkinlik başarıyla kaydedildi!');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Kaydet</h3>

      <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-check text-4xl text-green-500"></i>
          </div>
          <h4 className="text-lg font-bold text-green-400 mb-2">Etkinlik Hazır!</h4>
          <p className="text-sm text-zinc-400 mb-6">
            {wizardData.goal?.topic} konulu etkinlik başarıyla oluşturuldu.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Önizlemeye Dön
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-400 transition-all shadow-lg shadow-green-500/10"
        >
          <i className="fa-solid fa-download mr-2"></i>
          İndir
        </button>
      </div>
    </div>
  );
};
