import React, { useState } from 'react';
import { ProfileData } from '../../../types/profile';
import { User, AppTheme, UiSettings } from '../../../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { authService } from '../../../services/authService';
import { AppError } from '../../../utils/AppError';
import { logError } from '../../../utils/errorHandler';

interface SettingsModuleProps {
  data: ProfileData;
  theme?: AppTheme;
  uiSettings?: UiSettings;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateUiSettings?: (settings: UiSettings) => void;
  onOpenSettingsModal?: () => void;
}

type SettingsCategory = 'profile' | 'appearance' | 'ai' | 'notifications' | 'security';

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  data,
  theme,
  uiSettings,
  onUpdateTheme,
  onUpdateUiSettings,
  onOpenSettingsModal,
}) => {
  const { user, updateUser, logout } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');

  // Profile state
  const [editName, setEditName] = useState(user?.name || '');
  const [editProfession, setEditProfession] = useState(user?.profession || '');
  const [editInstitution, setEditInstitution] = useState(user?.institution || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);

  // AI Settings
  const [aiSettings, setAiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('oogmatik-ai-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          model: 'gemini-2.5-flash',
          creativity: parsed.creativity || 75,
          autoSuggest: parsed.autoSuggest ?? true,
          analysisDepth: parsed.analysisDepth || 'detailed',
          voiceAssistant: parsed.voiceAssistant ?? false,
          dataPrivacy: parsed.dataPrivacy || 'balanced',
          tone: parsed.tone || 'kurumsal',
        };
      }
    } catch {
      // localStorage error
    }
    return {
      model: 'gemini-2.5-flash',
      creativity: 75,
      autoSuggest: true,
      analysisDepth: 'detailed',
      voiceAssistant: false,
      dataPrivacy: 'balanced',
      tone: 'kurumsal',
    };
  });

  // UI Settings
  const [customUi, setCustomUi] = useState({
    density: uiSettings?.compactMode ? 'compact' : 'comfortable',
    radius: 'xl',
    sidebarPosition: 'left',
    accent: 'indigo',
  });

  const [darkModeEnabled, setDarkModeEnabled] = useState(
    theme === 'dark' || theme === 'anthracite' || theme === 'space'
  );

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('emailNotifications') || 'true');
    } catch {
      return true;
    }
  });

  // Security state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ next: '', confirm: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const categories = [
    { id: 'profile' as SettingsCategory, label: 'Profil', icon: 'fa-user-pen', desc: 'Kişisel bilgiler' },
    { id: 'appearance' as SettingsCategory, label: 'Arayüz', icon: 'fa-sliders', desc: 'Görsel ayarlar' },
    { id: 'ai' as SettingsCategory, label: 'AI Asistan', icon: 'fa-brain', desc: 'AI davranışları' },
    { id: 'notifications' as SettingsCategory, label: 'Bildirimler', icon: 'fa-bell', desc: 'Uyarı ayarları' },
    { id: 'security' as SettingsCategory, label: 'Güvenlik', icon: 'fa-shield-halved', desc: 'Hesap güvenliği' },
  ];

  const handleUpdateProfile = async () => {
    if (!user || data.isReadOnly) return;
    setIsSavingProfile(true);
    try {
      await updateUser({
        name: editName,
        profession: editProfession,
        institution: editInstitution,
        phone: editPhone,
        bio: editBio,
        avatar: avatarUrl,
      });
      useToastStore.getState().success('Profil başarıyla güncellendi.');
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(String(e), 'PROFILE_UPDATE_ERROR', 500);
      logError(err, { context: 'handleUpdateProfile' });
      useToastStore.getState().error('Profil güncellenirken hata oluştu.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.next.length < 8) {
      useToastStore.getState().error('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      useToastStore.getState().error('Şifreler eşleşmiyor.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await authService.updatePassword(passwordForm.next);
      useToastStore.getState().success('Şifreniz başarıyla güncellendi.');
      setShowPasswordForm(false);
      setPasswordForm({ next: '', confirm: '' });
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(String(e), 'PASSWORD_UPDATE_ERROR', 500);
      logError(err, { context: 'handlePasswordChange' });
      useToastStore.getState().error('Şifre güncellenirken hata oluştu.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'HESABIMI SİL') return;
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      await authService.deleteUser(user.id);
      await logout();
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(String(e), 'DELETE_ACCOUNT_ERROR', 500);
      logError(err, { context: 'handleDeleteAccount' });
      useToastStore.getState().error('Hesap silinirken hata oluştu.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleToggleDarkMode = () => {
    const newTheme = darkModeEnabled ? 'light' : 'anthracite';
    setDarkModeEnabled(!darkModeEnabled);
    if (onUpdateTheme) {
      onUpdateTheme(newTheme);
    }
  };

  const handleToggleNotifications = () => {
    const newValue = !emailNotificationsEnabled;
    setEmailNotificationsEnabled(newValue);
    localStorage.setItem('emailNotifications', JSON.stringify(newValue));
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] p-1 bg-gradient-to-tr from-[var(--accent-color)] to-purple-500 shadow-xl overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt={editName}
                    className="w-full h-full rounded-[2.2rem] object-cover bg-[var(--bg-secondary)]"
                  />
                </div>
                <button 
                  onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--bg-paper)] text-[var(--accent-color)] rounded-xl border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                  <i className="fa-solid fa-camera-rotate"></i>
                </button>
              </div>
              <div className="flex-1 w-full space-y-6">
                {showAvatarUrlInput && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 text-sm font-bold"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Ad Soyad</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Uzmanlık / Meslek</label>
                    <input
                      type="text"
                      value={editProfession}
                      onChange={(e) => setEditProfession(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Kurum / Okul</label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Telefon</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Hakkımda / Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 font-bold resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="px-8 py-4 bg-[var(--accent-color)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--accent-muted)] disabled:opacity-50"
              >
                {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-check-double mr-2"></i>}
                Profil Bilgilerini Güncelle
              </button>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={darkModeEnabled}
                  onChange={handleToggleDarkMode}
                  className="rounded"
                />
                <span className="text-[var(--text-primary)] font-medium">Koyu Tema</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Yoğunluk
              </label>
              <div className="flex gap-3">
                {['comfortable', 'compact'].map((density) => (
                  <button
                    key={density}
                    onClick={() => setCustomUi(prev => ({ ...prev, density }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      customUi.density === density
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {density === 'comfortable' ? 'Rahat' : 'Kompakt'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Motor Modeli</label>
                <div className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-[var(--text-muted)] cursor-not-allowed flex items-center gap-3">
                  <i className="fa-solid fa-lock text-xs opacity-50"></i>
                  <span>Gemini 2.5 Flash</span>
                  <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-[var(--accent-muted)] text-[var(--accent-color)] px-2 py-1 rounded-lg border border-[var(--accent-color)]/20">SABİT</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">AI Konuşma Tonu</label>
                <select
                  value={aiSettings.tone}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 focus:border-[var(--accent-color)] transition-all"
                >
                  <option value="kurumsal">Kurumsal & Profesyonel</option>
                  <option value="öğretmen">Pedagojik (Öğretmen Tonu)</option>
                  <option value="bilimsel">Akademik & Bilimsel</option>
                  <option value="dostane">Sıcak & Dostane</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Yaratıcılık & Esneklik</label>
                  <span className="text-xs font-black text-[var(--accent-color)]">%{aiSettings.creativity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiSettings.creativity}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, creativity: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Analiz Derinliği</label>
                <select
                  value={aiSettings.analysisDepth}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, analysisDepth: e.target.value }))}
                  className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all"
                >
                  <option value="detailed">Maksimum Detay</option>
                  <option value="summary">Özet Analiz</option>
                  <option value="bullet">Maddeleştirilmiş</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Veri Gizlilik Profili</label>
                <select
                  value={aiSettings.dataPrivacy}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, dataPrivacy: e.target.value }))}
                  className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 transition-all"
                >
                  <option value="balanced">Dengeli Kararlılık</option>
                  <option value="strict">Yüksek Güvenlik</option>
                  <option value="collab">Gelişmiş İşbirliği</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setAiSettings(prev => ({ ...prev, autoSuggest: !prev.autoSuggest }))}
                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)]/40 transition-all"
              >
                <div>
                  <p className="font-black text-[var(--text-primary)] text-xs">Akıllı Öneriler</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Otomatik aktivite önerisi</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${aiSettings.autoSuggest ? 'bg-[var(--accent-color)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-300 ${aiSettings.autoSuggest ? 'left-5.5' : 'left-1'}`}></div>
                </div>
              </div>
              <div 
                onClick={() => setAiSettings(prev => ({ ...prev, voiceAssistant: !prev.voiceAssistant }))}
                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)]/40 transition-all"
              >
                <div>
                  <p className="font-black text-[var(--text-primary)] text-xs">Sesli Asistan</p>
                  <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Metinleri sesli oku</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${aiSettings.voiceAssistant ? 'bg-[var(--accent-color)]' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-300 ${aiSettings.voiceAssistant ? 'left-5.5' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div 
              onClick={handleToggleNotifications}
              className="flex items-center justify-between p-8 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] cursor-pointer hover:border-emerald-400 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl transition-all ${emailNotificationsEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-zinc-800 text-zinc-300 group-hover:text-emerald-500'}`}>
                  <i className="fa-solid fa-envelope-open-text"></i>
                </div>
                <div>
                  <p className="font-black text-[var(--text-primary)] text-lg mb-1">E-Posta Özetleri</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Haftalık öğrenci gelişim raporu ve güncellemeler</p>
                </div>
              </div>
              <div className={`w-16 h-8 rounded-full relative transition-all duration-300 ${emailNotificationsEnabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${emailNotificationsEnabled ? 'left-9' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-3xl border border-[var(--border-color)]">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-3">
                <i className="fa-solid fa-key text-[var(--accent-color)]"></i>
                Şifre Güvenliği
              </h3>
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-3 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-xl font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all shadow-sm"
                >
                  Yeni Şifre Oluştur
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Yeni Şifre</label>
                      <input
                        type="password"
                        value={passwordForm.next}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, next: e.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Şifre Tekrar</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSavingPassword}
                      className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--accent-muted)]"
                    >
                      {isSavingPassword ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Şifreyi Güncelle'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30">
              <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-3" id="danger-zone">
                <i className="fa-solid fa-triangle-exclamation"></i>
                Risk Alanı
              </h3>
              <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-wider mb-6">
                Hesabınızı sildiğinizde tüm verileriniz (Öğrenciler, Raporlar, Materyaller) kalıcı olarak yok edilir.
              </p>
              
              {deleteConfirmStep === 0 && (
                <button
                  onClick={() => setDeleteConfirmStep(1)}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Hesabımı Sonlandır
                </button>
              )}
              
              {deleteConfirmStep === 1 && (
                <div className="space-y-4 animate-in shake duration-500">
                  <p className="text-[10px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest">
                    Devam etmek için "HESABIMI SİL" yazın:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-black/50 border-2 border-rose-200 dark:border-rose-900 rounded-xl focus:ring-4 focus:ring-rose-500/20 outline-none text-rose-600 font-black text-center"
                    placeholder="HESABIMI SİL"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setDeleteConfirmStep(0); setDeleteConfirmText(''); }}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-800"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount || deleteConfirmText !== 'HESABIMI SİL'}
                      className="px-8 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 shadow-xl"
                    >
                      {isDeletingAccount ? 'SİLİNİYOR...' : 'HESABI KALICI OLARAK TEMİZLE'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-2xl">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-white text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <i className={`${category.icon} mr-2`}></i>
            {category.label}
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] p-6">
        {renderCategoryContent()}
      </div>
    </div>
  );
};