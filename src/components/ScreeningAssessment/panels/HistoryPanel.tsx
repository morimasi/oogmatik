import React, { useState } from 'react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { ScreeningFilters } from '../components/shared/ScreeningFilters';
import { RiskBadge } from '../components/shared/RiskBadge';
import { ShareScreeningModal } from '../components/shared/ShareScreeningModal';
import { Users, Eye, Download, Archive, Trash2, Share2, FileSpreadsheet, FileJson, X, Plus } from 'lucide-react';
import type { ScreeningResult } from '../../../types/screening';

export const HistoryPanel: React.FC = () => {
  const {
    filteredData,
    screeningData,
    searchQuery,
    filterStatus,
    filterRiskLevel,
    sortBy,
    setSearchQuery,
    setFilterStatus,
    setFilterRiskLevel,
    setSortBy,
    setCurrentScreening,
    setActiveView,
    handleArchiveScreening,
    handleDeleteScreening,
    handleBulkArchive,
    handleBulkDelete,
    handleExportJSON,
    handleExportCSV,
    handleDownloadReport,
    handleResetFilters,
    getScoreColor,
    getStatusBadgeClasses,
  } = useScreeningAssessment();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sharingItem, setSharingItem] = useState<ScreeningResult | null>(null);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((d: ScreeningResult) => d.id)));
    }
  };

  const selectedItems = filteredData.filter((item) => selectedIds.has(item.id));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ScreeningFilters
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterRiskLevel={filterRiskLevel}
        sortBy={sortBy}
        onSearchChange={setSearchQuery}
        onFilterStatusChange={setFilterStatus}
        onFilterRiskLevelChange={setFilterRiskLevel}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table Container */}
      <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 py-2.5 bg-[var(--accent-muted)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span className="text-xs font-bold text-[var(--accent-color)]">
                {selectedIds.size} kayit seçildi
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  handleBulkArchive(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="px-3 py-1.5 text-xs font-bold bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-all flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5 text-amber-500" />
                Arşivle
              </button>

              <button
                onClick={() => handleExportJSON(selectedItems)}
                className="px-3 py-1.5 text-xs font-bold bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-all flex items-center gap-1.5"
              >
                <FileJson className="w-3.5 h-3.5 text-blue-500" />
                JSON
              </button>

              <button
                onClick={() => handleExportCSV(selectedItems)}
                className="px-3 py-1.5 text-xs font-bold bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                CSV
              </button>

              <button
                onClick={() => {
                  if (confirm(`${selectedIds.size} kaydı silmek istediğinize emin misiniz?`)) {
                    handleBulkDelete(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sil
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 rounded-xl hover:bg-black/10 text-[var(--text-muted)]"
                title="Seçimi Temizle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-3 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                    onChange={selectAll}
                    className="rounded border-[var(--border-color)] accent-[var(--accent-color)] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Öğrenci</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Tarih</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Skor</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Risk</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Durum</th>
                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredData.map((item: ScreeningResult) => (
                <tr key={item.id} className="hover:bg-[var(--surface-glass)] transition-colors group">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-[var(--border-color)] accent-[var(--accent-color)] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)] shrink-0">
                        <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate">{item.studentName}</p>
                        <p className="text-[9px] font-medium text-[var(--text-muted)]">{item.age} yaş • {item.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-black ${getScoreColor(item.overallScore)}`}>
                      %{item.overallScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={item.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${getStatusBadgeClasses(item.status)}`}>
                      {item.status === 'completed' ? 'Tamamlandı' : item.status === 'pending' ? 'Bekleyen' : 'Arşivli'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCurrentScreening(item);
                          setActiveView('result-detail');
                        }}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="Sonuç İncele"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(item)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="Rapor İndir"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                      </button>
                      <button
                        onClick={() => setSharingItem(item)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="Raporu Paylaş"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-500" />
                      </button>
                      <button
                        onClick={() => handleArchiveScreening(item.id)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:bg-amber-500/10 hover:text-amber-500"
                        title="Arşivle"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${item.studentName} öğrencisine ait taramayı silmek istiyor musunuz?`)) {
                            handleDeleteScreening(item.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--text-primary)]">Kayıt Bulunamadı</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Arama ve filtreleme kriterlerinize uygun tarama kaydı bulunmuyor.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        {screeningData.length > 0 ? (
                          <button
                            onClick={handleResetFilters}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent-muted)] text-[var(--accent-color)] font-bold text-xs hover:bg-[var(--accent-color)] hover:text-white transition-all"
                          >
                            Filtreleri Sıfırla
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveView('new-screening')}
                            className="px-4 py-2 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            Yeni Tarama Başlat
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {sharingItem && (
        <ShareScreeningModal
          screening={sharingItem}
          onClose={() => setSharingItem(null)}
        />
      )}
    </div>
  );
};
