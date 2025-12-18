
import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment } from '../types';
import { ACTIVITIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';

interface SharedWorksheetsViewProps {
  onLoad: (worksheet: SavedWorksheet) => void;
  onBack: () => void;
}

const PAGE_SIZE = 10;

type GroupType = { title: string; items: SavedWorksheet[] };

export const SharedWorksheetsView: React.FC<SharedWorksheetsViewProps> = ({ onLoad, onBack }) => {
  const { user } = useAuth();
  const [sharedWorksheets, setSharedWorksheets] = useState<SavedWorksheet[]>([]);
  const [sharedAssessments, setSharedAssessments] = useState<SavedAssessment[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);

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
          console.error(e);
      } finally {
          setLoading(false);
      }
  }

  const handleDeleteWorksheet = async (id: string) => {
      if (confirm('Bu paylaşılan etkinliği silmek istediğinizden emin misiniz?')) {
          await worksheetService.deleteWorksheet(id);
          loadShared();
      }
  };

  const getActivityTitle = (type: SavedWorksheet['activityType']) => {
    const activity = ACTIVITIES.find(a => a.id === type);
    return activity?.title || type;
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
    }, {} as Record<string, GroupType>);

    // Add Assessments as a specific group if exists (only on first page for simplicity)
    if (page === 0 && sharedAssessments.length > 0) {
        grouped['assessments'] = {
            title: 'Değerlendirme Raporları',
            items: sharedAssessments.map(a => ({
                id: a.id,
                userId: a.userId,
                name: `${a.studentName} - ${a.grade}`,
                activityType: 'ASSESSMENT_REPORT' as any, // Virtual type for display
                worksheetData: [],
                createdAt: a.createdAt,
                icon: 'fa-solid fa-clipboard-user',
                category: { id: 'assessments', title: 'Değerlendirme' },
                sharedBy: a.sharedBy,
                sharedByName: a.sharedByName,
                sharedWith: a.sharedWith
            })) as SavedWorksheet[] // Cast to satisfy type, although structure slightly differs
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
      if (item.activityType === 'ASSESSMENT_REPORT' as any) {
          alert("Rapor detayları şu an sadece Değerlendirme Modülü içerisinden görüntülenebilir. Bu özellik yakında eklenecektir.");
          // TODO: Add logic to view shared assessment report modal
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
                                                                    {item.activityType === 'ASSESSMENT_REPORT' as any ? 'Rapor' : getActivityTitle(item.activityType)}
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
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleViewItem(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" title="Görüntüle">
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            {item.activityType !== 'ASSESSMENT_REPORT' as any && (
                                                                <button onClick={() => handleDeleteWorksheet(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" title="Sil">
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
    </div>
  );
};
