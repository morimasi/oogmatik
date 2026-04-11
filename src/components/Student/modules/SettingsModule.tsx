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
    <div className="flex gap-2 h-full">
      {/* Ultra Compact Sidebar */}
      <div className="w-10 md:w-32 shrink-0 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center md:justify-start gap-2 transition-all
                            ${activeSection === item.id ? 'bg-indigo-500 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            title={item.label}
          >
            <i className={`fa-solid ${item.icon} text-xs md:text-[10px]`} />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Ultra Compact Content */}
      <div className="flex-1 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 overflow-y-auto flex flex-col">
        <div className="flex-1">
          {activeSection === 'profile' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mb-1">
                <h3 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Profil
                </h3>
                <span className="text-[8px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-bold">
                  ID: {student.id}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-800/20 p-1.5 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
                <img
                  src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                  alt={student.name}
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 bg-white shadow-sm"
                />
                <div className="flex-1 grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 w-full outline-none"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Sınıf"
                    className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 w-full outline-none"
                    value={profileData.grade}
                    onChange={(e) => handleProfileChange('grade', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <div className="space-y-0.5">
                  <label className="text-[8px] font-black text-zinc-400 uppercase ml-1 opacity-50">
                    Veli
                  </label>
                  <input
                    type="text"
                    placeholder="Ad"
                    className="px-2 py-1 rounded bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 w-full outline-none"
                    value={profileData.parentName}
                    onChange={(e) => handleProfileChange('parentName', e.target.value)}
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] font-black text-zinc-400 uppercase ml-1 opacity-50">
                    Tel
                  </label>
                  <input
                    type="tel"
                    placeholder="No"
                    className="px-2 py-1 rounded bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 w-full outline-none"
                    value={profileData.parentPhone}
                    onChange={(e) => handleProfileChange('parentPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Bildirim Tercihleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                    onClick={() => handleToggle('notifications', key)}
                  >
                    <h4 className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      {key.replace('Report', ' Rapor')}
                    </h4>
                    {renderToggle(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Gizlilik ve Güvenlik
              </h3>
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-2 flex gap-2 items-center mb-1">
                <i className="fa-solid fa-shield-check text-amber-500 text-[10px]"></i>
                <p className="text-[9px] font-medium text-amber-700 dark:text-amber-500">
                  Veri paylaşımı KVKK standartlarına uygun olarak yönetilir.
                </p>
              </div>
              <div className="space-y-1.5">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleToggle('privacy', key)}
                  >
                    <h4 className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">
                      {key === 'shareProfile'
                        ? 'Profili Paylaş'
                        : key === 'publicPortfolio'
                          ? 'Açık Portfolyo'
                          : 'Notları Velilere Göster'}
                    </h4>
                    {renderToggle(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'modules' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                  Aktif Modüller
                </h3>
                <span className="text-[9px] text-zinc-400 font-medium">
                  Kullanılacak araçları seçin
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {Object.entries(settings.modules).map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                      value
                        ? 'border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    onClick={() => handleToggle('modules', key)}
                  >
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${value ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    >
                      <i
                        className={`fa-solid text-[10px] ${
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
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-[10px] font-bold capitalize truncate">
                        {key === 'iep' ? 'BEP' : key}
                      </p>
                    </div>
                    {value && (
                      <i className="fa-solid fa-circle-check text-[10px] text-indigo-500"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ultra Compact Footer */}
        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white rounded-md text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-check text-[9px]"></i>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
