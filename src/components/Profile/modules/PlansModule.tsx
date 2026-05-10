import React, { useState } from 'react';
import { ProfileData } from '../../../types/profile';
import { SectionHeader } from '../components/shared/SectionHeader';

interface PlansModuleProps {
  data: ProfileData;
  onNavigateToCurriculum?: () => void;
}

type PlanStatus = 'active' | 'completed' | 'paused';

const STATUS_CONFIG: Record<PlanStatus, { label: string; color: string; dot: string }> = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  completed: { label: 'Tamamlandı', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400', dot: 'bg-indigo-500' },
  paused: { label: 'Duraklatıldı', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
};

const BEP_PROGRESS: Record<string, { label: string; color: string }> = {
  achieved: { label: 'Başarıldı', color: 'text-emerald-500' },
  in_progress: { label: 'İlerliyor', color: 'text-amber-500' },
  not_started: { label: 'Başlamadı', color: 'text-zinc-400' },
};

export const PlansModule: React.FC<PlansModuleProps> = ({ data, onNavigateToCurriculum }) => {
  const { curriculums, loading } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <button
          onClick={onNavigateToCurriculum}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform"
        >
          <i className="fa-solid fa-plus mr-1.5" /> Yeni Plan
        </button>
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
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </div>

                <h3 className="text-sm font-black text-[var(--text-primary)] mb-1">{plan.studentName as string || 'Müfredat Planı'}</h3>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                  {plan.grade as string} · {plan.durationDays as number} Gün
                </p>

                {/* Progress */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">İlerleme</span>
                    <span className="text-[10px] font-black text-[var(--text-primary)]">{progress}%</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                  {daysLeft !== null && (
                    <p className="text-[9px] font-bold text-zinc-400">{daysLeft} gün kaldı</p>
                  )}
                </div>

                {/* BEP Goals */}
                {bepGoals.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <SectionHeader title="BEP Hedefleri" icon="fa-bullseye" />
                    {(isExpanded ? bepGoals : bepGoals.slice(0, 2)).map((goal, idx) => {
                      const gStatus = (goal.progress as string) ?? 'not_started';
                      const gCfg = BEP_PROGRESS[gStatus] ?? BEP_PROGRESS['not_started'];
                      return (
                        <div key={idx} className="flex items-start gap-2">
                          <i className={`fa-solid fa-circle-dot text-[10px] mt-0.5 ${gCfg.color}`} />
                          <span className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed flex-1">{goal.objective as string}</span>
                        </div>
                      );
                    })}
                    {bepGoals.length > 2 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : planId)} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                        {isExpanded ? 'Daha az göster' : `+${bepGoals.length - 2} hedef daha`}
                      </button>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="flex gap-2 mt-auto">
                  <button className="flex-1 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-colors">
                    Düzenle
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
                    <i className="fa-solid fa-play text-xs" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};