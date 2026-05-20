import React, { useState } from 'react';
import { Curriculum, CurriculumDay } from '../../../types';
import { EnrichedCurriculum, PlanRevision } from './studentDashboardData';

interface AcademicPlanModuleProps {
  studentId: string;
  curriculums: Curriculum[];
}

export const AcademicPlanModule: React.FC<AcademicPlanModuleProps> = ({
  studentId,
  curriculums,
}) => {
  const allPlans: any[] = curriculums.map(c => ({ ...c, revisions: [], lastReviewed: (c as any).startDate, nextReview: '' }));

  const [selectedPlan, setSelectedPlan] = useState<EnrichedCurriculum | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<'overview' | 'schedule' | 'revisions'>('overview');

  const activePlan = allPlans[0];
  const activeProgress = activePlan
    ? Math.round((activePlan.schedule.filter((d: CurriculumDay) => d.isCompleted).length / activePlan.schedule.length) * 100)
    : 0;

  const handlePrint = () => { window.print(); };

  const handleDownload = (plan: EnrichedCurriculum) => {
    const data = {
      id: plan.id,
      studentName: plan.studentName,
      startDate: plan.startDate,
      goals: plan.goals,
      schedule: plan.schedule,
      revisions: plan.revisions,
      note: plan.note,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = `plan_${plan.id}.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard && selectedPlan) {
      navigator.clipboard.writeText(`Akademik Plan - ${selectedPlan.studentName} - ${new Date(selectedPlan.startDate).toLocaleDateString('tr-TR')}`);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return status;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Akademik Plan</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allPlans.length} plan
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={() => selectedPlan && handleDownload(selectedPlan)} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
          <button onClick={handleShare} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Paylaş">
            <i className="fa-solid fa-share-nodes text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Active Plan Card */}
      {activePlan && (
        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {/* Plan Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-[var(--accent-color)] text-white rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-map-location-dot text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-[11px] text-[var(--text-primary)] uppercase">
                      {new Date(activePlan.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} Dönemi
                    </h4>
                    <p className="text-[7px] text-[var(--text-muted)] font-bold">{activePlan.durationDays} Günlük Plan • {activePlan.goals.length} Hedef</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[var(--accent-color)]">%{activeProgress}</span>
                <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase">Tamamlandı</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${activeProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Plan Tabs */}
          <div className="flex border-t border-[var(--border-color)]">
            {(['overview', 'schedule', 'revisions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActivePlanTab(tab)}
                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-wider transition-all ${activePlanTab === tab ? 'bg-[var(--accent-muted)] text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                {tab === 'overview' ? 'Genel' : tab === 'schedule' ? 'Takvim' : 'Revizyonlar'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activePlanTab === 'overview' && (
              <div className="space-y-3">
                <div>
                  <h5 className="font-black text-[9px] text-[var(--text-primary)] uppercase mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-bullseye text-[var(--accent-color)] text-[8px]"></i> Hedefler
                  </h5>
                  <div className="space-y-1.5">
                    {activePlan.goals.map((g: string, i: number) => {
                      const completedDays = activePlan.schedule.filter((d: CurriculumDay) => d.isCompleted).length;
                      const isAchieved = i < completedDays;
                      return (
                        <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-secondary)] rounded-lg">
                          <i className={`fa-solid ${isAchieved ? 'fa-check-circle text-emerald-500' : 'fa-circle text-[var(--text-muted)]'} text-[8px] mt-0.5`}></i>
                          <span className="text-[8px] text-[var(--text-secondary)]">{g}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Son İnceleme</span>
                    <p className="text-[9px] font-black text-[var(--text-primary)] mt-1">{new Date(activePlan.lastReviewed).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Sonraki İnceleme</span>
                    <p className="text-[9px] font-black text-[var(--text-primary)] mt-1">{activePlan.nextReview ? new Date(activePlan.nextReview).toLocaleDateString('tr-TR') : '—'}</p>
                  </div>
                </div>
                {activePlan.note && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <span className="text-[7px] font-bold text-amber-500 uppercase">Not</span>
                    <p className="text-[8px] text-[var(--text-secondary)] mt-1 leading-relaxed">{activePlan.note}</p>
                  </div>
                )}
              </div>
            )}

            {activePlanTab === 'schedule' && (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {activePlan.schedule.map((day: CurriculumDay, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${day.isCompleted ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${day.isCompleted ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-paper)] text-[var(--text-muted)]'}`}>
                      <span className="text-[8px] font-black">{day.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-[var(--text-primary)]">{day.focus}</p>
                      {day.activities[0] && (
                        <p className="text-[7px] text-[var(--text-muted)]">{day.activities[0].title} — {day.activities[0].duration}dk</p>
                      )}
                    </div>
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor(day.activities[0]?.status || 'pending')}`}>
                      {statusLabel(day.activities[0]?.status || 'pending')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activePlanTab === 'revisions' && (
              <div className="space-y-2">
                {activePlan.revisions.length > 0 ? (
                  activePlan.revisions.map((rev: PlanRevision) => (
                    <div key={rev.id} className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-bold text-[var(--text-primary)]">{new Date(rev.date).toLocaleDateString('tr-TR')}</span>
                        <span className="text-[7px] text-[var(--text-muted)]">{rev.author}</span>
                      </div>
                      <p className="text-[8px] text-[var(--text-secondary)] mb-2">{rev.changeDescription}</p>
                      <div className="flex gap-2">
                        <span className="text-[7px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded line-through">{rev.previousValue}</span>
                        <i className="fa-solid fa-arrow-right text-[6px] text-[var(--text-muted)] self-center"></i>
                        <span className="text-[7px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{rev.newValue}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[9px] text-[var(--text-muted)] text-center py-4">Henüz revizyon yok.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Plans List */}
      <div className="space-y-2">
        <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight">Tüm Planlar</h4>
        {allPlans.map(plan => {
          const progress = Math.round((plan.schedule.filter((d: CurriculumDay) => d.isCompleted).length / plan.schedule.length) * 100);
          return (
            <div
              key={plan.id}
              className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 cursor-pointer"
              onClick={() => { setSelectedPlan(plan); setActivePlanTab('overview'); }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-calendar-lines-pen text-[9px]"></i>
                  </div>
                  <div>
                    <h4 className="font-black text-[9px] text-[var(--text-primary)] uppercase">
                      {new Date(plan.startDate).toLocaleDateString('tr-TR')} Dönemi
                    </h4>
                    <p className="text-[7px] text-[var(--text-muted)]">{plan.goals.length} hedef • {plan.durationDays} gün</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[var(--accent-color)]">%{progress}</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
