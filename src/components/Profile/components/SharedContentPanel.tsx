import React from 'react';
import { SharedContent } from '../../../services/profileShareService';

const MODULE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  overview: { label: 'Özet', icon: 'fa-chart-pie', color: 'from-indigo-500 to-purple-600' },
  reports: { label: 'Raporlar', icon: 'fa-file-medical', color: 'from-amber-500 to-orange-600' },
  analysis: { label: 'Analiz', icon: 'fa-clipboard-check', color: 'from-emerald-500 to-teal-600' },
  plans: { label: 'Planlar', icon: 'fa-graduation-cap', color: 'from-blue-500 to-indigo-600' },
};

const PERMISSION_LABELS: Record<string, string> = {
  view: 'Görüntüleme',
  edit: 'Düzenleme',
};

interface SharedContentPanelProps {
  items: SharedContent[];
  loading: boolean;
  onOpenModule: (moduleType: SharedContent['moduleType']) => void;
  onRemoveShare: (shareId: string) => Promise<boolean>;
  onMarkAsRead?: (shareId: string) => Promise<boolean>;
}

export const SharedContentPanel: React.FC<SharedContentPanelProps> = ({
  items,
  loading,
  onOpenModule,
  onRemoveShare,
  onMarkAsRead,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-3xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
          <i className="fa-solid fa-share-nodes text-4xl text-indigo-400 opacity-50" />
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Henüz Paylaşım Yok</h3>
        <p className="text-sm font-bold text-[var(--text-muted)] mb-8 max-w-sm leading-relaxed">
          Diğer kullanıcılar sizinle bir modül paylaştığında burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const mod = MODULE_LABELS[item.moduleType] || MODULE_LABELS.overview;
        const isUnread = !item.readAt;
        return (
          <div
            key={item.id}
            onClick={() => {
              if (item.id && isUnread) onMarkAsRead?.(item.id);
              onOpenModule(item.moduleType);
            }}
            className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${isUnread
              ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
              : 'bg-[var(--bg-paper)] border-[var(--border-color)] hover:border-[var(--accent-color)]/30'
              }`}
          >
            {isUnread && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white shadow-lg shadow-indigo-500/30">
                <i className="fa-solid fa-bolt" />
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white text-xl shadow-lg shrink-0`}>
              <i className={`fa-solid ${mod.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-black text-[var(--text-primary)] truncate">{item.ownerName}</h4>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest shrink-0">
                  {mod.label}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--text-muted)]">
                <i className="fa-solid fa-lock-open text-[10px] mr-1" />
                {PERMISSION_LABELS[item.permission] || 'Görüntüleme'} · {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </p>
              {item.message && (
                <p className="text-[10px] font-medium text-[var(--text-muted)] mt-1 italic bg-[var(--bg-secondary)] px-2 py-1 rounded-lg inline-block">
                  "{item.message}"
                </p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); if (item.id) onRemoveShare(item.id); }}
              className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all shrink-0"
              title="Paylaşımı Kaldır"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
