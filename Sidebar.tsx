// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from './types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from './constants';
import * as generators from './services/generators';
import * as offlineGenerators from './services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from './services/statsService';
import { useStudent } from './context/StudentContext';

/**
 * Normalizasyon: ID'yi CamelCase fonksiyon ismine çevirir.
 */
const toPascalCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase()
        .split(/[-_ ]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
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
    onOpenOCR?: () => void;
    onOpenCurriculum?: () => void;
    onOpenReadingStudio?: () => void;
    onOpenMathStudio?: () => void;
    onOpenScreening?: () => void;
    activeCurriculumSession?: any;
    isExpanded?: boolean;
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
    width,
    onWidthChange
}) => {
    const { activeStudent } = useStudent();
    const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (onWidthChange) {
                const newWidth = Math.min(Math.max(280, e.clientX), 600);
                onWidthChange(newWidth);
            }
        };

        const handleMouseUp = () => setIsResizing(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, onWidthChange]);

    const handleGenerate = async (options: GeneratorOptions) => {
        if (!selectedActivity) return;

        setIsLoading(true);
        setWorksheetData(null);
        setError(null);

        const enrichedOptions: GeneratorOptions = {
            ...options,
            studentContext: activeStudent || undefined
        };

        try {
            const pascalName = toPascalCase(selectedActivity);
            const aiFunctionName = `generate${pascalName}FromAI`;
            const offlineFunctionName = `generateOffline${pascalName}`;

            let result: WorksheetData | null = null;

            if (options.mode === 'ai') {
                const aiGen = (generators as any)[aiFunctionName];
                if (aiGen) {
                    result = await aiGen(enrichedOptions);
                }
            }

            if (!result) {
                const offlineGen = (offlineGenerators as any)[offlineFunctionName];
                if (offlineGen) {
                    result = await offlineGen(enrichedOptions);
                } else {
                    throw new Error(`"${pascalName}" için üretim motoru henüz hazır değil.`);
                }
            }

            if (result) {
                setWorksheetData(result);
                onAddToHistory(selectedActivity, result);
                statsService.incrementUsage(selectedActivity).catch(console.error);
            }

        } catch (e: any) {
            console.error("Sidebar Error:", e);
            setError(e.message || "İçerik üretilemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 transform bg-[var(--bg-paper)] border-r border-[var(--border-color)] transition-all duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ width: width || 320 }}
        >
            <div className="flex h-full flex-col relative">
                {selectedActivity ? (
                    <GeneratorView
                        activity={ACTIVITIES.find(a => a.id === selectedActivity)!}
                        onGenerate={handleGenerate}
                        onBack={() => onSelectActivity(null)}
                        isLoading={isLoading}
                    />
                ) : (
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <h2 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest px-4 mb-6">Etkinlik Laboratuvarı</h2>
                        {ACTIVITY_CATEGORIES.map(category => (
                            <div key={category.id} className="mb-2">
                                <button
                                    onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${openCategoryId === category.id ? 'bg-[var(--accent-muted)] text-[var(--accent-color)] shadow-sm' : 'hover:bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <span className="flex items-center gap-3 font-bold text-sm">
                                        <i className={`${category.icon} ${openCategoryId === category.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}></i>
                                        {category.title}
                                    </span>
                                    <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${openCategoryId === category.id ? 'rotate-180' : ''}`}></i>
                                </button>
                                {openCategoryId === category.id && (
                                    <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                        {ACTIVITIES.filter(a => category.activities.includes(a.id)).map(act => (
                                            <button
                                                key={act.id}
                                                onClick={() => onSelectActivity(act.id)}
                                                className="w-full text-left p-3 pl-8 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--surface-glass)] rounded-xl transition-all"
                                            >
                                                {act.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                )}

                {/* RESIZE HANDLE */}
                <div
                    onMouseDown={() => setIsResizing(true)}
                    className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-50 group"
                >
                    <div className={`w-full h-full transition-colors ${isResizing ? 'bg-indigo-500/50' : 'group-hover:bg-indigo-500/20'}`}></div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
