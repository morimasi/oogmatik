import React from 'react';

export type StudentDashboardTab =
  | 'overview'
  | 'assignments'
  | 'materials'
  | 'analytics'
  | 'plans'
  | 'iep'
  | 'bep'
  | 'notes'
  | 'settings';

interface TabItem {
  id: StudentDashboardTab;
  label: string;
  icon: string;
}

export const STUDENT_TABS: TabItem[] = [
  { id: 'overview', label: 'Dashboard', icon: 'fa-grid-2' },
  { id: 'assignments', label: 'Atamalar', icon: 'fa-tasks' },
  { id: 'materials', label: 'Materyaller', icon: 'fa-scroll' },
  { id: 'analytics', label: 'Analiz', icon: 'fa-brain-circuit' },
  { id: 'plans', label: 'Akademik Plan', icon: 'fa-calendar-lines-pen' },
  { id: 'iep', label: 'BEP / IEP', icon: 'fa-hands-holding-child' },
  { id: 'bep', label: 'BEP Raporu', icon: 'fa-file-lines' },
  { id: 'notes', label: 'Klinik Notlar', icon: 'fa-notes-medical' },
];

interface StudentTabNavigationProps {
  activeTab: StudentDashboardTab;
  onSelectTab: (tab: StudentDashboardTab) => void;
}

export const StudentTabNavigation: React.FC<StudentTabNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-paper)]/50 backdrop-blur-md px-6 gap-6 overflow-x-auto shrink-0 sticky top-0 z-20 no-scrollbar">
      {STUDENT_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`py-3 text-[9px] font-black uppercase tracking-[0.1em] border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-[10px]`}></i> {tab.label}
          </button>
        );
      })}
    </div>
  );
};
