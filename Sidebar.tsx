import React, { useState } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions } from './types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from './constants';
import * as generators from './services/generators';
import * as offlineGenerators from './services/offlineGenerators';
import { GeneratorView } from './components/GeneratorView';

interface SidebarProps {
  selectedActivity: ActivityType | null;
  onSelectActivity: (id: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const getActivityById = (id: ActivityType | null): Activity | undefined => {
    if (!id) return undefined;
    // Find the first activity that matches the ID. Since some IDs have multiple titles,
    // we just need the core details for the generator.
    return ACTIVITIES.find(a => a.id === id);
}

// Helper to convert CONSTANT_CASE to PascalCase (e.g. WORD_SEARCH -> WordSearch)
const toPascalCase = (str: string): string => {
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  closeSidebar,
  selectedActivity,
  onSelectActivity,
  setWorksheetData,
  setIsLoading,
  setError,
  isLoading
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    try {
        let result: WorksheetData;
        
        // Correctly format the function names based on the ActivityType enum
        const pascalCaseName = toPascalCase(selectedActivity);
        const generatorFunctionName = `generate${pascalCaseName}FromAI`;
        const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;
        
        console.log(`Generating ${selectedActivity} using mode: ${options.mode}`);
        console.log(`Function names: AI=${generatorFunctionName}, Offline=${offlineGeneratorFunctionName}`);

        if (options.mode === 'ai') {
            const onlineGenerator = (generators as any)[generatorFunctionName];
            if (onlineGenerator) {
                result = await onlineGenerator(options);
            } else {
                throw new Error(`AI generator function "${generatorFunctionName}" not found.`);
            }
        } else { // Fast mode
            const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
            if (offlineGenerator) {
                result = await offlineGenerator(options);
            } else {
                 throw new Error(`Hızlı mod için "${getActivityById(selectedActivity)?.title}" (${offlineGeneratorFunctionName}) etkinliği henüz desteklenmiyor.`);
            }
        }
        
        // The generator functions are designed to return an array of pages (SingleWorksheetData[]).
        setWorksheetData(result);

    } catch (e: any) {
        console.error("Etkinlik oluşturulurken hata:", e);
        setError(e.message || "Bilinmeyen bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const currentActivity = getActivityById(selectedActivity);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r border-zinc-200 dark:border-zinc-700 print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Etkinlik Menüsü"
    >
        <div className="flex h-full flex-col">
            {currentActivity ? (
                <GeneratorView 
                    activity={currentActivity}
                    onGenerate={handleGenerate}
                    onBack={() => onSelectActivity(null)}
                    isLoading={isLoading}
                />
            ) : (
                <>
                    <div className="border-b p-4 dark:border-zinc-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold">Etkinlikler</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Bir kategori ve etkinlik seçin</p>
                        </div>
                         <button
                            onClick={closeSidebar}
                            className="md:hidden text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Menüyü kapat"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2">
                        {ACTIVITY_CATEGORIES.map((category) => (
                            <div key={category.id} className="py-1">
                                <button
                                    onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                    className="w-full flex items-center justify-between p-3 text-left font-semibold text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    aria-expanded={openCategoryId === category.id}
                                >
                                    <span>{category.title}</span>
                                    <i className={`fa-solid fa-chevron-down text-sm text-zinc-400 transition-transform ${openCategoryId === category.id ? 'rotate-180' : ''}`}></i>
                                </button>
                                {openCategoryId === category.id && (
                                    <ul className="mt-1 space-y-1 dark:bg-zinc-800 rounded-lg p-2 mx-2 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50">
                                        {ACTIVITIES.filter(act => category.activities.includes(act.id)).map(activity => (
                                            <li key={`${activity.id}-${activity.title}`}>
                                                <button
                                                    onClick={() => {
                                                        onSelectActivity(activity.id);
                                                        closeSidebar();
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedActivity === activity.id ? 'sidebar-activity-item-active' : ''}`}
                                                >
                                                    <i className={`${activity.icon} fa-fw mr-2 text-zinc-400 dark:text-zinc-500`}></i>
                                                    {activity.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
