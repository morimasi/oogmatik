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
