import React, { useState } from 'react';
import { ProfileData } from '../../../types/profile';
import { Student, SavedWorksheet } from '../../../types';
import { BentoCard } from '../components/shared/BentoCard';
import { StatCard } from '../components/shared/StatCard';

// Lazy load heavy student components
const StudentDashboard = React.lazy(() =>
  import('../../Student/StudentDashboard').then(m => ({ default: m.StudentDashboard }))
);
const AdvancedStudentManager = React.lazy(() =>
  import('../../Student/AdvancedStudentManager').then(m => ({ default: m.AdvancedStudentManager }))
);

interface StudentsModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
  onBack?: () => void;
  onLoadMaterial?: (ws: SavedWorksheet) => void;
  onTabChange?: (tab: string) => void;
}

type StudentView = 'grid' | 'manager' | 'dashboard';

const FALLBACK = (
  <div className="flex items-center justify-center h-64 animate-pulse">
    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
      <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500" />
      <span className="text-[10px] font-black uppercase tracking-widest">Modül Yükleniyor…</span>
    </div>
  </div>
);

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  data,
  activeStudent,
  onBack,
  onLoadMaterial,
  onTabChange,
}) => {
  const { stats, loading } = data;
  const [viewMode, setViewMode] = useState<StudentView>('grid');

  const handleBack = () => {
    if (viewMode !== 'grid') {
      setViewMode('grid');
    } else {
      onBack?.();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-3xl" />)}
        </div>
        <div className="h-80 bg-[var(--bg-secondary)] rounded-3xl" />
      </div>
    );
  }

  // Advanced Manager veya Dashboard aktifken tam ekran göster
  if (viewMode === 'manager') {
    return (
      <div className="h-full animate-in fade-in duration-300">
        <React.Suspense fallback={FALLBACK}>
          <AdvancedStudentManager onBack={handleBack} onLoadMaterial={onLoadMaterial} />
        </React.Suspense>
      </div>
    );
  }

  if (viewMode === 'dashboard' && activeStudent) {
    return (
      <div className="h-full animate-in fade-in duration-300">
        <React.Suspense fallback={FALLBACK}>
          <StudentDashboard onBack={handleBack} onLoadMaterial={onLoadMaterial} />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.totalStudents} label="Toplam Öğrenci" icon="fa-user-graduate" color="text-indigo-600" />
        <StatCard value={stats.monthlyNewStudents} label="Bu Ay Yeni" icon="fa-user-plus" color="text-emerald-500" />
        <StatCard value={stats.totalAssessments} label="Değerlendirme" icon="fa-clipboard-check" color="text-amber-500" />
        <StatCard value={`%${stats.avgScore}`} label="Ort. Başarı" icon="fa-chart-simple" color="text-purple-600" />
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gelişmiş Yönetim Kartı */}
        <BentoCard
          title="Gelişmiş Öğrenci Yönetimi"
          icon="fa-users-gear"
          iconColor="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
          action={
            <button
              onClick={() => setViewMode('manager')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-arrow-right mr-1.5" /> Paneli Aç
            </button>
          }
        >
          <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">
            BEP planları, akademik takip, finansal süreçler, yoklama ve AI analiz modüllerine tek ekrandan erişim.
          </p>
          <div className="flex mt-4 gap-2">
            {['fa-hands-holding-child', 'fa-graduation-cap', 'fa-wallet', 'fa-calendar-days', 'fa-wand-magic-sparkles'].map((icon, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-zinc-400 text-xs">
                <i className={`fa-solid ${icon}`} />
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Aktif Öğrenci Kartı */}
        <BentoCard
          title="Aktif Öğrenci"
          icon="fa-star"
          iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500"
          action={
            activeStudent ? (
              <button
                onClick={() => setViewMode('dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fa-solid fa-chart-line mr-1.5" /> Dashboard
              </button>
            ) : null
          }
        >
          {activeStudent ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
                {activeStudent.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text-primary)]">{activeStudent.name}</h4>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{activeStudent.grade}</p>
                {activeStudent.diagnosis?.[0] && (
                  <span className="mt-1 inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-wider">
                    {activeStudent.diagnosis[0]}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-[var(--text-muted)]">
              <i className="fa-solid fa-user-plus text-3xl mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Öğrenci seçilmedi</p>
              <button
                onClick={() => onTabChange?.('students')}
                className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
              >
                Öğrenci Seç
              </button>
            </div>
          )}
        </BentoCard>
      </div>
    </div>
  );
};