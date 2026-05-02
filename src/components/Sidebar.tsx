import { AppError } from '../utils/AppError';
// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActivityType,
  WorksheetData,
  Activity,
  GeneratorOptions,
  ActivityCategory,
  ActiveCurriculumSession,
} from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { activityService } from '../services/generators/ActivityService';
import { GeneratorMode } from '../services/generators/core/types';
import { adminService } from '../services/adminService';
import { useStudentStore } from '../store/useStudentStore';
import { logError } from '../utils/logger.js';
import './PremiumPopupStyles.css';

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
  onOpenSuperTurkce?: () => void;
  onOpenInfographicStudio?: () => void;
  onOpenActivityStudio?: () => void;
  onOpenScreening?: () => void;
  onOpenSinavStudyosu?: () => void;
  onOpenMatSinavStudyosu?: () => void;
  onOpenSariKitapStudio?: () => void;
  onOpenKelimeCumleStudio?: () => void;
  activeCurriculumSession?: ActiveCurriculumSession | null;
  width?: number;
  onWidthChange?: (width: number) => void;
}

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
  onOpenOCR,
  onOpenCurriculum,
  onOpenReadingStudio,
  onOpenMathStudio,
  onOpenScreening,
  onOpenSuperTurkce,
  onOpenInfographicStudio,
  onOpenActivityStudio,
  onOpenSinavStudyosu,
  onOpenMatSinavStudyosu,
  onOpenSariKitapStudio,
  onOpenKelimeCumleStudio,
  activeCurriculumSession,
}) => {
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [lockedCategory, setLockedCategory] = useState<string | null>(null);
  const [popupRect, setPopupRect] = useState<DOMRect | null>(null);
  
  const popupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const studioGroups = [
    {
      title: 'Değerlendirme & Plan',
      items: [
        {
          id: 'screening',
          label: 'Tarama & Analiz',
          icon: 'fa-clipboard-question',
          color: 'text-purple-500',
          onClick: onOpenScreening,
        },
        {
          id: 'curriculum',
          label: 'Plan & Müfredat',
          icon: 'fa-calendar-check',
          color: 'text-emerald-500',
          onClick: onOpenCurriculum,
        },
      ],
    },
    {
      title: 'Alan Stüdyoları',
      items: [
        {
          id: 'reading',
          label: 'Okuma Stüdyosu',
          icon: 'fa-book-open',
          color: 'text-rose-500',
          onClick: onOpenReadingStudio,
        },
        {
          id: 'math',
          label: 'Matematik Stüdyosu',
          icon: 'fa-calculator',
          color: 'text-blue-500',
          onClick: onOpenMathStudio,
        },
        {
          id: 'super-turkce',
          label: 'Süper Türkçe Stüdyosu',
          icon: 'fa-wand-magic-sparkles',
          color: 'text-teal-500',
          onClick: onOpenSuperTurkce,
        },
        {
          id: 'sinav-studyosu',
          label: 'Sınav Stüdyosu',
          icon: 'fa-clipboard-check',
          color: 'text-amber-500',
          onClick: onOpenSinavStudyosu,
        },
        {
          id: 'mat-sinav-studyosu',
          label: 'Matematik Sınav Stüdyosu',
          icon: 'fa-square-root-variable',
          color: 'text-blue-600',
          onClick: onOpenMatSinavStudyosu,
        },
      ],
    },
    {
      title: 'Yaratıcı Atölye',
      items: [
        {
          id: 'activity-studio',
          label: 'Ultra Etkinlik Stüdyosu',
          icon: 'fa-wand-sparkles',
          color: 'text-fuchsia-500',
          onClick: onOpenActivityStudio,
        },
        {
          id: 'infographic-studio',
          label: 'İnfografik Stüdyosu',
          icon: 'fa-chart-pie',
          color: 'text-violet-500',
          onClick: onOpenInfographicStudio,
        },
        {
          id: 'sari-kitap-studio',
          label: 'Hızlı Okuma Stüdyosu',
          icon: 'fa-book',
          color: 'text-yellow-500',
          onClick: onOpenSariKitapStudio,
        },
        {
          id: 'kelime-cumle-studio',
          label: 'Kelime-Cümle Stüdyosu',
          icon: 'fa-font',
          color: 'text-indigo-500',
          onClick: onOpenKelimeCumleStudio,
        },
      ],
    },
  ];

  const handleCategoryMouseEnter = (categoryId: string, event: React.MouseEvent) => {
    if (lockedCategory) return;
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();
    popupTimeoutRef.current = setTimeout(() => {
      setPopupRect(rect);
      setHoveredCategory(categoryId);
    }, 100);
  };

  const handleCategoryMouseLeave = () => {
    if (lockedCategory) return;
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 400);
  };

  const handleCategoryClick = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    if (lockedCategory === categoryId) {
      setLockedCategory(null);
      setHoveredCategory(null);
    } else {
      setPopupRect(rect);
      setLockedCategory(categoryId);
      setHoveredCategory(categoryId);
    }
  };

  const handleActivitySelect = (activityId: ActivityType) => {
    onSelectActivity(activityId);
    setLockedCategory(null);
    setHoveredCategory(null);
  };

  const handleStudioClick = (item: any) => {
    if (item.onClick) item.onClick();
    setLockedCategory(null);
    setHoveredCategory(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        (hoveredCategory || lockedCategory) &&
        !target.closest('.premium-popup-menu') &&
        !target.closest('.category-trigger-btn')
      ) {
        setLockedCategory(null);
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCategory, lockedCategory]);

  useEffect(() => {
    const loadDynamicResources = async () => {
      try {
        const dynamicActs = await adminService.getAllActivities();
        const mergedActivities = [...ACTIVITIES];
        dynamicActs.forEach((da) => {
          if (!mergedActivities.find((ex) => ex.id === da.id)) {
            mergedActivities.push({
              id: da.id as any,
              title: da.title,
              description: da.description,
              icon: da.icon,
              defaultStyle: { columns: 1 },
            });
          }
        });
        setAllActivities(mergedActivities);
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            activities: [
              ...new Set([
                ...cat.activities,
                ...dynamicActs.filter((da) => da.category === cat.id).map((da) => da.id as any),
              ]),
            ],
          }))
        );
      } catch (_e) {
        logError('Dinamik kaynaklar yüklenemedi');
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
        const dynamicAct = (await adminService.getAllActivities()).find(
          (a) => a.id === selectedActivity
        );
        if (dynamicAct?.engineConfig.baseBlueprint) {
          result = await generators.generateFromRichPrompt(
            selectedActivity,
            dynamicAct.engineConfig.baseBlueprint,
            options
          );
        }
      }
      if (!result) {
        const response = await activityService.generate(
          selectedActivity,
          options,
          options.mode === 'ai' ? GeneratorMode.AI : GeneratorMode.OFFLINE
        );
        result = response.data;
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
    return categories
      .map((category) => ({
        ...category,
        items: allActivities.filter((act) => category.activities.includes(act.id)),
      }))
      .filter((c) => c.items.length > 0);
  }, [allActivities, categories]);

  const selectedActivityData = useMemo(
    () => (selectedActivity ? allActivities.find((a) => a.id === selectedActivity) : null),
    [selectedActivity, allActivities]
  );

  const activeCategory = hoveredCategory || lockedCategory;

  return (
    <>
      <aside
        style={{ width: isSidebarOpen ? '250px' : (isExpanded ? '100%' : '76px') }}
        className={`fixed inset-y-0 left-0 z-[80] bg-[var(--bg-paper)] border-r border-[var(--border-color)] transition-all duration-500 ease-in-out flex flex-col h-full md:relative md:translate-x-0 font-['Lexend'] ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
      >
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)]">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--accent-color)] mb-4"></i>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">Hazırlanıyor</p>
              </div>
            )
          ) : (
            <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar space-y-8">
              {/* Studios Section */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] block ml-3 text-[var(--text-muted)] opacity-50">Merkezi Birimler</span>
                <button
                  onMouseEnter={(e) => handleCategoryMouseEnter('studios', e)}
                  onMouseLeave={handleCategoryMouseLeave}
                  onClick={(e) => handleCategoryClick('studios', e)}
                  className={`category-trigger-btn w-full group flex items-center ${isExpanded ? 'px-3 gap-3' : 'justify-center px-2'} py-3 rounded-2xl transition-all duration-300 border border-transparent ${activeCategory === 'studios' ? 'bg-[var(--accent-color)] text-white shadow-md shadow-indigo-500/20' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] hover:border-[var(--accent-color)]/30'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 ${activeCategory === 'studios' ? 'bg-white/20 text-white' : 'bg-[var(--accent-color)] text-white shadow-sm group-hover:scale-105'}`}>
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  {isExpanded && (
                    <div className="flex-1 flex flex-col items-start overflow-hidden">
                      <span className={`text-[11px] font-black transition-colors tracking-tight uppercase truncate ${activeCategory === 'studios' ? 'text-white' : 'text-[var(--text-primary)]'}`}>Stüdyolar</span>
                    </div>
                  )}
                  {isExpanded && activeCategory === 'studios' && <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              </div>

              {/* Categories Section */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] block ml-3 text-[var(--text-muted)] opacity-50">Aktivite Havuzu</span>
                <div className="space-y-2">
                  {categorizedActivities.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onMouseEnter={(e) => handleCategoryMouseEnter(category.id, e)}
                        onMouseLeave={handleCategoryMouseLeave}
                        onClick={(e) => handleCategoryClick(category.id, e)}
                        className={`category-trigger-btn w-full flex items-center ${isExpanded ? 'px-3 gap-3' : 'justify-center px-2'} py-3 rounded-2xl transition-all duration-300 border border-transparent ${isActive ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)]/30 shadow-sm' : 'hover:bg-[var(--bg-secondary)]'}`}
                      >
                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-300 bg-[var(--bg-paper)] border border-[var(--border-color)] ${isActive ? 'text-[var(--accent-color)] scale-105 shadow-md' : 'text-[var(--text-muted)] group-hover:bg-[var(--bg-paper)]'}`}>
                            <i className={category.icon}></i>
                         </div>
                         {isExpanded && (
                            <span className={`flex-1 text-left text-[11px] font-bold tracking-tight transition-colors uppercase ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                              {category.title}
                            </span>
                         )}
                         {isExpanded && <i className={`fa-solid fa-chevron-right text-[8px] transition-transform duration-300 ${isActive ? 'rotate-90 text-[var(--accent-color)]' : 'opacity-20'}`}></i>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </aside>

      {/* FLYOUT POPUPS PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeCategory && popupRect && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="premium-popup-menu fixed z-[1000] drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] font-['Lexend']"
              onMouseEnter={() => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }}
              onMouseLeave={handleCategoryMouseLeave}
              style={{ 
                top: Math.max(20, Math.min(window.innerHeight - 500, popupRect.top - 20)), 
                left: popupRect.left + (isExpanded ? 260 : 85) 
              }}
            >
              <div className="premium-popup-content min-w-[200px] max-w-[260px] overflow-hidden bg-[var(--bg-paper)]/90 backdrop-blur-3xl rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/5">
                 <div className="px-5 pt-5 pb-2">
                    <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">{activeCategory === 'studios' ? 'Merkezi Stüdyolar' : categorizedActivities.find(c => c.id === activeCategory)?.title}</h3>
                 </div>
                 
                 <div className="max-h-[65vh] overflow-y-auto custom-scrollbar px-3 pb-3 space-y-4">
                    {activeCategory === 'studios' ? (
                       studioGroups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-1">
                             <p className="px-3 text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest opacity-80 mb-2">{group.title}</p>
                             <div className="grid grid-cols-1 gap-0">
                                {group.items.map((item) => (
                                   <button key={item.id} onClick={() => handleStudioClick(item)} className="px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-colors group/item hover:bg-[var(--accent-color)]/10">
                                      <i className={`fa-solid ${item.icon} text-sm opacity-70 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all ${item.color}`}></i>
                                      <span className="text-[10px] font-bold uppercase tracking-tight text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)]">{item.label}</span>
                                   </button>
                                ))}
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="grid grid-cols-1 gap-0">
                          {categorizedActivities.find(c => c.id === activeCategory)?.items.map((act) => (
                             <button key={act.id} onClick={() => handleActivitySelect(act.id)} className="px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-colors group/item hover:bg-[var(--accent-color)]/10">
                                <i className={`fa-solid ${act.icon || 'fa-star'} text-sm text-[var(--accent-color)] opacity-70 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all`}></i>
                                <span className="text-[10px] font-bold uppercase tracking-tight text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)]">{act.title}</span>
                             </button>
                          ))}
                       </div>
                    )}
                 </div>
                 {lockedCategory && (
                    <div className="px-3 pb-4 pt-1 text-center">
                      <button onClick={() => { setLockedCategory(null); setHoveredCategory(null); }} className="text-[9px] font-black text-[var(--text-muted)] hover:text-rose-500 uppercase tracking-[0.2em] transition-colors">KAPAT</button>
                    </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Sidebar;
