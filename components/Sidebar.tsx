
import React, { useState, useMemo } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

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

const getActivityById = (id: ActivityType | null): Activity | undefined => {
    if (!id) return undefined;
    return ACTIVITIES.find(a => a.id === id);
}

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
  isLoading,
  onAddToHistory
}) => {
  const { user } = useAuth();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    const pascalCaseName = toPascalCase(selectedActivity);
    const generatorFunctionName = `generate${pascalCaseName}FromAI`;
    const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;

    try {
        let result: WorksheetData;
        
        const runOfflineGenerator = async () => {
             const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
             if (offlineGenerator) {
                 return await offlineGenerator(options);
             } else {
                 throw new Error(`Hızlı mod için "${getActivityById(selectedActivity)?.title}" henüz desteklenmiyor.`);
             }
        };

        if (options.mode === 'ai') {
            const onlineGenerator = (generators as any)[generatorFunctionName];
            if (onlineGenerator) {
                try {
                    result = await onlineGenerator(options);
                } catch (err: any) {
                    const msg = err.message || '';
                    if (
                        msg.includes('429') || 
                        msg.includes('503') || 
                        msg.includes('403') || 
                        msg.includes('quota') || 
                        msg.includes('kotası') || 
                        msg.includes('fetch') ||
                        msg.includes('leaked') || 
                        msg.includes('PERMISSION_DENIED')
                    ) {
                         console.warn("AI Service Error (Quota/Network/Key). Switching to Fast Mode automatically.");
                         try {
                             result = await runOfflineGenerator();
                             setError("Bilgi: Yapay zeka servisi şu an yanıt vermediği için (Kota/Erişim) etkinlik 'Hızlı Mod' ile oluşturuldu.");
                             setTimeout(() => setError(null), 5000);
                         } catch (offlineErr: any) {
                              throw new Error("Yapay zeka servisine erişilemedi ve Hızlı Mod sırasında da bir hata oluştu: " + offlineErr.message);
                         }
                    } else {
                        throw err;
                    }
                }
            } else {
                console.warn("AI generator not found, trying offline.");
                result = await runOfflineGenerator();
            }
        } else { 
            result = await runOfflineGenerator();
        }
        
        if (result) {
            setWorksheetData(result);
            onAddToHistory(selectedActivity, result);
            
            statsService.incrementUsage(selectedActivity).catch(console.error);
            if (user) {
                const act = getActivityById(selectedActivity);
                authService.recordActivityGeneration(user.id, selectedActivity, act ? act.title : selectedActivity).catch(console.error);
            }
        }

    } catch (e: any) {
        console.error("Etkinlik oluşturulurken hata:", e);
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            setError("API kotası aşıldı. Lütfen 'Hızlı Mod'u kullanın.");
        } else {
            setError(e.message || "Beklenmeyen bir hata oluştu.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const currentActivity = getActivityById(selectedActivity);

  const categorizedActivities = useMemo(() => {
      return ACTIVITY_CATEGORIES.map(category => ({
          ...category,
          items: ACTIVITIES.filter(act => category.activities.includes(act.id))
      }));
  }, []);

  return (
    <aside
      id="tour-sidebar"
      className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-[var(--bg-paper)] backdrop-blur-md shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r border-[var(--border-color)] print:hidden ${
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
                    <div className="border-b p-4 border-[var(--border-color)] flex justify-between items-center bg-inherit">
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Etkinlikler</h2>
                            <p className="text-xs text-[var(--text-muted)]">Bir kategori ve etkinlik seçin</p>
                        </div>
                         <button
                            onClick={closeSidebar}
                            className="md:hidden text-[var(--text-muted)] hover:bg-[var(--bg-inset)] rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                            aria-label="Menüyü kapat"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2">
                        {categorizedActivities.map((category) => (
                            <div key={category.id} className="py-1">
                                <button
                                    onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                    // Menu Button
                                    className={`w-full flex items-center justify-between p-3 text-left font-semibold text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-inset)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${openCategoryId === category.id ? 'bg-[var(--bg-inset)]' : ''}`}
                                    aria-expanded={openCategoryId === category.id}
                                >
                                    <span>{category.title}</span>
                                    <i className={`fa-solid fa-chevron-down text-sm text-[var(--text-muted)] transition-transform ${openCategoryId === category.id ? 'rotate-180' : ''}`}></i>
                                </button>
                                {openCategoryId === category.id && (
                                    // Sub-menu
                                    <ul className="sidebar-activity-list mt-1 space-y-1 bg-[var(--bg-primary)] rounded-lg p-2 mx-2 shadow-inner border border-[var(--border-color)]">
                                        {category.items.map(activity => (
                                            <li key={`${activity.id}-${activity.title}`}>
                                                <button
                                                    onClick={() => {
                                                        onSelectActivity(activity.id);
                                                        closeSidebar();
                                                    }}
                                                    // Activity Item
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${
                                                        selectedActivity === activity.id 
                                                        ? 'bg-[var(--bg-inset)] text-[var(--text-primary)] border-l-4 border-[var(--accent-color)] font-bold' 
                                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] hover:text-[var(--text-primary)]'
                                                    }`}
                                                >
                                                    <i className={`${activity.icon} fa-fw mr-2 ${selectedActivity === activity.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}></i>
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
