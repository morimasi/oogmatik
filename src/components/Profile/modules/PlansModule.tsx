import React, { useState, useCallback } from 'react';
import { ProfileData } from '../../../types/profile';
import { SectionHeader } from '../components/shared/SectionHeader';
import { curriculumService } from '../../../services/curriculumService';
import { useToastStore } from '../../../store/useToastStore';
import { PlanEditModal } from './PlanEditModal';
import { PlanPreviewModal } from './PlanPreviewModal';

type PlanStatus = 'active' | 'completed' | 'paused';

const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string; dot: string }> = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  completed: { label: 'Tamamlandı', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', dot: 'bg-indigo-500' },
  paused: { label: 'Duraklatıldı', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
};

const BEP_PROGRESS: Record<string, { color: string }> = {
  not_started: { color: 'text-zinc-300 dark:text-zinc-600' },
  in_progress: { color: 'text-amber-500' },
  completed: { color: 'text-emerald-500' },
};

interface PlansModuleProps {
  data: ProfileData;
  onNavigateToCurriculum?: () => void;
  onShare?: () => void;
}

export const PlansModule: React.FC<PlansModuleProps> = ({ data, onNavigateToCurriculum, onShare }) => {
  const { curriculums, loading, refreshData } = data;
  const { success, error } = useToastStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [addingGoal, setAddingGoal] = useState<string | null>(null);
  const [goalText, setGoalText] = useState('');
  const [editPlan, setEditPlan] = useState<Record<string, unknown> | null>(null);
  const [previewPlan, setPreviewPlan] = useState<Record<string, unknown> | null>(null);
  const [deletePlan, setDeletePlan] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleProgressChange = useCallback(async (planId: string, progress: number) => {
    try {
      await curriculumService.updateCurriculum(planId, { progress } as Record<string, unknown>);
      success('İlerleme güncellendi.');
      refreshData();
    } catch {
      error('Güncelleme başarısız.');
    }
    setEditingProgress(null);
  }, [success, error, refreshData]);

  const handleStatusChange = useCallback(async (planId: string, status: string) => {
    try {
      await curriculumService.updateCurriculum(planId, { status } as Record<string, unknown>);
      success('Durum güncellendi.');
      refreshData();
    } catch {
      error('Güncelleme başarısız.');
    }
    setEditingStatus(null);
  }, [success, error, refreshData]);

  const handleAddGoal = useCallback(async (planId: string) => {
    if (!goalText.trim()) return;
    try {
      const plan = curriculums.find((p: Record<string, unknown>) => p.id === planId);
      const goals = (plan?.bepGoals as Array<Record<string, unknown>>) || [];
      await curriculumService.updateCurriculum(planId, {
        bepGoals: [...goals, { objective: goalText.trim(), progress: 'not_started' }],
      } as Record<string, unknown>);
      success('Hedef eklendi.');
      refreshData();
    } catch {
      error('Hedef eklenemedi.');
    }
    setAddingGoal(null);
    setGoalText('');
  }, [goalText, curriculums, success, error, refreshData]);

  const handleDeleteGoal = useCallback(async (planId: string, goalIdx: number) => {
    try {
      const plan = curriculums.find((p: Record<string, unknown>) => p.id === planId);
      const goals = (plan?.bepGoals as Array<Record<string, unknown>>) || [];
      await curriculumService.updateCurriculum(planId, {
        bepGoals: goals.filter((_: unknown, i: number) => i !== goalIdx),
      } as Record<string, unknown>);
      success('Hedef silindi.');
      refreshData();
    } catch {
      error('Hedef silinemedi.');
    }
  }, [curriculums, success, error, refreshData]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletePlan) return;
    const planId = deletePlan.id as string;
    setDeleting(true);
    try {
      await curriculumService.deleteCurriculum(planId);
      success('Plan kalıcı olarak silindi.');
      setDeletePlan(null);
      refreshData();
    } catch {
      error('Silme başarısız.');
    } finally {
      setDeleting(false);
    }
  }, [deletePlan, success, error, refreshData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-[var(--bg-secondary)] rounded-[2.5rem]" />)}
      </div>
    );
  }

  if (curriculums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
          <i className="fa-solid fa-graduation-cap text-4xl text-indigo-400 opacity-50" />
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Henüz Plan Yok</h3>
        <p className="text-sm font-bold text-[var(--text-muted)] mb-8 max-w-sm leading-relaxed">
          Öğrencileriniz için kişiselleştirilmiş müfredat planları oluşturun ve BEP hedeflerini takip edin.
        </p>
        <button
          onClick={onNavigateToCurriculum}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-plus mr-2" /> İlk Planı Oluştur
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
            Planlar & Müfredat
          </h2>
          <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-[9px] font-black shadow-md shadow-indigo-500/20">
            {curriculums.length} Plan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onShare && (
            <button onClick={onShare} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-color)]">
              <i className="fa-solid fa-share-nodes" /> Paylaş
            </button>
          )}
          <button
            onClick={onNavigateToCurriculum}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform"
          >
            <i className="fa-solid fa-plus mr-1.5" /> Yeni Plan
          </button>
        </div>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {curriculums.map((plan: Record<string, unknown>) => {
          const planId = plan.id as string;
          const progress = (plan.progress as number) ?? 0;
          const status = (plan.status as PlanStatus) ?? 'active';
          const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
          const bepGoals = (plan.bepGoals as Array<Record<string, unknown>>) ?? [];
          const daysLeft = plan.durationDays
            ? Math.max(0, Math.round(((plan.durationDays as number) - progress / 100 * (plan.durationDays as number))))
            : null;
          const isExpanded = expandedId === planId;

          return (
            <div
              key={planId}
              className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group"
            >
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${statusCfg.dot}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <i className="fa-solid fa-graduation-cap text-lg" />
                  </div>
                  {editingStatus === planId ? (
                    <div className="flex gap-1">
                      {(['active', 'completed', 'paused'] as PlanStatus[]).map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <button key={s} onClick={() => handleStatusChange(planId, s)} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${s === status ? cfg.dot.replace('bg-', 'bg-').replace('500', '600') + ' text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button onClick={() => setEditingStatus(planId)} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                      <i className="fa-solid fa-pen text-[7px] ml-0.5 opacity-60" />
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-black text-[var(--text-primary)] mb-1">{plan.studentName as string || 'Müfredat Planı'}</h3>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                  {plan.grade as string} · {plan.durationDays as number} Gün
                </p>

                {/* Progress (editable) */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">İlerleme</span>
                    {editingProgress === planId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="range" min="0" max="100" value={progressValue}
                          onChange={(e) => setProgressValue(Number(e.target.value))}
                          className="w-24 h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-[10px] font-black text-indigo-600 w-8 text-right">{progressValue}%</span>
                        <button onClick={() => handleProgressChange(planId, progressValue)} className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black">Kaydet</button>
                        <button onClick={() => setEditingProgress(null)} className="px-2 py-0.5 text-[8px] font-black text-zinc-400">İptal</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingProgress(planId); setProgressValue(progress); }} className="flex items-center gap-1 text-[10px] font-black text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors">
                        {progress}%
                        <i className="fa-solid fa-pen text-[7px] opacity-60" />
                      </button>
                    )}
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                  {daysLeft !== null && (
                    <p className="text-[9px] font-bold text-zinc-400">{daysLeft} gün kaldı</p>
                  )}
                </div>

                {/* BEP Goals (editable) */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <SectionHeader title="BEP Hedefleri" icon="fa-bullseye" />
                    <button onClick={() => { setAddingGoal(planId); setGoalText(''); }} className="flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                      <i className="fa-solid fa-plus text-[8px]" /> Hedef Ekle
                    </button>
                  </div>
                  {bepGoals.length > 0 && (isExpanded ? bepGoals : bepGoals.slice(0, 2)).map((goal, idx) => {
                    const gStatus = (goal.progress as string) ?? 'not_started';
                    const gCfg = BEP_PROGRESS[gStatus] ?? BEP_PROGRESS['not_started'];
                    return (
                      <div key={idx} className="flex items-start gap-2 group">
                        <i className={`fa-solid fa-circle-dot text-[10px] mt-0.5 ${gCfg.color}`} />
                        <span className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed flex-1">{goal.objective as string}</span>
                        <button onClick={() => handleDeleteGoal(planId, idx)} className="w-5 h-5 flex items-center justify-center text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                          <i className="fa-solid fa-xmark text-[9px]" />
                        </button>
                      </div>
                    );
                  })}
                  {bepGoals.length > 2 && (
                    <button onClick={() => setExpandedId(isExpanded ? null : planId)} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                      {isExpanded ? 'Daha az göster' : `+${bepGoals.length - 2} hedef daha`}
                    </button>
                  )}
                  {addingGoal === planId && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={goalText}
                        onChange={(e) => setGoalText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddGoal(planId); }}
                        placeholder="Yeni BEP hedefi..."
                        className="flex-1 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
                        autoFocus
                      />
                      <button onClick={() => handleAddGoal(planId)} disabled={!goalText.trim()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest disabled:opacity-50">Ekle</button>
                    </div>
                  )}
                </div>

                {/* CTA — Düzenle / Önizle / Sil */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setEditPlan(plan)}
                    className="flex-1 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen-to-square text-[8px]" /> Düzenle
                  </button>
                  <button
                    onClick={() => setPreviewPlan(plan)}
                    className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-eye text-[8px]" /> Önizle
                  </button>
                  <button
                    onClick={() => setDeletePlan(plan)}
                    className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:scale-105 active:scale-95 transition-all"
                    title="Planı Sil"
                  >
                    <i className="fa-solid fa-trash-can text-xs" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Edit Modal */}
      {editPlan && (
        <PlanEditModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSaved={refreshData}
        />
      )}

      {/* Preview Modal */}
      {previewPlan && (
        <PlanPreviewModal
          plan={previewPlan}
          onClose={() => setPreviewPlan(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-[var(--bg-paper)] dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-pink-700 p-6 text-center">
              <div className="w-14 h-14 mx-auto bg-white/15 rounded-2xl flex items-center justify-center mb-3">
                <i className="fa-solid fa-triangle-exclamation text-2xl text-white" />
              </div>
              <h3 className="text-white font-black text-lg">Planı Sil</h3>
              <p className="text-rose-200 text-[10px] font-bold mt-1">
                {(deletePlan.studentName as string) || 'Müfredat Planı'}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed mb-6">
                Bu planı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletePlan(null)}
                  className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <i className="fa-solid fa-spinner animate-spin" /> : <i className="fa-solid fa-trash-can" />}
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};