import React, { useState } from 'react';
import { ProfileData } from '../../types/profile';
import { User, AppTheme, UiSettings } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { authService } from '../../services/authService';
import { AppError } from '../../utils/AppError';
import { logError } from '../../utils/errorHandler';

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Uzmanlık Alanı
                </label>
                <input
                  type="text"
                  value={editProfession}
                  onChange={(e) => setEditProfession(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Kurum
                </label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Bio
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {isSavingProfile ? 'Kaydediliyor...' : 'Kaydet'}
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Model
              </label>
              <select
                value={aiSettings.model}
                onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Yaratıcılık: {aiSettings.creativity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={aiSettings.creativity}
                onChange={(e) => setAiSettings(prev => ({ ...prev, creativity: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              {[
                { key: 'autoSuggest', label: 'Otomatik öneriler' },
                { key: 'voiceAssistant', label: 'Sesli asistan' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={aiSettings[key as keyof typeof aiSettings] as boolean}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-[var(--text-primary)]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={emailNotificationsEnabled}
                  onChange={handleToggleNotifications}
                  className="rounded"
                />
                <span className="text-[var(--text-primary)] font-medium">E-posta bildirimleri</span>
              </label>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Haftalık özetler ve önemli güncellemeler
              </p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Şifre Değiştir</h3>
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Şifre Değiştir
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, next: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSavingPassword}
                      className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg"
                    >
                      {isSavingPassword ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="text-lg font-bold text-red-600 mb-4">Hesabı Sil</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
              </p>
              {deleteConfirmStep === 0 && (
                <button
                  onClick={() => setDeleteConfirmStep(1)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Hesabı Sil
                </button>
              )}
              {deleteConfirmStep === 1 && (
                <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 font-medium">
                    Lütfen "HESABIMI SİL" yazarak onaylayın:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg"
                    placeholder="HESABIMI SİL"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount || deleteConfirmText !== 'HESABIMI SİL'}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {isDeletingAccount ? 'Siliniyor...' : 'Onayla ve Sil'}
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmStep(0);
                        setDeleteConfirmText('');
                      }}
                      className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg"
                    >
                      İptal
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