import { useState } from 'react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { ScreeningFilters } from '../components/shared/ScreeningFilters';
import { RiskBadge } from '../components/shared/RiskBadge';
import { ReportActions } from '../components/shared/ReportActions';
import { Users, Eye, Download, Archive, Trash2, Share2 } from 'lucide-react';
import type { ScreeningResult } from '../../../types/screening';

export const HistoryPanel: React.FC = () => {
  const {
    filteredData,
    searchQuery,
    filterStatus,
    setSearchQuery,
    setFilterStatus,
    setCurrentScreening,
    setActiveView,
    handleArchiveScreening,
    handleDeleteScreening,
    handleShareResults,
    handleDownloadReport,
    getScoreColor,
    getStatusBadgeClasses,
  } = useScreeningAssessment();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-4">
      <ScreeningFilters
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
      />

      <div className="bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="px-4 py-2 bg-[var(--accent-muted)] border-b border-[var(--border-color)] flex items-center gap-3">
            <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">
              {selectedIds.size} seçili
            </span>
            <button
              onClick={() => {
                selectedIds.forEach((id) => handleArchiveScreening(id));
                setSelectedIds(new Set());
              }}
              className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-colors"
            >
              <Archive className="w-3 h-3 inline mr-1" />
              Arşivle
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-3 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                    onChange={selectAll}
                    className="rounded border-[var(--border-color)] accent-[var(--accent-color)]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Öğrenci</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Tarih</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Skor</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Risk</th>
                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Durum</th>
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
                      className="rounded border-[var(--border-color)] accent-[var(--accent-color)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)] shrink-0">
                        <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate">{item.studentName}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{item.age} yaş</p>
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
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full ${getStatusBadgeClasses(item.status)}`}>
                      {item.status === 'completed' ? 'Tamamlandı' : item.status === 'pending' ? 'Bekleyen' : 'Arşivli'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCurrentScreening(item);
                          setActiveView('result-detail');
                        }}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="İncele"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(item)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="İndir"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleShareResults(item.id)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all"
                        title="Paylaş"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleArchiveScreening(item.id)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500"
                        title="Arşivle"
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteScreening(item.id)}
                        className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500"
                        title="Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[var(--text-muted)] font-medium">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
