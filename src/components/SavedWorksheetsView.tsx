import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowLeft, 
  Layers, 
  FileBox, 
  CalendarClock, 
  Trash2, 
  Eye, 
  ChevronDown, 
  FolderOpen,
  LayoutGrid,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  Filter
} from 'lucide-react';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { curriculumService } from '../services/curriculumService';
import { cn } from '../utils/tailwindUtils';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface SharedWorksheetsViewProps {
    onLoad: (worksheet: SavedWorksheet) => void;
    onBack: () => void;
    targetUserId?: string;
}

const PAGE_SIZE = 12;

// --- Premium UI Components ---

const GlassCard = ({ children, className, onClick }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        onClick={onClick}
        className={cn(
            "relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer shadow-xl",
            className
        )}
    >
        {children}
    </motion.div>
);

const MaterialCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    const activityDef = ACTIVITIES.find(a => a.id === item.activityType);
    const categoryDef = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));

    const getGlowColor = () => {
        if (categoryDef?.id === 'math-logic') return 'from-blue-500/20 to-indigo-500/20';
        if (categoryDef?.id === 'reading-verbal') return 'from-emerald-500/20 to-teal-500/20';
        return 'from-amber-500/20 to-orange-500/20';
    };

    return (
        <GlassCard onClick={() => onLoad?.(item)} className="h-64 flex flex-col p-5">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", getGlowColor())}></div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 group-hover:text-accent transition-colors">
                    <i className={cn(activityDef?.icon || item.icon, "text-xl")}></i>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <span className="text-[10px] font-black text-accent/60 uppercase tracking-[0.2em] mb-1 font-lexend">
                    {categoryDef?.title || 'Genel Materyal'}
                </span>
                <h3 className="font-bold text-white/90 text-base leading-tight mb-2 line-clamp-2 font-lexend">
                    {item.name}
                </h3>
                <div className="mt-auto flex items-center justify-between text-[11px] text-white/30 font-lexend">
                    <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Mevcut Değil'}
                    </div>
                    {item.activityType === 'INFOGRAPHIC_STUDIO' && (
                        <div className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[9px] font-bold uppercase tracking-wider">İnfografik</div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

const ReportCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    return (
        <GlassCard className="h-72 flex flex-col p-6">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-accent"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex flex-col items-center justify-center text-white/90">
                    <ClipboardCheck className="w-6 h-6 mb-0.5" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">RAPOR</span>
                </div>
                {!isReadOnly && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }} className="text-white/10 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-white text-xl font-lexend mb-1">{item.studentName}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{item.grade}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{item.age} Yaş</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold tracking-widest mb-1">Tarih</span>
                        <span className="text-xs font-bold text-white/70">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20 text-center">
                        <span className="block text-[9px] text-emerald-400 opacity-60 uppercase font-bold tracking-widest mb-1">Durum</span>
                        <span className="text-xs font-bold text-emerald-400">Analiz Edildi</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onLoad?.(item)}
                className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group border border-white/10"
            >
                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Raporu Görüntüle
            </button>
        </GlassCard>
    );
};

const PlanCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    return (
        <GlassCard onClick={() => onLoad?.(item)} className="h-64 flex flex-col p-6">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4">
                <GraduationCap className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent/20">
                        {item.durationDays} Günlük Plan
                    </div>
                    {!isReadOnly && (
                         <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <h3 className="text-2xl font-black text-white font-lexend mb-1">{item.studentName}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-6 font-lexend">{item.note || 'Özel eğitim ve gelişim planı.'}</p>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40">
                        <ClipboardCheck className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold">{item.goals?.length || 0} Hedef Atandı</span>
                    </div>
                    <span className="text-[10px] text-white/20 font-mono">
                         {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};

// --- Main View ---

export const SavedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'materials' | 'reports' | 'plans'>('materials');
    const [activeCategory, setActiveCategory] = useState<string>('all');

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
            logError(e);
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

    const handleDelete = async (id: string, type: 'materials' | 'reports' | 'plans') => {
        if (isReadOnly || !confirm("Silmek istediğinize emin misiniz?")) return;

        try {
            if (type === 'materials') {
                if (!effectiveUserId) return;
                await worksheetService.deleteWorksheet(id, effectiveUserId);
                setWorksheets(prev => prev.filter(i => i.id !== id));
            } else if (type === 'plans') {
                await curriculumService.deleteCurriculum(id);
                setPlans(prev => prev.filter(i => i.id !== id));
            } else if (type === 'reports') {
                // Assessment deletion would go here if implemented in service
                setAssessments(prev => prev.filter(i => i.id !== id));
            }
        } catch (_e) {
            alert("Silme işlemi sırasında bir hata oluştu.");
        }
    };

    const filteredItems = useMemo(() => {
        const query = debouncedSearchQuery.toLowerCase();
        if (activeTab === 'materials') {
            return worksheets.filter(item => item && (item.name || '').toLowerCase().includes(query));
        }
        if (activeTab === 'reports') {
            return assessments.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        if (activeTab === 'plans') {
            return plans.filter(item => item && (item.studentName || '').toLowerCase().includes(query));
        }
        return [];
    }, [activeTab, debouncedSearchQuery, worksheets, assessments, plans]);

    const tabs = [
        { id: 'materials', label: 'Materyaller', icon: Layers, count: worksheets.length },
        { id: 'reports', label: 'Raporlar', icon: FileBox, count: assessments.length },
        { id: 'plans', label: 'Eğitim Planları', icon: CalendarClock, count: plans.length },
    ];

    return (
        <div className="flex h-full bg-[#0B1120] text-slate-200 overflow-hidden font-lexend relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>

            {/* Premium SIDEBAR */}
            <div className="w-80 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 flex flex-col p-6 shrink-0 relative z-10">
                <div className="mb-10 flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Arşiv</h2>
                        <p className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">Dijital Kütüphane</p>
                    </div>
                </div>

                <div className="space-y-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setActiveCategory('all'); }}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold text-sm border",
                                activeTab === tab.id 
                                    ? "bg-accent/20 text-accent border-accent/20 shadow-lg shadow-accent/5" 
                                    : "text-white/40 border-transparent hover:bg-white/5 hover:text-white/60"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-accent" : "text-white/20")} />
                                <span>{tab.label}</span>
                            </div>
                            {tab.count > 0 && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] font-black",
                                    activeTab === tab.id ? "bg-accent/20 text-accent" : "bg-white/5 text-white/20"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'materials' && (
                    <div className="mt-2 pt-6 border-t border-white/5 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 px-2">
                             <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Kategoriler</h4>
                             <Filter className="w-3.5 h-3.5 text-white/20" />
                        </div>
                        <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-6">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-xs rounded-xl transition-all border",
                                    activeCategory === 'all' 
                                        ? "bg-white/10 text-white font-bold border-white/10 shadow-md" 
                                        : "text-white/40 border-transparent hover:text-white/60 hover:bg-white/5"
                                )}
                            >
                                Tüm Materyaller ✨
                            </button>
                            {ACTIVITY_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 text-xs rounded-xl transition-all flex items-center gap-3 border",
                                        activeCategory === cat.id 
                                            ? "bg-white/10 text-white font-bold border-white/10 shadow-md" 
                                            : "text-white/40 border-transparent hover:text-white/60 hover:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        cat.id === 'math-logic' ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : 
                                        cat.id === 'reading-verbal' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : 
                                        "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                    )}></div>
                                    <span className="truncate">{cat.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Search Bar & Stats Header */}
                <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            {activeTab === 'materials' ? 'Materyaller' : activeTab === 'reports' ? 'Raporlar' : 'Eğitim Planları'}
                        </h1>
                        <span className="text-accent/60 font-bold text-lg">({filteredItems.length})</span>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-indigo-500/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-2xl overflow-hidden focus-within:border-accent/40 shadow-2xl transition-all">
                            <Search className="w-5 h-5 ml-4 text-white/30 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder={`${activeTab === 'materials' ? 'Materyal' : 'Öğrenci'} ismi ile ara...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none text-sm text-white placeholder:text-white/20 outline-none font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                             <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                             <p className="text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">Arşiv Yükleniyor...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="w-32 h-32 bg-white/5 rounded-[3rem] border border-white/5 flex items-center justify-center text-white/10 relative overflow-hidden">
                                <FolderOpen className="w-16 h-16 relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50"></div>
                            </div>
                            <div className="max-w-xs">
                                <h3 className="text-xl font-bold text-white/80 mb-2">Henüz kayıt bulunamadı</h3>
                                <p className="text-sm text-white/30">Aradığın kriterlerde bir içerik kütüphanede mevcut değil. Farklı bir arama yapabilirsin.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="pb-24">
                            <motion.div 
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                            >
                                <AnimatePresence mode='popLayout'>
                                    {activeTab === 'materials' && filteredItems.map((item) => (
                                        <MaterialCard 
                                            key={item.id} 
                                            item={item} 
                                            onLoad={onLoad} 
                                            onDelete={(id: string) => handleDelete(id, 'materials')} 
                                            isReadOnly={isReadOnly} 
                                        />
                                    ))}
                                    {activeTab === 'reports' && filteredItems.map((item) => (
                                        <ReportCard 
                                            key={item.id} 
                                            item={item} 
                                            onLoad={onLoad} 
                                            onDelete={(id: string) => handleDelete(id, 'reports')} 
                                            isReadOnly={isReadOnly} 
                                        />
                                    ))}
                                    {activeTab === 'plans' && filteredItems.map((item) => (
                                        <PlanCard 
                                            key={item.id} 
                                            item={item} 
                                            onLoad={onLoad} 
                                            onDelete={(id: string) => handleDelete(id, 'plans')} 
                                            isReadOnly={isReadOnly} 
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Load More Premium Button */}
                            {hasMore && filteredItems.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="mt-16 flex justify-center"
                                >
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="relative group p-[1px] rounded-2xl overflow-hidden shadow-2xl transition-all hover:shadow-accent/20"
                                    >
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-r from-accent/50 via-indigo-500/50 to-accent/50",
                                            loadingMore ? "animate-pulse" : "group-hover:animate-spin-slow"
                                        )}></div>
                                        <div className="relative px-12 py-4 bg-slate-900 rounded-2xl flex items-center gap-3 font-black text-xs text-white uppercase tracking-widest group-hover:bg-slate-800 transition-colors">
                                            {loadingMore ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                            )}
                                            {loadingMore ? 'Yükleniyor...' : 'Daha Fazlasını Keşfet'}
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Overlay Footer */}
            <div className="absolute bottom-6 right-8 z-20 hidden md:block">
                 <div className="px-6 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4">
                     <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Oogmatik Premium Archives v2.0</span>
                 </div>
            </div>
        </div>
    );
};