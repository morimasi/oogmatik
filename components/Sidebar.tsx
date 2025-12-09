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

  // --- SMART PERSISTENCE ---
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

  // Memoize Filtered Categories for Performance
  const filteredCategories = useMemo(() => {
      const searchLower = localSearch.toLowerCase().trim();
      
      if (!searchLower) {
          return ACTIVITY_CATEGORIES.map(category => ({
              ...category,
              items: ACTIVITIES.filter(act => category.activities.includes(act.id))
          }));
      }

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

  // Auto-expand on search
  useEffect(() => {
      if (localSearch && filteredCategories.length > 0) {
          setOpenCategoryId(filteredCategories[0].id);
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
      className={`
        fixed inset-y-0 left-0 z-30 
        bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl
        border-r border-zinc-200 dark:border-zinc-800
        transition-all duration-300 cubic-bezier(0.25, 0.46, 0.45, 0.94)
        md:relative md:translate-x-0
        flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} 
        ${isExpanded ? 'w-[320px]' : 'w-[80px]'}
      `}
    >
        {/* HEADER AREA: SEARCH INTEGRATED */}
        <div className="flex-shrink-0 h-[64px] flex items-center justify-between px-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/30">
            {isExpanded ? (
                <div className="relative w-full group">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-xs"></i>
                    <input 
                        type="text" 
                        placeholder="Etkinlik ara..." 
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-8 bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    />
                    {localSearch && (
                        <button 
                            onClick={() => setLocalSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                            <i className="fa-solid fa-circle-xmark text-xs"></i>
                        </button>
                    )}
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <div className="w-9 h-9 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                </div>
            )}

            <button 
                onClick={closeSidebar} 
                className="md:hidden ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
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
                <nav className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar min-h-0">
                    {filteredCategories.map((category) => {
                        const isOpen = openCategoryId === category.id || !!localSearch;
                        
                        return (
                            <div key={category.id} className="mb-1">
                                <button
                                    onClick={() => {
                                        if (isExpanded) {
                                            setOpenCategoryId(openCategoryId === category.id ? null : category.id);
                                        }
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                        ${!isExpanded ? 'justify-center' : ''}
                                        ${isOpen && isExpanded ? 'bg-zinc-50 dark:bg-white/5' : 'hover:bg-zinc-50 dark:hover:bg-white/5'}
                                    `}
                                    title={!isExpanded ? category.title : undefined}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all shadow-sm shrink-0
                                        bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500
                                    `}>
                                        <i className={category.icon}></i>
                                    </div>

                                    {isExpanded && (
                                        <>
                                            <span className="flex-1 text-left text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">
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
                                    <div className="pl-[19px] ml-[15px] border-l-2 border-zinc-100 dark:border-zinc-800 space-y-0.5 py-1">
                                        {category.items.map(activity => (
                                            <button
                                                key={activity.id}
                                                onClick={() => {
                                                    onSelectActivity(activity.id);
                                                    if(window.innerWidth < 768) closeSidebar();
                                                }}
                                                className={`
                                                    group/item w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-2 relative
                                                    ${selectedActivity === activity.id 
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-indigo-500 pl-2' 
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 border-l-4 border-transparent'}
                                                `}
                                            >
                                                <span className="truncate">{activity.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12 px-4 opacity-50">
                            <i className="fa-solid fa-filter-circle-xmark text-2xl mb-2"></i>
                            <p className="text-xs font-medium">Sonuç bulunamadı.</p>
                        </div>
                    )}
                </nav>
            )}

            {/* FOOTER */}
            <div className={`p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm ${!isExpanded ? 'hidden' : ''}`}>
                 <div className="text-[9px] text-zinc-400 text-center font-bold uppercase tracking-widest opacity-60">
                     Bursa Disleksi AI v1.4
                 </div>
            </div>
        </div>
    </aside>
  );
};

export default Sidebar;