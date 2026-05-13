/**
 * SettingsModule — Orkestratör
 * Alt modülleri yöneten hafif container. 805 satırlık monolitik yapı
 * 6 bağımsız alt modüle ayrılmıştır.
 */
import React, { useState } from 'react';
import { ProfileData } from '../../../types/profile';
import { AppTheme, UiSettings } from '../../../types';
import { SETTINGS_CATEGORIES, SettingsCategory } from '../types';
import { UserProfileSettings } from './settings/UserProfileSettings';
import { StudentsSettings } from './settings/StudentsSettings';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { PedagogySettings } from './settings/PedagogySettings';
import { AIControlSettings } from './settings/AIControlSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { SecuritySettings } from './settings/SecuritySettings';

interface SettingsModuleProps {
  data: ProfileData;
  theme?: AppTheme;
  uiSettings?: UiSettings;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateUiSettings?: (settings: UiSettings) => void;
  onOpenSettingsModal?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  data,
  theme,
  uiSettings,
  onUpdateTheme,
  onUpdateUiSettings,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return <UserProfileSettings data={data} />;
      case 'students':
        return <StudentsSettings data={data} />;
      case 'appearance':
        return (
          <AppearanceSettings
            data={data}
            theme={theme}
            uiSettings={uiSettings}
            onUpdateTheme={onUpdateTheme}
            onUpdateUiSettings={onUpdateUiSettings}
          />
        );
      case 'pedagogy':
        return <PedagogySettings data={data} />;
      case 'ai':
        return <AIControlSettings data={data} />;
      case 'notifications':
        return <NotificationSettings data={data} />;
      case 'security':
        return <SecuritySettings data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-[var(--border-color)]">
        {SETTINGS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`min-w-[110px] flex-1 text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${activeCategory === cat.id
                ? 'bg-white dark:bg-zinc-800 text-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/10 border border-[var(--accent-color)]/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]'
              }`}
          >
            <i className={`fa-solid ${cat.icon} mr-1.5`} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {renderContent()}
      </div>
    </div>
  );
};