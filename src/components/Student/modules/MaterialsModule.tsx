import React, { useState, useMemo } from 'react';
import { SavedWorksheet } from '../../../types';
import { generateMockWorksheets, getMaterialCategories, MaterialCategory } from './studentDashboardData';

interface MaterialsModuleProps {
  studentId: string;
  worksheets: SavedWorksheet[];
  onLoadMaterial?: (ws: SavedWorksheet) => void;
}

export const MaterialsModule: React.FC<MaterialsModuleProps> = ({
  studentId,
  worksheets,
  onLoadMaterial,
}) => {
  const allWorksheets = worksheets;
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<SavedWorksheet | null>(null);

  const categories = useMemo(() => getMaterialCategories(allWorksheets), [allWorksheets]);

  const filtered = useMemo(() => {
    let result = [...allWorksheets];
    if (activeCategory !== 'all') {
      result = result.filter(ws => (ws.category?.title || 'Genel').toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery) {
      result = result.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ws.category?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allWorksheets, activeCategory, searchQuery]);

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

  const handleDownload = (ws: SavedWorksheet) => {
    const blob = new Blob([JSON.stringify(ws, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ws.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Materyaller</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allWorksheets.length} materyal • {categories.length} kategori
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
        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[8px]"></i>
        <input
          type="text"
          placeholder="Materyal ara..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
        >
          Tümü ({allWorksheets.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.label ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}`}
          >
            <i className={`fa-solid ${cat.icon} text-[7px]`}></i>
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Materials Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ws => (
            <div key={ws.id} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all hover:border-[var(--accent-color)]/30 hover:shadow-lg group">
              {/* Card Header */}
              <div className="p-3 pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all">
                      <i className={`fa-solid ${ws.icon} text-sm`}></i>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase truncate leading-tight">{ws.name}</h4>
                      <span className="text-[7px] font-bold text-[var(--text-muted)]">{ws.category?.title || 'Genel'}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(ws.id)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${favorites.has(ws.id) ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-amber-500'}`} title="Favorilere Ekle">
                    <i className={`fa-${favorites.has(ws.id) ? 'solid' : 'regular'} fa-star text-[9px]`}></i>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between text-[7px] text-[var(--text-muted)] font-bold mb-2">
                  <span><i className="fa-solid fa-calendar mr-1"></i>{new Date(ws.createdAt).toLocaleDateString('tr-TR')}</span>
                  <span className="uppercase">{ws.activityType}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setShowPreview(ws)} className="flex-1 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg text-[7px] font-bold uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1">
                    <i className="fa-solid fa-eye text-[7px]"></i> Önizle
                  </button>
                  <button onClick={() => onLoadMaterial?.(ws)} className="flex-1 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-[7px] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1">
                    <i className="fa-solid fa-play text-[7px]"></i> Aç
                  </button>
                  <button onClick={() => handleDownload(ws)} className="w-7 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-lg text-[7px] font-bold hover:text-[var(--accent-color)] transition-all flex items-center justify-center">
                    <i className="fa-solid fa-download text-[7px]"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ws => (
            <div key={ws.id} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 group flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all shrink-0">
                <i className={`fa-solid ${ws.icon} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase truncate">{ws.name}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[7px] font-bold text-[var(--text-muted)]">{ws.category?.title}</span>
                  <span className="text-[7px] text-[var(--text-muted)]">{new Date(ws.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleFavorite(ws.id)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${favorites.has(ws.id) ? 'text-amber-500' : 'text-[var(--text-muted)] hover:text-amber-500'}`}>
                  <i className={`fa-${favorites.has(ws.id) ? 'solid' : 'regular'} fa-star text-[8px]`}></i>
                </button>
                <button onClick={() => setShowPreview(ws)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all">
                  <i className="fa-solid fa-eye text-[8px]"></i>
                </button>
                <button onClick={() => onLoadMaterial?.(ws)} className="w-6 h-6 rounded-md bg-[var(--accent-color)] flex items-center justify-center text-white transition-all">
                  <i className="fa-solid fa-play text-[8px]"></i>
                </button>
                <button onClick={() => handleDownload(ws)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all">
                  <i className="fa-solid fa-download text-[8px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
          <i className="fa-solid fa-folder-open text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
          <p className="text-[var(--text-muted)] font-bold text-[9px] uppercase tracking-widest">Materyal bulunamadı</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center">
                  <i className={`fa-solid ${showPreview.icon} text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">{showPreview.name}</h3>
                  <p className="text-[7px] text-[var(--text-muted)]">{showPreview.category?.title}</p>
                </div>
              </div>
              <button onClick={() => setShowPreview(null)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Oluşturulma</span>
                    <p className="text-[9px] font-black text-[var(--text-primary)] mt-1">{new Date(showPreview.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Aktivite Türü</span>
                    <p className="text-[9px] font-black text-[var(--text-primary)] mt-1 uppercase">{showPreview.activityType}</p>
                  </div>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                  <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Kategori</span>
                  <p className="text-[9px] font-black text-[var(--text-primary)] mt-1">{showPreview.category?.title || 'Genel'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={handlePrint} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[8px] font-bold uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[8px]"></i> Yazdır
              </button>
              <button onClick={() => handleDownload(showPreview)} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[8px] font-bold uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[8px]"></i> İndir
              </button>
              <button onClick={() => { onLoadMaterial?.(showPreview); setShowPreview(null); }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[8px] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-play text-[8px]"></i> Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
