
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityType, WorksheetData, Activity, GeneratorOptions, ActivityCategory } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { GeneratorView } from './GeneratorView';
import { statsService } from '../services/statsService';
import { adminService } from '../services/adminService';
import { useStudent } from '../context/StudentContext';

// Fix: Improved toPascalCase to handle UPPERCASE strings correctly
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
  onOpenStudentModal?: () => void;
  studentProfile?: any;
  styleSettings?: any;
  onOpenOCR?: () => void;
  onOpenCurriculum?: () => void;
  onOpenReadingStudio?: () => void;
  onOpenMathStudio?: () => void;
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
  onOpenStudentModal,
  studentProfile,
  styleSettings,
  onOpenOCR,
  onOpenCurriculum,
  onOpenReadingStudio,
  onOpenMathStudio
}) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const { activeStudent } = useStudent();
  
  // "Single Source of Truth" için State
  const [allActivities, setAllActivities] = useState<Activity[]>(ACTIVITIES);
  const [categories, setCategories] = useState<ActivityCategory[]>(ACTIVITY_CATEGORIES);

  // --- GÜVENLİ VERİ BİRLEŞTİRME (SAFE MERGE) ---
  useEffect(() => {
      const loadCustomActivities = async () => {
          try {
              const customActs = await adminService.getAllActivities();
              
              // 1. Adım: Statik aktiviteleri bir Map'e yükle (ID bazlı indeksleme)
              const activityMap = new Map<string, Activity>();
              ACTIVITIES.forEach(act => activityMap.set(act.id, act));

              // 2. Adım: Veritabanından gelenleri ekle (Varsa üzerine yazar - Override)
              if (customActs && Array.isArray(customActs)) {
                  customActs.forEach(ca => {
                      if (!ca || !ca.id) return;
                      if (activityMap.has(ca.id)) {
                          const existing = activityMap.get(ca.id)!;
                          activityMap.set(ca.id, { ...existing, ...ca } as Activity);
                      } else {
                          activityMap.set(ca.id, ca as unknown as Activity);
                      }
                  });
              }

              // 3. Adım: Map'i tekrar diziye çevir ve State'i güncelle
              const mergedActivities = Array.from(activityMap.values());
              setAllActivities(mergedActivities);

              // 4. Adım: Kategorileri Güncelle (Dinamik kategori desteği - 'Others' iptal edildi)
              const updatedCategories = [...ACTIVITY_CATEGORIES]; // Klonla
              
              // Custom aktiviteleri yerleştir
              customActs.forEach(act => {
                   const actId = act.id as ActivityType;
                   // Eğer kategori 'others' ise veya boşsa 'visual-perception'a ata, yoksa kendi kategorisine
                   let targetCatId = (!act.category || act.category === 'others') ? 'visual-perception' : act.category;
                   
                   let targetCat = updatedCategories.find(c => c.id === targetCatId);

                   // Eğer kategori listede yoksa, DİNAMİK OLARAK OLUŞTUR
                   if (!targetCat) {
                       targetCat = {
                           id: targetCatId,
                           title: toPascalCase(targetCatId), // ID'den başlık üret
                           description: 'Özel Kategori',
                           icon: 'fa-solid fa-folder-open', // Varsayılan ikon
                           activities: []
                       };
                       updatedCategories.push(targetCat);
                   }

                   if (!targetCat.activities.includes(actId)) {
                       targetCat.activities.push(actId);
                   }
              });

              // Boş kategorileri temizle (Opsiyonel) veya Others varsa sil
              setCategories(updatedCategories.filter(c => c.id !== 'others'));

          } catch (e) { 
              console.error("Sidebar veri yükleme hatası (Graceful Fallback):", e); 
          }
      };
      loadCustomActivities();
  }, []);

  const getActivityById = (id: ActivityType | null): Activity | undefined => {
      if (!id) return undefined;
      return allActivities.find(a => a && a.id === id);
  }

  const handleGenerate = async (options: GeneratorOptions) => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setWorksheetData(null);
    setError(null);

    const enrichedOptions: GeneratorOptions = {
        ...options,
        studentContext: activeStudent || undefined
    };

    const currentAct = getActivityById(selectedActivity);
    
    // Fix: Force bypass AI if mode is fast, regardless of database promptId
    const useAI = options.mode === 'ai';
    const promptId = useAI ? currentAct?.promptId : null;

    try {
        let result: WorksheetData | null = null;
        
        if (promptId) {
             const promptTemplate = await adminService.getPromptTemplate(promptId);
             if (promptTemplate) {
                 const vars = { 
                     worksheetCount: options.worksheetCount, 
                     difficulty: options.difficulty, 
                     topic: options.topic || 'Genel', 
                     itemCount: options.itemCount,
                     studentName: activeStudent?.name || 'Öğrenci'
                 };
                 const aiResult = await adminService.testPrompt(promptTemplate, vars);
                 if (Array.isArray(aiResult)) result = aiResult;
                 else if (aiResult && (aiResult as any).data && Array.isArray((aiResult as any).data)) result = (aiResult as any).data;
                 else result = [aiResult];
             }
        } 
        
        if (!result) {
            const pascalCaseName = toPascalCase(selectedActivity).replace(/\s+/g, '');
            const generatorFunctionName = `generate${pascalCaseName}FromAI`;
            const offlineGeneratorFunctionName = `generateOffline${pascalCaseName}`;
            
            const runOfflineGenerator = async () => {
                 const offlineGenerator = (offlineGenerators as any)[offlineGeneratorFunctionName];
                 if (offlineGenerator) return await offlineGenerator(enrichedOptions);
                 throw new Error(`"${currentAct?.title}" yerel üretim motoru bulunamadı.`);
            };

            if (options.mode === 'ai') {
                const onlineGenerator = (generators as any)[generatorFunctionName];
                if (onlineGenerator) {
                    try { result = await onlineGenerator(enrichedOptions); } 
                    catch (err) { result = await runOfflineGenerator(); }
                } else result = await runOfflineGenerator();
            } else {
                result = await runOfflineGenerator();
            }
        }

        if (result) {
            const labeledResult = result.map((page: any) => ({ ...page, title: page.title || currentAct?.title || 'Etkinlik' }));
            setWorksheetData(labeledResult);
            onAddToHistory(selectedActivity, labeledResult);
            statsService.incrementUsage(selectedActivity).catch(console.error);
        }
    } catch (e: any) { 
        setError(e.message || "İçerik üretilemedi."); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const categorizedActivities = useMemo(() => {
      return categories.map(category => ({ 
          ...category, 
          items: allActivities.filter(act => act && act.id && category.activities.includes(act.id)) 
      })).filter(c => c.items.length > 0);
  }, [allActivities, categories]);

  const currentActivityObj = selectedActivity ? getActivityById(selectedActivity) : undefined;

  return (
    <aside id="tour-sidebar" className={`fixed inset-y-0 left-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 ease-in-out flex flex-col h-full md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'} ${isExpanded ? 'w-[300px]' : 'w-[70px]'}`} aria-label="Etkinlik Menüsü">
        <div className="flex h-full flex-col">
            {selectedActivity && currentActivityObj ? (
                <GeneratorView 
                    activity={currentActivityObj} 
                    onGenerate={handleGenerate} 
                    onBack={() => onSelectActivity(null)} 
                    isLoading={isLoading} 
                    isExpanded={isExpanded} 
                    onOpenStudentModal={onOpenStudentModal} 
                    studentProfile={studentProfile} 
                />
            ) : (
                <>
                <div className="flex-shrink-0 h-[56px] flex items-center justify-between px-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-800/30">
                    {isExpanded ? (
                        <div className="relative w-full group animate-in fade-in duration-300">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors text-[10px]"></i>
                            <input type="text" placeholder="Etkinlik ara..." className="w-full h-8 pl-8 pr-2 bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-sm"/>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center"><div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center"><i className="fa-solid fa-layer-group text-sm"></i></div></div>
                    )}
                    <button onClick={closeSidebar} className="md:hidden ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"><i className="fa-solid fa-xmark text-sm"></i></button>
                </div>

                {isExpanded && (
                    <div className="px-4 py-4 grid grid-cols-1 gap-2 shrink-0 border-b border-dashed border-zinc-200 dark:border-zinc-800/50 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <button onClick={onOpenStudentModal} className="group w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 p-3 rounded-2xl transition-all flex items-center gap-4 shadow-lg shadow-indigo-500/20">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-user-graduate text-lg"></i>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Öğrencilerim</span>
                                <span className="text-[9px] text-indigo-100 mt-1">Yönetim ve Analiz Paneli</span>
                            </div>
                            <i className="fa-solid fa-chevron-right text-indigo-300 ml-auto text-[10px]"></i>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button onClick={onOpenOCR} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-camera text-zinc-400 group-hover:text-indigo-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Tarayıcı</span>
                            </button>
                            <button onClick={onOpenCurriculum} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-calendar-check text-zinc-400 group-hover:text-emerald-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Planlama</span>
                            </button>
                            <button onClick={onOpenReadingStudio} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-book-open-reader text-zinc-400 group-hover:text-blue-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Okuma S.</span>
                            </button>
                            <button onClick={onOpenMathStudio} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 transition-all flex flex-col items-center gap-1 group">
                                <i className="fa-solid fa-calculator text-zinc-400 group-hover:text-amber-500 transition-colors text-xs"></i>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Matematik S.</span>
                            </button>
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar min-h-0 space-y-0.5">
                    {categorizedActivities.map((category) => {
                        const isOpen = openCategoryId === category.id;
                        return (
                            <div key={category.id}>
                                <button onClick={() => isExpanded && setOpenCategoryId(isOpen ? null : category.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 group ${!isExpanded ? 'justify-center' : ''} ${isOpen && isExpanded ? 'bg-zinc-800 text-white dark:bg-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`} title={!isExpanded ? category.title : undefined}>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition-all shrink-0 ${isOpen && isExpanded ? 'text-white dark:text-black' : 'text-zinc-500 dark:text-zinc-500'}`}><i className={category.icon}></i></div>
                                    {isExpanded && <><span className="flex-1 text-left text-[11px] font-bold uppercase tracking-tight truncate">{category.title}</span><i className={`fa-solid fa-chevron-down text-[8px] opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i></>}
                                </button>
                                {isExpanded && isOpen && (
                                    <div className="overflow-hidden animate-in slide-in-from-left-1 duration-200">
                                        <div className="pl-3 ml-[11px] border-l border-zinc-200 dark:border-zinc-800 mt-0.5 space-y-0.5">
                                            {category.items.map(activity => (
                                                <button key={activity.id} onClick={() => { onSelectActivity(activity.id); if(window.innerWidth < 768) closeSidebar(); }} className={`w-full text-left px-3 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1.5 relative ${selectedActivity === activity.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}>
                                                    <span className={`w-1 h-1 rounded-full ${selectedActivity === activity.id ? 'bg-indigo-500' : 'bg-transparent border border-zinc-300'}`}></span>
                                                    <span className="truncate">{activity.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
                </>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
