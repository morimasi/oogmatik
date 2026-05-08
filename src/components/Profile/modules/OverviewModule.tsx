import React from 'react';
import { ProfileData } from '../../types/profile';
import { Student } from '../../types';
import { LineChart } from '../LineChart';

interface OverviewModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
  onSelectActivity: (id: any) => void;
  onLoadSaved: (ws: any) => void;
  onTabChange: (tab: string) => void;
}

// BentoCard component from original ProfileView
const BentoCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  iconColor?: string;
  action?: React.ReactNode;
}> = ({
  children,
  className = '',
  title,
  icon,
  iconColor = 'bg-[var(--bg-secondary)] text-[var(--accent-color)]',
  action,
}) => (
  <div
    className={`bg-[var(--bg-paper)] p-4 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group ${className}`}
  >
    {(title || icon || action) && (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-transform group-hover:scale-105 duration-300 ${iconColor} border border-[var(--border-color)]`}
            >
              <i className={icon}></i>
            </div>
          )}
          {title && (
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {title}
            </h3>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

const ActionButton: React.FC<{
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
}> = ({ label, icon, onClick, color = 'bg-[var(--accent-color)] text-white' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent-muted)] ${color}`}
  >
    <i className={icon}></i>
    {label}
  </button>
);

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  data,
  activeStudent,
  onSelectActivity,
  onLoadSaved,
  onTabChange,
}) => {
  const { stats, performanceTrends, worksheets, assessments, loading } = data;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-[var(--bg-secondary)] rounded-3xl h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* KPI Cards */}
      <BentoCard className="md:col-span-3" title="Öğrenciler" icon="fa-solid fa-user-graduate">
        <div className="text-3xl font-black text-[var(--text-primary)]">{stats.totalStudents}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          +{stats.monthlyNewStudents} bu ay
        </div>
      </BentoCard>

      <BentoCard className="md:col-span-3" title="Materyaller" icon="fa-solid fa-file-alt">
        <div className="text-3xl font-black text-[var(--text-primary)]">{stats.totalMaterials}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          +{stats.weeklyProduction} bu hafta
        </div>
      </BentoCard>

      <BentoCard className="md:col-span-3" title="Değerlendirmeler" icon="fa-solid fa-clipboard-check">
        <div className="text-3xl font-black text-[var(--text-primary)]">{stats.totalAssessments}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          Ortalama: %{stats.avgScore}
        </div>
      </BentoCard>

      <BentoCard className="md:col-span-3" title="Planlar" icon="fa-solid fa-graduation-cap">
        <div className="text-3xl font-black text-[var(--text-primary)]">{stats.totalPlans}</div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          Aktif müfredat
        </div>
      </BentoCard>

      {/* Performance Trend */}
      <BentoCard className="md:col-span-8" title="Performans Trendi" icon="fa-solid fa-chart-line">
        {performanceTrends ? (
          <LineChart
            data={performanceTrends}
            height={120}
            showGrid={false}
            showDots={true}
            color="var(--accent-color)"
          />
        ) : (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Yeterli veri yok
          </div>
        )}
      </BentoCard>

      {/* Active Student */}
      <BentoCard
        className="md:col-span-4"
        title="Son Odak"
        icon="fa-solid fa-star"
        iconColor="bg-amber-100 text-amber-600"
      >
        {activeStudent ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={activeStudent.avatar || ''}
                className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                alt=""
              />
              <div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">{activeStudent.name}</h4>
                <p className="text-xs text-[var(--text-muted)]">{activeStudent.grade}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {(() => {
                const studentAssessments = assessments.filter(
                  (a: any) => a.studentName === activeStudent.name
                );
                const score = studentAssessments.length > 0
                  ? Math.round(
                      studentAssessments.reduce(
                        (sum: number, a: any) => sum + (a.report.scores.attention || 0),
                        0
                      ) / studentAssessments.length
                    )
                  : null;
                return (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-muted)]">GELİŞİM</span>
                      <span className="text-emerald-500 font-medium">
                        {score !== null ? `%${score}` : 'Veri Yok'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${score ?? 0}%` }}
                      ></div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="mt-auto">
              <ActionButton
                label="PROFİLİ AÇ"
                icon="fa-solid fa-arrow-right"
                onClick={() => onTabChange('students')}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <i className="fa-solid fa-user-plus text-2xl mb-2 opacity-50"></i>
            <span className="text-sm">Aktif öğrenci seçilmedi</span>
          </div>
        )}
      </BentoCard>

      {/* Recent Materials */}
      <BentoCard
        className="md:col-span-12"
        title="Son Üretilen Materyaller"
        icon="fa-solid fa-history"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {worksheets.slice(0, 4).map((ws: any) => (
            <div
              key={ws.id}
              onClick={() => onLoadSaved(ws)}
              className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors">
                <i className={ws.icon}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {ws.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(ws.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
};