import React from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { PreviewRenderer } from '@/components/ActivityStudio/preview/PreviewRenderer';
import { useExport } from '@/components/ActivityStudio/hooks/useExport';
import { createShareLink } from '@/components/ActivityStudio/preview/ShareEngine';

interface StepPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ onNext, onBack }) => {
  const { wizardData, content, pedagogicalNote, setError } = useActivityStudioStore();
  const { runExport } = useExport();

  const doExport = async (format: 'pdf' | 'png' | 'json') => {
    const summary = await runExport('studio-preview', format);
    setError(`Export hazir: ${summary.type} (${summary.size} bytes)`);
  };

  const doShare = () => {
    const link = createShareLink({
      activityId: wizardData.goal?.topic ?? 'studio-preview',
      ownerId: 'local-user',
    });
    setError(`Paylasim linki hazir: ${link}`);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Önizleme</h3>
      <PreviewRenderer
        title={wizardData.goal?.topic ?? 'Etkinlik'}
        scenario={content && content.length > 0 ? 'AI içeriği başarıyla hazırlandı.' : 'İçerik henüz oluşmadı.'}
        pedagogicalNote={pedagogicalNote || 'Etkinlik öğrencinin hedef becerilerini aşamalı olarak pekiştirir.'}
      />
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Geri
        </button>
        <div className="flex gap-2 mr-auto">
          <button type="button" onClick={() => doExport('pdf')} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all">PDF</button>
          <button type="button" onClick={() => doExport('png')} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all">PNG</button>
          <button type="button" onClick={() => doExport('json')} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all">JSON</button>
        </div>
        <button type="button" onClick={doShare} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all">Paylaşım Linki</button>
        <button type="button" onClick={onNext} className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10">Onaya Geç</button>
      </div>
    </div>
  );
};
