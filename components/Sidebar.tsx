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
    const [isStudioMenuOpen, setIsStudioMenuOpen] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    
    // Hover popup state
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [popupTimeout, setPopupTimeout] = useState<NodeJS.Timeout | null>(null);
    const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

    const studioItems = [
        { id: 'ocr', label: 'Klon (OCR)', icon: 'fa-camera-viewfinder', color: 'bg-indigo-500', onClick: onOpenOCR },
        { id: 'curriculum', label: 'Plan & Müfredat', icon: 'fa-calendar-check', color: 'bg-emerald-500', onClick: onOpenCurriculum },
        { id: 'reading', label: 'Okuma Stüdyosu', icon: 'fa-book-open', color: 'bg-rose-500', onClick: onOpenReadingStudio },
        { id: 'math', label: 'Matematik Stüdyosu', icon: 'fa-calculator', color: 'bg-blue-500', onClick: onOpenMathStudio },
        { id: 'screening', label: 'Tarama & Analiz', icon: 'fa-clipboard-question', color: 'bg-purple-500', onClick: onOpenScreening },
    ];

    const handleStudioClick = (item: any) => {
        setSelectedStudio(item.id);
        setIsStudioMenuOpen(false);
        if (item.onClick) item.onClick();
    };

    // Hover popup handlers
    const handleCategoryMouseEnter = (categoryId: string) => {
        // Clear any existing timeouts
        if (popupTimeout) clearTimeout(popupTimeout);
        if (closeTimeout) clearTimeout(closeTimeout);
        
        // Set popup to show after 0-100ms delay
        const timeout = setTimeout(() => {
            setHoveredCategory(categoryId);
        }, Math.random() * 100); // Random delay between 0-100ms
        
        setPopupTimeout(timeout);
    };

    const handleCategoryMouseLeave = () => {
        // Clear popup timeout
        if (popupTimeout) clearTimeout(popupTimeout);
        
        // Set close timeout with 150ms delay
        const timeout = setTimeout(() => {
            setHoveredCategory(null);
        }, 150);
        
        setCloseTimeout(timeout);
    };

    const handlePopupMouseEnter = () => {
        // Clear close timeout when mouse enters popup
        if (closeTimeout) clearTimeout(closeTimeout);
    };

    const handlePopupMouseLeave = () => {
        // Set close timeout when mouse leaves popup
        const timeout = setTimeout(() => {
            setHoveredCategory(null);
        }, 150);
        
        setCloseTimeout(timeout);
    };

    const handleActivitySelect = (activityId: ActivityType) => {
        onSelectActivity(activityId);
        setHoveredCategory(null);
    };

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setHoveredCategory(null);
                if (closeTimeout) clearTimeout(closeTimeout);
                if (popupTimeout) clearTimeout(popupTimeout);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [closeTimeout, popupTimeout]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (popupTimeout) clearTimeout(popupTimeout);
            if (closeTimeout) clearTimeout(closeTimeout);
        };
    }, [popupTimeout, closeTimeout]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isStudioMenuOpen && !target.closest('.studio-menu-container') && !target.closest('.studio-trigger-btn')) {
                setIsStudioMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStudioMenuOpen]);


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

    // Resize Logic (Disabled for now as we use fixed width or simpler layout)
    /*
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
    */

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
        <>
            {/* STUDIO DRAWER / SIDE MENU */}
            <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isStudioMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsStudioMenuOpen(false)}
                />

                {/* Sliding Menu Panel */}
                <div className={`studio-menu-container absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 transform transition-transform duration-150 ease-out flex flex-col ${isStudioMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Stüdyolar</h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kreatif Araçlar</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsStudioMenuOpen(false)}
                            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {studioItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleStudioClick(item)}
                                className={`w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${selectedStudio === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-md transition-transform duration-300 group-hover:scale-110 ${item.color} text-white`}>
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-bold text-sm transition-colors ${selectedStudio === item.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                                        {item.label}
                                    </h3>
                                    <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${selectedStudio === item.id ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500'}`}>
                                        {selectedStudio === item.id ? 'Şu an Açık' : 'Stüdyoyu Aç'}
                                    </span>
                                </div>
                                <i className={`fa-solid fa-chevron-right text-xs transition-all duration-300 ${selectedStudio === item.id ? 'text-indigo-500 translate-x-0' : 'text-zinc-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}></i>
                            </button>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            Tüm stüdyolar yapay zeka destekli olarak çalışır.
                        </p>
                    </div>
                </div>
            </div>

            <aside
                style={{ width: isExpanded ? '320px' : '85px' }}
                className={`fixed inset-y-0 left-0 z-30 bg-zinc-50/80 dark:bg-[#09090b]/90 backdrop-blur-2xl border-r border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
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

                        {/* STÜDYOLAR - SINGLE BUTTON WITH DRAWER */}
                        <div className="flex flex-col px-2">
                            {isExpanded && <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-2">Stüdyolar</span>}
                            <button
                                onClick={() => setIsStudioMenuOpen(true)}
                                className={`studio-trigger-btn w-full group flex items-center ${isExpanded ? 'px-3 gap-3' : 'justify-center px-2'} py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 hover:shadow-lg border border-zinc-200 dark:border-zinc-700 relative overflow-hidden`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm transition-all duration-500 bg-indigo-600 text-white relative z-10`}>
                                    <i className="fa-solid fa-layer-group"></i>
                                </div>
                                
                                {isExpanded && (
                                    <div className="flex-1 flex flex-col items-start relative z-10">
                                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Stüdyolar</span>
                                        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Tüm Modüller</span>
                                    </div>
                                )}
                                
                                {isExpanded && (
                                    <i className="fa-solid fa-chevron-right text-[10px] text-zinc-400 relative z-10 transition-transform group-hover:translate-x-1"></i>
                                )}

                                {/* Hover Effect Background */}
                                <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mx-2 opacity-50"></div>

                        {/* ETKİNLİKLER - MODERN ACCORDIONS */}
                        <div className="space-y-2">
                            {isExpanded && <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em] mb-6 block ml-1">Akıllı Modüller</span>}
                            {categorizedActivities.map((category) => {
                                const isOpen = openCategoryId === category.id;
                                const isHovered = hoveredCategory === category.id;
                                const colors: any = {
                                    'visual-perception': 'text-violet-500 bg-violet-500/10 border-violet-500/20',
                                    'reading-verbal': 'text-teal-500 bg-teal-500/10 border-teal-500/20',
                                    'math-logic': 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                };
                                return (
                                    <div key={category.id} className="relative mb-2">
                                        <button
                                            onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)}
                                            onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                                            onMouseLeave={handleCategoryMouseLeave}
                                            className={`w-full group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-500 relative ${isOpen && isExpanded ? 'bg-white dark:bg-zinc-800/60 shadow-xl shadow-indigo-500/5' : 'hover:bg-white/60 dark:hover:bg-zinc-800/40'}`}
                                            aria-haspopup="true"
                                            aria-expanded={isHovered}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setHoveredCategory(category.id);
                                                }
                                            }}
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

                                        {/* PREMIUM HOVER POPUP MENU */}
                                        {isHovered && (
                                            <div
                                                className="absolute left-full top-0 ml-2 z-50 premium-popup-menu"
                                                onMouseEnter={handlePopupMouseEnter}
                                                onMouseLeave={handlePopupMouseLeave}
                                                style={{
                                                    minWidth: '280px',
                                                    maxWidth: '350px',
                                                    animation: 'slideInFade 0.3s ease-out'
                                                }}
                                            >
                                                {/* Popup Content */}
                                                <div className="premium-popup-content">
                                                    {/* Header */}
                                                    <div className="premium-popup-header">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colors[category.id]?.split(' ')[0] || 'bg-zinc-500'} text-white shadow-lg`}>
                                                            <i className={`${category.icon}`}></i>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="premium-popup-title">{category.title}</h3>
                                                            <p className="premium-popup-subtitle">{category.items.length} Etkinlik</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Activity List */}
                                                    <div className="premium-popup-activities" role="menu">
                                                        {category.items.map((activity, index) => (
                                                            <button
                                                                key={activity.id}
                                                                onClick={() => handleActivitySelect(activity.id)}
                                                                className="premium-popup-activity-item"
                                                                role="menuitem"
                                                                tabIndex={0}
                                                                style={{
                                                                    animationDelay: `${index * 50}ms`
                                                                }}
                                                            >
                                                                <div className="premium-popup-activity-icon">
                                                                    <i className={`${activity.icon || 'fa-star'} text-xs`}></i>
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <span className="premium-popup-activity-title">{activity.title}</span>
                                                                    {activity.description && (
                                                                        <span className="premium-popup-activity-desc">{activity.description}</span>
                                                                    )}
                                                                </div>
                                                                <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
        </>
    );
};

export default Sidebar;
