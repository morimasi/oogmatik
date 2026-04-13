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
      console.error('Failed to load library:', error);
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
      console.error('Failed to duplicate:', error);
    }
  }

  async function handleDelete(workbookId: string) {
    if (!confirm('Bu workbook\'u silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteWorkbook(workbookId, userId);
      setWorkbooks(workbooks.filter((wb) => wb.id !== workbookId));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  return (
    <div className="workbook-library h-full flex flex-col" style={{ backgroundColor: 'var(--bg-default)' }}>
      {/* Header */}
      <header className="p-6" style={{ backgroundColor: 'var(--bg-paper)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Lexend', color: 'var(--text-primary)' }}>
            Çalışma Kitapçığı Kütüphanesi
          </h1>
          <button
            onClick={() => onCreateNew()}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <Plus className="w-5 h-5" />
            Yeni Kitapçık
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Kitapçık ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
              style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg outline-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="archived">Arşiv</option>
          </select>

          <div className="flex gap-2 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 rounded transition-colors"
              style={viewMode === 'grid' ? { backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' } : { color: 'var(--text-muted)' }}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded transition-colors"
              style={viewMode === 'list' ? { backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' } : { color: 'var(--text-muted)' }}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Templates Section */}
      <section className="p-6" style={{ background: 'linear-gradient(to right, var(--surface-elevated), var(--bg-paper))', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Premium Şablonlar
        </h2>
        <div className="grid grid-cols-6 gap-4">
          {templates.slice(0, 6).map((template) => (
            <button
              key={template.id}
              onClick={() => onCreateNew(template)}
              className="p-4 rounded-xl border-2 hover:shadow-lg transition text-center hover:border-[var(--accent-color)]"
              style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}
            >
              <div className="text-3xl mb-2">{getTemplateIcon(template.type)}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {template.name}
              </div>
              {template.isPremium && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
                  Premium
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Workbooks Grid/List */}
      <main className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Yükleniyor...</div>
        ) : filteredWorkbooks.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            Henüz kitapçık bulunamadı. Yeni bir kitapçık oluşturun!
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-6">
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
          <div className="space-y-2">
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
// WORKBOOK CARD (Grid View)
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
    <div className="rounded-xl hover:shadow-xl transition cursor-pointer overflow-hidden group" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
      {/* Thumbnail */}
      <div
        className="h-48 flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom right, var(--surface-elevated), var(--bg-inset))' }}
        onClick={() => onSelect(workbook)}
      >
        <div className="text-6xl">{getTemplateIcon(workbook.templateType)}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-lg font-semibold mb-1 truncate"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => onSelect(workbook)}
        >
          {workbook.title}
        </h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {workbook.description || 'Açıklama yok'}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <span>{workbook.pages?.length || 0} sayfa</span>
          <span>{new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicate(workbook.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded transition hover:opacity-80"
            style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
          >
            <Copy className="w-4 h-4" />
            Kopyala
          </button>
          <button
            onClick={() => onDelete(workbook.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded transition hover:opacity-80"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WORKBOOK LIST ITEM (List View)
// ============================================================================

const WorkbookListItem: React.FC<WorkbookCardProps> = ({
  workbook,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div
      className="rounded-lg p-4 hover:shadow-md transition flex items-center gap-4 cursor-pointer"
      style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}
      onClick={() => onSelect(workbook)}
    >
      <div className="text-4xl">{getTemplateIcon(workbook.templateType)}</div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {workbook.title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {workbook.pages?.length || 0} sayfa · {new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(workbook.id);
          }}
          className="p-2 rounded hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          <Copy className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workbook.id);
          }}
          className="p-2 rounded hover:opacity-80"
          style={{ color: '#ef4444' }}
        >
          <Trash2 className="w-5 h-5" />
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
