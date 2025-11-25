import React, { useState, useMemo } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';

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
  onAddToHistory
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

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
                    if (err.message && (err.message.includes('429') || err.message.includes('503') || err.message.includes('quota') || err.message.includes('kotası') || err.message.includes('fetch'))) {
                         console.warn("AI Quota exceeded or Network Error. Switching to Fast Mode automatically.");
                         try {
                             result = await runOfflineGenerator();
                             setError("Bilgi: Yapay zeka servisi şu an çok yoğun olduğu için etkinlik 'Hızlı Mod' ile oluşturuldu.");
                             setTimeout(() => setError(null), 5000);
                         } catch (offlineErr: any) {
                              throw new Error("Yapay zeka kotası dolu ve Hızlı Mod sırasında da bir hata oluştu: " + offlineErr.message);
                         }
                    } else {
                        throw err;
                    }
                }
            } else {
                console.warn("AI generator not found, trying offline.");
                result = await runOfflineGenerator();
            }
        } else { 
            result = await runOfflineGenerator();
        }
        
        if (result) {
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            // Fire and forget stats increment to not block UI
            statsService.incrementUsage(selectedActivity).catch(console.error);
        }

    } catch (e: any) {
        console.error("Etkinlik oluşturulurken hata:", e);
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            setError("API kotası aşıldı. Lütfen 'Hızlı Mod'u kullanın.");
        } else {
            setError(e.message || "Beklenmeyen bir hata oluştu.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const currentActivity = getActivityById(selectedActivity);

  // Optimization: Memoize categorization to avoid recalculation on every render
  const categorizedActivities = useMemo(() => {
      return ACTIVITY_CATEGORIES.map(category => ({
          ...category,
          items: ACTIVITIES.filter(act => category.activities.includes(act.id))
      }));
  }, []);

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
                                    className="w-full flex items-center justify-between p-3 text-left font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    aria-expanded={openCategoryId === category.id}
                                >
                                    <span>{category.title}</span>
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