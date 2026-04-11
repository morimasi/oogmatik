import React, { useState } from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

interface SettingsModuleProps {
  student: AdvancedStudent;
  onUpdate?: (updates: Partial<AdvancedStudent>) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ student, onUpdate }) => {
  const [activeSection, setActiveSection] = useState<
    'profile' | 'notifications' | 'privacy' | 'modules'
  >('profile');

  const [settings, setSettings] = useState({
    notifications: { email: true, sms: false, push: true, weeklyReport: true },
    privacy: { shareProfile: false, publicPortfolio: true, showGradesToParents: true },
    modules: { iep: true, financial: true, attendance: true, academic: true, behavior: true },
  });

  const [profileData, setProfileData] = useState({
    name: student.name,
    grade: student.grade,
    parentName: 'Veli Adı',
    parentPhone: '555-000-0000',
    address: 'Bursa, Türkiye',
  });

  const handleToggle = (category: keyof typeof settings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof (typeof prev)[typeof category]],
      },
    }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onUpdate) onUpdate({ name: profileData.name, grade: profileData.grade });
  };

  const menuItems = [
    { id: 'profile', icon: 'fa-user-gear', label: 'Profil' },
    { id: 'notifications', icon: 'fa-bell', label: 'Bildirim' },
    { id: 'privacy', icon: 'fa-shield-halved', label: 'Gizlilik' },
    { id: 'modules', icon: 'fa-layer-group', label: 'Modüller' },
  ] as const;

  const renderToggle = (checked: boolean) => (
    <div
      className={`w-8 h-5 rounded-full transition-all ${checked ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`}
      />
    </div>
  );

  return (
    <div className="flex gap-1.5 h-full">
      {/* Ultra Compact Sidebar (Themed) */}
      <div className="w-10 md:w-28 shrink-0 space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-1.5 md:px-2 py-1 md:py-1.5 rounded-md text-[9px] font-black flex items-center justify-center md:justify-start gap-1.5 transition-all
                            ${activeSection === item.id ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'}`}
            title={item.label}
          >
            <i className={`fa-solid ${item.icon} text-[10px] md:text-[9px]`} />
            <span className="hidden md:inline uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Ultra Compact Content (Themed) */}
      <div className="flex-1 bg-[var(--bg-paper)]/50 rounded-lg border border-[var(--border-color)] p-2 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {activeSection === 'profile' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1 mb-1">
                <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                  Profil
                </h3>
                <span className="text-[7px] px-1 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded font-bold">
                  ID: {student.id}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-[var(--bg-inset)]/20 p-1 rounded-lg border border-[var(--border-color)]">
                <img
                  src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                  alt={student.name}
                  className="w-7 h-7 rounded object-cover border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-sm"
                />
                <div className="flex-1 grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    className="px-1.5 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-primary)] w-full outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Sınıf"
                    className="px-1.5 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-primary)] w-full outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                    value={profileData.grade}
                    onChange={(e) => handleProfileChange('grade', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="space-y-0.5">
                  <label className="text-[7px] font-black text-[var(--text-muted)] uppercase ml-1 opacity-50">
                    Veli
                  </label>
                  <input
                    type="text"
                    placeholder="Ad"
                    className="px-1.5 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-primary)] w-full outline-none"
                    value={profileData.parentName}
                    onChange={(e) => handleProfileChange('parentName', e.target.value)}
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[7px] font-black text-[var(--text-muted)] uppercase ml-1 opacity-50">
                    Tel
                  </label>
                  <input
                    type="tel"
                    placeholder="No"
                    className="px-1.5 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-primary)] w-full outline-none"
                    value={profileData.parentPhone}
                    onChange={(e) => handleProfileChange('parentPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase border-b border-[var(--border-color)] pb-1">
                Bildirim
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-2 py-1 bg-[var(--bg-inset)]/10 hover:bg-[var(--surface-elevated)] rounded-md cursor-pointer border border-transparent transition-all"
                    onClick={() => handleToggle('notifications', key)}
                  >
                    <h4 className="font-bold text-[8px] text-[var(--text-secondary)] uppercase tracking-tight">
                      {key}
                    </h4>
                    {renderToggle(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase border-b border-[var(--border-color)] pb-1">
                Gizlilik
              </h3>
              <div className="space-y-1 mt-1">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-2 py-1 bg-[var(--bg-inset)]/10 rounded-md cursor-pointer transition-colors"
                    onClick={() => handleToggle('privacy', key)}
                  >
                    <h4 className="font-bold text-[8px] text-[var(--text-secondary)] uppercase">
                      {key}
                    </h4>
                    {renderToggle(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'modules' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1">
                <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase">
                  Modüller
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1">
                {Object.entries(settings.modules).map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-1.5 rounded-md border cursor-pointer flex items-center gap-1.5 transition-all ${
                      value
                        ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-inset)]/10 text-[var(--text-muted)]'
                    }`}
                    onClick={() => handleToggle('modules', key)}
                  >
                    <i
                      className={`fa-solid text-[9px] ${
                        key === 'iep'
                          ? 'fa-hands-holding-child'
                          : key === 'financial'
                            ? 'fa-wallet'
                            : key === 'attendance'
                              ? 'fa-calendar-days'
                              : key === 'academic'
                                ? 'fa-graduation-cap'
                                : 'fa-scale-balanced'
                      }`}
                    />
                    <p className="text-[8px] font-black uppercase truncate">
                      {key === 'iep' ? 'BEP' : key}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ultra Compact Footer */}
        <div className="mt-2 pt-1.5 border-t border-[var(--border-color)] flex justify-end gap-1.5 shrink-0">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm transition-colors flex items-center gap-1"
          >
            <i className="fa-solid fa-check text-[7px]"></i>
            KAYDET
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
