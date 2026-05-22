import React from 'react';
import { PROFILE_TABS, ProfileTabId } from '../constants';

type ProfileTab = typeof PROFILE_TABS[number];

interface TabNavigationProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  allowedTabs: ProfileTab[];
  unreadCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  allowedTabs,
  unreadCount = 0,
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
          {tab.id === 'shared' && unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};