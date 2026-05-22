import React from 'react';
import { PROFILE_TABS, ProfileTabId } from '../constants';

type ProfileTab = typeof PROFILE_TABS[number];

interface TabNavigationProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  allowedTabs: ProfileTab[];
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  allowedTabs,
}) => {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-2xl">
      {allowedTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === tab.id
              ? 'bg-white text-[var(--accent-color)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <i className={tab.icon}></i>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};