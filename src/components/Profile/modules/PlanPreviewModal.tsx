import React from 'react';

interface PlanPreviewModalProps {
  plan: Record<string, unknown>;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  completed: { label: 'Tamamlandı', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', dot: 'bg-indigo-500' },
  paused: { label: 'Duraklatıldı', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  Kolay: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Orta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  Zor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
};

export const PlanPreviewModal: React.FC<PlanPreviewModalProps> = ({ plan, onClose }) => {
  const studentName = (plan.studentName as string) || 'Müfredat Planı';
  const grade = (plan.grade as string) || '';
  const durationDays = (plan.durationDays as number) || 7;
  const goals = (plan.goals as string[]) || [];
  const note = (plan.note as string) || '';
  const schedule = (plan.schedule as Record<string, unknown>[]) || [];
  const progress = (plan.progress as number) ?? 0;
  const status = ((plan.status as string) || 'active') as keyof typeof STATUS_LABELS;
  const statusCfg = STATUS_LABELS[status] || STATUS_LABELS.active;
  const bepGoals = (plan.bepGoals as Record<string, unknown>[]) || [];
  const createdAt = (plan.createdAt as string) || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-[var(--bg-paper)] dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-3xl flex flex-col border border-[var(--border-color)] overflow-hidden max-h-[90vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-graduation-cap text-xl text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">{studentName}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-indigo-200 text-[10px] font-bold">{grade}</span>
                <span className="text-indigo-300">·</span>
                <span className="text-indigo-200 text-[10px] font-bold">{durationDays} Gün</span>
                {createdAt && (
                  <>
                    <span className="text-indigo-300">·</span>
                    <span className="text-indigo-200 text-[10px] font-bold">{new Date(createdAt).toLocaleDateString('tr-TR')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] p-4">
              <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Durum</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black ${statusCfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] p-4">
              <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">İlerleme</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[var(--bg-paper)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] font-black text-indigo-600">{progress}%</span>
              </div>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] p-4">
              <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">BEP Hedefleri</p>
              <p className="text-lg font-black text-[var(--text-primary)]">{bepGoals.length + goals.length}</p>
            </div>
          </div>

          {/* Amaçlar */}
          {goals.length > 0 && (
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] p-5">
              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-3">
                <i className="fa-solid fa-bullseye text-indigo-500" /> Eğitim Hedefleri
              </h4>
              <div className="space-y-2">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[8px] font-black shrink-0">{idx + 1}</span>
                    <span className="text-[10px] font-bold text-[var(--text-primary)] leading-relaxed">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEP Hedefleri */}
          {bepGoals.length > 0 && (
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] p-5">
              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-3">
                <i className="fa-solid fa-file-pen text-amber-500" /> BEP Hedefleri
              </h4>
              <div className="space-y-2">
                {bepGoals.map((g: Record<string, unknown>, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <i className="fa-solid fa-circle-dot text-[9px] text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-[10px] font-bold text-[var(--text-primary)] leading-relaxed">{g.objective as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Öğretmen Notu */}
          {note && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-200 dark:border-amber-800 p-5">
              <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-2">
                <i className="fa-solid fa-note-sticky" /> Öğretmen Notu
              </h4>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{note}</p>
            </div>
          )}

          {/* Günlük Program */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-emerald-500" /> Günlük Program
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schedule.map((day: Record<string, unknown>) => {
                const dayNum = day.day as number;
                const focus = day.focus as string;
                const activities = (day.activities as Record<string, unknown>[]) || [];
                const isCompleted = day.isCompleted as boolean || activities.every(a => a.status === 'completed');
                return (
                  <div key={dayNum} className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] overflow-hidden group hover:shadow-lg hover:translate-y-[-1px] transition-all">
                    <div className={`px-4 py-2.5 flex items-center justify-between border-b border-[var(--border-color)] ${isCompleted ? 'bg-emerald-500/5' : 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>{dayNum}</span>
                        <span className="text-[10px] font-bold text-[var(--text-primary)]">{focus}</span>
                      </div>
                      {isCompleted && <i className="fa-solid fa-circle-check text-emerald-500 text-sm" />}
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {activities.map((act: Record<string, unknown>, i: number) => {
                        const actStatus = act.status as string;
                        const difficulty = act.difficultyLevel as string;
                        const diffColor = DIFFICULTY_COLORS[difficulty] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300';
                        return (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${actStatus === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                              {actStatus === 'completed' && <i className="fa-solid fa-check text-[6px] text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${actStatus === 'completed' ? 'line-through text-zinc-400' : 'text-[var(--text-primary)]'}`}>{act.title as string}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${diffColor}`}>{difficulty}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] font-bold text-[var(--text-muted)]">{act.duration as number} dk</span>
                                <span className="text-[8px] font-bold text-[var(--text-muted)] truncate">{act.goal as string}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] p-4 flex justify-end bg-[var(--bg-secondary)] shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
