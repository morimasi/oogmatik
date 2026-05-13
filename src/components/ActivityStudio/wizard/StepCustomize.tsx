import React from 'react';
import { useActivityStudioStore } from '../../../store/useActivityStudioStore';

interface StepCustomizeProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepCustomize: React.FC<StepCustomizeProps> = ({ onNext, onBack }) => {
  const { content, wizardData } = useActivityStudioStore();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Görsel Ayarlar</h3>

      <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur-sm">
        <h4 className="text-sm font-bold text-zinc-200 mb-2">İçerik Özeti</h4>
        <p className="text-xs text-zinc-400">
          Toplam {content?.length || 0} içerik bloğu hazırlandı.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/30">
          <h4 className="text-sm font-bold text-zinc-200 mb-2">Tema</h4>
          <p className="text-xs text-zinc-400">Varsayılan tema (Amber/Indigo) kullanılacak.</p>
        </div>
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/30">
          <h4 className="text-sm font-bold text-zinc-200 mb-2">Düzen</h4>
          <p className="text-xs text-zinc-400">Kompakt A4 düzeni kullanılacak.</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Geri
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          Önizle
        </button>
      </div>
    </div>
  );
};
