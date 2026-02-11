
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

const SidebarToolButton = ({ icon, label, onClick, color, isExpanded }: any) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group"
  >
    <div className={`w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-600 group-hover:scale-110 transition-transform ${color}`}>
      <i className={`fa-solid ${icon} text-sm`}></i>
    </div>
    {isExpanded && <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">{label}</span>}
  </button>
);

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

              const mappedActs: Activity[] = dynamicActs.map(da => ({
                  id: da.id as any,
                  title: da.title,
                  description: da.description,
                  icon: da.icon,
                  defaultStyle: { columns: 1 }
              }));

              const mergedActivities = [...ACTIVITIES];
              mappedActs.forEach(ma => {
                  if(!mergedActivities.find(ex => ex.id === ma.id)) {
                      mergedActivities.push(ma);
                  }
              });
              setAllActivities(mergedActivities);

              setCategories(prev => prev.map(cat => ({
                  ...cat,
                  activities: [...new Set([...cat.activities, ...dynamicActs.filter(da => da.category === cat.id).map(da => da.id as any)])]
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
        
        if (String(selectedActivity).startsWith('dyn_')) {
            const dynamicAct = (await adminService.getAllActivities()).find(a => a.id === selectedActivity);
            if (dynamicAct?.engineConfig.baseBlueprint) {
                result = await generators.generateFromRichPrompt(
                    selectedActivity, 
                    dynamicAct.engineConfig.baseBlueprint, 
                    options
                );
            }
        }

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
                    
                    {/* STATİK AI ARAÇLARI */}
                    <div className="px-2 mb-6 space-y-1">
                        {isExpanded && <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-3">Akıllı Atölyeler</h4>}
                        <SidebarToolButton icon="fa-camera-viewfinder" label="Mimari Klonlayıcı" onClick={onOpenOCR} color="text-indigo-500" isExpanded={isExpanded} />
                        <SidebarToolButton icon="fa-calendar-check" label="Akıllı Müfredat" onClick={onOpenCurriculum} color="text-emerald-500" isExpanded={isExpanded} />
                        <SidebarToolButton icon="fa-book-open" label="Reading Studio" onClick={onOpenReadingStudio} color="text-rose-500" isExpanded={isExpanded} />
                        <SidebarToolButton icon="fa-calculator" label="Math Studio" onClick={onOpenMathStudio} color="text-blue-500" isExpanded={isExpanded} />
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-4 mb-4"></div>

                    {/* KATEGORİLER */}
                    {categorizedActivities.map((category) => {
                        const isOpen = openCategoryId === category.id;
                        return (
                            <div key={category.id}>
                                <button onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isOpen && isExpanded ? 'bg-zinc-800 text-white shadow-lg' : 'hover:bg-zinc-100 text-zinc-600 dark:text-zinc-400'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-transparent ${isOpen && isExpanded ? 'bg-white/10' : ''}`}>
                                        <i className={`${category.icon} text-sm`}></i>
                                    </div>
                                    {isExpanded && <span className="flex-1 text-left text-[11px] font-black uppercase truncate tracking-tight">{category.title}</span>}
                                    {isExpanded && <i className={`fa-solid fa-chevron-down text-[8px] opacity-30 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>}
                                </button>
                                {isExpanded && isOpen && (
                                    <div className="pl-12 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                        {category.items.map(activity => (
                                            <button key={activity.id} onClick={() => onSelectActivity(activity.id)} className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${selectedActivity === activity.id ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
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

export default Sidebar;
