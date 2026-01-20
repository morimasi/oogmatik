
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService';
import { useStudent } from '../context/StudentContext';

/**
 * Normalizasyon: ID'yi CamelCase fonksiyon ismine çevirir.
 * NUMBER_LOGIC_RIDDLES -> NumberLogicRiddles
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
  onAddToHistory
}) => {
  const { activeStudent } = useStudent();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

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
                throw new Error(`"${pascalName}" için yerel üretim motoru bulunamadı.`);
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
    <aside className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
            {selectedActivity ? (
                <GeneratorView 
                    activity={ACTIVITIES.find(a => a.id === selectedActivity)!} 
                    onGenerate={handleGenerate} 
                    onBack={() => onSelectActivity(null)} 
                    isLoading={isLoading} 
                />
            ) : (
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-4 mb-6">Etkinlik Laboratuvarı</h2>
                    {ACTIVITY_CATEGORIES.map(category => (
                        <div key={category.id}>
                            <button onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${openCategoryId === category.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
                                <span className="flex items-center gap-3 font-bold text-sm">
                                    <i className={`${category.icon} text-zinc-400`}></i>
                                    {category.title}
                                </span>
                                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${openCategoryId === category.id ? 'rotate-180' : ''}`}></i>
                            </button>
                            {openCategoryId === category.id && (
                                <div className="ml-8 mt-2 space-y-1">
                                    {ACTIVITIES.filter(a => category.activities.includes(a.id)).map(act => (
                                        <button key={act.id} onClick={() => onSelectActivity(act.id)} className="w-full text-left p-3 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            {act.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
