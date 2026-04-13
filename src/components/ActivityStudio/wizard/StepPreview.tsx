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
  const { wizardData, setError } = useActivityStudioStore();
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
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Onizleme</h3>
      <PreviewRenderer
        title={wizardData.goal?.topic ?? 'Etkinlik'}
        scenario={wizardData.generatedContent ? 'AI icerigi hazirlandi.' : 'Icerik henuz olusmadi.'}
        pedagogicalNote="Etkinlik ogrencinin hedef becerilerini asamali olarak pekistirir."
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">Geri</button>
        <button type="button" onClick={() => doExport('pdf')} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">PDF</button>
        <button type="button" onClick={() => doExport('png')} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">PNG</button>
        <button type="button" onClick={() => doExport('json')} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">JSON</button>
        <button type="button" onClick={doShare} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">Paylasim Linki</button>
        <button type="button" onClick={onNext} className="rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white">Onaya Gec</button>
      </div>
    </div>
  );
};
