
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory, ActiveCurriculumSession } from '../types';
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
  onOpenOCR?: () => void;
  onOpenCurriculum?: () => void;
  onOpenReadingStudio?: () => void;
  onOpenMathStudio?: () => void;
  activeCurriculumSession?: ActiveCurriculumSession | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen, closeSidebar, selectedActivity, onSelectActivity, setWorksheetData, setIsLoading, setError, isLoading, onAddToHistory, isExpanded = true,
  onOpenOCR, onOpenCurriculum, onOpenReadingStudio, onOpenMathStudio, activeCurriculumSession
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const { activeStudent } = useStudent();
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  useEffect(() => {
      const loadDynamicResources = async () => {
          try {
              const dynamicActs = await adminService.getAllActivities();
              if (dynamicActs.length === 0) return;

              // 1. Aktivite Listesini Güncelle
              const mappedActs: Activity[] = dynamicActs.map(da => ({
                  id: da.id as any,
                  title: da.title,
                  description: da.description,
                  icon: da.icon,
                  defaultStyle: { columns: 1 }
              }));

              setAllActivities(prev => [...prev, ...mappedActs]);

              // 2. Kategorileri Güncelle (Dinamik aktiviteleri ait oldukları yere ekle)
              setCategories(prev => prev.map(cat => ({
                  ...cat,
                  activities: [...cat.activities, ...dynamicActs.filter(da => da.category === cat.id).map(da => da.id as any)]
              })));

          } catch (e) {
              console.error("Dinamik kaynaklar yüklenemedi");
          }
      };
      loadDynamicResources();
  }, []);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    try {
        let result: WorksheetData | null = null;
        
        // Eğer seçilen aktivite bir dinamik (Studio) aktivitesiyse özel motoru çalıştır
        if (String(selectedActivity).startsWith('dyn_')) {
            const dynamicAct = (await adminService.getAllActivities()).find(a => a.id === selectedActivity);
            if (dynamicAct?.engineConfig.baseBlueprint) {
                // Dinamik üretim motoru (Creative Studio Engine)
                result = await generators.generateFromRichPrompt(
                    selectedActivity, 
                    dynamicAct.engineConfig.baseBlueprint, 
                    options
                );
            }
        }

        // Değilse standart akış (AI veya Offline)
        if (!result) {
            const pascalCaseName = toPascalCase(selectedActivity).replace(/\s+/g, '');
            const generatorFunctionName = `generate${pascalCaseName}FromAI`;
            const runOfflineGenerator = async () => {
                 const offlineGenerator = (offlineGenerators as any)[`generateOffline${pascalCaseName}`];
                 if (offlineGenerator) return await offlineGenerator(options);
                 throw new Error("Üretim motoru bulunamadı.");
            };

            if (options.mode === 'ai') {
                const onlineGenerator = (generators as any)[generatorFunctionName];
                result = onlineGenerator ? await onlineGenerator(options) : await runOfflineGenerator();
            } else {
                result = await runOfflineGenerator();
            }
        }

        if (result) {
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            statsService.incrementUsage(selectedActivity).catch(console.error);
        }
    } catch (e: any) { 
        setError(e.message); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({ 
          ...category, 
          items: allActivities.filter(act => category.activities.includes(act.id)) 
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} ${isExpanded ? 'w-[300px]' : 'w-[70px]'}`}>
        <div className="flex h-full flex-col">
            {selectedActivity ? (
                <GeneratorView 
                    activity={allActivities.find(a => a.id === selectedActivity)!} 
                    onGenerate={handleGenerate} 
                    onBack={() => onSelectActivity(null)} 
                    isLoading={isLoading} 
                    activeCurriculumSession={activeCurriculumSession}
                />
            ) : (
                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 custom-scrollbar">
                    {categorizedActivities.map((category) => {
                        const isOpen = openCategoryId === category.id;
                        return (
                            <div key={category.id}>
                                <button onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isOpen && isExpanded ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-100 text-zinc-600 dark:text-zinc-400'}`}>
                                    <i className={`${category.icon} w-5`}></i>
                                    {isExpanded && <span className="flex-1 text-left text-xs font-black uppercase truncate">{category.title}</span>}
                                </button>
                                {isExpanded && isOpen && (
                                    <div className="pl-6 mt-1 space-y-1">
                                        {category.items.map(activity => (
                                            <button key={activity.id} onClick={() => onSelectActivity(activity.id)} className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedActivity === activity.id ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                                                {activity.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            )}
        </div>
    </aside>
  );
};

/* Fix: Added missing default export */
export default Sidebar;
