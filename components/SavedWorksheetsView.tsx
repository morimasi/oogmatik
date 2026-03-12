import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment, Curriculum, ActivityType } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { curriculumService } from '../services/curriculumService';

interface SharedWorksheetsViewProps {
    onLoad: (worksheet: SavedWorksheet) => void;
    onBack: () => void;
    targetUserId?: string;
}

const PAGE_SIZE = 12;

const ViewToggle = ({ mode, onChange }: { mode: 'grid' | 'list', onChange: (m: 'grid' | 'list') => void }) => (
    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <button
            onClick={() => onChange('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'grid' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            <i className="fa-solid fa-table-cells-large"></i>
        </button>
        <button
            onClick={() => onChange('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'list' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
            <i className="fa-solid fa-list"></i>
        </button>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] h-64 animate-pulse border-2 border-zinc-50 dark:border-zinc-800">
        <div className="p-6">
            <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-2xl mb-6"></div>
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4 mb-3"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/2 mb-8"></div>
            <div className="flex justify-between mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="w-20 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
        </div>
    </div>
);

const MaterialCard = ({ item, onLoad, onDelete, isSelected, onSelect, isSelectionMode, viewMode }: any) => {
    if (!item || !item.id) return null;

    const activityDef = ACTIVITIES.find(a => a.id === item.activityType);
    const categoryDef = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));
    const pageCount = Array.isArray(item.worksheetData) ? item.worksheetData.length : 1;

    // AI Insight (Pedagojik Etiket)
    const aiInsight = item.aiSummary || (categoryDef?.id === 'math-logic' ? 'Analitik Düşünme Odaklı' : categoryDef?.id === 'reading-verbal' ? 'Sözel Bellek Güçlendirici' : 'Bilişsel Gelişim Destekli');

    if (viewMode === 'list') {
        return (
            <div
                onClick={() => isSelectionMode ? onSelect(item.id) : onLoad(item)}
                className={`group flex items-center gap-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-zinc-100 dark:border-zinc-800 hover:border-indigo-300'}`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                    <i className={activityDef?.icon || item.icon}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-zinc-800 dark:text-zinc-100 text-sm truncate">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{categoryDef?.title}</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                        <span className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                            <i className="fa-solid fa-brain text-[8px]"></i> {aiInsight}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-[10px] font-bold text-zinc-400 font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </div>
                    {!isSelectionMode && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 rounded-full hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => isSelectionMode ? onSelect(item.id) : onLoad(item)}
            className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-900/50 hover:shadow-xl'}`}
        >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${categoryDef?.id === 'math-logic' ? 'bg-blue-500' : categoryDef?.id === 'reading-verbal' ? 'bg-emerald-500' : 'bg-amber-500 opacity-70'}`}></div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${isSelected ? 'bg-indigo-600 text-white rotate-6 scale-110' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                        <i className={activityDef?.icon || item.icon}></i>
                    </div>
                    <div className="flex gap-1">
                        {isSelectionMode ? (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
                                {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 hover:text-red-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                                <i className="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 rounded uppercase tracking-tighter">
                            {categoryDef?.title || 'Genel'}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded">
                            <i className="fa-solid fa-brain text-[8px] text-indigo-500 animate-pulse"></i>
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                AI ANALİZ
                            </span>
                        </div>
                    </div>
                    <h3 className="font-black text-zinc-800 dark:text-zinc-100 text-lg leading-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                        {item.name}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 mt-2 line-clamp-1 italic">{aiInsight}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-dashed border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                        <i className="fa-regular fa-clock"></i>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                        <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">{pageCount}</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Sayfa</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportCard = ({ item, onLoad, onDelete, isSelected, onSelect, isSelectionMode }: any) => (
    <div onClick={() => isSelectionMode ? onSelect(item.id) : onLoad(item)} className={`bg-white dark:bg-zinc-950 rounded-[2.5rem] p-0 border-2 transition-all cursor-pointer overflow-hidden flex flex-col h-full group ${isSelected ? 'border-purple-600 ring-4 ring-purple-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-900/50 hover:shadow-xl'}`}>
        <div className="h-3 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        <div className="p-8 flex-1">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-black text-zinc-900 dark:text-white text-xl group-hover:text-purple-600 transition-colors leading-tight">{item.studentName}</h3>
                    <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest leading-none">{item.grade} • {item.age} Yaş</p>
                </div>
                {isSelectionMode ? (
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/10 transition-transform group-hover:scale-110">
                        <i className="fa-solid fa-file-medical"></i>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <span className="block text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Tarih</span>
                    <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="block text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1">Durum</span>
                    <span className="text-sm font-black text-emerald-600">Analiz Edildi</span>
                </div>
            </div>
        </div>
        <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-black text-purple-600 flex items-center gap-2">
                <i className="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-1"></i> Raporu İncele
            </span>
            {!isSelectionMode && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 text-zinc-300 hover:text-red-500 transition-colors shadow-sm">
                    <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
            )}
        </div>
    </div>
);

const PlanCard = ({ item, onLoad, onDelete, isSelected, onSelect, isSelectionMode }: any) => (
    <div onClick={() => isSelectionMode ? onSelect(item.id) : onLoad(item)} className={`bg-white dark:bg-zinc-950 rounded-[2.5rem] border-2 shadow-sm p-8 relative overflow-hidden group cursor-pointer transition-all flex flex-col h-full ${isSelected ? 'border-amber-600 ring-4 ring-amber-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-900/50 hover:shadow-xl'}`}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <i className="fa-solid fa-graduation-cap text-[120px]"></i>
        </div>
        <div className="relative z-10 flex-1">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {item.durationDays} Günlük Plan
                    </span>
                    {isSelectionMode && (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-amber-600 border-amber-600' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
                            {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                        </div>
                    )}
                </div>
                {!isSelectionMode && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash-can"></i></button>
                )}
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors leading-tight">{item.studentName}</h3>
            <p className="text-sm font-bold text-zinc-500 line-clamp-2 mb-8 leading-relaxed">{item.note || 'Özel eğitim ve gelişim planı.'}</p>
            <div className="flex gap-4 mt-auto">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 group/box transition-all hover:bg-white dark:hover:bg-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/5">
                        <i className="fa-solid fa-bullseye"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hedefler</span>
                        <span className="text-base font-black text-zinc-800 dark:text-zinc-200 leading-tight">{item.goals?.length || 0} Adet</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SectionHeader = ({ title, count, icon, subtitle }: { title: string, count: number, icon: string, subtitle?: string }) => (
    <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-8 duration-700">
        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-black flex items-center justify-center text-3xl shadow-xl shadow-zinc-900/20 dark:shadow-zinc-100/10">
            <i className={icon}></i>
        </div>
        <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">{title}</h2>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">{count} KAYIT ARŞİVLENDİ</span>
                {subtitle && <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>}
                {subtitle && <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{subtitle}</span>}
            </div>
        </div>
    </div>
);

const FilterButton = ({ active, label, icon, onClick, count }: any) => (
    <button
        onClick={onClick}
        className={`w-full group relative flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all duration-300 overflow-hidden ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
    >
        <div className="relative z-10 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white/20' : 'bg-zinc-50 dark:bg-zinc-800 group-hover:bg-white'}`}>
                <i className={`${icon} text-sm ${active ? 'text-white' : 'text-zinc-400'}`}></i>
            </div>
            <span className="text-sm font-black tracking-tight">{label}</span>
        </div>
        {count !== undefined && (
            <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-indigo-700/50 text-indigo-100' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                {count}
            </span>
        )}
    </button>
);

export const SavedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'materials' | 'reports' | 'plans'>('materials');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Data Containers
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [plans, setPlans] = useState<Curriculum[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const effectiveUserId = targetUserId || user?.id;
    const isReadOnly = !!targetUserId && targetUserId !== user?.id;

    // Toggle multi-select mode
    const toggleSelectMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    };

    const handleItemSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setPage(0); // Reset page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (effectiveUserId) {
            setLoading(true);
            setWorksheets([]);
            setAssessments([]);
            setPlans([]);
            setPage(0);
            loadData(0);
        }
        else setLoading(false);
    }, [effectiveUserId, activeTab, debouncedSearchQuery, activeCategory]);

    const loadData = async (pageNum: number) => {
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            if (activeTab === 'materials') {
                const wsData = await worksheetService.getUserWorksheets(effectiveUserId!, pageNum, PAGE_SIZE, activeCategory);
                if (pageNum === 0) setWorksheets(wsData.items);
                else setWorksheets(prev => [...prev, ...wsData.items]);
                setHasMore(wsData.items.length === PAGE_SIZE);
            } else if (activeTab === 'reports') {
                const asData = await assessmentService.getUserAssessments(effectiveUserId!);
                setAssessments(asData);
                setHasMore(false);
            } else if (activeTab === 'plans') {
                const plData = await curriculumService.getUserCurriculums(effectiveUserId!);
                setPlans(plData);
                setHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage);
    };

    const handleDeleteMultiple = async () => {
        if (selectedIds.size === 0 || !user || !confirm(`${selectedIds.size} kaydı silmek istediğinize emin misiniz?`)) return;

        try {
            setLoading(true);
            const ids = Array.from(selectedIds);

            if (activeTab === 'materials') {
                await worksheetService.deleteMultipleWorksheets(ids, user.id);
                setWorksheets(prev => prev.filter(i => !selectedIds.has(i.id)));
            } else if (activeTab === 'reports') {
                await assessmentService.deleteMultipleAssessments(ids);
                setAssessments(prev => prev.filter(i => !selectedIds.has(i.id)));
            } else if (activeTab === 'plans') {
                await curriculumService.deleteMultipleCurriculums(ids);
                setPlans(prev => prev.filter(i => !selectedIds.has(i.id)));
            }

            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } catch (e) {
            alert("Toplu silme sırasında hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: 'materials' | 'reports' | 'plans') => {
        if (isReadOnly || !confirm("Silmek istediğinize emin misiniz?")) return;

        try {
            if (type === 'materials') {
                if (!user) return;
                await worksheetService.deleteWorksheet(id, user.id);
                setWorksheets(prev => prev.filter(i => i.id !== id));
            } else if (type === 'reports') {
                await assessmentService.deleteAssessment(id);
                setAssessments(prev => prev.filter(i => i.id !== id));
            } else if (type === 'plans') {
                await curriculumService.deleteCurriculum(id);
                setPlans(prev => prev.filter(i => i.id !== id));
            }
        } catch (e) {
            alert("Silme işlemi sırasında hata oluştu.");
        }
    };

    // --- FILTERING LOGIC ---
    const filteredItems = useMemo(() => {
        const query = debouncedSearchQuery.toLowerCase();

        if (activeTab === 'materials') {
            return worksheets.filter(item => {
                if (!item) return false;
                return (item.name || '').toLowerCase().includes(query);
            });
        }
        if (activeTab === 'reports') {
            return assessments.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        if (activeTab === 'plans') {
            return plans.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        return [];
    }, [activeTab, debouncedSearchQuery, worksheets, assessments, plans]);

    return (
        <div className="flex h-full bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">

            {/* SIDEBAR NAVIGATION */}
            <div className="w-80 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-8 shrink-0 relative z-20">
                <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-indigo-600 transition-all active:scale-90">
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <h3 className="font-black text-2xl text-zinc-900 dark:text-white tracking-tighter">Archive Hub</h3>
                    </div>
                </div>

                <div className="space-y-2 mb-10">
                    <FilterButton
                        active={activeTab === 'materials'}
                        label="Materyaller"
                        icon="fa-solid fa-layer-group"
                        onClick={() => { setActiveTab('materials'); setActiveCategory('all'); }}
                        count={worksheets.length}
                    />
                    <FilterButton
                        active={activeTab === 'reports'}
                        label="Gelişim Raporları"
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
                    <div className="flex-1 overflow-hidden flex flex-col pt-8 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="px-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">KATEGORİLER</h4>
                        <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2 flex-1">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`w-full text-left px-5 py-3 text-xs rounded-2xl transition-all font-black ${activeCategory === 'all' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                            >
                                Tüm Materyaller
                            </button>
                            {ACTIVITY_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-5 py-3 text-xs rounded-2xl transition-all flex items-center justify-between font-bold group ${activeCategory === cat.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full transition-transform group-hover:scale-125 ${cat.id === 'math-logic' ? 'bg-blue-400' : cat.id === 'reading-verbal' ? 'bg-emerald-400' : 'bg-amber-400 opacity-60'}`}></span>
                                        {cat.title}
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900/10 pointer-events-none"></div>

                {/* Search & Header Bar */}
                <div className="p-10 pb-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        {activeTab === 'materials' && <SectionHeader title="Kayıtlı Materyaller" count={filteredItems.length} icon="fa-solid fa-shapes" subtitle={ACTIVITY_CATEGORIES.find(c => c.id === activeCategory)?.title} />}
                        {activeTab === 'reports' && <SectionHeader title="Gelişim Raporları" count={filteredItems.length} icon="fa-solid fa-clipboard-user" />}
                        {activeTab === 'plans' && <SectionHeader title="Eğitim Planları" count={filteredItems.length} icon="fa-solid fa-calendar-check" />}
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input
                                type="text"
                                placeholder="Aradığınız içeriği yazın..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-zinc-100/50 dark:bg-zinc-900 border border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold shadow-inner outline-none transition-all dark:text-white"
                            />
                        </div>
                        <ViewToggle mode={viewMode} onChange={setViewMode} />

                        {!isReadOnly && (
                            <button
                                onClick={toggleSelectMode}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${isSelectionMode ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:text-indigo-600'}`}
                                title="Toplu İşlem"
                            >
                                <i className="fa-solid fa-list-check"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk Action Bar */}
                {isSelectionMode && (
                    <div className="mx-10 mt-6 p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/20 flex items-center justify-between text-white animate-in slide-in-from-top-4 duration-300 relative z-20">
                        <div className="flex items-center gap-6 pl-4 font-black">
                            <span className="text-xl">
                                {selectedIds.size} <span className="text-sm opacity-70">Dosya Seçildi</span>
                            </span>
                            <div className="h-4 w-px bg-white/30"></div>
                            <button onClick={() => setSelectedIds(new Set(filteredItems.map(i => i.id)))} className="text-xs uppercase tracking-widest hover:underline">Hepsini Seç</button>
                            <button onClick={() => setSelectedIds(new Set())} className="text-xs uppercase tracking-widest hover:underline opacity-70">Bırak</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleDeleteMultiple} disabled={selectedIds.size === 0} className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-black text-xs transition-all flex items-center gap-2 disabled:opacity-50">
                                <i className="fa-solid fa-trash-can"></i> SEÇİLENLERİ SİL
                            </button>
                            <button onClick={toggleSelectMode} className="w-12 h-12 rounded-2xl bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition-all"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                )}

                {/* Main Repository Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                    {loading ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-300 opacity-60">
                            <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-10 text-6xl shadow-inner group">
                                <i className="fa-solid fa-box-open group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <h4 className="font-black text-2xl text-zinc-400 tracking-tighter">Hazine Kasası Boş</h4>
                            <p className="text-sm font-bold mt-2 uppercase tracking-[0.2em] max-w-xs text-center">ARADIĞINIZ KRİTERLERE UYGUN BİR BİLGİ KAYDI BULUNAMADI.</p>
                        </div>
                    ) : (
                        <div className="pb-32">
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
                                {activeTab === 'materials' && filteredItems.map((item: any) => (
                                    <MaterialCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'materials')} isSelected={selectedIds.has(item.id)} onSelect={handleItemSelect} isSelectionMode={isSelectionMode} viewMode={viewMode} />
                                ))}
                                {activeTab === 'reports' && filteredItems.map((item: any) => (
                                    <ReportCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'reports')} isSelected={selectedIds.has(item.id)} onSelect={handleItemSelect} isSelectionMode={isSelectionMode} />
                                ))}
                                {activeTab === 'plans' && filteredItems.map((item: any) => (
                                    <PlanCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'plans')} isSelected={selectedIds.has(item.id)} onSelect={handleItemSelect} isSelectionMode={isSelectionMode} />
                                ))}
                            </div>

                            {hasMore && activeTab === 'materials' && (
                                <div className="mt-20 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="group px-12 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] font-black text-sm text-zinc-800 dark:text-zinc-200 hover:border-indigo-500 transition-all shadow-xl hover:shadow-indigo-500/10 flex items-center gap-4 active:scale-95 disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-chevron-down group-hover:translate-y-1 transition-transform"></i>
                                        )}
                                        ARŞİVDE DERİNE İN
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Decorative Background Element */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
};