import { Search } from 'lucide-react';

interface ScreeningFiltersProps {
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (status: string) => void;
}

export const ScreeningFilters: React.FC<ScreeningFiltersProps> = ({
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
}) => (
  <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-4">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Öğrenci adı ile ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend focus:ring-2 focus:ring-[var(--accent-color)] outline-none text-sm"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] font-lexend text-xs font-black uppercase tracking-widest cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
      >
        <option value="all">Tüm Kayıtlar</option>
        <option value="completed">Tamamlananlar</option>
        <option value="pending">Bekleyenler</option>
        <option value="archived">Arşivlenenler</option>
      </select>
    </div>
  </div>
);
