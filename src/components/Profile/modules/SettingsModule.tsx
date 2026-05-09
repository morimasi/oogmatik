import React, { useState, ChangeEvent } from 'react';
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

type SettingsCategory = 'profile' | 'appearance' | 'pedagogy' | 'ai' | 'notifications' | 'security';

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
    if (user?.aiAssistantSettings) return user.aiAssistantSettings;
    return {
      tone: 'kurumsal',
      creativity: 75,
      autoSuggest: true,
      analysisDepth: 'detailed' as const,
      voiceAssistant: false,
      imageMode: 'cartoon' as const,
      scaffolding: 'balanced' as const
    };
  });

  // Pedagogy Settings
  const [pedagogySettings, setPedagogySettings] = useState(() => {
    if (user?.pedagogySettings) return user.pedagogySettings;
    return {
      curriculumSync: true,
      curriculumYear: '2024-2025',
      zpdStrategy: 'optimal' as const,
      terminologyMode: 'supportive' as const,
      bepIntegration: true,
      fontStandard: 'Lexend'
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
    { id: 'profile' as SettingsCategory, label: 'Kullanıcı Profili', icon: 'fa-user-astronaut', desc: 'Kimlik ve Kurumsal' },
    { id: 'appearance' as SettingsCategory, label: 'Tasarım & Tema', icon: 'fa-wand-magic-sparkles', desc: 'Ultra Premium UI' },
    { id: 'pedagogy' as SettingsCategory, label: 'Eğitim Vizyonu', icon: 'fa-microscope', desc: 'Strateji ve ZPD' },
    { id: 'ai' as SettingsCategory, label: 'AI Kontrol Merkezi', icon: 'fa-brain-circuit', desc: 'Motor & Zeka' },
    { id: 'notifications' as SettingsCategory, label: 'İletişim Hattı', icon: 'fa-satellite-dish', desc: 'Sistem Mesajları' },
    { id: 'security' as SettingsCategory, label: 'Varlık Güvenliği', icon: 'fa-vault', desc: 'Şifre & Gizlilik' },
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
        pedagogySettings,
        aiAssistantSettings: {
          ...aiSettings,
          imageMode: (aiSettings as any).imageMode || 'cartoon',
          scaffolding: (aiSettings as any).scaffolding || 'balanced'
        } as any
      });
      useToastStore.getState().success('Profil ve ayarlar başarıyla güncellendi.');
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(String(e), 'PROFILE_UPDATE_ERROR', 500);
      logError(err, { context: 'handleUpdateProfile' });
      useToastStore.getState().error('Güncelleme sırasında hata oluştu.');
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
          <>
          <>
             <div className="p-10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent rounded-[3.5rem] border border-white/20 shadow-2xl relative overflow-hidden group mb-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                   <div className="relative group cursor-pointer">
                      <div className="w-32 h-32 rounded-[2.8rem] bg-indigo-500 p-1 bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                         <img src={avatarUrl} className="w-full h-full rounded-[2.6rem] object-cover bg-white" alt="Avatar" />
                      </div>
                      <button 
                        onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                        className="absolute -bottom-2 -right-2 w-11 h-11 bg-white dark:bg-zinc-900 border-4 border-slate-50 dark:border-zinc-800 text-indigo-600 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                      >
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                      </button>
                   </div>
                   
                   <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{editName || 'İsimsiz Eğitmen'}</h3>
                        <span className="px-3 py-1 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-indigo-500/40">Premium Pro</span>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                         <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm transition-colors hover:bg-white/80">
                            <i className="fa-solid fa-user-graduate text-indigo-500 text-xs"></i>
                            <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">{editProfession || 'Uzmanlık Belirtilmedi'}</span>
                         </div>
                         <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm transition-colors hover:bg-white/80">
                            <i className="fa-solid fa-building-columns text-emerald-500 text-xs"></i>
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{editInstitution || 'Kurum Atanmadı'}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

            <div className="w-full space-y-6">
                {showAvatarUrlInput && (
                  <div className="animate-in slide-in-from-top-2 duration-300 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
                    <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-1">Özel Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-4 bg-white dark:bg-black/30 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold shadow-inner"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Gerçek Adınız</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                        <i className="fa-solid fa-signature text-xs"></i>
                      </div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Uzmanlık & Branş</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                        <i className="fa-solid fa-graduation-cap text-xs"></i>
                      </div>
                      <input
                        type="text"
                        value={editProfession}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditProfession(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Çalıştığınız Kurum</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-school text-xs"></i>
                  </div>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditInstitution(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">İletişim Numarası</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[var(--accent-color)] transition-colors">
                    <i className="fa-solid fa-mobile-screen-button text-xs"></i>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 font-bold transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Eğitmen Özeti / Biyografi</label>
              <textarea
                value={editBio}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditBio(e.target.value)}
                rows={4}
                placeholder="Pedagoji yaklaşımınızdan veya deneyimlerinizden bahsedin..."
                className="w-full px-6 py-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold resize-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleUpdateProfile}
                disabled={isSavingProfile}
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-600/30 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                <div className="relative flex items-center gap-3">
                   {isSavingProfile ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt-lightning"></i>}
                   <span>Profil Değişikliklerini Uygula</span>
                </div>
              </button>
            </div>
          </>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2 ml-1">
                <i className="fa-solid fa-palette text-indigo-500"></i>
                Görsel Tema Stili
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { name: 'Antrasit Pro', id: 'anthracite', color: 'bg-[#1a1a1a]' },
                   { name: 'Okyanus', id: 'ocean', color: 'bg-blue-600' },
                   { name: 'Işık Kaplı', id: 'light', color: 'bg-white border' },
                   { name: 'Uzay Gezgini', id: 'space', color: 'bg-slate-900' }
                 ].map(t => (
                   <button 
                    key={t.id}
                    onClick={() => onUpdateTheme && onUpdateTheme(t.id as AppTheme)}
                    className={`p-4 rounded-3xl border-2 transition-all group ${theme === t.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent bg-[var(--bg-secondary)] hover:border-indigo-200'}`}
                   >
                      <div className={`w-full h-12 ${t.color} rounded-2xl mb-3 shadow-md group-hover:scale-105 transition-transform`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.name}</span>
                   </button>
                 ))}
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                <i className="fa-solid fa-compress text-indigo-500"></i>
                Arayüz Yerleşimi (Density)
              </label>
              <div className="flex gap-4">
                {['comfortable', 'compact'].map((density) => (
                  <button
                    key={density}
                    onClick={() => setCustomUi((prev: any) => ({ ...prev, density }))}
                    className={`flex-1 p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                      customUi.density === density
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                        : 'border-transparent bg-[var(--bg-paper)] text-[var(--text-muted)] hover:border-indigo-200'
                    }`}
                  >
                    <i className={`fa-solid ${density === 'comfortable' ? 'fa-square' : 'fa-list-ul'} text-xl`}></i>
                    <span className="text-xs font-black uppercase tracking-widest">{density === 'comfortable' ? 'Ferah Mod' : 'Kompakt Mod'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
                  <div className="space-y-10 animate-in fade-in duration-500">
             <div className="p-8 bg-gradient-to-br from-indigo-600/10 to-transparent rounded-[3rem] border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start gap-3">
                       <i className="fa-solid fa-wand-magic-sparkles animate-bounce"></i>
                       Omnikron AI Pro
                    </h3>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hiper-Parametrik Üretim Motoru</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/50">
                      Gemini 1.5 Flash
                    </div>
                    <div className="px-5 py-2 bg-white dark:bg-zinc-800 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900 shadow-sm">
                      v2.8 Master
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="p-5 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm transition-all hover:translate-y-[-2px]">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 opacity-60">Avg Latency</p>
                    <p className="text-2xl font-black text-indigo-600">0.72s</p>
                  </div>
                  <div className="p-5 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm transition-all hover:translate-y-[-2px]">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 opacity-60">Success Rate</p>
                    <p className="text-2xl font-black text-emerald-500">99.8%</p>
                  </div>
                  <div className="p-5 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm transition-all hover:translate-y-[-2px]">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 opacity-60">Context Win</p>
                    <p className="text-2xl font-black text-indigo-600">1.2M</p>
                  </div>
                   <div className="p-5 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm transition-all hover:translate-y-[-2px]">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 opacity-60">Reputation</p>
                    <p className="text-2xl font-black text-purple-600">Legend</p>
                  </div>
                </div>
             </div>
             </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">AI Konuşma Tonu</label>
                <div className="grid grid-cols-2 gap-2">
                  {['kurumsal', 'öğretmen', 'bilimsel', 'dostane'].map(t => (
                    <button
                      key={t}
                      onClick={() => setAiSettings((prev: any) => ({ ...prev, tone: t }))}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        aiSettings.tone === t 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Görsel Üretim Modu</label>
                <select
                  value={(aiSettings as any).imageMode || 'cartoon'}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setAiSettings((prev: any) => ({ ...prev, imageMode: e.target.value }))}
                  className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                >
                  <option value="cartoon">Pedagojik İllüstrasyon (Yumuşak)</option>
                  <option value="realistic">Gerçekçi Fotoğraf (Vivid)</option>
                  <option value="schematic">Şematik & Teknik Çizim</option>
                  <option value="lineart">Boyama Sayfası (Line Art)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-6 p-6 bg-[var(--bg-secondary)]/50 rounded-3xl border border-[var(--border-color)]">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pedagojik İskele (Scaffolding) Seviyesi</label>
                    <span className="text-xs font-black text-indigo-600">Optimize Edildi</span>
                  </div>
                  <div className="flex gap-2">
                    {['low', 'balanced', 'high', 'max'].map(l => (
                      <button 
                        key={l}
                        onClick={() => setAiSettings((prev: any) => ({ ...prev, scaffolding: l }))}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                          (aiSettings as any).scaffolding === l ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {l === 'low' ? 'Düşük' : l === 'balanced' ? 'Dengeli' : l === 'high' ? 'Yüksek' : 'Maksimum'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Yaratıcılık Matrisi</label>
                    <span className="text-xs font-black text-indigo-600">%{aiSettings.creativity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={aiSettings.creativity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAiSettings((prev: any) => ({ ...prev, creativity: Number(e.target.value) }))}
                    className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[8px] font-black text-zinc-400 uppercase">Muhafazakar</span>
                    <span className="text-[8px] font-black text-zinc-400 uppercase">Dengeli</span>
                    <span className="text-[8px] font-black text-zinc-400 uppercase">Kaotik Yaratıcı</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                 { id: 'autoSuggest', label: 'Akıllı Öneriler', icon: 'fa-lightbulb' },
                 { id: 'voiceAssistant', label: 'Sesli Asistan', icon: 'fa-microphone' },
                 { id: 'ocrModule', label: 'Gelişmiş OCR', icon: 'fa-file-export' }
               ].map(item => (
                 <div
                   key={item.id}
                   onClick={() => setAiSettings((prev: any) => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                   className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex items-center justify-between hover:border-indigo-500/30 transition-all cursor-pointer group"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                       <i className={`fa-solid ${item.icon} text-xs`}></i>
                     </div>
                     <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight">{item.label}</span>
                   </div>
                   <div className={`w-8 h-4 rounded-full relative transition-all ${(aiSettings as any)[item.id] ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                      <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-0.75 transition-all ${(aiSettings as any)[item.id] ? 'right-1' : 'left-1'}`}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'pedagogy':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Müfredat Senkronizasyonu</label>
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
                         <div>
                            <p className="text-xs font-black text-[var(--text-primary)]">MEB 2024-2025 Uyumu</p>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Otomatik kazanım eşleme aktif</p>
                         </div>
                         <div 
                           onClick={() => setPedagogySettings((prev: any) => ({ ...prev, curriculumSync: !prev.curriculumSync }))}
                           className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${pedagogySettings.curriculumSync ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                          >
                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all shadow-sm ${pedagogySettings.curriculumSync ? 'right-1' : 'left-1'}`}></div>
                         </div>
                      </div>
                      <select 
                        value={pedagogySettings.curriculumYear}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setPedagogySettings((prev: any) => ({ ...prev, curriculumYear: e.target.value }))}
                        className="w-full p-4 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl font-bold text-sm outline-none"
                      >
                        <option>2024-2025 (Yeni Müfredat)</option>
                        <option>2023-2024 (Eski Müfredat)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Vygotsky ZPD Stratejisi</label>
                    <div className="grid grid-cols-1 gap-2">
                       {[
                         { id: 'optimal', label: 'Optimal Gelişim', desc: 'Öğrenciyi %15 zorlayarak ilerletir' },
                         { id: 'scaffold', label: 'Yoğun İskele', desc: 'Maksimum yardım ile hata oranını düşürür' },
                         { id: 'autonomy', label: 'Özerklik Odaklı', desc: 'İpuçlarını azaltarak bağımsız çalışmayı teşvik eder' }
                       ].map(s => (
                         <div 
                           key={s.id}
                           onClick={() => setPedagogySettings((prev: any) => ({ ...prev, zpdStrategy: s.id }))}
                           className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                             pedagogySettings.zpdStrategy === s.id 
                             ? 'bg-amber-500/5 border-amber-500/30' 
                             : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                           }`}
                         >
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-[var(--text-primary)]">{s.label}</span>
                              {pedagogySettings.zpdStrategy === s.id && <i className="fa-solid fa-circle-check text-amber-500"></i>}
                           </div>
                           <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">{s.desc}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Klinik Dil Politikası</label>
                    <div className="p-6 bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] shadow-inner">
                       <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed italic mb-4">
                         "MEB yönetmeliği gereği öğrenciler için 'tanılayıcı' dil yerine 'destekleyici/pedagojik' dil kullanımı önerilir."
                       </p>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setPedagogySettings((prev: any) => ({ ...prev, terminologyMode: 'supportive' }))}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              pedagogySettings.terminologyMode === 'supportive' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                             Destekleyici
                          </button>
                          <button 
                            onClick={() => setPedagogySettings((prev: any) => ({ ...prev, terminologyMode: 'clinical' }))}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              pedagogySettings.terminologyMode === 'clinical' ? 'bg-rose-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                             Klinik
                          </button>
                       </div>
                    </div>
                   </div>

                   <div className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl border border-amber-500/10">
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-shield-cat"></i>
                        Disleksi Erişilebilirlik Kilidi
                      </h4>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[var(--text-primary)]">Lexend Font Zorunluluğu</span>
                            <div className="w-8 h-4 bg-amber-500 rounded-full relative">
                               <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-0.75 right-1"></div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[var(--text-primary)]">Satır Aralığı Optimizasyonu</span>
                            <div className="w-8 h-4 bg-amber-500 rounded-full relative">
                               <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-0.75 right-1"></div>
                            </div>
                         </div>
                      </div>
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordForm((prev: any) => ({ ...prev, next: e.target.value }))}
                        className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Şifre Tekrar</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordForm((prev: any) => ({ ...prev, confirm: e.target.value }))}
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDeleteConfirmText(e.target.value)}
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)] rounded-[2rem] shadow-sm border border-[var(--border-color)]">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`min-w-[120px] flex-1 text-left px-4 py-3 rounded-2xl text-xs font-black transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-white text-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/10 border border-[var(--accent-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]'
            }`}
          >
            <i className={`${category.icon} mr-2`}></i>
            {category.label}
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {renderCategoryContent()}
      </div>
    </div>
  );
};