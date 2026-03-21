import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
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
  title: string,
  subtitle: string,
  children: React.ReactNode,
  actions?: React.ReactNode
}> = ({ title, subtitle, children, actions }) => (
  <div className="h-full flex flex-col animate-in fade-in duration-500">
    <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur">
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{title}</h2>
        <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {children}
    </div>
  </div>
);

// ... (ManagerSidebar component remains mostly same, just updating labels)
const ManagerSidebar: React.FC<{
  activeModule: string;
  onSelectModule: (m: string) => void;
  student: AdvancedStudent;
  visibleModules: string[];
}> = ({ activeModule, onSelectModule, student, visibleModules }) => (
  <div className="w-64 bg-zinc-900 text-zinc-400 flex flex-col h-full border-r border-zinc-800">
    <div className="p-6 flex flex-col items-center border-b border-zinc-800/50">
      <div className="relative group cursor-pointer">
        <img
          src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
          alt={student.name}
          className="w-20 h-20 rounded-2xl object-cover border-4 border-zinc-800 group-hover:border-zinc-700 transition-colors shadow-2xl"
        />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs border-4 border-zinc-900">
          <i className="fa-solid fa-check"></i>
        </div>
      </div>
      <h3 className="mt-4 font-black text-white text-lg text-center leading-tight">
        {student.name}
      </h3>
      <p className="text-xs font-bold uppercase tracking-widest mt-1 text-zinc-500">
        {student.grade || 'Öğrenci'}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
      {Object.entries(MODULE_ICONS).map(([key, icon]) => {
        if (!visibleModules.includes(key)) return null;
        return (
          <button
            key={key}
            onClick={() => onSelectModule(key)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeModule === key
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 translate-x-1'
              : 'hover:bg-zinc-800 hover:text-zinc-200'
              }`}
          >
            <i
              className={`fa-solid ${icon} w-5 text-center text-sm ${activeModule === key ? 'text-white' : 'text-indigo-400'}`}
            ></i>
            <span>
              {key === 'iep'
                ? 'BEP / IEP'
                : key === 'financial'
                  ? 'Finans'
                  : key === 'attendance'
                    ? 'Yoklama'
                    : key === 'academic'
                      ? 'Akademik'
                      : key === 'behavior'
                        ? 'Davranış'
                        : key === 'overview'
                          ? 'Özet'
                          : key === 'portfolio'
                            ? 'Portfolyo'
                            : key === 'ai_insights'
                              ? 'AI Analiz'
                              : 'Ayarlar'}
            </span>
          </button>
        );
      })}
    </div>

    <div className="p-4 border-t border-zinc-800 bg-black/20">
      <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            Gelişim Puanı
          </span>
          <span className="text-xs font-black text-emerald-400">88/100</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            style={{ width: '88%' }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// ... (ContentWrapper remains same)

// Main Manager Component
export const AdvancedStudentManager: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const studentContext = useStudent();
  const { activeStudent, students, setActiveStudent, updateStudent } = studentContext || {};
  const [selectedModule, setSelectedModule] = useState('overview');
  const [visibleModules, setVisibleModules] = useState<string[]>(Object.keys(MODULE_ICONS));

  const handleStudentUpdate = async (updates: Partial<AdvancedStudent>) => {
    if (!activeStudent) return;
    try {
      await updateStudent(activeStudent.id, updates);
    } catch (e) {
      console.error("Öğrenci güncelleme hatası:", e);
    }
  };

  // ... (currentStudent logic remains same)
  const baseStudent = activeStudent;
  const currentStudent: AdvancedStudent = baseStudent
    ? ({
      ...baseStudent,
      iep: (baseStudent as any).iep || { goals: [], status: 'draft' },
      financial: (baseStudent as any).financial || { balance: 0, transactions: [] },
      attendance: (baseStudent as any).attendance || { stats: { attendanceRate: 0 } },
      academic: (baseStudent as any).academic || { metrics: { gpa: 0 } },
      behavior: (baseStudent as any).behavior || { score: 100, incidents: [] },
      portfolio: (baseStudent as any).portfolio || [],
      aiProfile: (baseStudent as any).aiProfile || {},
    } as AdvancedStudent)
    : (null as any);

  if (!currentStudent)
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-black overflow-y-auto flex items-center justify-center">
        <div className="max-w-md w-full p-8 text-center bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-user-graduate text-4xl text-indigo-600"></i>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
            Öğrenci Seçilmedi
          </h2>
          <p className="text-zinc-500 mb-8">
            Yönetim panelini kullanmak için lütfen bir öğrenci profili seçin.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setActiveStudent(students[0])}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform"
            >
              Hızlı Seçim (Son Öğrenci)
            </button>
            <button
              onClick={onBack}
              className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-bold"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        </div>
      </div>
    );

  const renderContent = () => {
    switch (selectedModule) {
      case 'overview':
        return (
          <ContentWrapper
            title="Profesyonel Özet"
            subtitle="Öğrencinin anlık durumu ve kritik uyarılar."
            actions={
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform flex items-center gap-2">
                <i className="fa-solid fa-file-pdf"></i> PDF Rapor
              </button>
            }
          >
            <OverviewModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'ai_insights':
        return (
          <ContentWrapper
            title="AI Bilişsel Analiz"
            subtitle="Yapay zeka motoru tarafından oluşturulan derinlemesine öğrenci profili."
            actions={
              <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform flex items-center gap-2">
                <i className="fa-solid fa-rotate"></i> Yeniden Analiz Et
              </button>
            }
          >
            <AIInsightsModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'iep':
        return (
          <ContentWrapper
            title="BEP / IEP Yönetimi"
            subtitle="Hedefler, kazanımlar ve müdahale programı."
          >
            <IEPModule student={currentStudent} onUpdate={(iep) => handleStudentUpdate({ iep })} />
          </ContentWrapper>
        );
      case 'financial':
        return (
          <ContentWrapper
            title="Finansal Kayıtlar"
            subtitle="Muhasebe, taksitler ve ödeme geçmişi."
          >
            <FinancialModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'attendance':
        return (
          <ContentWrapper title="Devam Takibi" subtitle="Ders katılımı ve mazeret kayıtları.">
            <AttendanceModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'academic':
        return (
          <ContentWrapper
            title="Akademik Gelişim"
            subtitle="Sınav sonuçları, beceri grafikleri ve ödev takibi."
          >
            <AcademicModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'portfolio':
        return (
          <ContentWrapper
            title="Dijital Portfolyo"
            subtitle="Öğrenciye ait materyal ve çalışma galerisi."
          >
            <PortfolioModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'behavior':
        return (
          <ContentWrapper
            title="Davranış & Sosyal Uyum"
            subtitle="Gözlem notları ve davranışsal gelişim takibi."
          >
            <BehaviorModule student={currentStudent} />
          </ContentWrapper>
        );
      case 'settings':
        return (
          <ContentWrapper
            title="Panel Özelleştirme"
            subtitle="Modül görünürlüğünü ve bildirimleri ayarlayın."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingsModule student={currentStudent} onUpdate={handleStudentUpdate} />

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">
                  Modül Yönetimi
                </h3>
                <div className="space-y-4">
                  {Object.entries(MODULE_ICONS).map(([key, icon]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <i className={`fa-solid ${icon} text-indigo-500`}></i>
                        <span className="font-bold text-sm capitalize">
                          {key.replace('_', ' ')}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={visibleModules.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleModules([...visibleModules, key]);
                          } else {
                            setVisibleModules(visibleModules.filter((m) => m !== key));
                          }
                        }}
                        className="w-5 h-5 accent-indigo-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ContentWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex bg-black font-['Lexend']">
      {/* 1. Global Navigation Rail (Mini) */}
      <div className="w-20 bg-black border-r border-zinc-800 flex flex-col items-center py-8 gap-8 shrink-0">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-900/40">
          O
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all group"
            title="Ana Menü"
          >
            <i className="fa-solid fa-house group-hover:scale-110 transition-transform"></i>
          </button>
          <button
            onClick={() => setActiveStudent(null)}
            className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all group"
            title="Öğrenci Değiştir"
          >
            <i className="fa-solid fa-users-rectangle group-hover:scale-110 transition-transform"></i>
          </button>
          <button
            className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-indigo-600 flex items-center justify-center transition-all group"
            title="Sistem Ayarları"
          >
            <i className="fa-solid fa-gear group-hover:rotate-45 transition-transform"></i>
          </button>
        </div>

        <button
          className="w-12 h-12 rounded-2xl bg-rose-900/20 text-rose-500 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all group"
          title="Çıkış"
        >
          <i className="fa-solid fa-power-off group-hover:scale-110 transition-transform"></i>
        </button>
      </div>

      {/* 2. Context Sidebar (Student & Modules) */}
      <ManagerSidebar
        activeModule={selectedModule}
        onSelectModule={setSelectedModule}
        student={currentStudent}
        visibleModules={visibleModules}
      />

      {/* 3. Main Content Area */}
      <div className="flex-1 min-w-0 bg-white dark:bg-black">{renderContent()}</div>
    </div>
  );
};
