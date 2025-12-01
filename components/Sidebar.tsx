
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, StudentProfile } from '../types';
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
  isExpanded?: boolean;
  onOpenStudentModal?: () => void;
  studentProfile?: StudentProfile | null;
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
  onAddToHistory,
  isExpanded = true,
  onOpenStudentModal,
  studentProfile
}) => {
  const { user } = useAuth();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Arama terimi değiştiğinde veya menü daraltıldığında kategori durumunu yönet
  useEffect(() => {
      if (searchTerm) {
          // Arama yapılıyorsa tüm kategorileri açık varsayacağız (render mantığında)
          setOpenCategoryId(null);
      }
  }, [searchTerm]);

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

  // Filtered Categories based on Search
  const filteredCategories = useMemo(() => {
      if (!searchTerm.trim()) {
          return ACTIVITY_CATEGORIES.map(category => ({
              ...category,
              items: ACTIVITIES.filter(act => category.activities.includes(act.id))
          }));
      }

      const lowerTerm = searchTerm.toLocaleLowerCase('tr');
      return ACTIVITY_CATEGORIES.map(category => {
          // Kategori başlığı eşleşiyor mu?
          const isCategoryMatch = category.title.toLocaleLowerCase('tr').includes(lowerTerm);
          
          // Etkinlikler eşleşiyor mu?
          const matchingActivities = ACTIVITIES.filter(act => 
              category.activities.includes(act.id) && 
              (act.title.toLocaleLowerCase('tr').includes(lowerTerm) || isCategoryMatch)
          );

          return {
              ...category,
              items: matchingActivities
          };
      }).filter(cat => cat.items.length > 0);
  }, [searchTerm]);

  return (
    <aside
      id="tour-sidebar"
      className={`fixed inset-y-0 left-0 z-30 transform bg-[var(--bg-paper)] backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none md:border-r border-[var(--border-color)] print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isExpanded ? 'w-80' : 'w-24'}`}
      aria-label="Etkinlik Menüsü"
    >
        <div className="flex h-full flex-col overflow-hidden">
            {currentActivity ? (
                <GeneratorView 
                    activity={currentActivity}
                    onGenerate={handleGenerate}
                    onBack={() => onSelectActivity(null)}
                    isLoading={isLoading}
                    isExpanded={isExpanded}
                    onOpenStudentModal={onOpenStudentModal}
                    studentProfile={studentProfile}
                />
            ) : (
                <>
                    <div className="border-b p-4 border-[var(--border-color)] flex flex-col justify-between bg-inherit shrink-0 gap-3">
                        <div className="flex justify-between items-center h-[33px]">
                            <div className={`transition-opacity duration-300 ${!isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Etkinlikler</h2>
                            </div>
                            
                            {!isExpanded && (
                                <div className="w-full flex justify-center text-[var(--text-primary)]">
                                    <i className="fa-solid fa-layer-group text-xl"></i>
                                </div>
                            )}

                            <button
                                onClick={closeSidebar}
                                className="md:hidden text-[var(--text-muted)] hover:bg-[var(--bg-inset)] rounded-full w-8 h-8 flex items-center justify-center focus:outline-none"
                                aria-label="Menüyü kapat"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>

                        {/* Search Bar - Only visible when expanded */}
                        {isExpanded && (
                            <div className="relative">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"></i>
                                <input 
                                    type="text" 
                                    placeholder="Etkinlik ara..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-8 py-2 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] placeholder:text-zinc-500"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                                    >
                                        <i className="fa-solid fa-times-circle text-xs"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center p-4 text-zinc-500 text-sm">
                                Sonuç bulunamadı.
                            </div>
                        ) : (
                            filteredCategories.map((category) => {
                                const isOpen = searchTerm ? true : openCategoryId === category.id;
                                
                                return (
                                    <div key={category.id} className="rounded-xl overflow-hidden transition-all duration-200">
                                        <button
                                            onClick={() => setOpenCategoryId(openCategoryId === category.id ? null : category.id)}
                                            className={`w-full flex items-center p-3 text-left font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${isOpen ? 'bg-[var(--bg-inset)] text-[var(--text-primary)]' : ''} ${!isExpanded ? 'justify-center' : 'justify-between'}`}
                                            title={!isExpanded ? category.title : undefined}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-[var(--accent-color)] text-black' : 'bg-transparent text-[var(--text-muted)]'}`}>
                                                    <i className={`${category.icon} text-sm`}></i>
                                                </div>
                                                <span className={`whitespace-nowrap transition-opacity duration-300 font-bold text-sm ${!isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>{category.title}</span>
                                            </div>
                                            {isExpanded && !searchTerm && (
                                                <i className={`fa-solid fa-chevron-down text-xs text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                                            )}
                                        </button>
                                        
                                        {/* Sub-menu with Animation */}
                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <ul className={`pl-4 pr-1 py-1 space-y-1 ${!isExpanded ? 'hidden' : ''}`}>
                                                {category.items.map(activity => (
                                                    <li key={`${activity.id}-${activity.title}`}>
                                                        <button
                                                            onClick={() => {
                                                                onSelectActivity(activity.id);
                                                                // Don't close sidebar on desktop selection
                                                                if(window.innerWidth < 768) closeSidebar();
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all focus:outline-none flex items-center group relative overflow-hidden ${
                                                                selectedActivity === activity.id 
                                                                ? 'bg-[var(--accent-color)] text-black shadow-md' 
                                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                                                            }`}
                                                        >
                                                            {/* Active Indicator Line */}
                                                            {selectedActivity === activity.id && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"></div>
                                                            )}
                                                            
                                                            <i className={`fa-solid fa-circle text-[6px] mr-3 ${selectedActivity === activity.id ? 'text-black' : 'text-[var(--border-color)] group-hover:text-[var(--accent-color)]'}`}></i>
                                                            <span className="truncate">{activity.title}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
