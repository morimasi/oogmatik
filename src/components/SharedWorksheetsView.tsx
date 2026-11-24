import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SavedWorksheet, SavedAssessment, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useFascicleStore } from '../store/useFascicleStore';
import { useRBAC } from '../hooks/useRBAC';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { printService } from '../utils/printService';
import { logError } from '../utils/logger.js';

interface SharedWorksheetsViewProps {
    onLoad: (worksheet: SavedWorksheet | SavedAssessment) => void;
    onBack: () => void;
}

const PAGE_SIZE = 10;

type GroupType = { title: string; items: SavedWorksheet[] };

export const SharedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack }) => {
    const { user } = useAuthStore();
    const toast = useToastStore();
    const { hasPermission } = useRBAC();
    const canExport = hasPermission('shared-materials', 'export');

    const [sharedWorksheets, setSharedWorksheets] = useState<SavedWorksheet[]>([]);
    const [sharedAssessments, setSharedAssessments] = useState<SavedAssessment[]>([]);
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [senderFilter, setSenderFilter] = useState<string>('all');
    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

    const loadShared = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [{ items, count: totalCount }, assessments] = await Promise.all([
                worksheetService.getSharedWithMe(user.id, page, PAGE_SIZE),
                assessmentService.getSharedAssessments(user.id),
            ]);
            setSharedWorksheets(items);
            setSharedAssessments(assessments);
            setCount(totalCount ?? items.length);
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            toast.error('Paylaşılan materyaller yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [user, page, toast]);

    useEffect(() => {
        if (user) {
            loadShared();
        } else {
            setLoading(false);
        }
    }, [user, loadShared]);

    const handleConfirmRemove = async () => {
        if (!user || !confirmRemoveId) return;
        const targetId = confirmRemoveId;
        setConfirmRemoveId(null);
        try {
            await worksheetService.removeFromSharedWithMe(targetId, user.id);
            setSharedWorksheets(prev => prev.filter(item => item.id !== targetId));
            setCount(prev => Math.max(0, prev - 1));
            toast.success('Paylaşılan materyal listenizden kaldırıldı.');
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            toast.error('Materyal kaldırılırken bir hata oluştu.');
        }
    };

    const getActivityTitle = (type: SavedWorksheet['activityType']) => {
        const activity = ACTIVITIES.find(a => a.id === type);
        return activity?.title || type;
    };

    const handleArchive = async (item: SavedWorksheet) => {
        if (!user) return;
        try {
            await worksheetService.saveWorksheet(
                user.id,
                `${item.name} (Arşiv)`,
                item.activityType,
                item.worksheetData,
                item.icon,
                item.category || { id: 'archived', title: 'Arşivlenmiş' },
                item.styleSettings,
                item.studentProfile,
                item.studentId,
                item.studentName
            );
            toast.success(`"${item.name}" dijital arşivinize kopyalandı.`);
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            toast.error('Arşivleme sırasında bir hata oluştu.');
        }
    };

    const handlePrintOrDownload = (item: SavedWorksheet, action: 'print' | 'download') => {
        onLoad(item);
        toast.info(action === 'download' ? 'PDF hazırlanıyor...' : 'Yazdırma önizlemesi hazırlanıyor...');
        setTimeout(() => {
            const targetSelector = '#print-container, #print-target, #worksheet-preview-root, .worksheet-page, #math-canvas-container .math-canvas-page, #sinav-print-target, #mat-sinav-print-inner';
            printService.generatePdf(targetSelector, item.name || 'Paylasilan_Etkinlik', { action }).catch((err) => {
                logError(err instanceof Error ? err : String(err));
            });
        }, 900);
    };

    const handleAddToBooklet = (item: SavedWorksheet) => {
        if (!user) return;
        const { addItem, items } = useFascicleStore.getState();
        addItem({
            id: crypto.randomUUID(),
            type: item.activityType,
            difficulty: 'Orta',
            pageCount: Array.isArray(item.worksheetData) ? item.worksheetData.length : 1,
            order: items.length,
            content: item.worksheetData,
        });
        toast.success(`"${item.name}" Fasikül & Kitapçık stüdyosuna eklendi!`);
    };

    const senders = useMemo(() => {
        const set = new Set<string>();
        sharedWorksheets.forEach(w => {
            if (w.sharedByName) set.add(w.sharedByName);
        });
        sharedAssessments.forEach(a => {
            if (a.sharedByName) set.add(a.sharedByName);
        });
        return Array.from(set);
    }, [sharedWorksheets, sharedAssessments]);

    const groupedData = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const filteredWorksheets = sharedWorksheets.filter(ws => {
            const matchesSearch =
                !q ||
                (ws.name || '').toLowerCase().includes(q) ||
                getActivityTitle(ws.activityType).toLowerCase().includes(q) ||
                (ws.sharedByName || '').toLowerCase().includes(q);
            const matchesSender = senderFilter === 'all' || ws.sharedByName === senderFilter;
            return matchesSearch && matchesSender;
        });

        const grouped = filteredWorksheets.reduce<Record<string, GroupType>>((acc, ws) => {
            const categoryId = ws.category?.id || 'uncategorized';
            const categoryTitle = ws.category?.title || 'Kategorisiz';
            if (!acc[categoryId]) {
                acc[categoryId] = { title: categoryTitle, items: [] };
            }
            acc[categoryId].items.push(ws);
            return acc;
        }, {});

        if (page === 0 && sharedAssessments.length > 0) {
            const filteredAssessments = sharedAssessments.filter(a => {
                const matchesSearch =
                    !q ||
                    (a.studentName || '').toLowerCase().includes(q) ||
                    (a.sharedByName || '').toLowerCase().includes(q);
                const matchesSender = senderFilter === 'all' || a.sharedByName === senderFilter;
                return matchesSearch && matchesSender;
            });

            if (filteredAssessments.length > 0) {
                grouped['assessments'] = {
                    title: 'Değerlendirme Raporları',
                    items: filteredAssessments.map(a => ({
                        id: a.id,
                        userId: a.userId,
                        name: `${a.studentName} - ${a.grade}`,
                        activityType: ActivityType.ASSESSMENT_REPORT,
                        worksheetData: [],
                        createdAt: a.createdAt,
                        icon: 'fa-solid fa-clipboard-user',
                        category: { id: 'assessments', title: 'Değerlendirme' },
                        sharedBy: a.sharedBy,
                        sharedByName: a.sharedByName,
                        sharedWith: a.sharedWith,
                    })),
                };
            }
        }

        Object.values(grouped).forEach(group => {
            group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        return Object.entries(grouped);
    }, [sharedWorksheets, sharedAssessments, page, searchQuery, senderFilter]);

    useEffect(() => {
        if (groupedData.length > 0 && (!openCategory || !groupedData.some(([id]) => id === openCategory))) {
            setOpenCategory(groupedData[0][0]);
        }
    }, [groupedData, openCategory]);

    const toggleCategory = (categoryId: string) => {
        setOpenCategory(prev => (prev === categoryId ? null : categoryId));
    };

    const handleViewItem = (item: SavedWorksheet) => {
        if (item.activityType === ActivityType.ASSESSMENT_REPORT) {
            const assessment = sharedAssessments.find(a => a.id === item.id);
            if (assessment) {
                onLoad(assessment);
            }
        } else {
            onLoad(item);
        }
    };

    const totalPages = Math.max(1, Math.ceil((count + sharedAssessments.length) / PAGE_SIZE));

    return (
        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl shadow-xl p-5 sm:p-7 md:p-8 font-lexend text-[var(--text-primary)] h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--border-color)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--accent-muted)] border border-[var(--accent-color)]/25 flex items-center justify-center text-[var(--accent-color)]">
                        <i className="fa-solid fa-share-nodes text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                            Paylaşılan Materyaller
                            <span className="text-xs bg-[var(--bg-secondary)] px-2.5 py-0.5 rounded-full text-[var(--text-muted)] border border-[var(--border-color)]">
                                {count + sharedAssessments.length}
                            </span>
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                            Meslektaşlarınız ve uzmanlar tarafından sizinle paylaşılan materyal ve raporlar.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 text-[var(--text-primary)] text-xs font-bold flex items-center gap-2 transition-all"
                >
                    <i className="fa-solid fa-arrow-left"></i> Geri Dön
                </button>
            </div>

            {/* Search & Sender Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 shrink-0">
                <div className="relative flex-1">
                    <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Materyal, etkinlik türü veya paylaşan kişi ara..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
                    />
                </div>
                {senders.length > 0 && (
                    <select
                        value={senderFilter}
                        onChange={(e) => setSenderFilter(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                    >
                        <option value="all">Tüm Paylaşanlar</option>
                        {senders.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent-color)] animate-spin"></div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Paylaşımlar yükleniyor...</p>
                    </div>
                ) : groupedData.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 rounded-3xl flex items-center justify-center mb-4 mx-auto">
                            <i className="fa-solid fa-inbox fa-2x text-[var(--accent-color)]"></i>
                        </div>
                        <p className="font-bold text-[var(--text-primary)] mb-1">Paylaşılan içerik bulunamadı</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {searchQuery || senderFilter !== 'all'
                                ? 'Arama veya filtre kriterlerinizi değiştirmeyi deneyin.'
                                : 'Henüz sizinle paylaşılan bir materyal veya değerlendirme raporu yok.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-6">
                        {groupedData.map(([categoryId, group]: [string, GroupType]) => (
                            <div key={categoryId} className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-secondary)]/40">
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(categoryId)}
                                    className="w-full flex justify-between items-center px-5 py-3.5 text-left hover:bg-[var(--bg-secondary)] transition-colors focus:outline-none"
                                    aria-expanded={openCategory === categoryId}
                                >
                                    <span className="font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--accent-color)]"></span>
                                        {group.title}
                                        <span className="text-xs font-bold text-[var(--text-muted)]">({group.items.length})</span>
                                    </span>
                                    <i className={`fa-solid fa-chevron-down text-xs text-[var(--text-muted)] transition-transform ${openCategory === categoryId ? 'rotate-180' : ''}`}></i>
                                </button>

                                {openCategory === categoryId && (
                                    <div className="p-3 bg-[var(--bg-paper)] border-t border-[var(--border-color)]">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="sr-only md:not-sr-only">
                                                    <tr className="border-b border-[var(--border-color)]">
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">İçerik</th>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Paylaşan</th>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Tarih</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Eylemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border-color)]/60">
                                                    {group.items.map(item => (
                                                        <tr key={item.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div
                                                                        onClick={() => handleViewItem(item)}
                                                                        className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center mr-3.5 shrink-0 cursor-pointer border border-[var(--accent-color)]/20"
                                                                    >
                                                                        <i className={`${item.icon} text-base`}></i>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleViewItem(item)}
                                                                            className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors text-left block truncate max-w-[240px]"
                                                                        >
                                                                            {item.name}
                                                                        </button>
                                                                        <div className="text-[11px] text-[var(--text-muted)]">
                                                                            {item.activityType === ActivityType.ASSESSMENT_REPORT
                                                                                ? 'Değerlendirme Raporu'
                                                                                : getActivityTitle(item.activityType)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)]">
                                                                        {item.sharedByName ? item.sharedByName[0].toUpperCase() : '?'}
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                                                        {item.sharedByName || 'Bilinmiyor'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[var(--text-muted)]">
                                                                {item.createdAt
                                                                    ? new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleViewItem(item)}
                                                                        className="text-[var(--accent-color)] p-2 rounded-lg hover:bg-[var(--accent-muted)] transition-colors"
                                                                        title="Stüdyoda Aç / Görüntüle"
                                                                    >
                                                                        <i className="fa-solid fa-eye"></i>
                                                                    </button>
                                                                    {canExport && item.activityType !== ActivityType.ASSESSMENT_REPORT && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handlePrintOrDownload(item, 'print')}
                                                                                className="text-emerald-500 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                                                                title="Yazdır"
                                                                            >
                                                                                <i className="fa-solid fa-print"></i>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handlePrintOrDownload(item, 'download')}
                                                                                className="text-teal-500 p-2 rounded-lg hover:bg-teal-500/10 transition-colors"
                                                                                title="PDF İndir"
                                                                            >
                                                                                <i className="fa-solid fa-file-pdf"></i>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {item.activityType !== ActivityType.ASSESSMENT_REPORT && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleArchive(item)}
                                                                                className="text-amber-500 p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                                                                                title="Dijital Arşive Kopyala"
                                                                            >
                                                                                <i className="fa-solid fa-box-archive"></i>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleAddToBooklet(item)}
                                                                                className="text-sky-500 p-2 rounded-lg hover:bg-sky-500/10 transition-colors"
                                                                                title="Fasiküle / Kitapçığa Ekle"
                                                                            >
                                                                                <i className="fa-solid fa-book-medical"></i>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setConfirmRemoveId(item.id)}
                                                                                className="text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                                                                                title="Listemden Kaldır"
                                                                            >
                                                                                <i className="fa-solid fa-trash-alt"></i>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] disabled:opacity-40"
                        >
                            Önceki
                        </button>
                        <span className="text-xs font-bold text-[var(--text-muted)]">Sayfa {page + 1} / {totalPages}</span>
                        <button
                            type="button"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] disabled:opacity-40"
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </div>

            {/* In-App Confirmation Modal */}
            {confirmRemoveId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmRemoveId(null)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-6 shadow-2xl"
                    >
                        <h3 className="text-base font-black text-[var(--text-primary)] mb-1">Paylaşılanı Kaldır</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-5">
                            Bu materyal yalnızca sizin paylaşılanlar listenizden kaldırılacaktır. Gönderenin arşivinden silinmez.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmRemoveId(null)}
                                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRemove}
                                className="px-4 py-2 rounded-xl bg-rose-500 text-xs font-bold text-white hover:bg-rose-600"
                            >
                                Listeden Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
