import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { curriculumService } from '../services/curriculumService';
import '../styles/archiveStyles.css';

interface SharedWorksheetsViewProps {
    onLoad: (worksheet: SavedWorksheet) => void;
    onBack: () => void;
    targetUserId?: string;
}

const PAGE_SIZE = 12;

type ViewMode = 'grid' | 'list';

const MaterialCard = ({ item, onLoad, onDelete, isReadOnly, isSelected, onToggleSelect, viewMode }: any) => {
    if (!item || !item.id) return null;

    const activityDef = ACTIVITIES.find(a => a.id === item.activityType);
    const categoryDef = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));

    if (viewMode === 'list') {
        return (
            <div
                className={`archive-glass p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80 cursor-pointer border ${isSelected ? 'border-indigo-500 shadow-sm' : 'border-zinc-100 dark:border-zinc-800'}`}
                onClick={() => onLoad(item)}
            >
                <div onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id); }} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                    {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <i className={activityDef?.icon || item.icon}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{item.name}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{categoryDef?.title || 'Genel'}</p>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono hidden md:block">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '-'}
                </div>
                {!isReadOnly && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-8 h-8 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            onClick={() => onLoad(item)}
            className={`group archive-glass archive-card-hover rounded-[2rem] p-6 border transition-all cursor-pointer relative overflow-hidden flex flex-col h-full ${isSelected ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10' : 'border-zinc-100 dark:border-zinc-800'}`}
        >
            <div className="absolute top-4 right-4 z-10">
                <div
                    onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id); }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white scale-110' : 'bg-white/50 dark:bg-zinc-900/50 border-white/20 text-transparent opacity-0 group-hover:opacity-100'}`}
                >
                    <i className="fa-solid fa-check text-xs"></i>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-2xl text-zinc-600 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500">
                    <i className={activityDef?.icon || item.icon}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest block mb-1">
                        {categoryDef?.title || 'Genel'}
                    </span>
                    <h3 className="font-black text-zinc-800 dark:text-zinc-100 text-base leading-tight truncate">
                        {item.name}
                    </h3>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-100/50 dark:border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1 rounded-lg">
                        <i className="fa-regular fa-calendar-check"></i>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </div>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

const SectionHeader = ({ title, count, icon, viewMode, setViewMode }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in-up">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/20">
                <i className={icon}></i>
            </div>
            <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">{title}</h2>
                <p className="text-xs font-black text-zinc-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {count} Toplam Materyal
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
            <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
                <i className="fa-solid fa-grip-vertical"></i>
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
                <i className="fa-solid fa-list-ul"></i>
            </button>
        </div>
    </div>
);

const NavButton = ({ active, label, icon, onClick, count }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-xs group relative overflow-hidden ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
    >
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600'}`}>
                <i className={`${icon} w-4 text-center`}></i>
            </div>
            <span>{label}</span>
        </div>
        {count !== undefined && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black relative z-10 ${active ? 'bg-indigo-700 text-white/90' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                {count}
            </span>
        )}
        {active && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>}
    </button>
);

export const SavedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'materials' | 'reports' | 'plans'>('materials');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setPage(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (effectiveUserId) {
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

    const handleToggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleDelete = async (id: string, type: 'materials' | 'reports' | 'plans') => {
        if (isReadOnly || !confirm("Bu kaydı silmek istediğinizden emin misiniz?")) return;

        try {
            if (type === 'materials') {
                if (!user) return;
                await worksheetService.deleteWorksheet(id, user.id);
                setWorksheets(prev => prev.filter(i => i.id !== id));
            } else if (type === 'plans') {
                await curriculumService.deleteCurriculum(id);
                setPlans(prev => prev.filter(i => i.id !== id));
            } else if (type === 'reports') {
                setAssessments(prev => prev.filter(i => i.id !== id));
            }
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (e) {
            alert("Silme işlemi sırasında hata oluştu.");
        }
    };

    const handleBulkDelete = async () => {
        if (isReadOnly || selectedIds.size === 0 || !confirm(`${selectedIds.size} kaydı silmek istediğinizden emin misiniz?`)) return;

        setLoading(true);
        try {
            for (const id of selectedIds) {
                if (activeTab === 'materials' && user) await worksheetService.deleteWorksheet(id, user.id);
                else if (activeTab === 'plans') await curriculumService.deleteCurriculum(id);
            }
            if (activeTab === 'materials') setWorksheets(prev => prev.filter(i => !selectedIds.has(i.id)));
            else if (activeTab === 'plans') setPlans(prev => prev.filter(i => !selectedIds.has(i.id)));
            else if (activeTab === 'reports') setAssessments(prev => prev.filter(i => !selectedIds.has(i.id)));

            setSelectedIds(new Set());
        } catch (e) {
            alert("Toplu silme sırasında hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        const query = debouncedSearchQuery.toLowerCase();
        if (activeTab === 'materials') return worksheets.filter(item => (item.name || '').toLowerCase().includes(query));
        if (activeTab === 'reports') return assessments.filter(item => (item.studentName || '').toLowerCase().includes(query));
        if (activeTab === 'plans') return plans.filter(item => (item.studentName || '').toLowerCase().includes(query));
        return [];
    }, [activeTab, debouncedSearchQuery, worksheets, assessments, plans]);

    return (
        <div className="flex h-full bg-[#f8f9fc] dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">

            {/* SIDEBAR NAVIGATION */}
            <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-8 shrink-0 relative z-30">
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-all active:scale-90"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <h3 className="font-black text-2xl text-zinc-800 dark:text-white tracking-tight">Arşiv</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Yönetim Merkezi</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <NavButton
                        active={activeTab === 'materials'}
                        label="Materyal Kütüphanesi"
                        icon="fa-solid fa-folder-tree"
                        onClick={() => { setActiveTab('materials'); setActiveCategory('all'); }}
                        count={worksheets.length}
                    />
                    <NavButton
                        active={activeTab === 'reports'}
                        label="Gelişim Raporları"
                        icon="fa-solid fa-chart-line"
                        onClick={() => setActiveTab('reports')}
                        count={assessments.length}
                    />
                    <NavButton
                        active={activeTab === 'plans'}
                        label="Eğitim Programları"
                        icon="fa-solid fa-graduation-cap"
                        onClick={() => setActiveTab('plans')}
                        count={plans.length}
                    />
                </div>

                {activeTab === 'materials' && (
                    <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
                        <h4 className="px-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">Branşlar</h4>
                        <div className="space-y-2 max-h-[35vh] overflow-y-auto scroll-hide pr-2">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`w-full text-left px-5 py-3 text-xs rounded-2xl transition-all font-black ${activeCategory === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                <span className={`inline-block w-2.5 h-2.5 rounded-full mr-3 bg-zinc-400`}></span>
                                Tüm Materyaller
                            </button>
                            {ACTIVITY_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-5 py-3 text-xs rounded-2xl transition-all font-black flex items-center justify-between ${activeCategory === cat.id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${cat.id === 'math-logic' ? 'bg-blue-500' : cat.id === 'reading-verbal' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        {cat.title}
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-[8px] opacity-30"></i>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm relative overflow-hidden">

                {/* Search & Action Bar */}
                <div className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 z-20">
                    <div className="relative flex-1 max-w-2xl w-full group">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors"></i>
                        <input
                            type="text"
                            placeholder="Dosya adı, öğrenci veya kategori ile hızlı arama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>

                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 animate-fade-in-up">
                            <span className="text-xs font-black text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                <span className="text-indigo-600 dark:text-indigo-400">{selectedIds.size}</span> Öğe Seçildi
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                                Toplu Sil
                            </button>
                        </div>
                    )}
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            title={activeTab === 'materials' ? 'Materyaller' : activeTab === 'reports' ? 'Gelişim Raporları' : 'Eğitim Planları'}
                            count={filteredItems.length}
                            icon={activeTab === 'materials' ? 'fa-solid fa-boxes-stacked' : activeTab === 'reports' ? 'fa-solid fa-chart-pie' : 'fa-solid fa-graduation-cap'}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {loading ? (
                            <div className="h-96 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-black text-zinc-400 animate-pulse">ARŞİV TARANIYOR...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center text-zinc-400 text-center">
                                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-6 text-4xl shadow-inner">
                                    <i className="fa-regular fa-folder-open opacity-30"></i>
                                </div>
                                <h4 className="text-xl font-black text-zinc-800 dark:text-zinc-200">Dosya Bulunamadı</h4>
                                <p className="text-xs font-bold mt-2 max-w-xs px-4">Henüz bir kayıt oluşturulmamış veya arama kriterlerinizle eşleşen dosya yok.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                {activeTab === 'materials' && filteredItems.map((item: any) => (
                                    <MaterialCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'materials')} isReadOnly={isReadOnly} isSelected={selectedIds.has(item.id)} onToggleSelect={handleToggleSelect} viewMode={viewMode} />
                                ))}
                                {activeTab === 'reports' && filteredItems.map((item: any) => (
                                    <div key={item.id} className="animate-fade-in-up">
                                        <div onClick={() => onLoad(item)} className="archive-glass rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 flex items-center justify-center text-xl">
                                                    <i className="fa-solid fa-clipboard-user"></i>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, 'reports'); }} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">{item.studentName}</h3>
                                            <p className="text-xs font-bold text-zinc-500 mb-4">{item.grade} • {item.age} Yaş</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">Analiz Hazır</span>
                                                <span className="text-[10px] text-zinc-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {activeTab === 'plans' && filteredItems.map((item: any) => (
                                    <div key={item.id} className="animate-fade-in-up">
                                        <div onClick={() => onLoad(item)} className="archive-glass rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                                    {item.durationDays} GÜNLÜK PROGRAM
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-2">{item.studentName}</h3>
                                            <p className="text-[11px] font-bold text-zinc-500 line-clamp-2 mb-6">{item.note || 'Özel eğitim planı.'}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px]">
                                                    <i className="fa-solid fa-calendar-day"></i>
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, 'plans'); }} className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:text-red-500 transition-colors">
                                                    <i className="fa-solid fa-trash-can text-xs"></i>
                                                </button>
                                            </div>
                                            <>
                                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                                    {activeTab === 'materials' && filteredItems.map((item: any) => (
                                                        <MaterialCard key={item.id} item={item} onLoad={onLoad} onDelete={(id: string) => handleDelete(id, 'materials')} isReadOnly={isReadOnly} isSelected={selectedIds.has(item.id)} onToggleSelect={handleToggleSelect} viewMode={viewMode} />
                                                    ))}
                                                    {activeTab === 'reports' && filteredItems.map((item: any) => (
                                                        <div key={item.id} className="animate-fade-in-up">
                                                            <div onClick={() => onLoad(item)} className="archive-glass rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 flex items-center justify-center text-xl">
                                                                        <i className="fa-solid fa-clipboard-user"></i>
                                                                    </div>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, 'reports'); }} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <i className="fa-solid fa-trash-can"></i>
                                                                    </button>
                                                                </div>
                                                                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">{item.studentName}</h3>
                                                                <p className="text-xs font-bold text-zinc-500 mb-4">{item.grade} • {item.age} Yaş</p>
                                                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">Analiz Hazır</span>
                                                                    <span className="text-[10px] text-zinc-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {activeTab === 'plans' && filteredItems.map((item: any) => (
                                                        <div key={item.id} className="animate-fade-in-up">
                                                            <div onClick={() => onLoad(item)} className="archive-glass rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                                                        {item.durationDays} GÜNLÜK PROGRAM
                                                                    </span>
                                                                </div>
                                                                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-2">{item.studentName}</h3>
                                                                <p className="text-[11px] font-bold text-zinc-500 line-clamp-2 mb-6">{item.note || 'Özel eğitim planı.'}</p>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px]">
                                                                        <i className="fa-solid fa-calendar-day"></i>
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, 'plans'); }} className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:text-red-500 transition-colors">
                                                                        <i className="fa-solid fa-trash-can text-xs"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {hasMore && filteredItems.length > 0 && (
                                                    <div className="mt-16 pb-12 flex justify-center">
                                                        <button
                                                            onClick={handleLoadMore}
                                                            disabled={loadingMore}
                                                            className="px-12 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.25rem] font-black text-xs text-zinc-600 dark:text-zinc-300 hover:border-indigo-500 transition-all shadow-xl shadow-zinc-100/50 dark:shadow-none flex items-center gap-3 disabled:opacity-50 active:scale-95"
                                                        >
                                                            {loadingMore ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-chevron-down"></i>}
                                                            DAHA FAZLA GÖSTER
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                        )}
                                        </div>
                                    </div>
            </div>
        </div>
                    );
};
                    ```
