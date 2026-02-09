
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService';
import { useStudent } from '../context/StudentContext';

const toPascalCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase()
              .split(/[-_ ]+/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
};

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
  onOpenOCR?: () => void;
  onOpenCurriculum?: () => void;
  onOpenReadingStudio?: () => void;
  onOpenMathStudio?: () => void;
}

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
  onOpenOCR,
  onOpenCurriculum,
  onOpenReadingStudio,
  onOpenMathStudio
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const { activeStudent } = useStudent();
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  useEffect(() => {
      const loadCustomActivities = async () => {
          try {
              const customActs = await adminService.getAllActivities();
              const activityMap = new Map<string, Activity>();
              ACTIVITIES.forEach(act => activityMap.set(act.id, act));
              if (customActs && Array.isArray(customActs)) {
                  customActs.forEach(ca => {
                      if (!ca || !ca.id) return;
                      if (activityMap.has(ca.id)) {
                          const existing = activityMap.get(ca.id)!;
                          activityMap.set(ca.id, { ...existing, ...ca } as Activity);
                      } else {
                          activityMap.set(ca.id, ca as unknown as Activity);
                      }
                  });
              }
              setAllActivities(Array.from(activityMap.values()));
          } catch (e) { console.error(e); }
      };
      loadCustomActivities();
  }, []);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    try {
        const pascalCaseName = toPascalCase(selectedActivity).replace(/\s+/g, '');
        const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;
        const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
        
        if (offlineGenerator) {
            const result = await offlineGenerator(options);
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            statsService.incrementUsage(selectedActivity).catch(console.error);
        } else {
            throw new Error("Üretici bulunamadı.");
        }
    } catch (e: any) { 
        setError(e.message || "İçerik üretilemedi."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({ 
          ...category, 
          items: allActivities.filter(act => act && act.id && category.activities.includes(act.id)) 
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} ${isExpanded ? 'w-[300px]' : 'w-[70px]'}`}>
        <div className="flex h-full flex-col">
            {selectedActivity ? (
                <GeneratorView 
                    activity={allActivities.find(a => a.id === selectedActivity)!} 
                    onGenerate={handleGenerate} 
                    onBack={() => onSelectActivity(null)} 
                    isLoading={isLoading} 
                    isExpanded={isExpanded} 
                />
            ) : (
                <>
                <div className="flex-shrink-0 h-[56px] flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                    {isExpanded ? (
                        <div className="relative w-full group animate-in fade-in duration-300">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-[10px]"></i>
                            <input type="text" placeholder="Etkinlik ara..." className="w-full h-8 pl-8 pr-2 bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-indigo-500 transition-all shadow-sm"/>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center"><div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center"><i className="fa-solid fa-layer-group text-sm"></i></div></div>
                    )}
                </div>

                {isExpanded && (
                    <div className="px-4 py-4 grid grid-cols-1 gap-2 shrink-0 border-b border-dashed border-zinc-200 dark:border-zinc-800/50 mb-2">
                        <button onClick={onOpenStudentModal} className="group w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 p-3 rounded-2xl transition-all flex items-center gap-4 shadow-lg shadow-indigo-500/20">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-user-graduate text-lg"></i>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Öğrencilerim</span>
                                <span className="text-[9px] text-indigo-100 mt-1">Yönetim ve Analiz Paneli</span>
                            </div>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button onClick={onOpenOCR} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-camera text-zinc-400 group-hover:text-indigo-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Tarayıcı</span>
                            </button>
                            <button onClick={onOpenCurriculum} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-calendar-check text-zinc-400 group-hover:text-emerald-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Planlama</span>
                            </button>
                            <button onClick={onOpenReadingStudio} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-book-open-reader text-zinc-400 group-hover:text-blue-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Okuma S.</span>
                            </button>
                            <button onClick={onOpenMathStudio} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-calculator text-zinc-400 group-hover:text-amber-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Matematik S.</span>
                            </button>
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar min-h-0 space-y-0.5">
                    {categorizedActivities.map((category) => {
                        const isOpen = openCategoryId === category.id;
                        return (
                            <div key={category.id}>
                                <button onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 group ${!isExpanded ? 'justify-center' : ''} ${isOpen && isExpanded ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-100 text-zinc-600'}`}>
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0"><i className={category.icon}></i></div>
                                    {isExpanded && <><span className="flex-1 text-left text-[11px] font-bold uppercase truncate">{category.title}</span><i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i></>}
                                </button>
                                {isExpanded && isOpen && (
                                    <div className="ml-2 pl-2 border-l border-zinc-200 dark:border-zinc-800 mt-1 space-y-0.5">
                                        {category.items.map(activity => (
                                            <button key={activity.id} onClick={() => onSelectActivity(activity.id)} className={`w-full text-left px-3 py-1 rounded-md text-[10px] font-medium transition-all ${selectedActivity === activity.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                                                {activity.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
