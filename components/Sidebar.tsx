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
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService';
import { useStudent } from '../context/StudentContext';
import './PremiumPopupStyles.css';

const toPascalCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md ${color} relative overflow-hidden`}
    >
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
  activeCurriculumSession,
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
  const popupTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [popupRect, setPopupRect] = useState<DOMRect | null>(null);

  const studioItems = [
    {
      id: 'ocr',
      label: 'Klon (OCR)',
      icon: 'fa-camera-viewfinder',
      color: 'bg-indigo-500',
      onClick: onOpenOCR,
    },
    {
      id: 'curriculum',
      label: 'Plan & Müfredat',
      icon: 'fa-calendar-check',
      color: 'bg-emerald-500',
      onClick: onOpenCurriculum,
    },
    {
      id: 'reading',
      label: 'Okuma Stüdyosu',
      icon: 'fa-book-open',
      color: 'bg-rose-500',
      onClick: onOpenReadingStudio,
    },
    {
      id: 'math',
      label: 'Matematik Stüdyosu',
      icon: 'fa-calculator',
      color: 'bg-blue-500',
      onClick: onOpenMathStudio,
    },
    {
      id: 'screening',
      label: 'Tarama & Analiz',
      icon: 'fa-clipboard-question',
      color: 'bg-purple-500',
      onClick: onOpenScreening,
    },
  ];

  const handleStudioClick = (item: any) => {
    setSelectedStudio(item.id);
    setIsStudioMenuOpen(false);
    if (item.onClick) item.onClick();
  };

  // Hover popup handlers
  const handleCategoryMouseEnter = (categoryId: string, event: React.MouseEvent) => {
    // Clear any existing timeouts
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();

    // Set popup to show after 0-100ms delay
    popupTimeoutRef.current = setTimeout(() => {
      setPopupRect(rect);
      setHoveredCategory(categoryId);
    }, Math.random() * 100); // Random delay between 0-100ms
  };

  const handleCategoryMouseLeave = () => {
    // Clear popup timeout
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);

    // Set close timeout with 350ms delay for stability
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 350);
  };

  const handlePopupMouseEnter = () => {
    // Clear close timeout when mouse enters popup
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handlePopupMouseLeave = () => {
    // Set close timeout when mouse leaves popup
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 350);
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
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close menu when clicking outside - Enhanced for popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Studio menu
      if (
        isStudioMenuOpen &&
        !target.closest('.studio-menu-container') &&
        !target.closest('.studio-trigger-btn')
      ) {
        setIsStudioMenuOpen(false);
      }

      // Popup menu - click outside detection
      if (
        hoveredCategory &&
        !target.closest('.premium-popup-menu') &&
        !target.closest('.category-trigger-btn')
      ) {
        setHoveredCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStudioMenuOpen, hoveredCategory]);

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
      } catch (e) {
        console.error('Dinamik kaynaklar yüklenemedi');
      }
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
        const pascalCaseName = toPascalCase(selectedActivity).replace(/\s+/g, '');
        const generatorFunctionName = `generate${pascalCaseName}FromAI`;
        const runOfflineGenerator = async () => {
          const offlineGenerator = (offlineGenerators as any)[`generateOffline${pascalCaseName}`];
          if (offlineGenerator) return await offlineGenerator(options);
          throw new Error('Üretim motoru bulunamadı.');
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
        className={`fixed inset-y-0 left-0 z-30 bg-[var(--bg-primary)] backdrop-blur-2xl border-r border-[var(--border-color)] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)]">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--accent-color)] mb-4"></i>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Etkinlik Yükleniyor...
                </p>
              </div>
            )
          ) : (
            <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar scroll-smooth">
              {isExpanded && (
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em] mb-4 mt-2 block ml-3">
                  Akıllı Modüller
                </span>
              )}

              <div className="space-y-2 px-2">
                {/* STÜDYOLAR - SINGLE BUTTON WITH POPUP */}
                <div className="relative mb-2">
                  <button
                    onClick={(e) => {
                      setPopupRect(e.currentTarget.getBoundingClientRect());
                      setHoveredCategory('studios');
                    }}
                    onMouseEnter={(e) => handleCategoryMouseEnter('studios', e)}
                    onMouseLeave={handleCategoryMouseLeave}
                    className={`studio-trigger-btn w-full group flex items-center ${isExpanded ? 'px-3 gap-3' : 'justify-center px-2'} py-3 rounded-2xl transition-all duration-300 bg-[var(--bg-paper)] hover:shadow-lg border border-[var(--border-color)] relative overflow-hidden`}
                    aria-haspopup="true"
                    aria-expanded={hoveredCategory === 'studios'}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPopupRect(e.currentTarget.getBoundingClientRect());
                        setHoveredCategory('studios');
                      }
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm transition-all duration-500 bg-[var(--accent-color)] text-white relative z-10`}
                    >
                      <i className="fa-solid fa-layer-group"></i>
                    </div>

                    {isExpanded && (
                      <div className="flex-1 flex flex-col items-start relative z-10">
                        <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                          Stüdyolar
                        </span>
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                          Tüm Modüller
                        </span>
                      </div>
                    )}

                    {isExpanded && (
                      <i className="fa-solid fa-chevron-right text-[10px] text-[var(--text-muted)] relative z-10 transition-transform group-hover:translate-x-1"></i>
                    )}

                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-[var(--accent-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* PREMIUM HOVER POPUP MENU FOR STUDIOS */}
                  {hoveredCategory === 'studios' &&
                    popupRect &&
                    createPortal(
                      <div
                        className="premium-popup-menu md:block hidden"
                        onMouseEnter={handlePopupMouseEnter}
                        onMouseLeave={handlePopupMouseLeave}
                        role="menu"
                        aria-label="Stüdyolar menüsü"
                        aria-hidden="false"
                        style={{
                          animation: 'slideInFade 0.35s ease-in-out',
                          position: 'fixed',
                          top: popupRect.top,
                          left: popupRect.left + popupRect.width * 0.5,
                        }}
                        onKeyDown={(e) => {
                          const items = Array.from(
                            document.querySelectorAll('.premium-popup-activity-item')
                          );
                          const currentIndex = items.indexOf(document.activeElement as HTMLElement);
                          let nextIndex = currentIndex;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            nextIndex = Math.min(currentIndex + 1, items.length - 1);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            nextIndex = Math.max(currentIndex - 1, 0);
                          } else if (e.key === 'Home') {
                            e.preventDefault();
                            nextIndex = 0;
                          } else if (e.key === 'End') {
                            e.preventDefault();
                            nextIndex = items.length - 1;
                          }

                          if (nextIndex !== currentIndex && items[nextIndex]) {
                            (items[nextIndex] as HTMLElement).focus();
                          }
                        }}
                      >
                        <div className="premium-popup-content flex flex-col">
                          <div className="premium-popup-header">
                            <span className="premium-popup-title">Stüdyolar</span>
                          </div>

                          <div
                            className="premium-popup-activities flex flex-col"
                            role="listbox"
                            aria-label="Stüdyolar Listesi"
                          >
                            {studioItems.map((item, index) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  handleStudioClick(item);
                                  setHoveredCategory(null);
                                }}
                                className={`premium-popup-activity-item ${selectedStudio === item.id ? 'active' : ''}`}
                                role="option"
                                aria-selected={selectedStudio === item.id}
                                tabIndex={0}
                                style={{
                                  animationDelay: `${index * 20}ms`,
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleStudioClick(item);
                                    setHoveredCategory(null);
                                  }
                                }}
                              >
                                <div
                                  className={`premium-popup-activity-icon ${item.color.replace('bg-', 'text-')}`}
                                >
                                  <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <span className="premium-popup-activity-title block truncate">
                                  {item.label}
                                </span>
                                {selectedStudio === item.id && (
                                  <i className="fa-solid fa-check text-[10px] ml-auto opacity-70"></i>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                </div>

                {/* ETKİNLİKLER - MODERN ACCORDIONS */}
                {categorizedActivities.map((category) => {
                  const isOpen = openCategoryId === category.id;
                  const isHovered = hoveredCategory === category.id;
                  const colors: any = {
                    'visual-perception': 'text-violet-500 bg-violet-500/10 border-violet-500/20',
                    'reading-verbal': 'text-teal-500 bg-teal-500/10 border-teal-500/20',
                    'math-logic': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                  };
                  return (
                    <div key={category.id} className="relative mb-2">
                      <button
                        onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)}
                        onMouseEnter={(e) => handleCategoryMouseEnter(category.id, e)}
                        onMouseLeave={handleCategoryMouseLeave}
                        className={`category-trigger-btn w-full group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-500 relative ${isOpen && isExpanded ? 'bg-[var(--bg-paper)] shadow-xl' : 'hover:bg-[var(--surface-elevated)]'}`}
                        aria-haspopup="true"
                        aria-expanded={isHovered}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPopupRect(e.currentTarget.getBoundingClientRect());
                            setHoveredCategory(category.id);
                          }
                        }}
                      >
                        {/* Aktif Belirteci (Glow Hattı) */}
                        {isOpen && isExpanded && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_10px_var(--accent-color)]" />
                        )}

                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-500 border ${colors[category.id] || 'bg-zinc-100 border-zinc-200'}`}
                        >
                          <i
                            className={`${category.icon} ${isOpen ? 'scale-110' : 'scale-90 opacity-70'}`}
                          ></i>
                        </div>
                        {isExpanded && (
                          <>
                            <span
                              className={`flex-1 text-left text-[12px] font-bold tracking-tight transition-colors ${isOpen ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300'}`}
                            >
                              {category.title}
                            </span>
                            <i
                              className={`fa-solid fa-chevron-right text-[9px] opacity-30 transition-transform duration-500 ${isOpen ? 'rotate-90 text-[var(--accent-color)] opacity-100' : ''}`}
                            ></i>
                          </>
                        )}
                      </button>

                      {/* PREMIUM HOVER POPUP MENU - Enhanced with Accessibility */}
                      {isHovered &&
                        popupRect &&
                        createPortal(
                          <div
                            className="premium-popup-menu md:block hidden"
                            onMouseEnter={handlePopupMouseEnter}
                            onMouseLeave={handlePopupMouseLeave}
                            role="menu"
                            aria-label={`${category.title} kategorisindeki etkinlikler`}
                            aria-hidden="false"
                            style={{
                              animation: 'slideInFade 0.35s ease-in-out',
                              position: 'fixed',
                              top: popupRect.top,
                              left: popupRect.left + popupRect.width * 0.5,
                            }}
                            onKeyDown={(e) => {
                              const items = Array.from(
                                document.querySelectorAll('.premium-popup-activity-item')
                              );
                              const currentIndex = items.indexOf(
                                document.activeElement as HTMLElement
                              );
                              let nextIndex = currentIndex;

                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                nextIndex = Math.min(currentIndex + 1, items.length - 1);
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                nextIndex = Math.max(currentIndex - 1, 0);
                              } else if (e.key === 'Home') {
                                e.preventDefault();
                                nextIndex = 0;
                              } else if (e.key === 'End') {
                                e.preventDefault();
                                nextIndex = items.length - 1;
                              }

                              if (nextIndex !== currentIndex && items[nextIndex]) {
                                (items[nextIndex] as HTMLElement).focus();
                              }
                            }}
                          >
                            <div className="premium-popup-content flex flex-col">
                              <div className="premium-popup-header">
                                <span className="premium-popup-title">{category.title}</span>
                              </div>

                              <div
                                className="premium-popup-activities flex flex-col"
                                role="listbox"
                                aria-label="Etkinlikler"
                              >
                                {category.items.map((activity, index) => (
                                  <button
                                    key={activity.id}
                                    onClick={() => handleActivitySelect(activity.id)}
                                    className={`premium-popup-activity-item ${selectedActivity === activity.id ? 'active' : ''}`}
                                    role="option"
                                    aria-selected={selectedActivity === activity.id}
                                    tabIndex={0}
                                    style={{
                                      animationDelay: `${index * 20}ms`,
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleActivitySelect(activity.id);
                                      }
                                    }}
                                  >
                                    <div className="premium-popup-activity-icon">
                                      <i className={`${activity.icon || 'fa-star'}`}></i>
                                    </div>
                                    <span className="premium-popup-activity-title block truncate">
                                      {activity.title}
                                    </span>
                                    {selectedActivity === activity.id && (
                                      <i className="fa-solid fa-check text-[10px] ml-auto opacity-70"></i>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>,
                          document.body
                        )}

                      {isExpanded && isOpen && (
                        <div className="ml-8 pl-5 mt-2 space-y-1 pr-2 border-l-2 border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-left-2 fade-in duration-500">
                          {category.items.map((activity) => (
                            <button
                              key={activity.id}
                              onClick={() => onSelectActivity(activity.id)}
                              className={`w-full group flex items-center gap-2 text-left py-2.5 px-3 rounded-xl text-[11px] font-bold transition-all duration-300 relative ${selectedActivity === activity.id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-muted)]'}`}
                            >
                              {selectedActivity !== activity.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)] transition-colors group-hover:bg-[var(--accent-color)]" />
                              )}
                              <span className="flex-1 truncate">{activity.title}</span>
                              {selectedActivity === activity.id && (
                                <i className="fa-solid fa-check text-[8px] opacity-70"></i>
                              )}
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
