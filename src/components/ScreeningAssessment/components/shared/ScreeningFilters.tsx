import React from 'react';
import { Search, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';
import type { ScreeningFilterStatus, ScreeningFilterRiskLevel, ScreeningSortBy } from '../../types';

interface ScreeningFiltersProps {
  searchQuery: string;
  filterStatus: ScreeningFilterStatus;
  filterRiskLevel: ScreeningFilterRiskLevel;
  sortBy: ScreeningSortBy;
  onSearchChange: (query: string) => void;
  onFilterStatusChange: (status: ScreeningFilterStatus) => void;
  onFilterRiskLevelChange: (level: ScreeningFilterRiskLevel) => void;
  onSortByChange: (sort: ScreeningSortBy) => void;
  onResetFilters?: () => void;
}

export const ScreeningFilters: React.FC<ScreeningFiltersProps> = ({
  searchQuery,
  filterStatus,
  filterRiskLevel,
  sortBy,
  onSearchChange,
  onFilterStatusChange,
  onFilterRiskLevelChange,
  onSortByChange,
  onResetFilters,
}) => {
  const isFiltered = searchQuery !== '' || filterStatus !== 'all' || filterRiskLevel !== 'all' || sortBy !== 'newest';

  return (
    <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-3 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Öğrenci adı ile ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend text-xs focus:ring-2 focus:ring-[var(--accent-color)] outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as ScreeningFilterStatus)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <option value="all">Durum: Tümü</option>
            <option value="completed">Tamamlananlar</option>
            <option value="pending">Bekleyenler</option>
            <option value="archived">Arşivlenenler</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="relative">
          <select
            value={filterRiskLevel}
            onChange={(e) => onFilterRiskLevelChange(e.target.value as ScreeningFilterRiskLevel)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <option value="all">Risk Seviyesi: Tümü</option>
            <option value="high">Yüksek Risk</option>
            <option value="medium">Orta Risk</option>
            <option value="low">Düşük Risk</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as ScreeningSortBy)}
            className="flex-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <option value="newest">Sırala: En Yeni</option>
            <option value="oldest">Sırala: En Eski</option>
            <option value="score_desc">Skor: Yüksekten Düşüğe</option>
            <option value="score_asc">Skor: Düşükten Yükseğe</option>
          </select>

          {isFiltered && onResetFilters && (
            <button
              onClick={onResetFilters}
              title="Filtreleri Sıfırla"
              className="px-2.5 py-2 rounded-xl bg-[var(--accent-muted)] border border-[var(--border-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all text-xs flex items-center justify-center shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
