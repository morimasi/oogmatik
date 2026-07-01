import React, { useRef } from 'react';
import { StudentEyeView } from './StudentEyeView';
import { A4CompactRenderer } from './A4CompactRenderer';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import type { ActivityStudioState } from '@/types/activityStudio';

interface PreviewRendererProps {
  title: string;
  scenario: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ title, scenario }) => {
  const a4Ref = useRef<HTMLDivElement>(null);
  const content = useActivityStudioStore((state: ActivityStudioState) => state.content);
  const themeConfig = useActivityStudioStore((state: ActivityStudioState) => state.themeConfig);
  const compactA4Config = useActivityStudioStore((state: ActivityStudioState) => state.compactA4Config);

  const hasBlocks = content && content.length > 0;

  return (
    <div className="space-y-6">
      {/* Öğrenci Gözü Önizleme */}
      <StudentEyeView title={title} scenario={scenario} />

      {/* A4 Kompakt Renderer — tam tema + layout uygulanmış */}
      {hasBlocks ? (
        <div className="overflow-auto rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800/50 pb-3">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">A4 Canlı Önizleme</p>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">210×297mm</span>
          </div>
          <A4CompactRenderer
            ref={a4Ref}
            title={title}
            blocks={content}
            themeConfig={themeConfig}
            compactA4Config={compactA4Config}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <p className="text-sm leading-relaxed text-zinc-300 italic">İçerik bulunamadı.</p>
        </div>
      )}
    </div>
  );
};
