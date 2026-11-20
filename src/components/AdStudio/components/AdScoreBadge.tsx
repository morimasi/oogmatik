import React from 'react';
import { AdScore } from '../../../types/adStudio';

interface AdScoreBadgeProps {
  score?: AdScore;
}

export const AdScoreBadge: React.FC<AdScoreBadgeProps> = ({ score }) => {
  if (!score) return null;

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-3 font-lexend">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-xl border text-xs font-black ${getScoreColor(score.overall)}`}>
            %{score.overall}
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>AI Reklam Kalite & Etik Skoru</span>
              {score.ethicsStatus === 'approved' && (
                <i className="fa-solid fa-shield-check text-emerald-400 text-xs" title="MEB & Etik Onaylı" />
              )}
            </h4>
            <span className="text-[9px] text-zinc-500 block">
              {score.ethicsStatus === 'approved' ? 'MEB 573 KHK & RÖK Etik Standartlarına Tam Uyumlu' : 'Gözden Geçirilmesi Gereken Noktalar Var'}
            </span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          score.ethicsStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
        }`}>
          {score.ethicsStatus === 'approved' ? 'Onaylandı' : 'Öneri Var'}
        </span>
      </div>

      {/* 4 Micro Metrics */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Kanca</span>
          <span className="text-xs font-bold text-indigo-400">%{score.hookScore}</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Okunabilirlik</span>
          <span className="text-xs font-bold text-sky-400">%{score.readabilityScore}</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Duygu</span>
          <span className="text-xs font-bold text-pink-400">%{score.emotionalScore}</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Etik Uyum</span>
          <span className="text-xs font-bold text-emerald-400">%{score.complianceScore}</span>
        </div>
      </div>

      {/* Diagnostic warnings or suggestions */}
      {score.suggestions.length > 0 && (
        <div className="pt-2 border-t border-white/5 space-y-1">
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">İyileştirme Önerileri:</span>
          {score.suggestions.map((sug, idx) => (
            <p key={idx} className="text-[9px] text-amber-300/90 leading-tight flex items-start gap-1.5">
              <i className="fa-solid fa-triangle-exclamation text-[8px] mt-0.5 text-amber-400" />
              <span>{sug}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
