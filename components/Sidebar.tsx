
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService'; // Import admin service for fetching custom activities

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
  onOpenOCR?: () => void;
  onOpenCurriculum?: () => void;
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
  styleSettings,
  onOpenOCR,
  onOpenCurriculum
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  
  // State to hold combined activities (Static + Dynamic)
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  // Load custom activities on mount
  useEffect(() => {
      const loadCustomActivities = async () => {
          try {
              const customActs = await adminService.getAllActivities(); // Should fetch from 'config_activities'
              
              // Filter out ones that are already in static list to avoid dupes if any
              const newCustoms = customActs.filter(ca => !ACTIVITIES.find(a => a.id === ca.id));
              
              if (newCustoms.length > 0) {
                  // Merge activities
                  setAllActivities([...ACTIVITIES, ...newCustoms]);
                  
                  // Update categories
                  const updatedCategories = ACTIVITY_CATEGORIES.map(cat => ({...cat})); // Shallow copy
                  
                  // Check if "Others" category exists, if not add it
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
                      if (targetCat) {
                          if (!targetCat.activities.includes(act.id)) {
                              targetCat.activities.push(act.id);
                          }
                      } else {
                           // If category doesn't exist, put in Others
                           otherCat!.activities.push(act.id);
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
      return allActivities.find(a => a.id === id);
  }

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    // Get current activity to check if it is custom
    const currentAct = getActivityById(selectedActivity);
    const isCustom = currentAct?.isCustom || (currentAct as any)?.promptId; // Check if custom

    try {
        let result: WorksheetData | null = null;
        
        // CUSTOM ACTIVITY LOGIC
        if (isCustom && (currentAct as any).promptId) {
             // For custom activities, we ALWAYS use AI generation via the stored prompt template
             const promptTemplate = await adminService.getPromptTemplate((currentAct as any).promptId);
             
             if (promptTemplate) {
                 // Prepare variables from options
                 const vars = {
                     worksheetCount: options.worksheetCount,
                     difficulty: options.difficulty,
                     topic: options.topic || 'Genel',
                     itemCount: options.itemCount
                 };
                 // Generate using the template
                 const aiResult = await adminService.testPrompt(promptTemplate, vars);
                 
                 if (Array.isArray(aiResult)) {
                     result = aiResult;
                 } else if (aiResult && (aiResult as any).data && Array.isArray((aiResult as any).data)) {
                     result = (aiResult as any).data;
                 } else {
                     // Fallback: wrap single object
                     result = [aiResult];
                 }
             } else {
                 throw new Error("Aktivite şablonu bulunamadı.");
             }

        } else {
            // STANDARD STATIC ACTIVITY LOGIC
            const pascalCaseName = toPascalCase(selectedActivity);
            const generatorFunctionName = `generate${pascalCaseName}FromAI`;
            const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;

            const runOfflineGenerator = async () => {
                 const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
                 if (offlineGenerator) {
                     return await offlineGenerator(options);
                 } else {
                     throw new Error(`Hızlı mod için "${currentAct?.title}" henüz desteklenmiyor.`);
                 }
            };

            if (options.mode === 'ai') {
                const onlineGenerator = (generators as any)[generatorFunctionName];
                if (onlineGenerator) {
                    try {
                        result = await onlineGenerator(options);
                    } catch (err: any) {
                        // Fallback logic...
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

  // Use state-based categories instead of constant
  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({
          ...category,
          items: allActivities.filter(act => category.activities.includes(act.id))
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  return (
    <aside
      id="tour-sidebar"
      className={`
        fixed inset-y-0 left-0 z-30 
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl
        border-r border-zinc-200 dark:border-zinc-800
        transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)
        md:relative md:translate-x-0
        flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} 
        ${isExpanded ? 'w-[300px]' : 'w-[70px]'}
      `}
      aria-label="Etkinlik Menüsü"
    >
        <div className="flex h-full flex-col">
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
                {/* HEADER AREA: SEARCH INTEGRATED */}
                <div className="flex-shrink-0 h-[56px] flex items-center justify-between px-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-800/30">
                    {isExpanded ? (
                        <div className="relative w-full group">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-[10px]"></i>
                            <input 
                                type="text" 
                                placeholder="Etkinlik ara..." 
                                className="w-full h-8 pl-8 pr-2 bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"
                            />
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-layer-group text-sm"></i>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={closeSidebar} 
                        className="md:hidden ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
                    >
                        <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* NEW TOOLS SECTION */}
                {isExpanded && (
                    <div className="px-3 py-2 grid grid-cols-2 gap-2 shrink-0 border-b border-dashed border-zinc-200 dark:border-zinc-800/50 mb-1">
                        {onOpenOCR && (
                            <button onClick={onOpenOCR} className="group relative overflow-hidden bg-white hover:bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    <i className="fa-solid fa-camera text-sm"></i>
                                </div>
                                <span className="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">OCR</span>
                            </button>
                        )}
                        {onOpenCurriculum && (
                            <button onClick={onOpenCurriculum} className="group relative overflow-hidden bg-white hover:bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    <i className="fa-solid fa-graduation-cap text-sm"></i>
                                </div>
                                <span className="text-[9px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Plan</span>
                            </button>
                        )}
                    </div>
                )}

                {/* CATEGORY LIST - COMPACT MODE */}
                <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar min-h-0 space-y-0.5">
                    {categorizedActivities.map((category) => {
                        const isOpen = openCategoryId === category.id;
                        
                        return (
                            <div key={category.id}>
                                <button
                                    onClick={() => {
                                        if (isExpanded) {
                                            setOpenCategoryId(openCategoryId === category.id ? null : category.id);
                                        }
                                    }}
                                    className={`
                                        w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 group
                                        ${!isExpanded ? 'justify-center' : ''}
                                        ${isOpen && isExpanded 
                                            ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900' 
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}
                                    `}
                                    title={!isExpanded ? category.title : undefined}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition-all shrink-0
                                        ${isOpen && isExpanded 
                                            ? 'text-white dark:text-black' 
                                            : 'text-zinc-500 dark:text-zinc-500'}
                                    `}>
                                        <i className={category.icon}></i>
                                    </div>

                                    {isExpanded && (
                                        <>
                                            <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-tight truncate">
                                                {category.title}
                                            </span>
                                            <i className={`fa-solid fa-chevron-down text-[8px] opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                                        </>
                                    )}
                                </button>
                                
                                {/* Sub-items (Activities) */}
                                {isExpanded && isOpen && (
                                    <div className="overflow-hidden animate-in slide-in-from-left-1 duration-200">
                                        <div className="pl-3 ml-[11px] border-l border-zinc-200 dark:border-zinc-800 mt-0.5 space-y-0.5">
                                            {category.items.map(activity => (
                                                <button
                                                    key={activity.id}
                                                    onClick={() => {
                                                        onSelectActivity(activity.id);
                                                        if(window.innerWidth < 768) closeSidebar();
                                                    }}
                                                    className={`
                                                        w-full text-left px-3 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1.5 relative
                                                        ${selectedActivity === activity.id 
                                                            ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 font-bold' 
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}
                                                    `}
                                                >
                                                    <span className={`w-1 h-1 rounded-full ${selectedActivity === activity.id ? 'bg-indigo-500' : 'bg-transparent border border-zinc-300'}`}></span>
                                                    <span className="truncate">{activity.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                </nav>

                {/* FOOTER */}
                <div className={`p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm ${!isExpanded ? 'hidden' : ''}`}>
                     <div className="flex items-center justify-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
                         <i className="fa-solid fa-robot text-indigo-500 text-xs"></i>
                         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">v2.1</span>
                     </div>
                </div>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
