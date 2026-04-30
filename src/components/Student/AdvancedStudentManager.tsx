import React, { useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import { AdvancedStudent } from '../../types/student-advanced';
import type { Student } from '../../types';
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

import { logInfo, logError, logWarn } from '../../utils/logger.js';
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
    <div className="px-4 py-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-paper)]/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-4 bg-[var(--accent-color)] rounded-full shadow-[0_0_8px_var(--accent-color)]"></div>
        <div>
          <h2 className="text-[11px] font-black text-[var(--text-primary)] tracking-tight uppercase leading-none">
            {title}
          </h2>
          <p className="text-[var(--text-muted)] text-[8px] font-bold uppercase tracking-widest opacity-60 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex gap-1.5">{actions}</div>}
    </div>
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[var(--bg-secondary)]/30">
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
  <div className="w-40 bg-[var(--bg-inset)]/50 backdrop-blur-xl text-[var(--text-secondary)] flex flex-col h-full border-r border-[var(--border-color)] shrink-0 shadow-lg">
    <div className="p-4 flex flex-col items-center border-b border-[var(--border-color)] bg-black/10">
      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[var(--accent-color)] to-indigo-600 shadow-lg">
        <img
          src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
          alt={student.name}
          className="w-12 h-12 rounded-xl object-cover bg-white"
        />
      </div>
      <h3 className="mt-3 font-black text-[var(--text-primary)] text-[11px] text-center tracking-tight truncate w-full px-1">
        {student.name}
      </h3>
      <p className="text-[8px] font-black uppercase tracking-widest mt-1 text-[var(--accent-color)] opacity-80">
        {student.grade || 'Öğrenci'}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
      {Object.entries(MODULE_ICONS).map(([key, icon]) => {
        if (!visibleModules.includes(key)) return null;
        const isActive = activeModule === key;
        return (
          <button
            key={key}
            onClick={() => onSelectModule(key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 group ${
              isActive
                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i
              className={`fa-solid ${icon} w-4 text-center text-xs transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[var(--accent-color)]'}`}
            ></i>
            <span className="truncate">
              {key === 'iep' ? 'BEP PLANI' :
               key === 'financial' ? 'FİNANSAL' :
               key === 'attendance' ? 'YOKLAMA' :
               key === 'academic' ? 'AKADEMİK' :
               key === 'behavior' ? 'DAVRANIŞ' :
               key === 'overview' ? 'GENEL ÖZET' :
               key === 'portfolio' ? 'ÇALIŞMALAR' :
               key === 'ai_insights' ? 'AI ANALİZ' : 'AYARLAR'}
            </span>
          </button>
        );
      })}
    </div>

    <div className="p-4 border-t border-[var(--border-color)] bg-black/5">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">BEP İlerleme</span>
        <span className="text-[8px] font-black text-[var(--accent-color)]">88%</span>
      </div>
      <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-color)] to-indigo-400 rounded-full shadow-[0_0_8px_var(--accent-color)]"
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
    } catch (err) {
      logError('Öğrenci güncelleme hatası:', err as Record<string, unknown>);
    }
  };

  // Öğrenci seçilmediğinde liste görünümü - Bento Modern
  if (!activeStudent) {
    return (
      <div className="w-full h-full flex bg-[var(--bg-default)] font-lexend overflow-hidden p-6">
        <div className="flex-1 min-w-0 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-y-auto custom-scrollbar relative">
          {/* Header */}
          <div className="sticky top-0 z-10 px-8 py-10 bg-[var(--bg-paper)]/80 backdrop-blur-xl border-b border-[var(--border-color)]/50">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                     <i className="fa-solid fa-graduation-cap text-sm"></i>
                  </div>
                  <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    Öğrenci Yönetimi
                  </h1>
                </div>
                <p className="text-[var(--text-muted)] text-xs font-medium tracking-wide">
                  Öğrenci kartlarını kullanarak detaylıBEP, akademik ve finansal süreçleri yönetin.
                </p>
              </div>
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-[var(--accent-color)] hover:text-white hover:shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Geri Dön
              </button>
            </div>
          </div>

          <div className="p-8">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-40">
                <div className="w-20 h-20 bg-[var(--bg-inset)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
                  <i className="fa-solid fa-users text-3xl"></i>
                </div>
                <p className="text-sm font-bold tracking-widest uppercase">Henüz kayıtlı öğrenci yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {students.map((student: Student) => (
                  <button
                    key={student.id}
                    onClick={() => setActiveStudent(student)}
                    className="group relative p-5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl transition-all duration-500 hover:border-[var(--accent-color)] hover:shadow-2xl hover:shadow-indigo-500/10 hover:translate-y-[-4px] text-left flex flex-col gap-4 overflow-hidden"
                  >
                    {/* Active/Status Glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)]/5 blur-3xl -mr-12 -mt-12 group-hover:bg-[var(--accent-color)]/20 transition-all"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative">
                        <img
                          src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                          alt={student.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--bg-inset)] shadow-md transition-transform group-hover:scale-105"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-paper)] shadow-sm"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[var(--text-primary)] text-sm tracking-tight truncate mb-1">
                          {student.name}
                        </h3>
                        <div className="px-2 py-0.5 rounded-lg bg-[var(--accent-muted)] text-[var(--accent-color)] text-[8px] font-black uppercase tracking-widest inline-block leading-tight">
                           {student.grade || 'GRADUATE'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 relative z-10">
                       <div className="p-2.5 rounded-2xl bg-[var(--bg-inset)]/50 border border-[var(--border-color)]/50">
                          <p className="text-[7px] font-black text-[var(--text-muted)] uppercase mb-1">Akademik</p>
                          <p className="text-[10px] font-black text-indigo-400">92/100</p>
                       </div>
                       <div className="p-2.5 rounded-2xl bg-[var(--bg-inset)]/50 border border-[var(--border-color)]/50">
                          <p className="text-[7px] font-black text-[var(--text-muted)] uppercase mb-1">BEP</p>
                          <p className="text-[10px] font-black text-emerald-400">AKTİF</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 relative z-10">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-5 h-5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[8px] text-[var(--text-muted)] font-black">
                            <i className="fa-solid fa-folder"></i>
                          </div>
                        ))}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[var(--bg-inset)] flex items-center justify-center group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all shadow-sm">
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
