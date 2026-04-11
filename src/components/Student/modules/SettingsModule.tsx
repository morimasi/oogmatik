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
    <div className="flex gap-3 h-full">
      {/* Compact Sidebar */}
      <div className="w-44 shrink-0 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all
                            ${activeSection === item.id ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <i className={`fa-solid ${item.icon} w-4 text-[10px]`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Compact Content */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 overflow-y-auto">
        {activeSection === 'profile' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">Öğrenci Profili</h3>

            <div className="flex items-center gap-3">
              <img
                src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                alt={student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100"
              />
              <div>
                <h4 className="font-bold text-sm text-zinc-900">{student.name}</h4>
                <p className="text-[10px] text-zinc-400">ID: {student.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ad Soyad"
                className="px-3 py-2 rounded-lg bg-zinc-50 text-xs font-bold"
                value={profileData.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Sınıf"
                className="px-3 py-2 rounded-lg bg-zinc-50 text-xs font-bold"
                value={profileData.grade}
                onChange={(e) => handleProfileChange('grade', e.target.value)}
              />
              <input
                type="text"
                placeholder="Veli"
                className="px-3 py-2 rounded-lg bg-zinc-50 text-xs font-bold"
                value={profileData.parentName}
                onChange={(e) => handleProfileChange('parentName', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Tel"
                className="px-3 py-2 rounded-lg bg-zinc-50 text-xs font-bold"
                value={profileData.parentPhone}
                onChange={(e) => handleProfileChange('parentPhone', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-zinc-900">Bildirimler</h3>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg cursor-pointer"
                onClick={() => handleToggle('notifications', key)}
              >
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">{key}</h4>
                </div>
                {renderToggle(value)}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs mt-0.5"></i>
              <p className="text-[10px] text-amber-700">Veri paylaşımı ayarları</p>
            </div>
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg cursor-pointer"
                onClick={() => handleToggle('privacy', key)}
              >
                <h4 className="font-bold text-xs text-zinc-900">{key}</h4>
                {renderToggle(value)}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'modules' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-zinc-900">Modüller</h3>
            <p className="text-[10px] text-zinc-500">Aktif modüller</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(settings.modules).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border cursor-pointer text-center ${value ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-200 opacity-50'}`}
                  onClick={() => handleToggle('modules', key)}
                >
                  <i
                    className={`fa-solid text-lg mb-1 ${key === 'iep' ? 'fa-hands-holding-child' : key === 'financial' ? 'fa-wallet' : key === 'attendance' ? 'fa-calendar-days' : key === 'academic' ? 'fa-graduation-cap' : 'fa-scale-balanced'}`}
                  />
                  <p className="text-[9px] font-bold">{key}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
