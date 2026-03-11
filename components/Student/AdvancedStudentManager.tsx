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

// Icons mapping for sub-modules
const MODULE_ICONS = {
    overview: 'fa-chart-pie',
    iep: 'fa-hands-holding-child',
    financial: 'fa-wallet',
    attendance: 'fa-calendar-days',
    grades: 'fa-graduation-cap',
    portfolio: 'fa-briefcase',
    behavior: 'fa-scale-balanced',
    settings: 'fa-sliders'
};

// Sidebar Navigation Component
const ManagerSidebar: React.FC<{
    activeModule: string;
    onSelectModule: (m: string) => void;
    student: AdvancedStudent;
}> = ({ activeModule, onSelectModule, student }) => (
    <div className="w-64 bg-zinc-900 text-zinc-400 flex flex-col h-full border-r border-zinc-800">
        <div className="p-6 flex flex-col items-center border-b border-zinc-800/50">
            <div className="relative group cursor-pointer">
                <img 
                    src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                    alt={student.name} 
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-zinc-800 group-hover:border-zinc-700 transition-colors" 
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs border-4 border-zinc-900">
                    <i className="fa-solid fa-check"></i>
                </div>
            </div>
            <h3 className="mt-4 font-black text-white text-lg text-center leading-tight">{student.name}</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-zinc-500">{student.grade || 'Öğrenci'}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {Object.entries(MODULE_ICONS).map(([key, icon]) => (
                <button
                    key={key}
                    onClick={() => onSelectModule(key)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeModule === key 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                        : 'hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                >
                    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
                    <span>
                        {key === 'iep' ? 'BEP / IEP' : 
                         key === 'financial' ? 'Finans' : 
                         key === 'attendance' ? 'Yoklama' : 
                         key === 'grades' ? 'Akademik' : 
                         key === 'behavior' ? 'Davranış' : 
                         key === 'overview' ? 'Özet' : 
                         key === 'portfolio' ? 'Portfolyo' : 'Ayarlar'}
                    </span>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
            <div className="bg-zinc-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">BEP İlerlemesi</span>
                    <span className="text-xs font-black text-emerald-400">
                        %{Math.round(student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) / (student.iep?.goals?.length || 1)) || 0}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${Math.round(student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) / (student.iep?.goals?.length || 1)) || 0}%` }}
                    ></div>
                </div>
            </div>
        </div>
    </div>
);

// Content Wrapper with Bento Grid Layout Support
const ContentWrapper: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, subtitle, children, actions }) => (
    <div className="flex-1 h-full flex flex-col bg-zinc-50 dark:bg-black overflow-hidden">
        <div className="shrink-0 px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-zinc-500 font-medium mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
        </div>
    </div>
);

// Main Manager Component
export const AdvancedStudentManager: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { activeStudent, students, setActiveStudent } = useStudent();
    const [selectedModule, setSelectedModule] = useState('overview');
    
    // Fallback if no student is active
    // We cast it to AdvancedStudent but in a real app we should ensure data exists
    const baseStudent = activeStudent;
    
    // Mock data extension to prevent crashes if fields are missing
    const currentStudent: AdvancedStudent = baseStudent ? {
        ...baseStudent,
        iep: (baseStudent as any).iep || { goals: [], status: 'draft' },
        financial: (baseStudent as any).financial || { balance: 0, transactions: [] },
        attendance: (baseStudent as any).attendance || { stats: { attendanceRate: 0 } },
        academic: (baseStudent as any).academic || { metrics: { gpa: 0 } },
        behavior: (baseStudent as any).behavior || { score: 100, incidents: [] },
        portfolio: (baseStudent as any).portfolio || [],
        aiProfile: (baseStudent as any).aiProfile || {}
    } as AdvancedStudent : null as any;

    if (!currentStudent) return (
        <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-black overflow-y-auto">
             <div className="p-4">
                 <button onClick={onBack} className="mb-4 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                     <i className="fa-solid fa-arrow-left"></i> Ana Menüye Dön
                 </button>
                 <StudentSelector />
             </div>
        </div>
    );

    const handleStudentUpdate = (updates: any) => {
        if (!activeStudent) return;
        
        // Update local state first for immediate UI feedback
        const updatedStudent = { ...currentStudent, ...updates };
        setActiveStudent(updatedStudent);
        
        // In a real app, you would also call an API here
        console.log('Student updated:', updatedStudent);
    };

    const renderContent = () => {
        switch (selectedModule) {
            case 'overview':
                return (
                    <ContentWrapper 
                        title="Genel Bakış" 
                        subtitle="Öğrencinin son durum özeti ve kritik metrikler."
                        actions={<button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform">Rapor Al</button>}
                    >
                        <OverviewModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'iep':
                return (
                    <ContentWrapper 
                        title="Bireyselleştirilmiş Eğitim Programı" 
                        subtitle="Özel öğrenme hedefleri ve ilerleme takibi."
                    >
                        <IEPModule student={currentStudent} onUpdate={(iep) => handleStudentUpdate({ iep })} />
                    </ContentWrapper>
                );
            case 'financial':
                return (
                    <ContentWrapper 
                        title="Finansal Durum" 
                        subtitle="Ödemeler, burslar ve harcamalar."
                    >
                        <FinancialModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'attendance':
                return (
                    <ContentWrapper 
                        title="Yoklama ve Devam" 
                        subtitle="Aylık katılım takvimi ve istatistikler."
                    >
                        <AttendanceModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'grades':
                return (
                    <ContentWrapper 
                        title="Akademik Başarı" 
                        subtitle="Ders notları, sınavlar ve gelişim grafikleri."
                    >
                        <AcademicModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'portfolio':
                return (
                    <ContentWrapper 
                        title="Portfolyo" 
                        subtitle="Öğrenci çalışmaları ve medya galerisi."
                    >
                        <PortfolioModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'behavior':
                return (
                    <ContentWrapper 
                        title="Davranış Takibi" 
                        subtitle="Olumlu davranışlar ve olay kayıtları."
                    >
                        <BehaviorModule student={currentStudent} />
                    </ContentWrapper>
                );
            case 'settings':
                return (
                    <ContentWrapper 
                        title="Öğrenci Ayarları" 
                        subtitle="Profil, bildirim ve modül yapılandırması."
                    >
                        <SettingsModule student={currentStudent} onUpdate={handleStudentUpdate} />
                    </ContentWrapper>
                );
            default:
                return (
                    <ContentWrapper title="Ayarlar" subtitle="Modül yapılandırması.">
                         <div className="flex flex-col items-center justify-center h-96 text-zinc-400 border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                            <i className="fa-solid fa-sliders text-6xl mb-4 opacity-20"></i>
                            <p className="font-bold">Ayarlar</p>
                        </div>
                    </ContentWrapper>
                );
        }
    };

    return (
        <div className="w-full h-full flex bg-black font-['Lexend']">
            {/* 1. Global Navigation Rail (Mini) */}
            <div className="w-20 bg-black border-r border-zinc-800 flex flex-col items-center py-8 gap-8 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">O</div>
                <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all" title="Ana Menü">
                    <i className="fa-solid fa-grid-2"></i>
                </button>
                <button onClick={() => setActiveStudent(null)} className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all" title="Öğrenci Değiştir">
                    <i className="fa-solid fa-users-rectangle"></i>
                </button>
                <button className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all" title="Bildirimler">
                    <div className="relative">
                        <i className="fa-solid fa-bell"></i>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></div>
                    </div>
                </button>
            </div>

            {/* 2. Context Sidebar (Student & Modules) */}
            <ManagerSidebar 
                activeModule={selectedModule} 
                onSelectModule={setSelectedModule} 
                student={currentStudent} 
            />

            {/* 3. Main Content Area */}
            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>
        </div>
    );
};
