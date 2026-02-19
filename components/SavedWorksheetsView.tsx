import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { curriculumService } from '../services/curriculumService';

interface SharedWorksheetsViewProps {
  onLoad: (worksheet: SavedWorksheet) => void;
  onBack: () => void;
  targetUserId?: string;
}

const PAGE_SIZE = 10;

type GroupType = { title: string; items: SavedWorksheet[] };

const MaterialCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null; // Safe check

    const activityDef = ACTIVITIES.find(a => a.id === item.activityType);
    const categoryDef = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));
    
    return (
        <div 
            onClick={() => onLoad(item)}
            className="group bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${categoryDef?.id === 'math-logic' ? 'bg-blue-500' : categoryDef?.id === 'reading-verbal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            
            <div className="flex justify-between items-start mb-3 pl-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-500 group-hover:text-indigo-600 transition-colors">
                    <i className={activityDef?.icon || item.icon}></i>
                </div>
                {!isReadOnly && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="w-8 h-8 rounded-full hover:bg-red-50 hover:text-red-500 text-zinc-300 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                )}
            </div>
            
            <div className="pl-3 flex-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {categoryDef?.title || 'Genel'}
                </span>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm leading-tight mb-2 line-clamp-2">
                    {item.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-auto">
                    <i className="fa-regular fa-calendar"></i>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                </div>
            </div>
        </div>
    );
};

// Güncellenmiş ReportCard: onLoad prop'u eklendi ve butona bağlandı
const ReportCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null; // Safe check
    
    return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-0 border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col group h-full">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        <div className="p-5 flex-1 cursor-default">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{item.studentName}</h3>
                    <p className="text-xs text-zinc-500">{item.grade} • {item.age} Yaş</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-file-medical"></i>
                </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-zinc-400 uppercase font-bold">Tarih</span>
                    <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-2 rounded-lg text-center">
                    <span className="block text-[10px] text-zinc-400 uppercase font-bold">Durum</span>
                    <span className="text-xs font-bold text-emerald-600">Tamamlandı</span>
                </div>
            </div>
        </div>
        
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
            <button 
                onClick={() => onLoad(item)} 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline flex items-center gap-2"
            >
                <i className="fa-solid fa-eye"></i> Raporu Aç
            </button>
            {!isReadOnly && (
                <button onClick={() => onDelete(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
            )}
        </div>
    </div>
    );
};

// Güncellenmiş PlanCard: onLoad eklendi ve kart tıklanabilir yapıldı
const PlanCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null; // Safe check

    return (
    <div 
        onClick={() => onLoad(item)}
        className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm p-5 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all h-full flex flex-col"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fa-solid fa-calendar-days text-6xl"></i>
        </div>
        
        <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">
                    {item.durationDays} Günlük Plan
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                </span>
            </div>
            
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">{item.studentName}</h3>
            <p className="text-xs text-zinc-500 line-clamp-1 mb-4">{item.note || 'Özel eğitim planı.'}</p>
            
            <div className="flex gap-2 mt-auto">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-2 flex items-center gap-2">
                    <i className="fa-solid fa-bullseye text-indigo-500 text-xs"></i>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{item.goals?.length || 0} Hedef</span>
                </div>
                {!isReadOnly && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                        className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                    >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                )}
            </div>
        </div>
    </div>
    );
};

const SectionHeader = ({ title, count, icon }: { title: string, count: number, icon: string }) => (
    <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-lg shadow-lg">
            <i className={icon}></i>
        </div>
        <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-none">{title}</h2>
            <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider">{count} Kayıt</p>
        </div>
    </div>
);

const FilterButton = ({ active, label, icon, onClick, count }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-xs mb-2 group ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
    >
        <div className="flex items-center gap-3">
            <i className={`${icon} w-4 text-center ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`}></i>
            <span>{label}</span>
        </div>
        {count !== undefined && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                {count}
            </span>
        )}
    </button>
);

export const SavedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'materials' | 'reports' | 'plans'>('materials');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    
    // Data Containers
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [plans, setPlans] = useState<Curriculum[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const effectiveUserId = targetUserId || user?.id;
    const isReadOnly = !!targetUserId && targetUserId !== user?.id;

    useEffect(() => {
        if (effectiveUserId) loadAllData();
        else setLoading(false);
    }, [effectiveUserId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [wsData, asData, plData] = await Promise.all([
                worksheetService.getUserWorksheets(effectiveUserId!, 0, 1000),
                assessmentService.getUserAssessments(effectiveUserId!),
                curriculumService.getUserCurriculums(effectiveUserId!)
            ]);
            setWorksheets(wsData.items);
            setAssessments(asData);
            setPlans(plData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'materials' | 'reports' | 'plans') => {
        if (isReadOnly || !confirm("Silmek istediğinize emin misiniz?")) return;
        
        try {
            if (type === 'materials') {
                await worksheetService.deleteWorksheet(id);
                setWorksheets(prev => prev.filter(i => i.id !== id));
            } else if (type === 'plans') {
                await curriculumService.deleteCurriculum(id);
                setPlans(prev => prev.filter(i => i.id !== id));
            } else if (type === 'reports') {
                // Rapor silme fonksiyonu eklenebilir, şimdilik UI'dan kaldırılıyor
                setAssessments(prev => prev.filter(i => i.id !== id));
            }
        } catch (e) {
            alert("Silme işlemi sırasında hata oluştu.");
        }
    };

    // --- FILTERING LOGIC ---
    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        if (activeTab === 'materials') {
            return worksheets.filter(item => {
                if (!item) return false;
                const matchesSearch = (item.name || '').toLowerCase().includes(query);
                const categoryDef = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));
                // Fallback to visual-perception if category missing
                const catId = categoryDef?.id || 'visual-perception'; 
                
                const matchesCategory = activeCategory === 'all' || catId === activeCategory || (item.category?.id === activeCategory);
                return matchesSearch && matchesCategory;
            });
        }
        if (activeTab === 'reports') {
            return assessments.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        if (activeTab === 'plans') {
            return plans.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        return [];
    }, [activeTab, activeCategory, searchQuery, worksheets, assessments, plans]);

    return (
        <div className="flex h-full bg-zinc-50 dark:bg-black rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 shrink-0">
                <div className="mb-6 flex items-center gap-2 px-2">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <h3 className="font-black text-lg text-zinc-800 dark:text-white">Arşiv</h3>
                </div>

                <div className="space-y-1">
                    <FilterButton 
                        active={activeTab === 'materials'} 
                        label="Materyaller" 
                        icon="fa-solid fa-layer-group" 
                        onClick={() => { setActiveTab('materials'); setActiveCategory('all'); }} 
                        count={worksheets.length}
                    />
                    <FilterButton 
                        active={activeTab === 'reports'} 
                        label="Raporlar" 
                        icon="fa-solid fa-file-medical" 
                        onClick={() => setActiveTab('reports')} 
                        count={assessments.length}
                    />
                    <FilterButton 
                        active={activeTab === 'plans'} 
                        label="Eğitim Planları" 
                        icon="fa-solid fa-graduation-cap" 
                        onClick={() => setActiveTab('plans')} 
                        count={plans.length}
                    />
                </div>

                {activeTab === 'materials' && (
                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <h4 className="px-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Kategoriler</h4>
                        <div className="space-y-0.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                            <button 
                                onClick={() => setActiveCategory('all')}
                                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${activeCategory === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                Tümü
                            </button>
                            {ACTIVITY_CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${activeCategory === cat.id ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${cat.id === 'math-logic' ? 'bg-blue-400' : cat.id === 'reading-verbal' ? 'bg-emerald-400' : 'bg-zinc-400'}`}></span>
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-black/50">
                {/* Search Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                    <div>
                         {activeTab === 'materials' && <SectionHeader title="Kayıtlı Materyaller" count={filteredItems.length} icon="fa-solid fa-shapes" />}
                         {activeTab === 'reports' && <SectionHeader title="Değerlendirme Raporları" count={filteredItems.length} icon="fa-solid fa-clipboard-user" />}
                         {activeTab === 'plans' && <SectionHeader title="Eğitim Planları" count={filteredItems.length} icon="fa-solid fa-calendar-check" />}
                    </div>
                    <div className="relative w-64">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            placeholder="Ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500"></i></div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50"><i className="fa-regular fa-folder-open"></i></div>
                            <p className="font-medium">Bu kategoride kayıt bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {activeTab === 'materials' && filteredItems.map((item: any) => (
                                <MaterialCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'materials')} isReadOnly={isReadOnly} />
                            ))}
                            {activeTab === 'reports' && filteredItems.map((item: any) => (
                                <ReportCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'reports')} isReadOnly={isReadOnly} />
                            ))}
                            {activeTab === 'plans' && filteredItems.map((item: any) => (
                                <PlanCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'plans')} isReadOnly={isReadOnly} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};