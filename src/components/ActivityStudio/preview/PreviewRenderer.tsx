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
            pedagogicalNote={effectivePedagogicalNote}
            themeConfig={themeConfig}
            compactA4Config={compactA4Config}
          />
        </div>
      ) : (
        /* Öğretmen Notu fallback */
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-tight">Pedagojik Not</h4>
          </div>
          <p className="text-sm leading-relaxed text-zinc-300 italic">{effectivePedagogicalNote}</p>
        </div>
      )}
    </div>
  );
};
