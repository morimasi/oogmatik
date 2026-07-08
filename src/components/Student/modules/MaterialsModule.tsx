import React, { useState, useMemo } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';
import { SavedWorksheet, SavedAssessment } from '../../../types';
import { useToastStore } from '../../../store/useToastStore';
import { getMaterialCategories, MaterialCategory } from './studentDashboardData';
import { logError } from '../../../utils/logger';

type MaterialItem = (SavedWorksheet & { type: 'worksheet' }) | (SavedAssessment & { type: 'assessment' });

interface MaterialsModuleProps {
  studentId: string;
  worksheets: SavedWorksheet[];
  assessments: SavedAssessment[];
  onLoadMaterial?: (ws: SavedWorksheet) => void;
}

export const MaterialsModule: React.FC<MaterialsModuleProps> = ({
  studentId,
  worksheets,
  assessments,
  onLoadMaterial,
}) => {
  console.log(`[MaterialsModule] Alınan veriler:`, { 
    studentId, 
    worksheetsCount: worksheets.length, 
    assessmentsCount: assessments.length,
    worksheets,
    assessments
  });
  const allItems: MaterialItem[] = useMemo(() => [
    ...worksheets.map(ws => ({ ...ws, type: 'worksheet' })),
    ...assessments.map(a => ({ ...a, type: 'assessment' }))
  ], [worksheets, assessments]);
  console.log(`[MaterialsModule] allItems:`, allItems);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<MaterialItem | null>(null);

  const categories = useMemo(() => getMaterialCategories(worksheets), [worksheets]);

  const filtered = useMemo(() => {
    let result = [...allItems];
    if (activeCategory !== 'all') {
      result = result.filter(item => {
        if (item.type === 'worksheet') {
          return (item.category?.title || 'Genel').toLowerCase() === activeCategory.toLowerCase();
        } else {
          // For assessments, show if category is 'Analizler' or similar
          return activeCategory.toLowerCase().includes('analiz') || activeCategory.toLowerCase().includes('rapor');
        }
      });
    }
    if (searchQuery) {
      result = result.filter(item => {
        const name = item.type === 'worksheet' ? item.name : `${item.studentName} Değerlendirme Raporu`;
        const category = item.type === 'worksheet' ? (item.category?.title || '') : 'Analizler';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) || category.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allItems, activeCategory, searchQuery]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    if (showPreview) window.print();
  };

  const handleDownload = (item: MaterialItem) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = item.type === 'worksheet' ? item.name : `${item.studentName}_Değerlendirme_Raporu`;
    a.download = `${name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (item: MaterialItem) => {
    const name = item.type === 'worksheet' ? item.name : `${item.studentName} Değerlendirme Raporu`;
    if (!confirm(`"${name}" materyalini silmek istediğinize emin misiniz?`)) return;
    try {
      const collectionName = item.type === 'worksheet' ? 'saved_worksheets' : 'saved_assessments';
      await deleteDoc(doc(db, collectionName, item.id));
      useToastStore.getState().success('Materyal silindi', 3000);
    } catch (err) {
      logError('Materyal silinemedi', { error: err instanceof Error ? err.message : String(err), context: 'MaterialsModule-delete' });
      useToastStore.getState().error('Silme hatası: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const getItemName = (item: MaterialItem) => {
    return item.type === 'worksheet' ? item.name : `${item.studentName} Değerlendirme Raporu`;
  };

  const getItemCategory = (item: MaterialItem) => {
    return item.type === 'worksheet' ? (item.category?.title || 'Genel') : 'Analizler';
  };

  const getItemIcon = (item: MaterialItem) => {
    return item.type === 'worksheet' ? item.icon : 'fa-chart-line';
  };

  const getItemActivityType = (item: MaterialItem) => {
    return item.type === 'worksheet' ? item.activityType : 'Değerlendirme';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] uppercase">Materyaller</h3>
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allItems.length} materyal • {categories.length + 1} kategori
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              <i className="fa-solid fa-grid-2"></i>
            </button>
            <button onClick={() => setViewMode('list')} className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] transition-all ${viewMode === 'list' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]"></i>
        <input
          type="text"
          placeholder="Materyal ara..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
        >
          Tümü ({allItems.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.label ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
          >
            <i className={`fa-solid ${cat.icon} text-[9px]`}></i>
            {cat.label} ({cat.count})
          </button>
        ))}
        <button
          onClick={() => setActiveCategory('Analizler')}
          className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === 'Analizler' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
        >
          <i className="fa-solid fa-chart-line text-[9px]"></i>
          Analizler ({assessments.length})
        </button>
      </div>

      {/* Materials Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all hover:border-[var(--accent-color)]/30 hover:shadow-lg group">
              {/* Card Header */}
              <div className="p-3 pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all">
                      <i className={`fa-solid ${getItemIcon(item)} text-sm`}></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase truncate leading-tight">{getItemName(item)}</h4>
                      <span className="text-[9px] font-medium text-[var(--text-muted)]">{getItemCategory(item)}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(item.id)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${favorites.has(item.id) ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-amber-500'}`} title="Favorilere Ekle">
                    <i className={`fa-${favorites.has(item.id) ? 'solid' : 'regular'} fa-star text-[11px]`}></i>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)] font-medium mb-2">
                  <span><i className="fa-solid fa-calendar mr-1"></i>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span className="uppercase">{getItemActivityType(item)}</span>
                </div>
                <div className="flex gap-1.5">
                  {item.type === 'worksheet' && (
                    <button onClick={() => onLoadMaterial?.(item)} className="flex-1 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg text-[9px] font-medium uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1">
                      <i className="fa-solid fa-eye text-[9px]"></i> Önizle
                    </button>
                  )}
                  <button onClick={() => { setShowPreview(item); }} className="flex-1 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-[9px] font-medium uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1">
                    <i className="fa-solid fa-info-circle text-[9px]"></i> Bilgi
                  </button>
                  <button onClick={() => handleDownload(item)} className="w-7 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-lg text-[9px] font-medium hover:text-[var(--accent-color)] transition-all flex items-center justify-center">
                    <i className="fa-solid fa-download text-[9px]"></i>
                  </button>
                  <button onClick={() => handleDelete(item)} className="w-7 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-lg text-[9px] font-medium hover:text-red-500 transition-all flex items-center justify-center">
                    <i className="fa-solid fa-trash-can text-[9px]"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 group flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all shrink-0">
                <i className={`fa-solid ${getItemIcon(item)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase truncate">{getItemName(item)}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] font-medium text-[var(--text-muted)]">{getItemCategory(item)}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleFavorite(item.id)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${favorites.has(item.id) ? 'text-amber-500' : 'text-[var(--text-muted)] hover:text-amber-500'}`}>
                  <i className={`fa-${favorites.has(item.id) ? 'solid' : 'regular'} fa-star text-[10px]`}></i>
                </button>
                {item.type === 'worksheet' && (
                  <button onClick={() => onLoadMaterial?.(item)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all">
                    <i className="fa-solid fa-eye text-[10px]"></i>
                  </button>
                )}
                <button onClick={() => { setShowPreview(item); }} className="w-6 h-6 rounded-md bg-[var(--accent-color)] flex items-center justify-center text-white transition-all">
                  <i className="fa-solid fa-info-circle text-[10px]"></i>
                </button>
                <button onClick={() => handleDownload(item)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all">
                  <i className="fa-solid fa-download text-[10px]"></i>
                </button>
                <button onClick={() => handleDelete(item)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-all">
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
          <i className="fa-solid fa-folder-open text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
          <p className="text-[var(--text-muted)] font-medium text-[11px] uppercase tracking-widest">Materyal bulunamadı</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center">
                  <i className={`fa-solid ${getItemIcon(showPreview)} text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase">{getItemName(showPreview)}</h3>
                  <p className="text-[9px] text-[var(--text-muted)]">{getItemCategory(showPreview)}</p>
                </div>
              </div>
              <button onClick={() => setShowPreview(null)} className="w-8 h-8 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[11px]"></i>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Oluşturulma</span>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">{new Date(showPreview.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Tür</span>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1 uppercase">{getItemActivityType(showPreview)}</p>
                  </div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                  <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Kategori</span>
                  <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">{getItemCategory(showPreview)}</p>
                </div>
                {showPreview.type === 'assessment' && (
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Öğrenci</span>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">{showPreview.studentName}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={handlePrint} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-medium uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[10px]"></i> Yazdır
              </button>
              <button onClick={() => handleDownload(showPreview)} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-medium uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[10px]"></i> İndir
              </button>
              {showPreview.type === 'worksheet' && (
                <button onClick={() => { onLoadMaterial?.(showPreview); setShowPreview(null); }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[10px] font-medium uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                  <i className="fa-solid fa-arrow-right text-[10px]"></i> Etkinliğe Git
                </button>
              )}
              <button onClick={() => { handleDelete(showPreview); setShowPreview(null); }} className="w-9 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-medium uppercase hover:bg-red-500/20 transition-all flex items-center justify-center">
                <i className="fa-solid fa-trash-can text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
