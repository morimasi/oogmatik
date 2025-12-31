
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService';
import { useStudent } from '../context/StudentContext';

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
  onAddToHistory
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const { activeStudent } = useStudent();
  
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  useEffect(() => {
      const loadCustomActivities = async () => {
          try {
              const customActs = await adminService.getAllActivities();
              const newCustoms = customActs.filter(ca => !ACTIVITIES.find(a => a.id === ca.id));
              
              if (newCustoms.length > 0) {
                  // Fixed type compatibility by casting dynamic activity id
                  setAllActivities([...ACTIVITIES, ...newCustoms.map(ca => ({ ...ca, id: ca.id as ActivityType }))]);
                  const updatedCategories = ACTIVITY_CATEGORIES.map(cat => ({...cat}));
                  
                  let otherCat = updatedCategories.find(c => c.id === 'others');
                  if (!otherCat) {
                      otherCat = {
                          id: 'others',
                          title: 'Diğerleri (Özel)',
                          description: 'Sistem tarafından üretilen özel etkinlikler.',
                          icon: 'fa-solid fa-wand-magic-sparkles',
                          activities: []
                      };
                      updatedCategories.push(otherCat);
                  }

                  newCustoms.forEach(act => {
                      const targetCatId = act.category || 'others';
                      const targetCat = updatedCategories.find(c => c.id === targetCatId);
                      const actId = act.id as ActivityType;
                      if (targetCat) {
                          if (!targetCat.activities.includes(actId)) {
                              targetCat.activities.push(actId);
                          }
                      } else {
                           otherCat!.activities.push(actId);
                      }
                  });
                  setCategories(updatedCategories);
              }
          } catch (e) {
              console.error("Failed to load custom activities", e);
          }
      };
      loadCustomActivities();
  }, []);

  const getActivityById = (id: ActivityType | null): Activity | undefined => {
      if (!id) return undefined;
      return allActivities.find(a => a && a.id === id);
  }

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    // Personalize options with student context if available
    const enrichedOptions: GeneratorOptions = {
        ...options,
        studentContext: activeStudent || undefined
    };

    const currentAct = getActivityById(selectedActivity);
    const isCustom = currentAct?.isCustom || (currentAct as any)?.promptId;

    try {
        let result: WorksheetData;
        
        if (isCustom && (currentAct as any).promptId) {
             const promptTemplate = await adminService.getPromptTemplate((currentAct as any).promptId);
             
             if (promptTemplate) {
                 const vars = {
                     worksheetCount: enrichedOptions.worksheetCount,
                     difficulty: enrichedOptions.difficulty,
                     topic: enrichedOptions.topic || 'Genel',
                     itemCount: enrichedOptions.itemCount,
                     studentName: activeStudent?.name || 'Öğrenci',
                     diagnosis: activeStudent?.diagnosis?.join(', ') || 'Belirtilmemiş'
                 };
                 const aiResult = await adminService.testPrompt(promptTemplate, vars);
                 
                 if (Array.isArray(aiResult)) {
                     result = aiResult;
                 } else if (aiResult && (aiResult as any).data && Array.isArray((aiResult as any).data)) {
                     result = (aiResult as any).data;
                 } else {
                     result = [aiResult];
                 }
             } else {
                 throw new Error("Aktivite şablonu bulunamadı.");
             }

        } else {
            const pascalCaseName = toPascalCase(selectedActivity);
            const generatorFunctionName = `generate${pascalCaseName}FromAI`;
            const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;

            const runOfflineGenerator = async () => {
                 const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
                 if (offlineGenerator) {
                     return await offlineGenerator(enrichedOptions);
                 } else {
                     throw new Error(`Hızlı mod için "${currentAct?.title}" henüz desteklenmiyor.`);
                 }
            };

            if (enrichedOptions.mode === 'ai') {
                const onlineGenerator = (generators as any)[generatorFunctionName];
                if (onlineGenerator) {
                    try {
                        result = await onlineGenerator(enrichedOptions);
                    } catch (err: any) {
                        console.warn("AI generator failed, trying offline.", err);
                        result = await runOfflineGenerator();
                        setError("Bilgi: Yapay zeka servisi yanıt vermediği için Hızlı Mod kullanıldı.");
                    }
                } else {
                    result = await runOfflineGenerator();
                }
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
        console.error("Etkinlik oluşturulurken hata:", e);
        setError(e.message || "Beklenmeyen bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const currentActivity = getActivityById(selectedActivity);

  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({
          ...category,
          items: allActivities.filter(act => category.activities.includes(act.id))
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  return (
    <aside
      id="tour-sidebar"
      className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r border-zinc-200 dark:border-zinc-700 print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Etkinlik Menüsü"
    >
        <div className="flex h-full flex-col">
            {currentActivity ? (
                <GeneratorView 
                    activity={currentActivity}
                    onGenerate={handleGenerate}
                    onBack={() => onSelectActivity(null)}
                    isLoading={isLoading}
                />
            ) : (
                <>
                    <div className="border-b p-4 dark:border-zinc-700 flex justify-between items-center bg-inherit">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Etkinlikler</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Bir kategori ve etkinlik seçin</p>
                        </div>
                         <button
                            onClick={closeSidebar}
                            className="md:hidden text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Menüyü kapat"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2">
                        {categorizedActivities.map((category) => (
                            <div key={category.id} className="py-1">
                                <button
                                    onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                    className={`w-full flex items-center justify-between p-3 text-left font-semibold rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors focus:outline-none ${category.id === 'others' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-zinc-200'}`}
                                    aria-expanded={openCategoryId === category.id}
                                >
                                    <span className="flex items-center gap-2"><i className={category.icon}></i> {category.title}</span>
                                    <i className={`fa-solid fa-chevron-down text-sm text-zinc-400 transition-transform ${openCategoryId === category.id ? 'rotate-180' : ''}`}></i>
                                </button>
                                {openCategoryId === category.id && (
                                    <ul className="sidebar-activity-list mt-1 space-y-1 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-lg p-2 mx-2 shadow-inner border border-zinc-100 dark:border-zinc-700/50">
                                        {category.items.map(activity => (
                                            <li key={`${activity.id}-${activity.title}`}>
                                                <button
                                                    onClick={() => {
                                                        onSelectActivity(activity.id);
                                                        closeSidebar();
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md text-zinc-800 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedActivity === activity.id ? 'sidebar-activity-item-active' : ''}`}
                                                >
                                                    <i className={`${activity.icon} fa-fw mr-2 text-zinc-400 dark:text-zinc-500`}></i>
                                                    {activity.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
