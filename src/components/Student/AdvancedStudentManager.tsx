import React, { useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import { AdvancedStudent } from '../../types/student-advanced';
import { OverviewModule } from './modules/OverviewModule';
import { IEPModule } from './modules/IEPModule';
import { FinancialModule } from './modules/FinancialModule';
import { AttendanceModule } from './modules/AttendanceModule';
import { AcademicModule } from './modules/AcademicModule';
import { PortfolioModule } from './modules/PortfolioModule';
import { BehaviorModule } from './modules/BehaviorModule';
import { SettingsModule } from './modules/SettingsModule';
import { StudentSelector } from './StudentSelector';
import { AIInsightsModule } from './modules/AIInsightsModule';

// Icons mapping for sub-modules
const MODULE_ICONS = {
  overview: 'fa-chart-pie',
  ai_insights: 'fa-wand-magic-sparkles',
  iep: 'fa-hands-holding-child',
  academic: 'fa-graduation-cap',
  portfolio: 'fa-briefcase',
  behavior: 'fa-scale-balanced',
  financial: 'fa-wallet',
  attendance: 'fa-calendar-days',
  settings: 'fa-sliders',
};

const ContentWrapper: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, children, actions }) => (
  <div className="h-full flex flex-col animate-in fade-in duration-300">
    <div className="px-3 py-1 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-paper)] backdrop-blur shrink-0">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[10px] font-black text-[var(--text-primary)] tracking-tight uppercase leading-none">
          {title}
        </h2>
        <p className="text-[var(--text-muted)] text-[8px] font-bold uppercase tracking-wider opacity-60 leading-none">
          {subtitle}
        </p>
      </div>
      {actions && <div className="flex gap-1">{actions}</div>}
    </div>
    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[var(--bg-secondary)]">
      {children}
    </div>
  </div>
);

const ManagerSidebar: React.FC<{
  activeModule: string;
  onSelectModule: (m: string) => void;
  student: AdvancedStudent;
  visibleModules: string[];
}> = ({ activeModule, onSelectModule, student, visibleModules }) => (
  <div className="w-32 bg-[var(--bg-inset)] text-[var(--text-secondary)] flex flex-col h-full border-r border-[var(--border-color)] shrink-0">
    <div className="p-2 flex flex-col items-center border-b border-[var(--border-color)] bg-black/20">
      <div className="relative group cursor-pointer">
        <img
          src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
          alt={student.name}
          className="w-8 h-8 rounded-lg object-cover border border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors shadow-sm"
        />
      </div>
      <h3 className="mt-1 font-bold text-[var(--text-primary)] text-[10px] text-center leading-none truncate w-full px-1">
        {student.name}
      </h3>
      <p className="text-[7px] font-black uppercase tracking-tighter mt-0.5 text-[var(--text-muted)]">
        {student.grade || 'Öğrenci'}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5 custom-scrollbar">
      {Object.entries(MODULE_ICONS).map(([key, icon]) => {
        if (!visibleModules.includes(key)) return null;
        return (
          <button
            key={key}
            onClick={() => onSelectModule(key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
              activeModule === key
                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                : 'hover:bg-[var(--surface-elevated)]'
            }`}
          >
            <i
              className={`fa-solid ${icon} w-3 text-center text-[9px] ${activeModule === key ? 'text-white' : 'text-[var(--accent-color)]'}`}
            ></i>
            <span className="truncate">
              {key === 'iep'
                ? 'BEP'
                : key === 'financial'
                  ? 'FİNANS'
                  : key === 'attendance'
                    ? 'YOKLAMA'
                    : key === 'academic'
                      ? 'AKADEMİK'
                      : key === 'behavior'
                        ? 'DAVRANIŞ'
                        : key === 'overview'
                          ? 'ÖZET'
                          : key === 'portfolio'
                            ? 'DOSYA'
                            : key === 'ai_insights'
                              ? 'ANALİZ'
                              : 'AYAR'}
            </span>
          </button>
        );
      })}
    </div>

    <div className="p-2 border-t border-[var(--border-color)] bg-black/10">
      <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-color)] rounded-full"
          style={{ width: '88%' }}
        ></div>
      </div>
    </div>
  </div>
);

export const AdvancedStudentManager: React.FC<{
  onBack: () => void;
  onLoadMaterial?: (ws: any) => void;
}> = ({ onBack, onLoadMaterial }) => {
  const { activeStudent, students, setActiveStudent, updateStudent } = useStudentStore();
  const [selectedModule, setSelectedModule] = useState('overview');
  const [visibleModules] = useState<string[]>(Object.keys(MODULE_ICONS));

  const handleStudentUpdate = async (updates: Partial<AdvancedStudent>) => {
    if (!activeStudent) return;
    try {
      await updateStudent(activeStudent.id, updates);
    } catch (e) {
      console.error('Öğrenci güncelleme hatası:', e);
    }
  };

  // Öğrenci seçilmediğinde liste görünümü
  if (!activeStudent) {
    return (
      <div className="w-full h-full flex bg-black font-lexend overflow-hidden">
        <div className="flex-1 min-w-0 bg-white dark:bg-black p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                Öğrenci Yönetimi
              </h1>
              <p className="text-zinc-500 text-sm">
                Düzenlemek veya detaylarını görmek için bir öğrenci seçin.
              </p>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-user-graduate text-2xl text-indigo-600"></i>
                </div>
                <p className="text-zinc-500 text-sm">Henüz öğrenci bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setActiveStudent(student)}
                    className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all hover:shadow-lg text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                        alt={student.name}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                          {student.name}
                        </h3>
                        {student.diagnosis && student.diagnosis.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {student.diagnosis.slice(0, 2).map((d, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                        {student.grade && (
                          <p className="text-zinc-500 text-xs mt-1">{student.grade}</p>
                        )}
                      </div>
                      <i className="fa-solid fa-chevron-right text-zinc-400 group-hover:text-indigo-500 transition-colors text-xs"></i>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={onBack}
                className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase tracking-widest"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStudent: AdvancedStudent = {
    ...activeStudent,
    iep: (activeStudent as any).iep || { goals: [], status: 'draft' },
    financial: (activeStudent as any).financial || { balance: 0, transactions: [] },
    attendance: (activeStudent as any).attendance || { stats: { attendanceRate: 0 } },
    academic: (activeStudent as any).academic || { metrics: { gpa: 0 } },
    behavior: (activeStudent as any).behavior || { score: 100, incidents: [] },
    portfolio: (activeStudent as any).portfolio || [],
    aiProfile: (activeStudent as any).aiProfile || {},
  };

  const renderContent = () => {
    switch (selectedModule) {
      case 'overview':
        return (
          <ContentWrapper
            title="Özet"
            subtitle="Genel durum."
            actions={
              <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                PDF
              </button>
            }
          >
            <OverviewModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'ai_insights':
        return (
          <ContentWrapper title="AI Analiz" subtitle="Yapay zeka öngörüleri.">
            <AIInsightsModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'iep':
        return (
          <ContentWrapper title="BEP" subtitle="Bireyselleştirilmiş eğitim planı.">
            <IEPModule student={currentStudent} onUpdate={(iep) => handleStudentUpdate({ iep })} />
          </ContentWrapper>
        );
      case 'financial':
        return (
          <ContentWrapper title="Finans" subtitle="Ödeme ve kayıt bilgileri.">
            <FinancialModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      case 'attendance':
        return (
          <ContentWrapper title="Yoklama" subtitle="Devam durumu.">
            <AttendanceModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      case 'academic':
        return (
          <ContentWrapper title="Akademik" subtitle="Ders ve sınav başarısı.">
            <AcademicModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      case 'portfolio':
        return (
          <ContentWrapper title="Dosya" subtitle="Öğrenci çalışmaları.">
            <PortfolioModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      case 'behavior':
        return (
          <ContentWrapper title="Davranış" subtitle="Sosyal ve davranışsal notlar.">
            <BehaviorModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      case 'settings':
        return (
          <ContentWrapper title="Ayar" subtitle="Profil ayarları.">
            <SettingsModule student={currentStudent} onUpdate={handleStudentUpdate} />
          </ContentWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex bg-black font-lexend overflow-hidden">
      <div className="w-14 bg-black border-r border-zinc-800 flex flex-col items-center py-4 gap-4 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
          O
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-house text-xs"></i>
          </button>
          <button
            onClick={() => useStudentStore.getState().setActiveStudent(null)}
            className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-users text-xs"></i>
          </button>
        </div>
      </div>
      <ManagerSidebar
        activeModule={selectedModule}
        onSelectModule={setSelectedModule}
        student={currentStudent}
        visibleModules={visibleModules}
      />
      <div className="flex-1 min-w-0 bg-white dark:bg-black">{renderContent()}</div>
    </div>
  );
};
