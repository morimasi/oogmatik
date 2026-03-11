import React, { useState } from 'react';
import { AdvancedStudent, Settings } from '../../../types/student-advanced';

interface SettingsModuleProps {
    student: AdvancedStudent;
    onUpdateSettings: (newSettings: Settings) => void;
}

// Default settings in case student doesn't have them yet
const DEFAULT_SETTINGS: Settings = {
    theme: { mode: 'system', primaryColor: '#6366f1', fontSize: 'medium', reduceMotion: false },
    language: { current: 'tr', autoTranslateComments: true },
    notifications: { 
        email: true, push: true, sms: false, dailyDigest: true, weeklyReport: true,
        alertThresholds: { attendance: 80, grade: 50, behavior: 0 }
    },
    privacy: { shareDataWithAI: true, visibleToParents: true, anonymizeInReports: false, dataRetentionDays: 365 },
    accessibility: { screenReaderOptimized: false, highContrast: false, dyslexiaFriendlyFont: false },
    ai: { enableSuggestions: true, autoGenerateGoals: true, sentimentAnalysis: true, learningPathAdaptation: true },
    backup: { autoBackup: true, frequency: 'daily' }
};

export const SettingsModule: React.FC<SettingsModuleProps> = ({ student, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'accessibility' | 'ai' | 'backup'>('general');
    const [settings, setSettings] = useState<Settings>(student.settings || DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    // Mock AI Analysis of Usage Habits
    React.useEffect(() => {
        // Simulate analyzing user behavior to suggest settings
        const timer = setTimeout(() => {
            if (activeTab === 'notifications' && !settings.notifications.sms) {
                setAiSuggestion("Veli toplantı katılımı düşük olduğu için SMS bildirimlerini açmanızı öneririm. Bu, veli iletişimini %40 artırabilir.");
            } else if (activeTab === 'accessibility' && !settings.accessibility.dyslexiaFriendlyFont) {
                setAiSuggestion("Öğrencinin okuma hızında yavaşlama tespit edildi. Disleksi dostu fontu aktif etmek okuma konforunu artırabilir.");
            } else {
                setAiSuggestion(null);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [activeTab, settings]);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            onUpdateSettings(settings);
            setIsSaving(false);
            // Show success toast (mock)
            alert("Ayarlar başarıyla kaydedildi ve versiyonlandı.");
        }, 800);
    };

    const updateSetting = (category: keyof Settings, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const updateNestedSetting = (category: keyof Settings, subCategory: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [subCategory]: {
                    ...(prev[category] as any)[subCategory],
                    [key]: value
                }
            }
        }));
    };

    const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
        <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{label}</h4>
                {description && <p className="text-xs text-zinc-500 mt-1 max-w-md">{description}</p>}
            </div>
            <button 
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
                    ${checked ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
                <span 
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300
                        ${checked ? 'translate-x-6' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );

    const Select = ({ label, value, options, onChange }: { label: string, value: string, options: { value: string, label: string }[], onChange: (v: string) => void }) => (
        <div className="flex flex-col gap-2 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <label className="font-bold text-zinc-900 dark:text-white text-sm">{label}</label>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
                {[
                    { id: 'general', icon: 'fa-sliders', label: 'Genel & Görünüm' },
                    { id: 'notifications', icon: 'fa-bell', label: 'Bildirimler' },
                    { id: 'privacy', icon: 'fa-shield-halved', label: 'Gizlilik & Güvenlik' },
                    { id: 'accessibility', icon: 'fa-universal-access', label: 'Erişilebilirlik' },
                    { id: 'ai', icon: 'fa-wand-magic-sparkles', label: 'Yapay Zeka' },
                    { id: 'backup', icon: 'fa-database', label: 'Veri & Yedekleme' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                            ${activeTab === item.id 
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' 
                                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                        {item.label}
                    </button>
                ))}

                {/* AI Insight Box */}
                {aiSuggestion && (
                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                            <i className="fa-solid fa-robot"></i>
                            <span className="text-xs font-black uppercase tracking-wider">AI Önerisi</span>
                        </div>
                        <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                            {aiSuggestion}
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button className="text-[10px] font-bold bg-white dark:bg-zinc-900 text-indigo-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                Uygula
                            </button>
                            <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 px-2 py-1.5">
                                Yoksay
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                            {activeTab === 'general' && 'Genel Ayarlar'}
                            {activeTab === 'notifications' && 'Bildirim Tercihleri'}
                            {activeTab === 'privacy' && 'Gizlilik ve Veri Politikası'}
                            {activeTab === 'accessibility' && 'Erişilebilirlik'}
                            {activeTab === 'ai' && 'Yapay Zeka Konfigürasyonu'}
                            {activeTab === 'backup' && 'Yedekleme ve Kurtarma'}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Değişiklikler otomatik olarak versiyonlanır.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSettings(student.settings || DEFAULT_SETTINGS)}
                            className="px-4 py-2 text-zinc-500 hover:text-zinc-700 text-xs font-bold transition-colors"
                        >
                            Sıfırla
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2
                                ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'general' && (
                        <div className="space-y-2 max-w-2xl">
                            <Select 
                                label="Tema Modu" 
                                value={settings.theme.mode} 
                                options={[
                                    { value: 'light', label: 'Aydınlık Mod' },
                                    { value: 'dark', label: 'Karanlık Mod' },
                                    { value: 'system', label: 'Sistem Teması' }
                                ]}
                                onChange={(v) => updateSetting('theme', 'mode', v)} 
                            />
                            <Select 
                                label="Dil / Language" 
                                value={settings.language.current} 
                                options={[
                                    { value: 'tr', label: 'Türkçe' },
                                    { value: 'en', label: 'English' },
                                    { value: 'de', label: 'Deutsch' },
                                    { value: 'fr', label: 'Français' }
                                ]}
                                onChange={(v) => updateSetting('language', 'current', v)} 
                            />
                            <Select 
                                label="Yazı Boyutu" 
                                value={settings.theme.fontSize} 
                                options={[
                                    { value: 'small', label: 'Küçük (Kompakt)' },
                                    { value: 'medium', label: 'Orta (Varsayılan)' },
                                    { value: 'large', label: 'Büyük (Okunabilir)' }
                                ]}
                                onChange={(v) => updateSetting('theme', 'fontSize', v)} 
                            />
                            <Toggle 
                                label="Yorumları Otomatik Çevir" 
                                checked={settings.language.autoTranslateComments} 
                                onChange={(v) => updateSetting('language', 'autoTranslateComments', v)}
                                description="Yabancı dildeki veli veya öğretmen yorumlarını otomatik olarak sistem dilinize çevirir."
                            />
                            <Toggle 
                                label="Hareketi Azalt" 
                                checked={settings.theme.reduceMotion} 
                                onChange={(v) => updateSetting('theme', 'reduceMotion', v)}
                                description="Animasyonları ve geçiş efektlerini en aza indirir. Performansı artırabilir."
                            />
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-2 max-w-2xl">
                            <Toggle 
                                label="E-posta Bildirimleri" 
                                checked={settings.notifications.email} 
                                onChange={(v) => updateSetting('notifications', 'email', v)}
                            />
                            <Toggle 
                                label="Mobil Anlık Bildirimler (Push)" 
                                checked={settings.notifications.push} 
                                onChange={(v) => updateSetting('notifications', 'push', v)}
                            />
                            <Toggle 
                                label="SMS Bildirimleri" 
                                checked={settings.notifications.sms} 
                                onChange={(v) => updateSetting('notifications', 'sms', v)}
                                description="Kritik durumlar için SMS gönderimi. Ek ücret uygulanabilir."
                            />
                            <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">Otomatik Raporlar</h4>
                                <div className="space-y-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
                                    <Toggle 
                                        label="Günlük Özet" 
                                        checked={settings.notifications.dailyDigest} 
                                        onChange={(v) => updateSetting('notifications', 'dailyDigest', v)}
                                    />
                                    <Toggle 
                                        label="Haftalık Gelişim Raporu" 
                                        checked={settings.notifications.weeklyReport} 
                                        onChange={(v) => updateSetting('notifications', 'weeklyReport', v)}
                                    />
                                </div>
                            </div>
                            <div className="py-4">
                                <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-4">Uyarı Eşikleri</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
                                        <label className="text-xs font-bold text-zinc-500 block mb-2">Devamsızlık Alt Sınırı</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={settings.notifications.alertThresholds.attendance}
                                                onChange={(e) => updateNestedSetting('notifications', 'alertThresholds', 'attendance', parseInt(e.target.value))}
                                                className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold text-center"
                                            />
                                            <span className="text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
                                        <label className="text-xs font-bold text-zinc-500 block mb-2">Not Ortalaması Alt Sınırı</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={settings.notifications.alertThresholds.grade}
                                                onChange={(e) => updateNestedSetting('notifications', 'alertThresholds', 'grade', parseInt(e.target.value))}
                                                className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold text-center"
                                            />
                                            <span className="text-sm font-bold">Puan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-2 max-w-2xl">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-1">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    GDPR / KVKK Uyarısı
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    Bu bölümdeki ayarlar yasal yükümlülükler gerektirir. Değişiklik yapmadan önce okul veri politikasını inceleyiniz.
                                </p>
                            </div>

                            <Toggle 
                                label="AI ile Veri Paylaşımı" 
                                checked={settings.privacy.shareDataWithAI} 
                                onChange={(v) => updateSetting('privacy', 'shareDataWithAI', v)}
                                description="Öğrenci verilerinin (anonim olarak) yapay zeka modellerini eğitmek ve kişiselleştirilmiş öneriler sunmak için kullanılmasına izin ver."
                            />
                            <Toggle 
                                label="Veli Erişimine Açık" 
                                checked={settings.privacy.visibleToParents} 
                                onChange={(v) => updateSetting('privacy', 'visibleToParents', v)}
                                description="Bu öğrencinin profili ve raporları veli mobil uygulamasında görüntülenebilir."
                            />
                            <Toggle 
                                label="Raporlarda Anonimleştir" 
                                checked={settings.privacy.anonymizeInReports} 
                                onChange={(v) => updateSetting('privacy', 'anonymizeInReports', v)}
                                description="Genel sınıf veya okul raporlarında öğrenci ismini gizler."
                            />
                            <div className="py-4">
                                <label className="font-bold text-zinc-900 dark:text-white text-sm block mb-2">Veri Saklama Süresi (Gün)</label>
                                <input 
                                    type="range" 
                                    min="30" 
                                    max="1095" 
                                    step="30"
                                    value={settings.privacy.dataRetentionDays}
                                    onChange={(e) => updateSetting('privacy', 'dataRetentionDays', parseInt(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-1 font-medium">
                                    <span>30 Gün</span>
                                    <span className="text-indigo-600 font-bold">{settings.privacy.dataRetentionDays} Gün</span>
                                    <span>3 Yıl</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accessibility' && (
                        <div className="space-y-2 max-w-2xl">
                            <Toggle 
                                label="Ekran Okuyucu Optimizasyonu" 
                                checked={settings.accessibility.screenReaderOptimized} 
                                onChange={(v) => updateSetting('accessibility', 'screenReaderOptimized', v)}
                                description="Arayüz elementlerine ek ARIA etiketleri ekler ve navigasyon sırasını optimize eder."
                            />
                            <Toggle 
                                label="Yüksek Karşıtlık Modu" 
                                checked={settings.accessibility.highContrast} 
                                onChange={(v) => updateSetting('accessibility', 'highContrast', v)}
                                description="Renkleri WCAG AAA standartlarına uygun şekilde, maksimum görünürlük için ayarlar."
                            />
                            <Toggle 
                                label="Disleksi Dostu Yazı Tipi" 
                                checked={settings.accessibility.dyslexiaFriendlyFont} 
                                onChange={(v) => updateSetting('accessibility', 'dyslexiaFriendlyFont', v)}
                                description="Harf karışıklığını önlemek için özel olarak tasarlanmış OpenDyslexic fontunu kullanır."
                            />
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-2 max-w-2xl">
                             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
                                <h3 className="font-bold text-lg mb-2"><i className="fa-solid fa-brain mr-2"></i>Öğrenen Asistan</h3>
                                <p className="text-sm opacity-90 leading-relaxed">
                                    Sistem, öğrencinin performansını sürekli analiz ederek öğrenme yolunu dinamik olarak adapte eder. Bu özelliklerin kapatılması öneri kalitesini düşürebilir.
                                </p>
                             </div>

                            <Toggle 
                                label="Akıllı Öneriler" 
                                checked={settings.ai.enableSuggestions} 
                                onChange={(v) => updateSetting('ai', 'enableSuggestions', v)}
                                description="Arayüzde proaktif ipuçları ve aksiyon önerileri göster."
                            />
                            <Toggle 
                                label="Otomatik BEP Hedefi Oluşturma" 
                                checked={settings.ai.autoGenerateGoals} 
                                onChange={(v) => updateSetting('ai', 'autoGenerateGoals', v)}
                                description="Tanı raporlarına göre taslak hedefleri otomatik hazırla."
                            />
                            <Toggle 
                                label="Duygu Durum Analizi" 
                                checked={settings.ai.sentimentAnalysis} 
                                onChange={(v) => updateSetting('ai', 'sentimentAnalysis', v)}
                                description="Öğrenci günlükleri ve öğretmen notlarındaki duygu tonunu analiz et."
                            />
                             <Toggle 
                                label="Öğrenme Yolu Adaptasyonu" 
                                checked={settings.ai.learningPathAdaptation} 
                                onChange={(v) => updateSetting('ai', 'learningPathAdaptation', v)}
                                description="Zayıf olunan konular için müfredatı otomatik olarak önceliklendir."
                            />
                        </div>
                    )}

                    {activeTab === 'backup' && (
                         <div className="space-y-6 max-w-2xl">
                             <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                                    <i className="fa-solid fa-check-double text-2xl"></i>
                                </div>
                                <h3 className="font-bold text-zinc-900 dark:text-white">Sistem Güvende</h3>
                                <p className="text-sm text-zinc-500 mt-1 mb-6">
                                    Son yedekleme: {settings.backup.lastBackupDate || 'Bugün 09:41'}
                                </p>
                                <button className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                                    Şimdi Yedekle
                                </button>
                             </div>

                             <div className="space-y-2">
                                <Toggle 
                                    label="Otomatik Yedekleme" 
                                    checked={settings.backup.autoBackup} 
                                    onChange={(v) => updateSetting('backup', 'autoBackup', v)}
                                />
                                <Select 
                                    label="Yedekleme Sıklığı" 
                                    value={settings.backup.frequency} 
                                    options={[
                                        { value: 'daily', label: 'Her Gün' },
                                        { value: 'weekly', label: 'Her Hafta' },
                                        { value: 'monthly', label: 'Her Ay' }
                                    ]}
                                    onChange={(v) => updateSetting('backup', 'frequency', v)} 
                                />
                             </div>

                             <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <h4 className="font-bold text-rose-600 text-sm mb-4">Tehlikeli Bölge</h4>
                                <button className="w-full py-3 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-trash"></i>
                                    Tüm Öğrenci Verilerini Sil
                                </button>
                             </div>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
