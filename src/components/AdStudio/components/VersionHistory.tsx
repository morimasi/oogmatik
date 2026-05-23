import React, { useState } from 'react';
import { useAdHistory } from '../../../hooks/useAdHistory';
import { useAdGenerator } from '../../../hooks/useAdGenerator';
import { PreviewPanel } from './PreviewPanel';
import { AD_TARGET_LABELS } from '../../../types/adStudio';

export const VersionHistory: React.FC = () => {
  const { history, deleteFromHistory, clearHistory, compareVersions, archiveAd, favoriteAd } = useAdHistory();
  // We need a separate instance for reading history; use the hook directly
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [viewId, setViewId] = useState<string | null>(null);

  const viewed = history.find(h => h.id === viewId);
  const [idA, idB] = compareIds;
  const diff = idA && idB ? compareVersions(idA, idB) : null;

  if (viewed) {
    return (
      <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewId(null)} className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-all">
            <i className="fa-solid fa-arrow-left" /> Geri
          </button>
          <span className="text-[10px] text-zinc-500 font-mono">v{viewed.version} · {new Date(viewed.createdAt).toLocaleString('tr-TR')}</span>
        </div>
        <PreviewPanel output={viewed} />
      </div>
    );
  }

  if (diff) {
    return (
      <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCompareIds([])} className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
            <i className="fa-solid fa-arrow-left" /> Geri
          </button>
          <span className="text-[10px] text-zinc-500 font-mono">Karşılaştırma</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <h4 className="text-[10px] font-bold text-zinc-400 mb-2">Varyasyon A · v{diff.a.version}</h4>
            <p className="text-[10px] text-zinc-500 mb-2">Ton: {diff.a.tone} · Format: {diff.a.format}</p>
            <p className="text-[10px] text-zinc-300 line-clamp-10">{diff.a.script.slice(0, 300)}...</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <h4 className="text-[10px] font-bold text-zinc-400 mb-2">Varyasyon B · v{diff.b.version}</h4>
            <p className="text-[10px] text-zinc-500 mb-2">Ton: {diff.b.tone} · Format: {diff.b.format}</p>
            <p className="text-[10px] text-zinc-300 line-clamp-10">{diff.b.script.slice(0, 300)}...</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/5 border border-white/5 p-3">
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Farklar</p>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {Object.entries(diff.differences).filter(([, v]) => v).map(([key]) => (
              <span key={key} className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[9px]">{key}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-indigo-500" />
          Üretim Geçmişi
          <span className="text-zinc-600 font-mono normal-case tracking-normal">({history.length})</span>
        </h3>
        {history.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[9px] font-bold hover:bg-red-500/20 transition-all">
            <i className="fa-solid fa-trash-can" /> Temizle
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-500">
          <i className="fa-solid fa-clock-rotate-left text-3xl" />
          <p className="text-sm font-medium">Henüz reklam üretilmedi</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {history.map(ad => (
            <div key={ad.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-500/5 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-300 truncate">{ad.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-bold uppercase">{ad.format}</span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[8px] font-mono">v{ad.version}</span>
                </div>
                <p className="text-[8px] text-zinc-600 mt-0.5">
                  {AD_TARGET_LABELS[ad.target]} · {ad.audience.join(', ')} · {new Date(ad.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setViewId(ad.id)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-zinc-200 text-[9px]" title="Görüntüle">
                  <i className="fa-solid fa-eye" />
                </button>
                <button onClick={() => favoriteAd(ad.id)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-amber-400 text-[9px]" title="Favori">
                  <i className="fa-regular fa-star" />
                </button>
                <button
                  onClick={() => {
                    if (compareIds.length < 2) {
                      setCompareIds(prev => [...prev, ad.id]);
                    } else {
                      setCompareIds([ad.id]);
                    }
                  }}
                  className={`p-1.5 rounded-lg text-[9px] ${compareIds.includes(ad.id) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-zinc-400 hover:text-zinc-200'}`}
                  title="Karşılaştır"
                >
                  <i className="fa-solid fa-not-equal" />
                </button>
                <button onClick={() => archiveAd(ad.id)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-emerald-400 text-[9px]" title="Arşivle">
                  <i className="fa-solid fa-box-archive" />
                </button>
                <button onClick={() => deleteFromHistory(ad.id)} className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-red-400 text-[9px]" title="Sil">
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
