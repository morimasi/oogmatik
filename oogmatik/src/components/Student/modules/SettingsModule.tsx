import React, { useState } from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

interface SettingsModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updates: Partial<AdvancedStudent>) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ student, onUpdate }) => {
    const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'modules'>('profile');
    
    // Mock settings state - in a real app these would be part of the student object or a separate settings object
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: false,
            push: true,
            weeklyReport: true
        },
        privacy: {
            shareProfile: false,
            publicPortfolio: true,
            showGradesToParents: true
        },
        modules: {
            iep: true,
            financial: true,
            attendance: true,
            academic: true,
            behavior: true
        }
    });

    const [profileData, setProfileData] = useState({
        name: student.name,
        grade: student.grade,
        parentName: 'Veli Adı', // Mock
        parentPhone: '555-000-0000', // Mock
        address: 'Bursa, Türkiye' // Mock
    });

    const handleToggle = (category: keyof typeof settings, key: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key as keyof typeof prev[typeof category]]
            }
        }));
    };

    const handleProfileChange = (key: string, value: string) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // In a real app, this would call an API
        alert('Ayarlar kaydedildi!');
        if (onUpdate) {
            onUpdate({
                name: profileData.name,
                grade: profileData.grade
            });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <button 
                    onClick={() => setActiveSection('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors
                        ${activeSection === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    <i className="fa-solid fa-user-gear w-5"></i>
                    Profil Bilgileri
                </button>
                <button 
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors
                        ${activeSection === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    <i className="fa-solid fa-bell w-5"></i>
                    Bildirimler
                </button>
                <button 
                    onClick={() => setActiveSection('privacy')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors
                        ${activeSection === 'privacy' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    <i className="fa-solid fa-shield-halved w-5"></i>
                    Gizlilik & Güvenlik
                </button>
                <button 
                    onClick={() => setActiveSection('modules')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors
                        ${activeSection === 'modules' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                    <i className="fa-solid fa-layer-group w-5"></i>
                    Modül Yönetimi
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm overflow-y-auto">
                {activeSection === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Öğrenci Profili</h3>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group cursor-pointer">
                                <img 
                                    src={student.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                                    alt={student.name} 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-zinc-100 dark:border-zinc-800"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <i className="fa-solid fa-camera"></i>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{student.name}</h4>
                                <p className="text-sm text-zinc-500">ID: {student.id}</p>
                                <button className="text-indigo-600 text-xs font-bold mt-1 hover:underline">Fotoğrafı Değiştir</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Ad Soyad</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-900 dark:text-white"
                                    value={profileData.name}
                                    onChange={e => handleProfileChange('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Sınıf / Seviye</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-900 dark:text-white"
                                    value={profileData.grade}
                                    onChange={e => handleProfileChange('grade', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Veli Adı</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-900 dark:text-white"
                                    value={profileData.parentName}
                                    onChange={e => handleProfileChange('parentName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Veli Telefon</label>
                                <input 
                                    type="tel" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-900 dark:text-white"
                                    value={profileData.parentPhone}
                                    onChange={e => handleProfileChange('parentPhone', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Adres</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-900 dark:text-white min-h-[100px]"
                                    value={profileData.address}
                                    onChange={e => handleProfileChange('address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'notifications' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Bildirim Tercihleri</h3>
                        
                        <div className="space-y-4">
                            {Object.entries(settings.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white capitalize">
                                            {key === 'weeklyReport' ? 'Haftalık Rapor' : key.toUpperCase()} Bildirimleri
                                        </h4>
                                        <p className="text-xs text-zinc-500">
                                            {key === 'email' ? 'Önemli güncellemeleri e-posta ile al.' :
                                             key === 'sms' ? 'Acil durumlar için SMS al.' :
                                             key === 'push' ? 'Mobil uygulama bildirimleri.' : 'Haftalık gelişim özeti.'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={value}
                                            onChange={() => handleToggle('notifications', key)}
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'privacy' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Gizlilik Ayarları</h3>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                            <div className="flex gap-3">
                                <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5"></i>
                                <div>
                                    <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm">Dikkat</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-600 mt-1">
                                        Bu ayarlar öğrenci verilerinin veliler ve diğer öğretmenlerle nasıl paylaşılacağını kontrol eder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(settings.privacy).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">
                                            {key === 'shareProfile' ? 'Profili Paylaş' :
                                             key === 'publicPortfolio' ? 'Portfolyoyu Yayınla' : 'Notları Velilere Göster'}
                                        </h4>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={value}
                                            onChange={() => handleToggle('privacy', key)}
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'modules' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Aktif Modüller</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Bu öğrenci için kullanılacak takip modüllerini seçin. Devre dışı bırakılan modüller menüde görünmeyecektir.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(settings.modules).map(([key, value]) => (
                                <div key={key} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60'}`}
                                    onClick={() => handleToggle('modules', key)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                                            ${value ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                            <i className={`fa-solid ${
                                                key === 'iep' ? 'fa-hands-holding-child' : 
                                                key === 'financial' ? 'fa-wallet' : 
                                                key === 'attendance' ? 'fa-calendar-days' : 
                                                key === 'academic' ? 'fa-graduation-cap' : 'fa-scale-balanced'
                                            }`}></i>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                            ${value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 bg-transparent'}`}>
                                            {value && <i className="fa-solid fa-check text-[10px]"></i>}
                                        </div>
                                    </div>
                                    <h4 className={`font-bold ${value ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-500'}`}>
                                        {key === 'iep' ? 'BEP / IEP' : 
                                         key === 'financial' ? 'Finans' : 
                                         key === 'attendance' ? 'Yoklama' : 
                                         key === 'academic' ? 'Akademik' : 'Davranış'}
                                    </h4>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                        Değişiklikleri Sıfırla
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                    >
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};
