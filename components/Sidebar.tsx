// @ts-nocheck
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

const StudioMenuItem = ({ icon, label, onClick, color, isExpanded }: any) => (
    <button
        onClick={onClick}
        className={`w-full group flex items-center ${isExpanded ? 'px-3 gap-3' : 'justify-center px-2'} py-2 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700/50 relative`}
    >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md ${color} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <i className={`fa-solid ${icon} text-white`}></i>
        </div>
        
        {isExpanded && (
            <span className="flex-1 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {label}
            </span>
        )}
        
        {isExpanded && (
            <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300 dark:text-zinc-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></i>
        )}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen, closeSidebar, selectedActivity, onSelectActivity, setWorksheetData, setIsLoading, setError, isLoading, onAddToHistory, isExpanded = true,
    onOpenOCR, onOpenCurriculum, onOpenReadingStudio, onOpenMathStudio, onOpenScreening, activeCurriculumSession
}) => {
    const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
    const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
    const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

    // Boyutlandırma State'leri
    const [sidebarWidth, setSidebarWidth] = useState(420);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const loadDynamicResources = async () => {
            try {
                const dynamicActs = await adminService.getAllActivities();
                const mergedActivities = [...ACTIVITIES];
                dynamicActs.forEach(da => {
                    if (!mergedActivities.find(ex => ex.id === da.id)) {
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

    // Resize Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 280) newWidth = 280;
            if (newWidth > 650) newWidth = 650;
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

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

    const selectedActivityData = useMemo(() =>
        selectedActivity ? allActivities.find(a => a.id === selectedActivity) : null
        , [selectedActivity, allActivities]);

    return (
        <aside
            style={{ width: isExpanded ? `${sidebarWidth}px` : '85px' }}
            className={`fixed inset-y-0 left-0 z-30 bg-zinc-50/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-r border-zinc-200/50 dark:border-zinc-800/50 transition-all ${isResizing ? '' : 'duration-700 cubic-bezier(0.4, 0, 0.2, 1)'} flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
        >
            {/* Resizing Handle */}
            {isExpanded && (
                <div
                    onMouseDown={() => setIsResizing(true)}
                    className={`absolute -right-0.5 top-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-indigo-500/40 transition-colors group ${isResizing ? 'bg-indigo-500/60 w-2' : ''}`}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100" />
                </div>
            )}

            <div className="flex h-full flex-col overflow-hidden">
                {selectedActivity ? (
                    selectedActivityData ? (
                        <GeneratorView
                            activity={selectedActivityData}
                            onGenerate={handleGenerate}
                            onBack={() => onSelectActivity(null)}
                            isLoading={isLoading}
                            activeCurriculumSession={activeCurriculumSession}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-900/50">
                            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500 mb-4"></i>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Etkinlik Yükleniyor...</p>
                        </div>
                    )
                ) : (
                    <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-10 custom-scrollbar scroll-smooth">

                        {/* STÜDYOLAR - PREMIUM LIST MENU */}
                        <div className="flex flex-col px-2">
                            {isExpanded && <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-2">Stüdyolar</span>}
                            <div className="space-y-1">
                                <StudioMenuItem icon="fa-camera-viewfinder" label="Klon (OCR)" onClick={onOpenOCR} color="bg-gradient-to-br from-indigo-500 to-indigo-700" isExpanded={isExpanded} />
                                <StudioMenuItem icon="fa-calendar-check" label="Plan & Müfredat" onClick={onOpenCurriculum} color="bg-gradient-to-br from-emerald-500 to-emerald-700" isExpanded={isExpanded} />
                                <StudioMenuItem icon="fa-book-open" label="Okuma Stüdyosu" onClick={onOpenReadingStudio} color="bg-gradient-to-br from-rose-500 to-rose-700" isExpanded={isExpanded} />
                                <StudioMenuItem icon="fa-calculator" label="Matematik Stüdyosu" onClick={onOpenMathStudio} color="bg-gradient-to-br from-blue-500 to-blue-700" isExpanded={isExpanded} />
                                <StudioMenuItem icon="fa-clipboard-question" label="Tarama & Analiz" onClick={onOpenScreening} color="bg-gradient-to-br from-purple-500 to-purple-700" isExpanded={isExpanded} />
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mx-2 opacity-50"></div>

                        {/* ETKİNLİKLER - MODERN ACCORDIONS */}
                        <div className="space-y-2">
                            {isExpanded && <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em] mb-6 block ml-1">Akıllı Modüller</span>}
                            {categorizedActivities.map((category) => {
                                const isOpen = openCategoryId === category.id;
                                const colors: any = {
                                    'visual-perception': 'text-violet-500 bg-violet-500/10 border-violet-500/20',
                                    'reading-verbal': 'text-teal-500 bg-teal-500/10 border-teal-500/20',
                                    'math-logic': 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                };
                                return (
                                    <div key={category.id} className="relative mb-2">
                                        <button
                                            onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)}
                                            className={`w-full group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-500 relative ${isOpen && isExpanded ? 'bg-white dark:bg-zinc-800/60 shadow-xl shadow-indigo-500/5' : 'hover:bg-white/60 dark:hover:bg-zinc-800/40'}`}
                                        >
                                            {/* Aktif Belirteci (Glow Hattı) */}
                                            {isOpen && isExpanded && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}

                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-500 border ${colors[category.id] || 'bg-zinc-100 border-zinc-200'}`}>
                                                <i className={`${category.icon} ${isOpen ? 'scale-110' : 'scale-90 opacity-70'}`}></i>
                                            </div>
                                            {isExpanded && (
                                                <>
                                                    <span className={`flex-1 text-left text-[12px] font-bold tracking-tight transition-colors ${isOpen ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300'}`}>{category.title}</span>
                                                    <i className={`fa-solid fa-chevron-right text-[9px] opacity-30 transition-transform duration-500 ${isOpen ? 'rotate-90 text-indigo-500 opacity-100' : ''}`}></i>
                                                </>
                                            )}
                                        </button>

                                        {isExpanded && isOpen && (
                                            <div className="ml-8 pl-5 mt-2 space-y-1 pr-2 border-l-2 border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-left-2 fade-in duration-500">
                                                {category.items.map(activity => (
                                                    <button
                                                        key={activity.id}
                                                        onClick={() => onSelectActivity(activity.id)}
                                                        className={`w-full group flex items-center gap-2 text-left py-2.5 px-3 rounded-xl text-[11px] font-bold transition-all duration-300 relative ${selectedActivity === activity.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'}`}
                                                    >
                                                        {/* Küçük Nokta Göstergesi */}
                                                        {selectedActivity !== activity.id && <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-colors group-hover:bg-indigo-400" />}
                                                        <span className="flex-1 truncate">{activity.title}</span>
                                                        {selectedActivity === activity.id && <i className="fa-solid fa-check text-[8px] opacity-70"></i>}
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
