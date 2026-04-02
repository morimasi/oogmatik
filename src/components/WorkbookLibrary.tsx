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
import { Search, Grid, List, Plus, Trash2, Copy, Share2, Download } from 'lucide-react';
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
    <div className="workbook-library h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Lexend' }}>
            Çalışma Kitapçığı Kütüphanesi
          </h1>
          <button
            onClick={() => onCreateNew()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Yeni Kitapçık
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kitapçık ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="archived">Arşiv</option>
          </select>

          <div className="flex gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Templates Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Premium Şablonlar
        </h2>
        <div className="grid grid-cols-6 gap-4">
          {templates.slice(0, 6).map((template) => (
            <button
              key={template.id}
              onClick={() => onCreateNew(template)}
              className="p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 hover:shadow-lg transition text-center"
            >
              <div className="text-3xl mb-2">{getTemplateIcon(template.type)}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {template.name}
              </div>
              {template.isPremium && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
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
          <div className="text-center py-12">Yükleniyor...</div>
        ) : filteredWorkbooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition cursor-pointer overflow-hidden group">
      {/* Thumbnail */}
      <div
        className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
        onClick={() => onSelect(workbook)}
      >
        <div className="text-6xl">{getTemplateIcon(workbook.templateType)}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate"
          onClick={() => onSelect(workbook)}
        >
          {workbook.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {workbook.description || 'Açıklama yok'}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{workbook.pages.length} sayfa</span>
          <span>{new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicate(workbook.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <Copy className="w-4 h-4" />
            Kopyala
          </button>
          <button
            onClick={() => onDelete(workbook.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
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
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition flex items-center gap-4 cursor-pointer"
      onClick={() => onSelect(workbook)}
    >
      <div className="text-4xl">{getTemplateIcon(workbook.templateType)}</div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {workbook.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {workbook.pages.length} sayfa · {new Date(workbook.updatedAt).toLocaleDateString('tr-TR')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(workbook.id);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workbook.id);
          }}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded"
        >
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
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
