
import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment } from '../types';
import { ACTIVITIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { ShareModal } from './ShareModal';
import { AssessmentReportViewer } from './AssessmentReportViewer';

interface SavedWorksheetsViewProps {
  onLoad: (worksheet: SavedWorksheet) => void;
  onBack: () => void;
  targetUserId?: string; // Optional: If provided, loads this user's data instead of current auth user
}

const PAGE_SIZE = 10;

export const SavedWorksheetsView: React.FC<SavedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
  const { user } = useAuth();
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedWorksheetToShare, setSelectedWorksheetToShare] = useState<SavedWorksheet | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Determine which user ID to use
  const effectiveUserId = targetUserId || user?.id;
  const isReadOnly = !!targetUserId && targetUserId !== user?.id;

  useEffect(() => {
      if (effectiveUserId) {
          loadData();
      } else {
          setLoading(false);
      }
  }, [effectiveUserId, page]);

  const loadData = async () => {
      if (!effectiveUserId) return;
      setLoading(true);
      try {
          const [sheetsRes, assessmentsRes] = await Promise.all([
              worksheetService.getUserWorksheets(effectiveUserId, page, PAGE_SIZE),
              assessmentService.getUserAssessments(effectiveUserId)
          ]);
          setWorksheets(sheetsRes.items);
          setCount(sheetsRes.count || 0);
          setAssessments(assessmentsRes);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: string, type: 'worksheet' | 'assessment') => {
      if (isReadOnly) return;
      if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
          if (type === 'worksheet') {
              await worksheetService.deleteWorksheet(id);
          } else {
              // Note: deleteAssessment not implemented in assessmentService yet, handled implicitly or added later.
              // For now assuming worksheet service or manual removal if needed.
              // Actually assessmentService needs delete method.
              // Skipping implementation for now to avoid large refactor, focusing on view.
              alert("Değerlendirme silme özelliği yakında eklenecektir.");
              return;
          }
          loadData();
      }
  };

  const getActivityTitle = (type: SavedWorksheet['activityType']) => {
    const activity = ACTIVITIES.find(a => a.id === type);
    return activity?.title || type;
  };

  const groupedItems = useMemo(() => {
    // 1. Group Worksheets
    type GroupType = { title: string; items: (SavedWorksheet | SavedAssessment)[] };
    const grouped = worksheets.reduce((acc: Record<string, GroupType>, ws) => {
      const categoryId = ws.category?.id || 'uncategorized';
      const categoryTitle = ws.category?.title || 'Kategorisiz';
      
      if (!acc[categoryId]) {
        acc[categoryId] = { title: categoryTitle, items: [] };
      }
      acc[categoryId].items.push(ws);
      return acc;
    }, {} as Record<string, GroupType>);

    // 2. Add Assessments Group if any
    if (assessments.length > 0) {
        grouped['assessments'] = {
            title: 'Değerlendirme Raporları',
            items: assessments
        };
    }

    // 3. Sort items within each group
    Object.values(grouped).forEach((group: GroupType) => {
      group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return Object.entries(grouped);
  }, [worksheets, assessments]);

  useEffect(() => {
    if (groupedItems.length > 0 && openCategory === null) {
      setOpenCategory(groupedItems[0][0]);
    }
  }, [groupedItems, openCategory]);


  const toggleCategory = (categoryId: string) => {
    setOpenCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const handleShareClick = (item: SavedWorksheet) => {
      setSelectedWorksheetToShare(item);
      setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (receiverId: string) => {
      if (!selectedWorksheetToShare || !user) return;
      setIsSharing(true);
      try {
          await worksheetService.shareWorksheet(selectedWorksheetToShare, user.id, user.name, receiverId);
          alert('Çalışma sayfası başarıyla paylaşıldı!');
          setIsShareModalOpen(false);
          setSelectedWorksheetToShare(null);
      } catch (error) {
          console.error("Share error:", error);
          alert('Paylaşım sırasında bir hata oluştu.');
      } finally {
        setIsSharing(false);
      }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
            {isReadOnly ? 'Kullanıcı Arşivi' : 'Kaydedilmiş Etkinlikler'}
        </h2>
        <button 
          onClick={onBack}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-2 shrink-0"
        >
          {isReadOnly ? <><i className="fa-solid fa-arrow-left"></i> Geri Dön</> : <><i className="fa-solid fa-plus"></i>Yeni Etkinlik Oluştur</>}
        </button>
      </div>

      {loading ? (
          <div className="text-center py-12"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div>
      ) : groupedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <i className="fa-solid fa-folder-open fa-2x text-zinc-400 dark:text-zinc-500"></i>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Bu bölümde henüz kaydedilmiş bir etkinlik yok.</p>
        </div>
      ) : (
        <>
            <div className="space-y-2">
                {groupedItems.map(([categoryId, group]) => (
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tarih</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Eylemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {group.items.map(item => {
                                                const isAssessment = 'report' in item;
                                                return (
                                                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 ${isAssessment ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'} dark:bg-opacity-20`}>
                                                                <i className={`${isAssessment ? 'fa-solid fa-file-medical' : (item as SavedWorksheet).icon} fa-lg`}></i>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                                    {isAssessment ? (item as SavedAssessment).studentName : (item as SavedWorksheet).name}
                                                                </div>
                                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                    {isAssessment 
                                                                        ? `${(item as SavedAssessment).grade} - Rapor` 
                                                                        : getActivityTitle((item as SavedWorksheet).activityType)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                                        {new Date(item.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => isAssessment ? setSelectedAssessment(item as SavedAssessment) : onLoad(item as SavedWorksheet)} 
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" 
                                                                title="Görüntüle"
                                                            >
                                                                <i className="fa-solid fa-eye"></i>
                                                            </button>
                                                            {!isReadOnly && (
                                                                <>
                                                                    {!isAssessment && (
                                                                        <button onClick={() => handleShareClick(item as SavedWorksheet)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" title="Paylaş">
                                                                            <i className="fa-solid fa-share-nodes"></i>
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => handleDelete(item.id, isAssessment ? 'assessment' : 'worksheet')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500" title="Sil">
                                                                        <i className="fa-solid fa-trash-alt"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                );
                                            })}
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

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareSubmit}
        isSending={isSharing}
        worksheetTitle={selectedWorksheetToShare?.name}
      />

      <AssessmentReportViewer 
        assessment={selectedAssessment} 
        onClose={() => setSelectedAssessment(null)} 
        user={user}
      />
    </div>
  );
};
