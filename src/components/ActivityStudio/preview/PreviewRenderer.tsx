import React, { useRef } from 'react';
import { StudentEyeView } from './StudentEyeView';
import { A4CompactRenderer } from './A4CompactRenderer';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';

interface PreviewRendererProps {
  title: string;
  scenario: string;
  pedagogicalNote: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ title, scenario, pedagogicalNote }) => {
  const a4Ref = useRef<HTMLDivElement>(null);
  const content = useActivityStudioStore((state) => state.content);
  const themeConfig = useActivityStudioStore((state) => state.themeConfig);
  const compactA4Config = useActivityStudioStore((state) => state.compactA4Config);

  const effectivePedagogicalNote = pedagogicalNote || useActivityStudioStore.getState().pedagogicalNote;
  const hasBlocks = content && content.length > 0;

  return (
    <div className="space-y-4">
      {/* Öğrenci Gözü Önizleme */}
      <StudentEyeView title={title} scenario={scenario} />

      {/* A4 Kompakt Renderer — tam tema + layout uygulanmış */}
      {hasBlocks ? (
        <div className="overflow-auto rounded-2xl border border-[var(--border-color)] p-2">
          <p className="mb-2 text-xs text-[var(--text-secondary)]">A4 Önizleme (210×297mm)</p>
          <A4CompactRenderer
            ref={a4Ref}
            title={title}
            blocks={content}
            pedagogicalNote={effectivePedagogicalNote}
            themeConfig={themeConfig}
            compactA4Config={compactA4Config}
          />
        </div>
      ) : (
        /* Öğretmen Notu fallback */
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-4">
          <h4 className="text-sm font-bold">Öğretmen Notu</h4>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{effectivePedagogicalNote}</p>
        </div>
      )}
    </div>
  );
};
