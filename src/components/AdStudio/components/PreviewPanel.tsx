import React from 'react';
import { AdOutput, AD_TARGET_LABELS } from '../../../types/adStudio';

interface PreviewPanelProps {
  output: AdOutput;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ output }) => {
  if (output.format === 'storyboard') {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-200 mb-3">{output.title}</h4>
        <div className="flex items-center gap-2 text-[9px] text-zinc-500 mb-4">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{AD_TARGET_LABELS[output.target]}</span>
          <span>{output.audience.join(', ')}</span>
          <span>· {output.duration}s</span>
        </div>
        {output.scenes.map(scene => (
          <div key={scene.sceneNo} className="relative rounded-xl bg-gradient-to-br from-black/40 to-indigo-950/30 border border-white/5 p-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  Sahne {scene.sceneNo}
                </span>
                <span className="text-[8px] font-mono text-zinc-600">{scene.duration}s</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">
                <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Görsel: </span>
                {scene.visualDesc}
              </p>
              <div className="border-l-2 border-indigo-500/30 pl-3 mb-2">
                <p className="text-[11px] text-zinc-400 italic">
                  <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-wider not-italic">🎙️ Ses: </span>
                  {scene.voiceover}
                </p>
              </div>
              {scene.textOverlay && (
                <p className="text-[9px] text-zinc-500 font-mono">
                  <span className="text-zinc-600">── </span>
                  {scene.textOverlay}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (output.format === 'social_media') {
    return (
      <div className="space-y-4">
        {/* Instagram Mock */}
        <div className="rounded-xl bg-gradient-to-br from-pink-950/40 to-purple-950/30 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">O</div>
            <div>
              <span className="text-[11px] font-bold text-zinc-200">oogmatik</span>
              <span className="text-[8px] text-zinc-500 block">Sponsored</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{output.socialCopy}</p>
        </div>
        {/* LinkedIn Mock */}
        <div className="rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-950/30 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">in</div>
            <div>
              <span className="text-[11px] font-bold text-zinc-200">Oogmatik</span>
              <span className="text-[8px] text-zinc-500 block">Eğitim Teknolojileri</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{output.socialCopy}</p>
        </div>
      </div>
    );
  }

  if (output.format === 'email') {
    return (
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[8px]">
            <i className="fa-solid fa-envelope" />
          </div>
          <span className="text-[10px] text-zinc-500">Gelen Kutusu</span>
        </div>
        <div className="text-[10px] text-zinc-600">Konu: <span className="text-zinc-300 font-bold">{output.emailSubject}</span></div>
        <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{output.emailBody}</div>
      </div>
    );
  }

  /* Default: script view */
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-zinc-200">{output.title}</h4>
      <div className="flex items-center gap-2 text-[9px] text-zinc-500 mb-3">
        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{output.format}</span>
        <span>{output.target}</span>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{output.script}</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-2">Sosyal Medya Kopyası</p>
        <p className="text-[11px] text-zinc-300">{output.socialCopy}</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-2">E-posta</p>
        <p className="text-[10px] text-zinc-600">Konu: <span className="text-zinc-300">{output.emailSubject}</span></p>
        <p className="text-[11px] text-zinc-300 mt-1">{output.emailBody}</p>
      </div>
    </div>
  );
};
