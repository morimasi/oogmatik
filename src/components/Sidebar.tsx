import { AppError } from '../utils/AppError';
// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const { _activeStudent } = useStudentStore();
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const popupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [popupRect, setPopupRect] = useState<DOMRect | null>(null);

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

  const handleStudioClick = (item: any) => {
    setSelectedStudio(item.id);
    if (item.onClick) item.onClick();
  };

  const handleCategoryMouseEnter = (categoryId: string, event: React.MouseEvent) => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();
    popupTimeoutRef.current = setTimeout(() => {
      setPopupRect(rect);
      setHoveredCategory(categoryId);
    }, 50);
  };

  const handleCategoryMouseLeave = () => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handlePopupMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handleActivitySelect = (activityId: ActivityType) => {
    onSelectActivity(activityId);
    setHoveredCategory(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHoveredCategory(null);
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        hoveredCategory &&
        !target.closest('.premium-popup-menu') &&
        !target.closest('.category-trigger-btn') &&
        !target.closest('.studio-trigger-btn')
      ) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredCategory]);

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

  return (
    <>
      <aside
        style={{ width: isExpanded ? '320px' : '85px' }}
        className={`fixed inset-y-0 left-0 z-[80] bg-[var(--bg-paper)] border-r border-[var(--border-color)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col h-full md:relative md:translate-x-0 font-['Lexend'] ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
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
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                  Hazırlanıyor
                </p>
              </div>
            )
          ) : (
            <nav className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar scroll-smooth space-y-8">
              <div>
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 block ml-3 text-[var(--text-muted)] opacity-50">
                  Akıllı Modüller
                </span>

                <div className="space-y-2">
                  <button
                    onMouseEnter={(e) => handleCategoryMouseEnter('studios', e)}
                    onMouseLeave={handleCategoryMouseLeave}
                    className={`studio-trigger-btn w-full group flex items-center ${isExpanded ? 'px-4 gap-4' : 'justify-center px-2'} py-3 rounded-[1.5rem] transition-all duration-500 bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 hover:shadow-xl relative overflow-hidden`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[var(--accent-color)] text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                      <i className="fa-solid fa-layer-group"></i>
                    </div>

                    {isExpanded && (
                      <div className="flex-1 flex flex-col items-start">
                        <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors tracking-tight uppercase">
                          Stüdyolar
                        </span>
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                          Tüm Modüller
                        </span>
                      </div>
                    )}

                    {isExpanded && (
                      <i className="fa-solid fa-chevron-right text-[10px] text-[var(--text-muted)] opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all"></i>
                    )}
                  </button>

                  {/* STUDIO POPUP PORTAL */}
                  {hoveredCategory === 'studios' && popupRect && createPortal(
                     <div
                        className="premium-popup-menu"
                        onMouseEnter={handlePopupMouseEnter}
                        onMouseLeave={handlePopupMouseLeave}
                        style={{ top: popupRect.top, left: popupRect.left + popupRect.width + 15 }}
                      >
                        <div className="premium-popup-content">
                           <div className="premium-popup-header">
                             <span className="premium-popup-title">Ekosistem Stüdyoları</span>
                           </div>
                           <div className="premium-popup-activities">
                              {studioGroups.map((group, gIdx) => (
                                <div key={gIdx} className="mb-4 last:mb-0">
                                   <p className="px-5 py-1 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">{group.title}</p>
                                   {group.items.map((item, iIdx) => (
                                      <button
                                        key={item.id}
                                        onClick={() => { handleStudioClick(item); setHoveredCategory(null); }}
                                        className={`premium-popup-activity-item ${selectedStudio === item.id ? 'active' : ''}`}
                                      >
                                        <div className={`premium-popup-activity-icon ${item.color}`}>
                                          <i className={`fa-solid ${item.icon}`}></i>
                                        </div>
                                        <span className="premium-popup-activity-title">{item.label}</span>
                                      </button>
                                   ))}
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>,
                      document.body
                  )}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 block ml-3 text-[var(--text-muted)] opacity-50">
                  Etkinlik Havuzu
                </span>

                <div className="space-y-2">
                  {categorizedActivities.map((category) => {
                    const isOpen = openCategoryId === category.id;
                    const isHovered = hoveredCategory === category.id;
                    const colors: any = {
                      'visual-perception': 'text-violet-500 bg-violet-500/10 border-violet-500/20',
                      'reading-verbal': 'text-teal-500 bg-teal-500/10 border-teal-500/20',
                      'math-logic': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                    };

                    return (
                      <div key={category.id} className="relative group/cat">
                        <button
                          onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)}
                          onMouseEnter={(e) => handleCategoryMouseEnter(category.id, e)}
                          onMouseLeave={handleCategoryMouseLeave}
                          className={`category-trigger-btn w-full flex items-center gap-4 px-4 py-3 rounded-[1.5rem] transition-all duration-500 relative ${isOpen && isExpanded ? 'bg-[var(--bg-secondary)] border-[var(--accent-color)]/30 shadow-lg' : 'hover:bg-[var(--bg-secondary)] border border-transparent'}`}
                        >
                          {isOpen && isExpanded && (
                            <div className="absolute left-1.5 top-3 bottom-3 w-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_12px_var(--accent-color)]" />
                          )}

                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border transition-all duration-500 ${colors[category.id] || 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}>
                            <i className={`${category.icon} ${isOpen ? 'scale-110' : 'scale-90 opacity-70'}`}></i>
                          </div>

                          {isExpanded && (
                            <>
                              <span className={`flex-1 text-left text-xs font-black tracking-tight transition-colors uppercase ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                {category.title}
                              </span>
                              <i className={`fa-solid fa-chevron-right text-[9px] transition-transform duration-500 ${isOpen ? 'rotate-90 text-[var(--accent-color)]' : 'opacity-30'}`}></i>
                            </>
                          )}
                        </button>

                        {/* CATEGORY POPUP PORTAL */}
                        {isHovered && !isOpen && popupRect && createPortal(
                          <div
                            className="premium-popup-menu"
                            onMouseEnter={handlePopupMouseEnter}
                            onMouseLeave={handlePopupMouseLeave}
                            style={{ top: popupRect.top, left: popupRect.left + popupRect.width + 15 }}
                          >
                             <div className="premium-popup-content">
                                <div className="premium-popup-header">
                                  <span className="premium-popup-title">{category.title}</span>
                                </div>
                                <div className="premium-popup-activities">
                                   {category.items.map((act, iIdx) => (
                                      <button key={act.id} onClick={() => handleActivitySelect(act.id)} className="premium-popup-activity-item">
                                         <div className="premium-popup-activity-icon"><i className={act.icon || 'fa-star'}></i></div>
                                         <span className="premium-popup-activity-title">{act.title}</span>
                                      </button>
                                   ))}
                                </div>
                             </div>
                          </div>,
                          document.body
                        )}

                        {isExpanded && isOpen && (
                          <div className="ml-9 pl-6 mt-2 space-y-1.5 border-l-2 border-[var(--border-color)] animate-in slide-in-from-left-2 duration-500">
                            {category.items.map((act) => (
                              <button
                                key={act.id}
                                onClick={() => onSelectActivity(act.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 ${selectedActivity === act.id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-muted)]'}`}
                              >
                                <span className="flex-1 truncate uppercase tracking-tighter">{act.title}</span>
                                {selectedActivity === act.id && <i className="fa-solid fa-check text-[8px]"></i>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
