import React, { useMemo } from 'react';
import { ProfileData } from '../../../types/profile';
import { Student } from '../../../types';
import { BentoCard } from '../components/shared/BentoCard';
import { StatCard } from '../components/shared/StatCard';
import { LineChart } from '../../LineChart';

interface OverviewModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
  onSelectActivity: (id: string) => void;
  onLoadSaved: (ws: unknown) => void;
  onTabChange: (tab: string) => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  data,
  activeStudent,
  onLoadSaved,
  onTabChange,
}) => {
  const { stats, performanceTrends, worksheets, assessments, loading } = data;

  const studentScore = useMemo(() => {
    if (!activeStudent || assessments.length === 0) return null;
    const sa = assessments.filter((a: Record<string, unknown>) => a.studentName === activeStudent.name);
    if (sa.length === 0) return null;
    return Math.round(sa.reduce((sum: number, a: Record<string, unknown>) => {
      const r = a.report as Record<string, unknown>;
      const s = r?.scores as Record<string, number> | undefined;
      return sum + (s?.attention ?? 0);
    }, 0) / sa.length);
  }, [activeStudent, assessments]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          value={stats.totalStudents}
          label="Toplam Öğrenci"
          icon="fa-user-graduate"
          color="text-indigo-600"
          trend={{ value: stats.monthlyNewStudents, direction: stats.monthlyNewStudents > 0 ? 'up' : 'stable' }}
        />
        <StatCard
          value={stats.totalMaterials}
          label="Üretilen Materyal"
          icon="fa-file-lines"
          color="text-emerald-500"
          trend={{ value: stats.weeklyProduction, direction: 'up' }}
        />
        <StatCard
          value={stats.totalAssessments}
          label="Değerlendirme"
          icon="fa-clipboard-check"
          color="text-amber-500"
        />
        <StatCard
          value={`%${stats.avgScore}`}
          label="Ort. Başarı"
          icon="fa-chart-simple"
          color="text-purple-600"
        />
      </div>

      {/* Trend + Active Student */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Performance Chart */}
        <BentoCard
          className="md:col-span-8"
          title="Performans Trendi"
          icon="fa-chart-line"
          iconColor="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
        >
          {performanceTrends && performanceTrends.length > 0 ? (
            <LineChart
              data={performanceTrends}
              height={110}
              showGrid={false}
              showDots={true}
              color="var(--accent-color)"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-[var(--text-muted)]">
              <i className="fa-solid fa-chart-line text-3xl mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Yeterli veri yok</p>
            </div>
          )}
        </BentoCard>

        {/* Active Student Card */}
        <BentoCard
          className="md:col-span-4"
          title="Son Odak"
          icon="fa-star"
          iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500"
        >
          {activeStudent ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                  {activeStudent.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--text-primary)]">{activeStudent.name}</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{activeStudent.grade}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Gelişim</span>
                  <span className={`text-[10px] font-black ${studentScore !== null ? 'text-emerald-500' : 'text-zinc-400'}`}>
                    {studentScore !== null ? `%${studentScore}` : 'Veri yok'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${studentScore ?? 0}%` }} />
                </div>
              </div>
              <div className="mt-auto">
                <button
                  onClick={() => onTabChange('students')}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <i className="fa-solid fa-arrow-right mr-2" /> Profili Aç
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-2">
              <i className="fa-solid fa-user-plus text-3xl opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-widest">Öğrenci Seçilmedi</span>
            </div>
          )}
        </BentoCard>
      </div>

      {/* Son Materyaller */}
      <BentoCard title="Son Üretilen Materyaller" icon="fa-clock-rotate-left">
        {worksheets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {worksheets.slice(0, 8).map((ws: Record<string, unknown>) => (
              <div
                key={ws.id as string}
                onClick={() => onLoadSaved(ws)}
                className="flex items-center gap-3 p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-transparent hover:border-[var(--accent-color)]/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors shadow-sm text-lg">
                  <i className={ws.icon as string} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[var(--text-primary)] truncate">{ws.name as string}</p>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {new Date(ws.createdAt as string).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-[var(--text-muted)]">
            <i className="fa-solid fa-file-circle-plus text-4xl mb-3 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Henüz materyal üretilmemiş</p>
          </div>
        )}
      </BentoCard>
    </div>
  );
};