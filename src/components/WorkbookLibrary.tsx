/**
 * OOGMATIK — WorkbookLibrary Component
 *
 * Premium workbook library/archive UI with filters, search, and templates
 *
 * @module components/WorkbookLibrary
 * @version 2.0.0
 * @author Bora Demir (Yazılım Mühendisi)
 */

import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Plus, Trash2, Copy } from 'lucide-react';
import { listWorkbooks, duplicateWorkbook, deleteWorkbook } from '../services/workbook/workbookService';
import { getAllTemplates } from '../services/workbook/workbookTemplates';
import type { Workbook, WorkbookTemplate } from '../types/workbook';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface WorkbookLibraryProps {
  userId: string;
  onSelectWorkbook: (workbook: Workbook) => void;
  onCreateNew: (template?: WorkbookTemplate) => void;
}

export const WorkbookLibrary: React.FC<WorkbookLibraryProps> = ({
  userId,
  onSelectWorkbook,
  onCreateNew,
}) => {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [templates, setTemplates] = useState<WorkbookTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');

  // Load workbooks and templates
  useEffect(() => {
    loadData();
  }, [userId, statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const { workbooks: wbs } = await listWorkbooks(userId, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      });
      setWorkbooks(wbs);

      const tmpls = getAllTemplates();
      setTemplates(tmpls);
    } catch (error) {
      logError('Failed to load library:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtered workbooks
  const filteredWorkbooks = workbooks.filter((wb) =>
    wb.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions
  async function handleDuplicate(workbookId: string) {
    try {
      const duplicated = await duplicateWorkbook(workbookId, userId);
      setWorkbooks([...workbooks, duplicated]);
    } catch (error) {
      logError('Failed to duplicate:', error);
    }
  }

  async function handleDelete(workbookId: string) {
    if (!confirm('Bu workbook\'u silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteWorkbook(workbookId, userId);
      setWorkbooks(workbooks.filter((wb) => wb.id !== workbookId));
    } catch (error) {
      logError('Failed to delete:', error);
    }
  }

  return (
    <div className="workbook-library h-full flex flex-col bg-[var(--bg-default)]">
      {/* Header - Compact SaaS Style */}
      <header className="p-4 bg-[var(--bg-paper)] border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: 'Lexend', color: 'var(--text-primary)' }}>
              Kitapçık Kütüphanesi
            </h1>
          </div>
          <button
            onClick={() => onCreateNew?.()}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--accent-color)] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:translate-y-[-1px] shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            YENI OLUŞTUR
          </button>
        </div>

        {/* Search + Filters - Minimal */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }} />
            <input
              type="text"
              placeholder="Arşivinizde arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium outline-none border transition-all focus:ring-2 focus:ring-[var(--accent-muted)]"
              style={{ backgroundColor: 'var(--bg-inset)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs font-bold border outline-none bg-[var(--bg-inset)] cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktifler</option>
            <option value="archived">Arşivlenenler</option>
          </select>

          <div className="flex gap-1 rounded-xl p-1 bg-[var(--bg-inset)] border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Templates Section - Ultra Compact Grid */}
      <section className="p-4 bg-[var(--surface-elevated)]/30 border-b border-[var(--border-color)]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-[var(--text-muted)]">
          HIZLI ŞABLONLAR
        </h2>
        <div className="grid grid-cols-6 lg:grid-cols-9 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onCreateNew?.(template)}
              className="group p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] hover:border-[var(--accent-color)] hover:shadow-md transition-all text-center flex flex-col items-center gap-1.5 relative"
            >
              <div className="text-xl group-hover:scale-110 transition-transform">{getTemplateIcon(template.type)}</div>
              <div className="text-[9px] font-bold leading-tight truncate w-full" style={{ color: 'var(--text-primary)' }}>
                {template.name}
              </div>
              {template.isPremium && (
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-amber-400"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Workbooks Grid/List */}
      <main className="flex-1 overflow-auto p-5 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-10 h-10 border-4 border-[var(--accent-muted)] border-t-[var(--accent-color)] rounded-full animate-spin"></div>
             <p className="text-xs font-bold text-[var(--text-muted)]">Kütüphane hazırlanıyor...</p>
          </div>
        ) : filteredWorkbooks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-[2rem] bg-[var(--bg-inset)]/50">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold opacity-50">Henüz kitapçık bulunamadı.</p>
            <button onClick={() => onCreateNew()} className="mt-4 text-xs font-black text-[var(--accent-color)] uppercase hover:underline">
               İLK KİTAPÇIĞI OLUŞTURUN
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredWorkbooks.map((workbook) => (
              <WorkbookCard
                key={workbook.id}
                workbook={workbook}
                onSelect={onSelectWorkbook}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-w-5xl mx-auto">
            {filteredWorkbooks.map((workbook) => (
              <WorkbookListItem
                key={workbook.id}
                workbook={workbook}
                onSelect={onSelectWorkbook}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// ============================================================================
// WORKBOOK CARD (Premium Bento Grid View)
// ============================================================================

interface WorkbookCardProps {
  workbook: Workbook;
  onSelect: (workbook: Workbook) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkbookCard: React.FC<WorkbookCardProps> = ({
  workbook,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div 
      className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:translate-y-[-4px] flex flex-col h-full cursor-pointer relative"
    >
      {/* Thumbnail / Header */}
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-inset), var(--surface-elevated))' }}
        onClick={() => onSelect?.(workbook)}
      >
        <div className="text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
          {getTemplateIcon(workbook.templateType)}
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-[var(--bg-paper)]/80 backdrop-blur-md border border-[var(--border-color)] text-[8px] font-black uppercase text-[var(--text-muted)]">
          {workbook.pages?.length || 0} SAYFA
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="text-sm font-black mb-1 truncate text-[var(--text-primary)]"
          onClick={() => onSelect?.(workbook)}
        >
          {workbook.title}
        </h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4 flex-1">
          {workbook.description || 'Bu kitapçık için henüz açıklama eklenmemiş.'}
        </p>

        {/* Footer Actions - Minimal */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 gap-2">
          <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
            {new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(workbook.id); }}
              className="w-7 h-7 rounded-lg bg-[var(--bg-inset)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] flex items-center justify-center transition-all"
              title="Kopyala"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(workbook.id); }}
              className="w-7 h-7 rounded-lg bg-[var(--bg-inset)] hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WORKBOOK LIST ITEM (Compact List View)
// ============================================================================

const WorkbookListItem: React.FC<WorkbookCardProps> = ({
  workbook,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      className="group rounded-xl p-3 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:shadow-lg transition-all flex items-center gap-4 cursor-pointer"
      onClick={() => onSelect?.(workbook)}
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--bg-inset)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {getTemplateIcon(workbook.templateType)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black truncate text-[var(--text-primary)]">
          {workbook.title}
        </h3>
        <p className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-3">
          <span>{workbook.pages?.length || 0} sayfa</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
          <span>Son düzenleme: {new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}</span>
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(workbook.id); }}
          className="p-2 rounded-lg hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(workbook.id); }}
          className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

function getTemplateIcon(type: string): string {
  const icons: Record<string, string> = {
    'academic-standard': '📚',
    'dyslexia-friendly': '🎨',
    'dyscalculia-support': '🔢',
    'adhd-focus': '🎯',
    'exam-prep': '📝',
    'skill-practice': '💪',
    'assessment-portfolio': '📊',
    'bep-aligned': '🎓',
    'creative-journal': '✍️',
    'progress-tracker': '📈',
    'multi-subject': '🌈',
    'custom': '⚙️',
  };
  return icons[type] || '📖';
}
