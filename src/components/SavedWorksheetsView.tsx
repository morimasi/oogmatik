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
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  Filter,
  Library,
} from 'lucide-react';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { curriculumService } from '../services/curriculumService';
import { cn } from '../utils/tailwindUtils';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface SharedWorksheetsViewProps {
    onLoad: (item: SavedWorksheet | SavedAssessment | Curriculum) => void;
    onBack: () => void;
    targetUserId?: string;
}

const PAGE_SIZE = 12;

/** Kategori rengi: ACTIVITY_CATEGORIES kimliği + kitapçık */
const CATEGORY_ACCENT_DOT: Record<string, string> = {
  'visual-perception': 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.45)]',
  'reading-comprehension': 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]',
  'reading-verbal': 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.45)]',
  'math-logic': 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.45)]',
  'social-history': 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]',
  'spld-premium': 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.45)]',
  workbook: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.45)]',
};

function categoryDotClass(id: string | undefined): string {
  if (!id) return 'bg-[var(--text-muted)] opacity-60';
  return CATEGORY_ACCENT_DOT[id] || 'bg-[var(--accent-color)] shadow-[0_0_8px_rgba(var(--accent-color-rgb,99,102,241),0.35)]';
}

function resolveWorksheetCategory(sheet: SavedWorksheet): (typeof ACTIVITY_CATEGORIES)[number] | undefined {
  const fromStored = ACTIVITY_CATEGORIES.find((c) => c.id === sheet.category?.id);
  if (fromStored) return fromStored;
  return ACTIVITY_CATEGORIES.find((c) =>
    (c.activities as readonly string[]).includes(sheet.activityType)
  );
}

function categoryGlowGradient(cid: string | undefined): string {
  switch (cid) {
    case 'math-logic':
      return 'from-blue-500/12 to-indigo-500/12';
    case 'reading-verbal':
      return 'from-sky-500/12 to-cyan-500/12';
    case 'reading-comprehension':
      return 'from-emerald-500/12 to-teal-500/12';
    case 'visual-perception':
      return 'from-violet-500/12 to-fuchsia-500/12';
    case 'social-history':
      return 'from-amber-500/12 to-orange-500/12';
    case 'spld-premium':
      return 'from-rose-500/12 to-purple-500/12';
    case 'workbook':
      return 'from-indigo-500/15 to-accent/15';
    default:
      return 'from-[var(--accent-color)]/10 to-transparent';
  }
}

// --- Premium UI (tema token'ları) ---

const GlassCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        whileHover={{ y: onClick ? -4 : 0, transition: { duration: 0.18 } }}
        onClick={onClick}
        className={cn(
            'relative group overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-md backdrop-blur-sm transition-[box-shadow,border-color,background-color]',
            onClick &&
              'cursor-pointer hover:border-[var(--accent-color)]/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/35',
            className,
        )}
    >
        {children}
    </motion.div>
);

const MaterialCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    const activityDef = ACTIVITIES.find(a => a.id === item.activityType);
    const categoryDef = resolveWorksheetCategory(item);
    const cid = item.category?.id === 'workbook' || item.activityType === 'WORKBOOK' ? 'workbook' : categoryDef?.id;

    const getGlowColor = () => categoryGlowGradient(cid);

    const iconFa = activityDef?.icon || item.icon || 'fa-solid fa-file-lines';

    return (
        <GlassCard onClick={() => onLoad?.(item)} className="h-64 flex flex-col p-5">
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', getGlowColor())}></div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--accent-color)] shadow-inner transition-colors group-hover:border-[var(--accent-color)]/25">
                    <i className={cn(iconFa, 'text-xl leading-none')} aria-hidden />
                </div>
                {!isReadOnly && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] opacity-0 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                        aria-label="Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="relative z-10 flex flex-1 flex-col">
                <span className="font-lexend mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-color)] opacity-85">
                    {item.category?.id === 'workbook' || item.activityType === 'WORKBOOK'
                      ? 'Çalışma Kitapçığı'
                      : categoryDef?.title || item.category?.title || 'Genel materyal'}
                </span>
                <h3 className="font-lexend mb-2 line-clamp-2 text-base font-bold leading-tight text-[var(--text-primary)]">
                    {item.name}
                </h3>
                <div className="font-lexend mt-auto flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '—'}
                    </div>
                    {item.activityType === 'INFOGRAPHIC_STUDIO' && (
                        <div className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-color)]">
                          İnfografik
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

const ReportCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    return (
        <GlassCard className="flex h-72 cursor-default flex-col p-6 hover:translate-y-0">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 via-[var(--accent-color)] to-indigo-500 opacity-90" />
            
            <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                    <ClipboardCheck className="mb-0.5 h-6 w-6 text-[var(--accent-color)]" aria-hidden />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--text-muted)]">Rapor</span>
                </div>
                {!isReadOnly && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                      className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Sil"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-lexend mb-1 text-xl font-bold text-[var(--text-primary)]">{item.studentName}</h3>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">{item.grade}</span>
                    <span className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">{item.age} yaş</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-center">
                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Tarih</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '—'}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3 text-center dark:bg-emerald-500/12">
                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">Durum</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Kayıtlı</span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onLoad?.(item)}
                className="font-lexend mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-[var(--accent-color)]/35 hover:bg-[var(--accent-muted)]"
            >
                <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden /> Raporu aç
            </button>
        </GlassCard>
    );
};

const PlanCard = ({ item, onLoad, onDelete, isReadOnly }: any) => {
    if (!item || !item.id) return null;
    return (
        <GlassCard onClick={() => onLoad?.(item)} className="relative flex h-64 flex-col overflow-hidden p-6">
            <div className="absolute -right-4 -top-4 p-8 text-[var(--accent-color)] opacity-[0.07]">
                <GraduationCap className="h-32 w-32" aria-hidden />
            </div>

            <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg border border-[var(--accent-color)]/25 bg-[var(--accent-muted)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">
                        {item.durationDays} günlük plan
                    </div>
                    {!isReadOnly && (
                         <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Sil"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <h3 className="font-lexend mb-1 text-2xl font-black text-[var(--text-primary)]">{item.studentName}</h3>
                <p className="font-lexend mb-6 line-clamp-2 text-sm text-[var(--text-secondary)]">{item.note || 'Özel eğitim ve gelişim planı.'}</p>

                <div className="mt-auto flex items-center justify-between text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 shrink-0 text-[var(--accent-color)]" aria-hidden />
                        <span className="text-xs font-bold text-[var(--text-secondary)]">{item.goals?.length || 0} hedef</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-80">
                         {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '—'}
                    </span>
                </div>
            </div>
        </GlassCard>
    );
};

// --- Main View ---

export const SavedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
    const toast = useToastStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'materials' | 'reports' | 'plans'>('materials');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
    const [plans, setPlans] = useState<Curriculum[]>([]);
    const [materialsTotal, setMaterialsTotal] = useState(0);

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
                if (pageNum === 0) {
                    setWorksheets(wsData.items);
                    setMaterialsTotal(wsData.total);
                }
                else setWorksheets(prev => [...prev, ...wsData.items]);
                setHasMore((pageNum + 1) * PAGE_SIZE < wsData.total);
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
                if (!effectiveUserId) return;
                await assessmentService.deleteAssessment(id, effectiveUserId);
                setAssessments(prev => prev.filter(i => i.id !== id));
            }
            toast.success('Öğe kaldırıldı.');
        } catch (_e: unknown) {
            const msg =
                typeof _e === 'object' && _e !== null && 'message' in _e
                    ? String((_e as { message?: string }).message)
                    : 'Silme sırasında hata oluştu.';
            toast.error(msg);
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
        { id: 'materials' as const, label: 'Materyaller', icon: Layers, count: materialsTotal },
        { id: 'reports' as const, label: 'Raporlar', icon: FileBox, count: assessments.length },
        { id: 'plans' as const, label: 'Eğitim Planları', icon: CalendarClock, count: plans.length },
    ];

    if (!effectiveUserId && !loading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] px-8 font-lexend">
                <FolderOpen className="h-16 w-16 text-[var(--text-muted)] opacity-40" aria-hidden />
                <h2 className="text-center text-lg font-black text-[var(--text-primary)]">Dijital arşivi görüntülemek için giriş yapın</h2>
                <p className="max-w-md text-center text-sm text-[var(--text-secondary)]">
                    Materyaller, değerlendirme raporları ve eğitim planlarınız hesabınıza güvenli şekilde bağlanır.
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="mt-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-6 py-2 text-sm font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--accent-color)]/40"
                >
                    Ana görünüme dön
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex h-full overflow-hidden bg-[var(--bg-primary)] font-lexend text-[var(--text-primary)]">
            <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[var(--accent-color)]/[0.06] blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.05] blur-[100px]" />

            <div className="relative z-10 flex w-[min(22rem,100%)] shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/75 p-5 backdrop-blur-xl md:w-80 md:p-6">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-sm transition-colors hover:border-[var(--accent-color)]/35"
                        aria-label="Geri"
                    >
                        <ArrowLeft className="h-5 w-5 text-[var(--text-muted)] transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)] md:text-2xl">Dijital arşiv</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-color)] opacity-85">Materyal · rapor · plan</p>
                    </div>
                </div>

                <div className="mb-8 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => { setActiveTab(tab.id); setActiveCategory('all'); }}
                            className={cn(
                                'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition-all',
                                activeTab === tab.id
                                    ? 'border-[var(--accent-color)]/35 bg-[var(--accent-muted)] text-[var(--accent-color)] shadow-md'
                                    : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border-color)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-secondary)]',
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon className={cn('h-4 w-4 shrink-0', activeTab === tab.id ? 'text-[var(--accent-color)]' : 'opacity-50')} aria-hidden />
                                <span>{tab.label}</span>
                            </div>
                                {tab.count > 0 ? (
                                    <span
                                        className={cn(
                                            'rounded-md px-2 py-0.5 text-[10px] font-black tabular-nums',
                                            activeTab === tab.id
                                                ? 'bg-[var(--accent-color)]/15 text-[var(--accent-color)]'
                                                : 'bg-[var(--bg-paper)] text-[var(--text-muted)]',
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold tabular-nums text-[var(--text-muted)] opacity-60">0</span>
                                )}
                        </button>
                    ))}
                </div>

                {activeTab === 'materials' && (
                    <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-[var(--border-color)] pt-6">
                        <div className="mb-4 flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">İçerik kategorileri</h4>
                            <Filter className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-70" aria-hidden />
                        </div>
                        <div className="custom-scrollbar flex flex-1 flex-col space-y-1 overflow-y-auto pb-6 pr-1">
                            <button
                                type="button"
                                onClick={() => setActiveCategory('all')}
                                className={cn(
                                    'w-full rounded-xl border px-4 py-2.5 text-left text-xs transition-all',
                                    activeCategory === 'all'
                                        ? 'border-[var(--accent-color)]/40 bg-[var(--accent-muted)] font-bold text-[var(--accent-color)] shadow-sm'
                                        : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-secondary)]',
                                )}
                            >
                                Tüm materyaller
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCategory('workbook')}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-xs transition-all',
                                    activeCategory === 'workbook'
                                        ? 'border-[var(--accent-color)]/40 bg-[var(--accent-muted)] font-bold text-[var(--accent-color)] shadow-sm'
                                        : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-secondary)]',
                                )}
                            >
                                <div className={cn('h-2 w-2 shrink-0 rounded-full', categoryDotClass('workbook'))} aria-hidden />
                                <Library className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                                <span className="truncate">Çalışma kitapçığı</span>
                            </button>
                            {ACTIVITY_CATEGORIES.map((cat) => (
                                <button
                                    type="button"
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-xs transition-all',
                                        activeCategory === cat.id
                                            ? 'border-[var(--accent-color)]/40 bg-[var(--accent-muted)] font-bold text-[var(--accent-color)] shadow-sm'
                                            : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-secondary)]',
                                    )}
                                >
                                    <div className={cn('h-2 w-2 shrink-0 rounded-full', categoryDotClass(cat.id))} aria-hidden />
                                    <span className="truncate">{cat.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-[var(--bg-primary)]">
                <div className="flex flex-col justify-between gap-6 p-6 pb-4 md:flex-row md:items-end md:p-8 md:pb-4">
                    <div className="min-w-0">
                        <p className="mb-1 font-lexend text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] opacity-90">
                            {activeTab === 'materials' && activeCategory !== 'all'
                                ? activeCategory === 'workbook'
                                  ? 'Çalışma kitapçığı'
                                  : ACTIVITY_CATEGORIES.find((c) => c.id === activeCategory)?.title || 'Filtrelenmiş'
                                : 'Tüm kayıtlar'}
                        </p>
                        <div className="flex flex-wrap items-baseline gap-3">
                            <h1 className="font-lexend text-3xl font-black tracking-tight text-[var(--text-primary)] md:text-4xl">
                                {activeTab === 'materials' ? 'Materyaller' : activeTab === 'reports' ? 'Raporlar' : 'Eğitim planları'}
                            </h1>
                            <span className="text-lg font-bold tabular-nums text-[var(--accent-color)] opacity-80">
                                {filteredItems.length}
                                {activeTab === 'materials' && materialsTotal > 0 && searchQuery.trim() === ''
                                    ? ` / ${materialsTotal}`
                                    : ''}
                            </span>
                        </div>
                    </div>

                    <div className="group relative w-full max-w-md">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[var(--accent-color)]/15 to-indigo-500/15 opacity-40 blur transition-opacity duration-300 group-focus-within:opacity-80" />
                        <div className="relative flex items-center overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-sm transition-[border-color] focus-within:border-[var(--accent-color)]/35">
                            <Search className="ml-4 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-color)]" aria-hidden />
                            <input
                                type="search"
                                placeholder={`${activeTab === 'materials' ? 'Materyal adı' : 'Öğrenci'} ara…`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="font-lexend w-full border-none bg-transparent py-3.5 pl-3 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="custom-scrollbar flex flex-1 overflow-y-auto px-6 pb-8 pt-4 md:px-8">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent-color)]" />
                            <p className="animate-pulse font-lexend text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                Arşiv yükleniyor…
                            </p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex h-full flex-col items-center justify-center space-y-6 text-center"
                        >
                            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                <FolderOpen className="relative z-10 h-16 w-16 text-[var(--text-muted)] opacity-40" aria-hidden />
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/8 to-transparent" />
                            </div>
                            <div className="max-w-sm px-4">
                                <h3 className="font-lexend mb-2 text-xl font-bold text-[var(--text-primary)]">Kayıt yok</h3>
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    Arama veya seçtiğin kategoride sonuç çıkmadı. Farklı bir filtre deneyebilir veya yeni materyal üreterek arşive ekleyebilirsin.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="pb-24">
                            <motion.div
                                layout
                                className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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

                            {activeTab === 'materials' && hasMore && filteredItems.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="mt-12 flex justify-center md:mt-16"
                                >
                                    <button
                                        type="button"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="group relative overflow-hidden rounded-2xl p-px shadow-lg transition-shadow hover:shadow-xl"
                                    >
                                        <div
                                            className={cn(
                                                'absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/40 via-indigo-500/35 to-[var(--accent-color)]/40',
                                                loadingMore ? 'animate-pulse' : '',
                                            )}
                                            aria-hidden
                                        />
                                        <div className="relative flex items-center gap-3 rounded-[0.9rem] bg-[var(--bg-paper)] px-10 py-3.5 font-lexend text-xs font-black uppercase tracking-[0.14em] text-[var(--text-primary)] transition-colors group-hover:bg-[var(--bg-secondary)]">
                                            {loadingMore ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent-color)]" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" aria-hidden />
                                            )}
                                            {loadingMore ? 'Yükleniyor…' : 'Daha fazla materyal'}
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6 z-20 hidden md:block">
                <div className="pointer-events-none flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)]/92 px-5 py-2.5 shadow-lg backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent-color)]" aria-hidden />
                    <span className="font-lexend text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Şifreli kayıt · kişisel arşiv
                    </span>
                </div>
            </div>
        </div>
    );
};