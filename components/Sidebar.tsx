
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
  onOpenScreening?: () => void; // Added Prop
  activeCurriculumSession?: ActiveCurriculumSession | null;
}

const ToolIcon = ({ icon, label, onClick, color, isExpanded }: any) => (
    <button 
        onClick={onClick}
        className="group flex flex-col items-center gap-1.5 transition-all outline-none"
        title={label}
    >
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base shadow-sm transition-all group-hover:scale-110 group-hover:-rotate-6 border border-white/10 ${color}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        {isExpanded && <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{label}</span>}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen, closeSidebar, selectedActivity, onSelectActivity, setWorksheetData, setIsLoading, setError, isLoading, onAddToHistory, isExpanded = true,
  onOpenOCR, onOpenCurriculum, onOpenReadingStudio, onOpenMathStudio, onOpenScreening, activeCurriculumSession
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  useEffect(() => {
      const loadDynamicResources = async () => {
          try {
              const dynamicActs = await adminService.getAllActivities();
              const mergedActivities = [...ACTIVITIES];
              dynamicActs.forEach(da => {
                  if(!mergedActivities.find(ex => ex.id === da.id)) {
                      mergedActivities.push({
                          id: da.id as any, title: da.title, description: da.description,
                          icon: da.icon, defaultStyle: { columns: 1 }
                      });
                  }
              });
              setAllActivities(mergedActivities);
              setCategories(prev => prev.map(cat => ({
                  ...cat,
                  activities: [...new Set([...cat.activities, ...dynamicActs.filter(da => da.category === cat.id).map(da => da.id as any)])]
              })));
          } catch (e) { console.error("Dinamik kaynaklar yüklenemedi"); }
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
                result = await generators.generateFromRichPrompt(selectedActivity, dynamicAct.engineConfig.baseBlueprint, options);
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
            } else { result = await runOfflineGenerator(); }
        }
        if (result) {
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            statsService.incrementUsage(selectedActivity).catch(console.error);
        }
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };

  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({ 
          ...category, 
          items: allActivities.filter(act => category.activities.includes(act.id)) 
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 bg-white/95 dark:bg-[#0d0d0f]/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} ${isExpanded ? 'w-[260px]' : 'w-[75px]'}`}>
        <div className="flex h-full flex-col overflow-hidden">
            {selectedActivity ? (
                <GeneratorView 
                    activity={allActivities.find(a => a.id === selectedActivity)!} 
                    onGenerate={handleGenerate} 
                    onBack={() => onSelectActivity(null)} 
                    isLoading={isLoading} 
                    activeCurriculumSession={activeCurriculumSession}
                />
            ) : (
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 custom-scrollbar">
                    
                    {/* TOP TOOLS - COMPACT ICON STRIP */}
                    <div className="flex flex-col">
                        {isExpanded && <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 ml-2">Stüdyolar</span>}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 px-1">
                            <ToolIcon icon="fa-camera-viewfinder" label="Klon" onClick={onOpenOCR} color="bg-indigo-500 text-white" isExpanded={isExpanded} />
                            <ToolIcon icon="fa-calendar-check" label="Plan" onClick={onOpenCurriculum} color="bg-emerald-500 text-white" isExpanded={isExpanded} />
                            <ToolIcon icon="fa-book-open" label="Oku" onClick={onOpenReadingStudio} color="bg-rose-500 text-white" isExpanded={isExpanded} />
                            <ToolIcon icon="fa-calculator" label="Mat" onClick={onOpenMathStudio} color="bg-blue-500 text-white" isExpanded={isExpanded} />
                            <ToolIcon icon="fa-clipboard-question" label="Tarama" onClick={onOpenScreening} color="bg-purple-500 text-white" isExpanded={isExpanded} />
                        </div>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 mx-2"></div>

                    {/* CATEGORIES - MINIMAL ACCORDIONS */}
                    <div className="space-y-1">
                        {isExpanded && <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block ml-2">Etkinlikler</span>}
                        {categorizedActivities.map((category) => {
                            const isOpen = openCategoryId === category.id;
                            const colors: any = {
                                'visual-perception': 'text-violet-500 bg-violet-50',
                                'reading-verbal': 'text-teal-500 bg-teal-50',
                                'math-logic': 'text-amber-500 bg-amber-50'
                            };
                            return (
                                <div key={category.id} className="relative">
                                    <button 
                                        onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)} 
                                        className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-300 group ${isOpen && isExpanded ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${isOpen && isExpanded ? 'bg-white/10' : (colors[category.id] || 'bg-zinc-100')}`}>
                                            <i className={category.icon}></i>
                                        </div>
                                        {isExpanded && (
                                            <>
                                                <span className="flex-1 text-left text-[11px] font-black uppercase tracking-tight truncate">{category.title}</span>
                                                <i className={`fa-solid fa-chevron-right text-[8px] opacity-20 transition-transform ${isOpen ? 'rotate-90' : ''}`}></i>
                                            </>
                                        )}
                                    </button>
                                    {isExpanded && isOpen && (
                                        <div className="ml-6 pl-4 mt-1 space-y-1 border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left-1 duration-300">
                                            {category.items.map(activity => (
                                                <button 
                                                    key={activity.id} 
                                                    onClick={() => onSelectActivity(activity.id)} 
                                                    className={`w-full text-left py-2 px-2 rounded-lg text-[10px] font-bold transition-all ${selectedActivity === activity.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                                                >
                                                    {activity.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
