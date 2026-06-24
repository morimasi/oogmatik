import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { printService } from '../utils/printService';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface SharedWorksheetsViewProps {
    onLoad: (worksheet: SavedWorksheet) => void;
    onBack: () => void;
}

const PAGE_SIZE = 10;

type GroupType = { title: string; items: SavedWorksheet[] };

export const SharedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack }) => {
    const { user } = useAuthStore();
    const [sharedWorksheets, setSharedWorksheets] = useState<SavedWorksheet[]>([]);
    const [sharedAssessments, setSharedAssessments] = useState<SavedAssessment[]>([]);
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);

    useEffect(() => {
        if (user) {
            loadShared();
        } else {
            setLoading(false);
        }
    }, [user, page]);

    const loadShared = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { items, count } = await worksheetService.getSharedWithMe(user.id, page, PAGE_SIZE);
            const assessments = await assessmentService.getSharedAssessments(user.id);
            setSharedWorksheets(items);
            setSharedAssessments(assessments);
            setCount(count || 0);
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteWorksheet = async (id: string) => {
        if (!user) return;
        if (confirm('Bu paylaşılan etkinliği silmek istediğinizden emin misiniz?')) {
            await worksheetService.deleteWorksheet(id, user.id);
            loadShared();
        }
    };

    const getActivityTitle = (type: SavedWorksheet['activityType']) => {
        const activity = ACTIVITIES.find(a => a.id === type);
        return activity?.title || type;
    };

    const handleArchive = async (item: SavedWorksheet) => {
        if (!user) return;
        try {
            setLoading(true);
            // Copy to user's own collection
            await worksheetService.saveWorksheet(
                user.id,
                `${item.name} (Arşiv)`,
                item.activityType,
                item.worksheetData,
                item.icon,
                { id: 'archived', title: 'Arşivlenmiş' },
                item.styleSettings,
                item.studentProfile,
                item.studentId
            );
            alert('İçerik başarıyla arşivinize eklendi.');
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            alert('Arşivleme sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (item: SavedWorksheet) => {
        // Load item first
        onLoad(item);
        // Trigger print with offset to allow content to render
        setTimeout(() => {
            // Target the preview container
            const targetSelector = '#print-container, #print-target, #worksheet-preview-root, .worksheet-page';
            printService.generatePdf(targetSelector, item.name || 'Paylasilan_Etkinlik', {
                action: 'print'
            });
        }, 1000); // 1 second for full hydration
    };

    const handleAddToBooklet = (_item: SavedWorksheet) => {
        if (!user) return;
        // logic to add to active workbook in store
        alert('Bu özellik "Çalışma Kitapçığı" modülünde "Koleksiyon" altından paylaşılan içeriği seçerek kullanılabilir.');
    };

    const groupedData = useMemo(() => {
        // Group Worksheets
        const grouped = sharedWorksheets.reduce((acc: Record<string, GroupType>, ws) => {
            const categoryId = ws.category?.id || 'uncategorized';
            const categoryTitle = ws.category?.title || 'Kategorisiz';

            if (!acc[categoryId]) {
                acc[categoryId] = { title: categoryTitle, items: [] };
            }
            acc[categoryId].items.push(ws);
            return acc;
        }, {} as unknown as Record<string, GroupType>);

        // Add Assessments as a specific group if exists (only on first page for simplicity)
        if (page === 0 && sharedAssessments.length > 0) {
            grouped['assessments'] = {
                title: 'Değerlendirme Raporları',
                items: sharedAssessments.map(a => ({
                    id: a.id,
                    userId: a.userId,
                    name: `${a.studentName} - ${a.grade}`,
                    activityType: ActivityType.ASSESSMENT_REPORT, // Virtual type for display
                    worksheetData: [],
                    createdAt: a.createdAt,
                    icon: 'fa-solid fa-clipboard-user',
                    category: { id: 'assessments', title: 'Değerlendirme' },
                    sharedBy: a.sharedBy,
                    sharedByName: a.sharedByName,
                    sharedWith: a.sharedWith
                })) as SavedWorksheet[]
            };
        }

        // Sort items within each group by date (newest first)
        Object.values(grouped).forEach((group: GroupType) => {
            group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        return Object.entries(grouped);
    }, [sharedWorksheets, sharedAssessments, page]);

    useEffect(() => {
        if (groupedData.length > 0 && openCategory === null) {
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
                setSelectedAssessment(assessment);
            }
        } else {
            onLoad(item);
        }
    };

    const totalPages = Math.ceil((count + sharedAssessments.length) / PAGE_SIZE);

    return (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <i className="fa-solid fa-share-nodes text-indigo-500"></i> Paylaşılanlar
                </h2>
                <button
                    onClick={onBack}
                    className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold flex items-center gap-2"
                >
                    <i className="fa-solid fa-arrow-left"></i> Geri Dön
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div>
            ) : sharedWorksheets.length === 0 && sharedAssessments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <i className="fa-solid fa-inbox fa-2x text-indigo-300 dark:text-indigo-500"></i>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400">Henüz sizinle paylaşılan bir içerik yok.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {groupedData.map(([categoryId, group]: [string, GroupType]) => (
                            <div key={categoryId} className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
                                <button
                                    onClick={() => toggleCategory(categoryId)}
                                    className="w-full flex justify-between items-center p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    aria-expanded={openCategory === categoryId}
                                >
                                    <span className="font-bold text-lg">{group.title} ({group.items.length})</span>
                                    <i className={`fa-solid fa-chevron-down transition-transform ${openCategory === categoryId ? 'rotate-180' : ''}`}></i>
                                </button>

                                {openCategory === categoryId && (
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="sr-only md:not-sr-only">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">İçerik</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Paylaşan</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tarih</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Eylemler</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                                                    {group.items.map(item => (
                                                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mr-4 shrink-0">
                                                                        <i className={`${item.icon} fa-lg`}></i>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.name}</div>
                                                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                            {item.activityType === ActivityType.ASSESSMENT_REPORT ? 'Rapor' : getActivityTitle(item.activityType)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                                                                        {item.sharedByName ? item.sharedByName[0].toUpperCase() : '?'}
                                                                    </div>
                                                                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.sharedByName || 'Bilinmiyor'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                                                {new Date(item.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short' })}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                                    <button onClick={() => handleViewItem(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Görüntüle">
                                                                        <i className="fa-solid fa-eye"></i>
                                                                    </button>
                                                                    <button onClick={() => handlePrint(item)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Yazdır">
                                                                        <i className="fa-solid fa-print"></i>
                                                                    </button>
                                                                    <button onClick={() => handleArchive(item)} className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Arşive Ekle">
                                                                        <i className="fa-solid fa-box-archive"></i>
                                                                    </button>
                                                                    <button onClick={() => handleAddToBooklet(item)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Kitapçığa Ekle">
                                                                        <i className="fa-solid fa-book-medical"></i>
                                                                    </button>
                                                                    {item.activityType !== ActivityType.ASSESSMENT_REPORT && (
                                                                        <button onClick={() => handleDeleteWorksheet(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Sil">
                                                                            <i className="fa-solid fa-trash-alt"></i>
                                                                        </button>
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

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-between items-center">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                Önceki
                            </button>
                            <span className="text-sm text-zinc-500">Sayfa {page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                Sonraki
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedAssessment(null)}>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Değerlendirme Raporu</h3>
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(selectedAssessment.report, null, 2)}</pre>
                        <button onClick={() => setSelectedAssessment(null)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Kapat</button>
                    </div>
                </div>
            )}
        </div>
    );
};
