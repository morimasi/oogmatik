import React, { useState, useMemo, useEffect } from 'react';
import { SavedWorksheet, SavedAssessment, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { worksheetService } from '../services/worksheetService';
import { assessmentService } from '../services/assessmentService';
import { ShareModal } from './ShareModal';

interface SavedWorksheetsViewProps {
  onLoad: (worksheet: SavedWorksheet) => void;
  onBack: () => void;
  targetUserId?: string; // Optional: If provided, loads this user's data instead of current auth user
}

const PAGE_SIZE = 50;

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'type';

export const SavedWorksheetsView: React.FC<SavedWorksheetsViewProps> = ({ onLoad, onBack, targetUserId }) => {
  const { user } = useAuth();
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<SavedWorksheet | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Determine which user ID to use
  const effectiveUserId = targetUserId || user?.id;
  const isReadOnly = !!targetUserId && targetUserId !== user?.id;

  useEffect(() => {
      if (effectiveUserId) {
          loadData();
      } else {
          setLoading(false);
      }
  }, [effectiveUserId]);

  const loadData = async () => {
      if (!effectiveUserId) return;
      setLoading(true);
      try {
          const [sheetsRes, assessmentsRes] = await Promise.all([
              worksheetService.getUserWorksheets(effectiveUserId, 0, PAGE_SIZE),
              assessmentService.getUserAssessments(effectiveUserId)
          ]);
          setWorksheets(sheetsRes.items);
          setAssessments(assessmentsRes);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  // --- ACTIONS ---

  const handleDelete = async (id: string, type: 'worksheet' | 'assessment') => {
      if (isReadOnly) return;
      if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
          if (type === 'worksheet') {
              await worksheetService.deleteWorksheet(id);
              setWorksheets(prev => prev.filter(w => w.id !== id));
          } else {
              // Assuming API supports delete
              alert("Değerlendirme silme özelliği yakında eklenecektir.");
              return;
          }
          if (selectedIds.has(id)) {
              const newSet = new Set(selectedIds);
              newSet.delete(id);
              setSelectedIds(newSet);
          }
      }
  };

  const handleBulkDelete = async () => {
      if (isReadOnly || selectedIds.size === 0) return;
      if (confirm(`${selectedIds.size} öğeyi silmek istediğinizden emin misiniz?`)) {
          const ids = Array.from(selectedIds) as string[];
          // Filter IDs to check type (currently only worksheets support bulk delete efficiently via service)
          const worksheetIds = ids.filter(id => worksheets.some(w => w.id === id));
          
          if (worksheetIds.length > 0) {
              await worksheetService.deleteWorksheetsBulk(worksheetIds);
              setWorksheets(prev => prev.filter(w => !worksheetIds.includes(w.id)));
          }
          
          setSelectedIds(new Set());
      }
  };

  const handleDuplicate = async (id: string) => {
      if (isReadOnly) return;
      try {
          const newItem = await worksheetService.duplicateWorksheet(id);
          if (newItem) {
              setWorksheets(prev => [newItem, ...prev]);
          }
      } catch (e) {
          console.error("Duplicate failed", e);
          alert("Kopyalama sırasında hata oluştu.");
      }
  };

  const handleRenameStart = (item: SavedWorksheet) => {
      if (isReadOnly) return;
      setEditingItemId(item.id);
      setEditName(item.name);
  };

  const handleRenameSave = async (id: string) => {
      if (!editName.trim()) return;
      try {
          await worksheetService.updateWorksheetDetails(id, { name: editName });
          setWorksheets(prev => prev.map(w => w.id === id ? { ...w, name: editName } : w));
          setEditingItemId(null);
      } catch (e) {
          console.error("Rename failed", e);
      }
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === processedItems.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(processedItems.map(i => i.id)));
      }
  };

  // --- PROCESSING ---

  // Merge Worksheets and Assessments for unified list if needed, or keep separate categories
  // For this view, we primarily focus on Worksheets, but Assessments can be shown in a separate tab or group.
  // Let's mix them but distinguish by type.
  
  const processedItems = useMemo(() => {
      const allItems = [
          ...worksheets,
          ...assessments.map(a => ({
              id: a.id,
              userId: a.userId,
              name: `${a.studentName} - Rapor`,
              activityType: 'ASSESSMENT_REPORT' as any,
              worksheetData: [],
              createdAt: a.createdAt,
              icon: 'fa-solid fa-file-medical',
              category: { id: 'assessments', title: 'Değerlendirme' },
              description: `Sınıf: ${a.grade} | ${new Date(a.createdAt).toLocaleDateString()}`
          } as any))
      ];

      return allItems.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.activityType && item.activityType.toLowerCase().includes(searchQuery.toLowerCase()))
      ).sort((a, b) => {
          switch (sortOption) {
              case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              case 'name': return a.name.localeCompare(b.name);
              case 'type': return a.activityType.localeCompare(b.activityType);
              default: return 0;
          }
      });
  }, [worksheets, assessments, searchQuery, sortOption]);

  const getActivityTitle = (type: ActivityType) => {
    if (type === ActivityType.WORKBOOK) return 'Çalışma Kitapçığı';
    if (type === 'ASSESSMENT_REPORT' as any) return 'Değerlendirme Raporu';
    const activity = ACTIVITIES.find(a => a.id === type);
    return activity?.title || type;
  };

  // --- RENDERERS ---

  const EmptyState = () => (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <i className="fa-regular fa-folder-open text-4xl text-zinc-400"></i>
          </div>
          <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">Kayıt Bulunamadı</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-2">Arama kriterlerinizi değiştirin veya yeni bir etkinlik oluşturun.</p>
      </div>
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm h-full flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* HEADER TOOLBAR */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                            <i className="fa-solid fa-box-archive text-indigo-500"></i>
                            {isReadOnly ? 'Kullanıcı Arşivi' : 'Arşiv Yöneticisi'}
                        </h2>
                        <p className="text-xs text-zinc-500">{processedItems.length} Öğe</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <i className="fa-solid fa-search text-zinc-400 ml-2"></i>
                    <input 
                        type="text" 
                        placeholder="Ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full sm:w-48 text-zinc-700 dark:text-zinc-200"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleSelectAll}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 ${selectedIds.size > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                        <i className={`fa-regular ${selectedIds.size === processedItems.length && processedItems.length > 0 ? 'fa-square-check' : 'fa-square'}`}></i>
                        {selectedIds.size > 0 ? `${selectedIds.size} Seçildi` : 'Tümünü Seç'}
                    </button>

                    {selectedIds.size > 0 && !isReadOnly && (
                        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
                             <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors">
                                <i className="fa-solid fa-trash-can mr-1"></i> Sil
                             </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                     <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 outline-none cursor-pointer hover:bg-zinc-50"
                     >
                         <option value="newest">En Yeni</option>
                         <option value="oldest">En Eski</option>
                         <option value="name">İsim (A-Z)</option>
                         <option value="type">Tip</option>
                     </select>

                     <div className="flex bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg">
                         <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-white' : 'text-zinc-500'}`}>
                             <i className="fa-solid fa-border-all"></i>
                         </button>
                         <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-white' : 'text-zinc-500'}`}>
                             <i className="fa-solid fa-list-ul"></i>
                         </button>
                     </div>
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-100/50 dark:bg-black/20">
            {loading ? (
                 <div className="flex justify-center items-center h-full"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i></div>
            ) : processedItems.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {processedItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`group relative bg-white dark:bg-zinc-800 rounded-2xl p-4 border transition-all duration-200 hover:shadow-lg ${selectedIds.has(item.id) ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'}`}
                            >
                                {/* Selection Checkbox (Overlay) */}
                                <div className="absolute top-3 left-3 z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.has(item.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-300 text-transparent hover:border-indigo-400'}`}
                                    >
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </button>
                                </div>

                                {/* Menu Action (Overlay) */}
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                        {!isReadOnly && item.activityType !== 'ASSESSMENT_REPORT' as any && (
                                            <>
                                                <button onClick={(e) => {e.stopPropagation(); handleDuplicate(item.id)}} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500" title="Kopyala"><i className="fa-regular fa-copy"></i></button>
                                                <button onClick={(e) => {e.stopPropagation(); setItemToShare(item as any); setIsShareModalOpen(true);}} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 text-blue-500" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                                                <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id, 'worksheet')}} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-500" title="Sil"><i className="fa-regular fa-trash-can"></i></button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col items-center text-center mt-4 cursor-pointer" onClick={() => onLoad(item as SavedWorksheet)}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm ${item.activityType === 'ASSESSMENT_REPORT' as any ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                        <i className={item.icon}></i>
                                    </div>
                                    
                                    {editingItemId === item.id ? (
                                        <input 
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onBlur={() => handleRenameSave(item.id)}
                                            onKeyDown={e => e.key === 'Enter' && handleRenameSave(item.id)}
                                            onClick={e => e.stopPropagation()}
                                            className="w-full text-center font-bold text-sm bg-white border-b-2 border-indigo-500 outline-none"
                                        />
                                    ) : (
                                        <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm line-clamp-2 min-h-[2.5em] group-hover:text-indigo-600 transition-colors" title={item.name}>
                                            {item.name}
                                            {!isReadOnly && <button onClick={(e) => {e.stopPropagation(); handleRenameStart(item as SavedWorksheet)}} className="ml-2 text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-pen text-xs"></i></button>}
                                        </h3>
                                    )}
                                    
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-700 rounded text-[10px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-600">
                                        {getActivityTitle(item.activityType)}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 mt-2">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {processedItems.map(item => (
                             <div 
                                key={item.id} 
                                className={`group flex items-center gap-4 p-3 bg-white dark:bg-zinc-800 rounded-xl border transition-all hover:shadow-md cursor-pointer ${selectedIds.has(item.id) ? 'border-indigo-500 bg-indigo-50/10' : 'border-zinc-200 dark:border-zinc-700'}`}
                                onClick={() => onLoad(item as SavedWorksheet)}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(item.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-zinc-300 text-transparent hover:border-indigo-400'}`}
                                >
                                    <i className="fa-solid fa-check text-[10px]"></i>
                                </button>
                                
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${item.activityType === 'ASSESSMENT_REPORT' as any ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                    <i className={item.icon}></i>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {editingItemId === item.id ? (
                                            <input 
                                                autoFocus
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                onBlur={() => handleRenameSave(item.id)}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameSave(item.id)}
                                                onClick={e => e.stopPropagation()}
                                                className="font-bold text-sm bg-transparent border-b border-indigo-500 outline-none"
                                            />
                                        ) : (
                                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm truncate">{item.name}</h3>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{getActivityTitle(item.activityType)}</span>
                                        <span>•</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isReadOnly && (
                                        <>
                                            <button onClick={(e) => {e.stopPropagation(); handleRenameStart(item as SavedWorksheet)}} className="p-2 hover:bg-zinc-100 rounded text-zinc-500" title="Düzenle"><i className="fa-solid fa-pen"></i></button>
                                            <button onClick={(e) => {e.stopPropagation(); handleDuplicate(item.id)}} className="p-2 hover:bg-zinc-100 rounded text-zinc-500" title="Kopyala"><i className="fa-regular fa-copy"></i></button>
                                            <button onClick={(e) => {e.stopPropagation(); setItemToShare(item as any); setIsShareModalOpen(true);}} className="p-2 hover:bg-blue-50 rounded text-blue-500" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                                            <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id, 'worksheet')}} className="p-2 hover:bg-red-50 rounded text-red-500" title="Sil"><i className="fa-regular fa-trash-can"></i></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}
        </div>

        <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            onShare={async (id) => { /* Covered by modal internal logic or wrapper */ }}
            worksheetTitle={itemToShare?.name}
            // Passing item directly via props if ShareModal updated to handle it, or pass ID
        />
    </div>
  );
};