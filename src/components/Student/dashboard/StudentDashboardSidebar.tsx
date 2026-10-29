import React from 'react';
import { Student } from '../../../types';
import { StudentEffectCard } from '../StudentEffectCard';

export type GroupingMode = 'all' | 'grade' | 'age';

interface StudentDashboardSidebarProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupingMode: GroupingMode;
  onGroupingModeChange: (mode: GroupingMode) => void;
  openGroups: Record<string, boolean>;
  onToggleGroup: (groupKey: string) => void;
  groupedStudents: Record<string, Student[]>;
  sortedGroupKeys: string[];
}

export const StudentDashboardSidebar: React.FC<StudentDashboardSidebarProps> = ({
  students,
  onSelectStudent,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
  groupingMode,
  onGroupingModeChange,
  openGroups,
  onToggleGroup,
  groupedStudents,
  sortedGroupKeys,
}) => {
  return (
    <div className="w-64 bg-[var(--bg-paper)] border-r border-[var(--border-color)] flex flex-col h-full shrink-0 shadow-2xl z-30 overflow-hidden">
      {/* Header & Controls */}
      <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-lg text-[var(--text-primary)] flex items-center gap-2.5 tracking-tighter uppercase">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-color)]/20">
              <i className="fa-solid fa-users text-sm"></i>
            </div>
            Öğrencilerim
          </h2>
          <button
            onClick={onOpenAddModal}
            className="w-8 h-8 rounded-lg text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg active:scale-95"
            style={{ backgroundColor: 'var(--accent-color)' }}
            title="Yeni Öğrenci Ekle"
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
          <input
            type="text"
            placeholder="İsim veya sınıf ile ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-paper)]/50 border border-[var(--border-color)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all shadow-sm text-[var(--text-primary)]"
          />
        </div>

        {/* Grouping Toggles */}
        <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
          {(['all', 'grade', 'age'] as GroupingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onGroupingModeChange(mode)}
              className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${
                groupingMode === mode
                  ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {mode === 'all' ? 'Tümü' : mode === 'grade' ? 'Sınıf' : 'Yaş'}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="space-y-1.5">
            {groupingMode !== 'all' && (
              <button
                onClick={() => onToggleGroup(groupKey)}
                className="w-full flex items-center justify-between px-2 py-1 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] hover:text-[var(--text-secondary)] transition-colors"
              >
                <span>
                  {groupKey} ({groupedStudents[groupKey]?.length || 0})
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-[8px] transition-transform ${
                    openGroups[groupKey] ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>
            )}

            {(groupingMode === 'all' || openGroups[groupKey]) && (
              <div className="space-y-1.5">
                {groupedStudents[groupKey]?.map((s) => {
                  if (!s || !s.id) return null;
                  return (
                    <StudentEffectCard
                      key={s.id}
                      student={s}
                      onClick={() => onSelectStudent(s.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-3 border border-[var(--border-color)]">
              <i className="fa-solid fa-user-plus text-[var(--text-muted)] text-xl"></i>
            </div>
            <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-wider">
              Henüz Kayıt Yok
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 text-[var(--accent-color)] font-black text-[9px] uppercase tracking-widest hover:underline"
            >
              Hemen Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
