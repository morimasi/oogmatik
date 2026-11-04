// VisionStudio — Onaya Gönderildi Ekranı
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useVisionStudioStore } from '../../../store/useVisionStudioStore';

export default function ApprovalSentStep() {
  const { reset } = useVisionStudioStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <CheckCircle className="h-20 w-20 text-emerald-500" />
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Onaya Gönderildi! 🎉
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Etkinliğiniz <strong>admin paneline</strong> iletildi. Yönetici inceledikten sonra 
          onaylandığında ilgili kategoride görünür hale gelecektir.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Durum: <span className="font-semibold text-amber-600">Onay Bekliyor</span>
        </p>
      </div>

      <button
        onClick={reset}
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
      >
        Yeni Etkinlik Yükle
      </button>
    </div>
  );
}
