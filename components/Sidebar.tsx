
import React, { useState, useMemo } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, StudentProfile } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  selectedActivity: ActivityType | null;
  onSelectActivity: (id: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  onAddToHistory: (activityType: ActivityType, data: WorksheetData) => void;
  isExpanded?: boolean;
  onOpenStudentModal?: () => void;
  studentProfile?: StudentProfile | null;
}

const getActivityById = (id: ActivityType | null): Activity | undefined => {
    if (!id) return undefined;
    return ACTIVITIES.find(a => a.id === id);
}

const toPascalCase = (str: string): string => {
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  closeSidebar,
  selectedActivity,
  onSelectActivity,
  setWorksheetData,
  setIsLoading,
  setError,
  isLoading,
  onAddToHistory,
  isExpanded = true,
  onOpenStudentModal,
  studentProfile
}) => {
  const { user } = useAuth();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const categorizedActivities = useMemo(() => {
      return ACTIVITY_CATEGORIES.map(category => ({
          ...category,
          items: ACTIVITIES.filter(act => category.activities.includes(act.id))
      }));
  }, []);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    const pascalCaseName = toPascalCase(selectedActivity);
    const generatorFunctionName = `generate${pascalCaseName}FromAI`;
    const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;

    try {
        let result: WorksheetData;
        
        const runOfflineGenerator = async () => {
             const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
             if (offlineGenerator) {
                 return await offlineGenerator(options);
             } else {
                 throw new Error(`Hızlı mod için "${getActivityById(selectedActivity)?.title}" henüz desteklenmiyor.`);
             }
        };

        if (options.mode === 'ai') {
            const onlineGenerator = (generators as any)[generatorFunctionName];
            if (onlineGenerator) {
                try {
                    result = await onlineGenerator(options);
                } catch (err: any) {
                    // Hata yönetimi ve Fallback
                    console.warn("AI Service Error. Switching to Fast Mode.");
                    try {
                        result = await runOfflineGenerator();
                        setError("Bilgi: Yapay zeka servisine ulaşılamadığı için etkinlik 'Hızlı Mod' ile oluşturuldu.");
                    } catch (offlineErr: any) {
                        throw new Error("Etkinlik oluşturulamadı: " + offlineErr.message);
                    }
                }
            } else {
                result = await runOfflineGenerator();
            }
        } else { 
            result = await runOfflineGenerator();
        }
        
        if (result) {
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            
            statsService.incrementUsage(selectedActivity).catch(console.error);
            if (user) {
                const act = getActivityById(selectedActivity);
                authService.recordActivityGeneration(user.id, selectedActivity, act ? act.title : selectedActivity).catch(console.error);
            }
        }

    } catch (e: any) {
        console.error("Etkinlik oluşturulurken hata:", e);
        setError(e.message || "Beklenmeyen bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const currentActivity = getActivityById(selectedActivity);

  return (
    <aside
      id="tour-sidebar"
      className={`fixed inset-y-0 left-0 z-30 transform bg-[var(--bg-paper)] backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r border-[var(--border-color)] print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isExpanded ? 'w-80' : 'w-24'}`}
    >
        <div className="flex h-full flex-col overflow-hidden">
            {currentActivity ? (
                <GeneratorView 
                    activity={currentActivity}
                    onGenerate={handleGenerate}
                    onBack={() => onSelectActivity(null)}
                    isLoading={isLoading}
                    isExpanded={isExpanded}
                    onOpenStudentModal={onOpenStudentModal}
                    studentProfile={studentProfile}
                />
            ) : (
                <>
                    <div className="border-b p-4 border-[var(--border-color)] flex flex-col justify-between bg-inherit shrink-0 gap-3">
                        <div className="flex justify-between items-center h-[33px]">
                            <div className={`transition-opacity duration-300 ${!isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Etkinlikler</h2>
                            </div>
                            
                            {!isExpanded && (
                                <div className="w-full flex justify-center text-[var(--text-primary)]">
                                    <i className="fa-solid fa-layer-group text-xl"></i>
                                </div>
                            )}

                            <button onClick={closeSidebar} className="md:hidden text-[var(--text-muted)] hover:bg-[var(--bg-inset)] rounded-full w-8 h-8 flex items-center justify-center">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {categorizedActivities.map((category) => {
                            const isOpen = openCategoryId === category.id;
                            
                            return (
                                <div key={category.id} className="rounded-xl overflow-hidden transition-all duration-200">
                                    <button
                                        onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                        className={`w-full flex items-center p-3 text-left font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] transition-all focus:outline-none ${isOpen ? 'bg-[var(--bg-inset)] text-[var(--text-primary)]' : ''} ${!isExpanded ? 'justify-center' : 'justify-between'}`}
                                        title={!isExpanded ? category.title : undefined}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-[var(--accent-color)] text-black' : 'bg-transparent text-[var(--text-muted)]'}`}>
                                                <i className={`${category.icon} text-sm`}></i>
                                            </div>
                                            <span className={`whitespace-nowrap transition-opacity duration-300 font-bold text-sm ${!isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>{category.title}</span>
                                        </div>
                                        {isExpanded && (
                                            <i className={`fa-solid fa-chevron-down text-xs text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                                        )}
                                    </button>
                                    
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <ul className={`pl-4 pr-1 py-1 space-y-1 ${!isExpanded ? 'hidden' : ''}`}>
                                            {category.items.map(activity => (
                                                <li key={activity.id}>
                                                    <button
                                                        onClick={() => {
                                                            onSelectActivity(activity.id);
                                                            if(window.innerWidth < 768) closeSidebar();
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center group relative overflow-hidden ${
                                                            selectedActivity === activity.id 
                                                            ? 'bg-[var(--accent-color)] text-black shadow-md' 
                                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                                                        }`}
                                                    >
                                                        {selectedActivity === activity.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"></div>}
                                                        <i className={`fa-solid fa-circle text-[6px] mr-3 ${selectedActivity === activity.id ? 'text-black' : 'text-[var(--border-color)] group-hover:text-[var(--accent-color)]'}`}></i>
                                                        <span className="truncate">{activity.title}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
