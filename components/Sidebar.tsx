
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { cacheService } from '../services/cacheService';
import { paginationService } from '../services/paginationService';

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
  studentProfile?: any;
  styleSettings?: any;
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
  studentProfile,
  styleSettings
}) => {
  const { user } = useAuth();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  // --- SMART PERSISTENCE: Restore draft when activity is selected ---
  useEffect(() => {
      if (selectedActivity) {
          const restoreDraft = async () => {
              const draft = await cacheService.getDraft(selectedActivity);
              if (draft) {
                  setWorksheetData(draft);
              }
          };
          restoreDraft();
      }
  }, [selectedActivity, setWorksheetData]);

  // Memoize and Filter Categories based on Local Search
  const filteredCategories = useMemo(() => {
      const searchLower = localSearch.toLowerCase().trim();
      
      if (!searchLower) {
          return ACTIVITY_CATEGORIES.map(category => ({
              ...category,
              items: ACTIVITIES.filter(act => category.activities.includes(act.id))
          }));
      }

      // If searching, flatten the structure or keep categories that have matching items
      return ACTIVITY_CATEGORIES.map(category => {
          const matchingItems = ACTIVITIES.filter(act => 
              category.activities.includes(act.id) && 
              (act.title.toLowerCase().includes(searchLower) || act.description.toLowerCase().includes(searchLower))
          );
          return {
              ...category,
              items: matchingItems
          };
      }).filter(cat => cat.items.length > 0);
  }, [localSearch]);

  // Auto-expand categories if searching
  useEffect(() => {
      if (localSearch) {
          // If searching, maybe expand all? Or just let the user see the filtered list.
          // For now, let's auto-expand the first one if there are results
          if (filteredCategories.length > 0) {
              setOpenCategoryId(filteredCategories[0].id);
          }
      }
  }, [localSearch, filteredCategories.length]);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    const pascalCaseName = toPascalCase(selectedActivity);
    const generatorFunctionName = `generate${pascalCaseName}FromAI`;
    const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;

    const requestOptions = { ...options, seed: Math.random().toString(36).substring(7) };

    try {
        let result: WorksheetData | null = null;
        
        const runOfflineGenerator = async () => {
             // @ts-ignore
             const offlineGenerator = offlineGenerators[offlineGeneratorFunctionName];
             if (offlineGenerator) {
                 return await offlineGenerator(requestOptions);
             } else {
                 throw new Error(`Hızlı mod için "${getActivityById(selectedActivity)?.title}" henüz desteklenmiyor.`);
             }
        };

        if (options.mode === 'ai') {
            // @ts-ignore
            const onlineGenerator = generators[generatorFunctionName];
            
            if (onlineGenerator) {
                try {
                    const cacheKey = cacheService.generateKey(selectedActivity, requestOptions);
                    if (!result) {
                        result = await onlineGenerator(requestOptions);
                        if (result) {
                            await cacheService.set(cacheKey, result);
                        }
                    }
                } catch (err: any) {
                    console.warn("AI Service Error. Switching to Offline Mode.");
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
            if (Array.isArray(result) && result.length === 0) {
                 throw new Error("İçerik üretilemedi (Boş veri döndü).");
            }

            let finalResult = result;
            if (styleSettings?.smartPagination) {
                finalResult = paginationService.process(result, selectedActivity);
            }

            setWorksheetData(finalResult);
            onAddToHistory(selectedActivity, finalResult);
            cacheService.saveDraft(selectedActivity, finalResult);
            
            statsService.incrementUsage(selectedActivity).catch(console.error);
            if (user) {
                const act = getActivityById(selectedActivity);
                authService.recordActivityGeneration(user.id, selectedActivity, act ? act.title : selectedActivity).catch(console.error);
            }
        } else {
             throw new Error("İçerik üretimi başarısız oldu (Veri yok).");
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
      className={`
        fixed inset-y-0 left-0 z-30 
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl
        border-r border-zinc-200 dark:border-zinc-800
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        md:relative md:translate-x-0
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} 
        ${isExpanded ? 'w-[320px]' : 'w-[80px]'}
      `}
    >
        {/* HEADER AREA */}
        <div className="flex-shrink-0 h-[64px] flex items-center justify-between px-5 border-b border-zinc-200/50 dark:border-zinc-800/50">
            {isExpanded ? (
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 dark:shadow-none">
                        <i className="fa-solid fa-shapes text-sm"></i>
                    </div>
                    <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100 tracking-tight whitespace-nowrap">
                        Atölye
                    </span>
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <i className="fa-solid fa-shapes text-xl text-indigo-600"></i>
                </div>
            )}

            <button 
                onClick={closeSidebar} 
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
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
                <div className="flex flex-col h-full">
                    {/* SEARCH BAR (Only when Expanded) */}
                    {isExpanded && (
                        <div className="px-4 py-3 shrink-0">
                            <div className="relative group">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-xs"></i>
                                <input 
                                    type="text" 
                                    placeholder="Etkinlik ara..." 
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="w-full h-9 pl-9 pr-3 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 outline-none transition-all"
                                />
                                {localSearch && (
                                    <button 
                                        onClick={() => setLocalSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        <i className="fa-solid fa-circle-xmark text-xs"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CATEGORY LIST */}
                    <nav className="flex-1 overflow-y-auto px-3 pb-20 custom-scrollbar space-y-1 hover:space-y-1">
                        {filteredCategories.map((category) => {
                            const isOpen = openCategoryId === category.id || !!localSearch; // Auto open on search
                            const hasActiveItem = category.items.some(i => i.id === selectedActivity);

                            return (
                                <div key={category.id} className="group/cat">
                                    <button
                                        onClick={() => {
                                            if (isExpanded) {
                                                setOpenCategoryId(openCategoryId === category.id ? null : category.id);
                                            }
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200
                                            ${!isExpanded ? 'justify-center' : ''}
                                            ${isOpen && isExpanded ? 'bg-zinc-50 dark:bg-white/5' : 'hover:bg-zinc-50 dark:hover:bg-white/5'}
                                        `}
                                        title={!isExpanded ? category.title : undefined}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all shadow-sm
                                            ${hasActiveItem 
                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' 
                                                : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 group-hover/cat:border-zinc-300'}
                                        `}>
                                            <i className={category.icon}></i>
                                        </div>

                                        {isExpanded && (
                                            <>
                                                <span className="flex-1 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                    {category.title}
                                                </span>
                                                <i className={`fa-solid fa-chevron-down text-[10px] text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Sub-items (Activities) */}
                                    <div 
                                        className={`
                                            overflow-hidden transition-all duration-300 ease-in-out
                                            ${isOpen && isExpanded ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
                                        `}
                                    >
                                        <div className="pl-[14px] ml-[15px] border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 py-1">
                                            {category.items.map(activity => (
                                                <button
                                                    key={activity.id}
                                                    onClick={() => {
                                                        onSelectActivity(activity.id);
                                                        if(window.innerWidth < 768) closeSidebar();
                                                    }}
                                                    className={`
                                                        group/item w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-all flex items-center gap-2 relative
                                                        ${selectedActivity === activity.id 
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' 
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
                                                    `}
                                                >
                                                    {selectedActivity === activity.id && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full"></div>
                                                    )}
                                                    <span className="truncate">{activity.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Empty State for Search */}
                        {filteredCategories.length === 0 && (
                            <div className="text-center py-8 px-4">
                                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
                                    <i className="fa-solid fa-search"></i>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Sonuç bulunamadı.</p>
                            </div>
                        )}
                    </nav>
                </div>
            )}

            {/* FOOTER (Optional - User Context) */}
            <div className={`p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm ${!isExpanded ? 'hidden' : ''}`}>
                 <div className="text-[10px] text-zinc-400 text-center font-medium">
                     v1.3.0 • Bursa Disleksi AI
                 </div>
            </div>
        </div>
    </aside>
  );
};

export default Sidebar;
