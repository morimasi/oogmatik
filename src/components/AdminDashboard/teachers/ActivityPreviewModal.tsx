import React from 'react';
import { X, FileText, Award, ExternalLink } from 'lucide-react';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_COLORS } from './constants';
import { TeacherActivityType } from '../../../types/teacher';

interface ActivityPreviewModalProps {
  type: string;
  data: Record<string, unknown> | null;
  loading: boolean;
  onClose: () => void;
}

export const ActivityPreviewModal: React.FC<ActivityPreviewModalProps> = ({ type, data, loading, onClose }) => {
  const activityType = type as TeacherActivityType;
  const label = ACTIVITY_LABELS[activityType] || type;
  const icon = ACTIVITY_ICONS[activityType] || 'fa-file';
  const color = ACTIVITY_COLORS[activityType] || 'bg-zinc-500';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-bold text-[var(--text-muted)]">İçerik bulunamadı veya erişim izniniz yok.</p>
        </div>
      );
    }

    if (type === 'worksheet') {
      return (
        <div className="space-y-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Başlık</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{(data.title as string) || 'Adsız Çalışma Kağıdı'}</p>
          </div>
          {Boolean(data.studentName) && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Öğrenci</p>
              <p className="text-sm font-black text-[var(--text-primary)]">{data.studentName as string}</p>
            </div>
          )}
          {Boolean(data.difficulty) && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Zorluk</p>
              <p className="text-sm font-black text-[var(--text-primary)]">{data.difficulty as string}</p>
            </div>
          )}
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Oluşturulma</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{new Date((data.createdAt as string) || '').toLocaleString('tr-TR')}</p>
          </div>
        </div>
      );
    }

    if (type === 'assessment') {
      const report = data.report as Record<string, unknown> | undefined;
      const scores = report?.scores as Record<string, number> | undefined;
      return (
        <div className="space-y-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Öğrenci</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{(data.studentName as string) || 'Belirtilmemiş'}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Yaş / Sınıf</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{`${(data.age as string) || '-'} yaş · ${(data.grade as string) || '-'}`}</p>
          </div>
          {scores && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(scores).map(([key, val]) => (
                <div key={key} className="bg-[var(--bg-secondary)] rounded-2xl p-3 border border-[var(--border-color)]">
                  <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">{key}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--bg-paper)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-xs font-black text-indigo-500">%{val}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (type === 'plan') {
      const schedule = data.schedule as Array<Record<string, unknown>> | undefined;
      const goals = data.goals as string[] | undefined;
      return (
        <div className="space-y-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Öğrenci</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{(data.studentName as string) || 'Belirtilmemiş'}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Süre</p>
            <p className="text-sm font-black text-[var(--text-primary)]">{`${(data.durationDays as number) || 0} gün`}</p>
          </div>
          {goals && goals.length > 0 && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Hedefler</p>
              <div className="space-y-1.5">
                {goals.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px]">
                    <span className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[7px] font-black shrink-0">{i + 1}</span>
                    <span className="font-bold text-[var(--text-primary)]">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {schedule && (
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Program ({schedule.length} gün)</p>
              <div className="flex gap-1.5 flex-wrap">
                {schedule.map((d) => (
                  <span key={d.day as number} className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold">
                    {d.day as number}. Gün
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-bold text-[var(--text-muted)]">Bu içerik türü önizlenemiyor.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200" onClick={onClose}>
      <div className="bg-[var(--bg-paper)] dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className={`${color} bg-opacity-20 px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
              <i className={`fa-solid ${icon} text-sm`} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">{label} Önizleme</h3>
              <p className="text-[9px] font-bold text-[var(--text-muted)]">{data ? (data.title as string) || (data.studentName as string) || '' : 'Yükleniyor...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-xl flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {renderContent()}
        </div>
        <div className="border-t border-[var(--border-color)] p-4 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
