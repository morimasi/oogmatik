import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import {
  SavedAssessment,
  SavedWorksheet,
  ActivityType,
  User,
  Curriculum,
  Student,
  UiSettings,
  AppTheme,
} from '../types';
import { assessmentService } from '../services/assessmentService';
import { worksheetService } from '../services/worksheetService';
import { curriculumService } from '../services/curriculumService';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { LineChart } from './LineChart';
import { RadarChart } from './RadarChart';
import { printService } from '../utils/printService';
import { ACTIVITIES } from '../constants';
import { StudentDashboard } from './Student/StudentDashboard';
import { AdvancedStudentManager } from './Student/AdvancedStudentManager';

interface ProfileViewProps {
  onBack: () => void;
  onSelectActivity: (id: ActivityType | null) => void;
  onLoadSaved: (ws: SavedWorksheet) => void;
  targetUser?: User;
  theme?: AppTheme;
  uiSettings?: UiSettings;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateUiSettings?: (settings: UiSettings) => void;
  onOpenSettingsModal?: () => void;
}

// --- BENTO COMPONENTS ---

const BentoCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  iconColor?: string;
  action?: React.ReactNode;
}> = ({
  children,
  className = '',
  title,
  icon,
  iconColor = 'bg-zinc-100 text-zinc-500',
  action,
}) => (
  <div
    className={`bg-white dark:bg-zinc-800 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group ${className}`}
  >
    {(title || icon || action) && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110 duration-300 ${iconColor}`}
            >
              <i className={icon}></i>
            </div>
          )}
          {title && (
            <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
              {title}
            </h3>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

const StatValue: React.FC<{
  value: string | number;
  label?: string;
  subValue?: string;
  trend?: 'up' | 'down';
}> = ({ value, label, subValue, trend }) => (
  <div className="flex flex-col">
    <div className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
      {value}
    </div>
    {label && (
      <div className="text-sm text-zinc-500 font-bold uppercase tracking-wide">{label}</div>
    )}
    {subValue && (
      <div
        className={`text-[10px] font-black px-2 py-1 rounded-full inline-flex items-center gap-1 mt-3 w-fit ${
          trend === 'up'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700'
        }`}
      >
        {trend === 'up' && <i className="fa-solid fa-arrow-trend-up"></i>}
        {subValue}
      </div>
    )}
  </div>
);

const TabPill: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({
  active,
  onClick,
  label,
  icon,
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-3.5 rounded-2xl text-xs font-black flex items-center gap-3 transition-all duration-300 uppercase tracking-widest border-2 ${
      active
        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-2xl scale-105 z-10'
        : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border-transparent hover:border-zinc-100 dark:hover:border-zinc-700'
    }`}
  >
    <i className={`${icon} ${active ? 'animate-bounce' : ''}`}></i>
    <span>{label}</span>
  </button>
);

const ActionButton: React.FC<{
  label: string;
  icon: string;
  onClick: () => void;
  color?: string;
}> = ({ label, icon, onClick, color = 'bg-indigo-600 text-white' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 ${color}`}
  >
    <i className={icon}></i>
    {label}
  </button>
);

type ProfileTab = 'overview' | 'students' | 'evaluations' | 'plans' | 'reports' | 'settings';

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBack,
  onSelectActivity,
  onLoadSaved,
  targetUser,
  theme: externalTheme,
  uiSettings: externalUiSettings,
  onUpdateTheme,
  onUpdateUiSettings,
  onOpenSettingsModal,
}) => {
  const { user: authUser, updateUser, logout } = useAuthStore();
  const { students, activeStudent } = useStudentStore();

  const user = targetUser || authUser;
  const isReadOnly = !!targetUser && targetUser.id !== authUser?.id;

  // Use external settings or default values
  const currentTheme = externalTheme || 'anthracite';
  const currentUiSettings = externalUiSettings || {
    fontFamily: 'OpenDyslexic',
    fontSizeScale: 1,
    letterSpacing: 'normal' as const,
    lineHeight: 1.6,
    saturation: 100,
  };

  const isDarkTheme =
    currentTheme === 'dark' ||
    currentTheme === 'anthracite' ||
    currentTheme === 'space' ||
    currentTheme.includes('anthracite') ||
    currentTheme.includes('cyber');

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const [assessments, setAssessments] = useState<SavedAssessment[]>([]);
  const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);

  const [editName, setEditName] = useState(user?.name || '');
  const [editProfession, setEditProfession] = useState(user?.profession || '');
  const [editInstitution, setEditInstitution] = useState(user?.institution || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settingsCategory, setSettingsCategory] = useState<
    'profile' | 'appearance' | 'ai' | 'notifications' | 'security'
  >('profile');

  const [aiSettings, setAiSettings] = useState({
    model: 'gemini-2.5-pro',
    creativity: 75,
    autoSuggest: true,
    analysisDepth: 'detailed',
    voiceAssistant: false,
    dataPrivacy: 'balanced',
    tone: 'kurumsal',
  });

  const [customUi, setCustomUi] = useState(() => ({
    density: externalUiSettings?.compactMode ? 'compact' : 'comfortable',
    radius: 'xl',
    sidebarPosition: 'left',
    accent: 'indigo',
  }));

  const [darkModeEnabled, setDarkModeEnabled] = useState(isDarkTheme);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('emailNotifications') || 'true');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    setDarkModeEnabled(isDarkTheme);
  }, [isDarkTheme]);

  const handleToggleDarkMode = () => {
    const newTheme = darkModeEnabled ? 'light' : 'anthracite';
    setDarkModeEnabled(!darkModeEnabled);
    if (onUpdateTheme) {
      onUpdateTheme(newTheme);
    } else {
      document.documentElement.classList.remove(
        'theme-light',
        'theme-dark',
        'theme-anthracite',
        'theme-space',
        'theme-nature',
        'theme-ocean',
        'theme-anthracite-gold',
        'theme-anthracite-cyber'
      );
      document.documentElement.classList.add(`theme-${newTheme}`);
      localStorage.setItem('app-theme', newTheme);
    }
  };

  const handleToggleNotifications = () => {
    const newValue = !emailNotificationsEnabled;
    setEmailNotificationsEnabled(newValue);
    localStorage.setItem('emailNotifications', JSON.stringify(newValue));
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditProfession(user.profession || '');
      setEditInstitution(user.institution || '');
      setEditPhone(user.phone || '');
      setEditBio(user.bio || '');
      setAvatarUrl(user.avatar || '');
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [asData, wsResult, plData] = await Promise.all([
        assessmentService.getUserAssessments(user.id),
        worksheetService.getUserWorksheets(user.id, 0, 1000),
        curriculumService.getUserCurriculums(user.id),
      ]);
      setAssessments(asData);
      setWorksheets(wsResult.items);
      setCurriculums(plData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || isReadOnly) return;
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
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Güncelleme hatası oluştu.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const performanceTrends = useMemo(() => {
    if (assessments.length < 2) return null;
    return assessments
      .slice(0, 5)
      .reverse()
      .map((a: SavedAssessment) => ({
        date: a.createdAt,
        puan: a.report.scores.attention || 0,
      }));
  }, [assessments]);

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: 'fa-user-pen',
      desc: 'Kişisel bilgiler ve uzmanlık alanı',
    },
    {
      id: 'appearance',
      label: 'Arayüz',
      icon: 'fa-sliders',
      desc: 'Görsel yoğunluk ve tema kontrolü',
    },
    { id: 'ai', label: 'AI Asistan', icon: 'fa-brain', desc: 'Analiz modu ve akıllı öneriler' },
    {
      id: 'notifications',
      label: 'Bildirimler',
      icon: 'fa-bell',
      desc: 'Özetler ve kritik uyarılar',
    },
    {
      id: 'security',
      label: 'Güvenlik',
      icon: 'fa-shield-halved',
      desc: 'Erişim ve hesap güvenliği',
    },
  ];

  const modulePadding =
    externalUiSettings?.compactMode || customUi.density === 'compact'
      ? 'p-4 md:p-6'
      : 'p-8 md:p-12';
  const settingsSpacing = customUi.density === 'compact' ? 'space-y-4' : 'space-y-8';
  const radiusClass =
    customUi.radius === 'lg'
      ? 'rounded-[1.5rem]'
      : customUi.radius === 'xl'
        ? 'rounded-[2rem]'
        : 'rounded-[2.5rem]';
  const accentSoft =
    customUi.accent === 'emerald'
      ? 'bg-emerald-50 text-emerald-600'
      : customUi.accent === 'cyan'
        ? 'bg-cyan-50 text-cyan-600'
        : 'bg-indigo-50 text-indigo-600';
  const accentRing =
    customUi.accent === 'emerald'
      ? 'ring-emerald-500'
      : customUi.accent === 'cyan'
        ? 'ring-cyan-500'
        : 'ring-indigo-500';

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-[#09090b] h-full flex flex-col font-['Lexend'] overflow-hidden">
      {/* 1. PROFESSIONAL HEADER */}
      <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl overflow-hidden transform group-hover:rotate-6 transition-transform duration-500">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-[2.8rem] object-cover bg-white dark:bg-zinc-800"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-900">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                {user.name}
              </h1>
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 w-fit mx-auto md:mx-0">
                {user.role === 'admin' ? 'SİSTEM YÖNETİCİSİ' : 'UZMAN EĞİTMEN'}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                <i className="fa-solid fa-envelope opacity-40"></i> {user.email}
              </div>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden md:block"></div>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                <i className="fa-solid fa-calendar-check opacity-40"></i>{' '}
                {new Date(user.createdAt).toLocaleDateString('tr-TR')} tarihinde katıldı
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onBack}
              className="w-full md:w-auto px-8 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all"
            >
              Geri Dön
            </button>
            {!isReadOnly && (
              <button
                onClick={logout}
                className="w-full md:w-auto px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border border-red-100 dark:border-red-900/30"
              >
                Oturumu Kapat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-8">
        <div className="max-w-7xl mx-auto flex gap-2 py-4 overflow-x-auto custom-scrollbar no-scrollbar">
          <TabPill
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Özet"
            icon="fa-solid fa-chart-pie"
          />
          <TabPill
            active={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
            label="Öğrenciler"
            icon="fa-solid fa-user-graduate"
          />
          <TabPill
            active={activeTab === 'evaluations'}
            onClick={() => setActiveTab('evaluations')}
            label="Değerlendirme"
            icon="fa-solid fa-clipboard-check"
          />
          <TabPill
            active={activeTab === 'plans'}
            onClick={() => setActiveTab('plans')}
            label="Eğitim Planları"
            icon="fa-solid fa-graduation-cap"
          />
          <TabPill
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            label="Raporlar"
            icon="fa-solid fa-file-medical"
          />
          <TabPill
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="Ayarlar"
            icon="fa-solid fa-gear"
          />
        </div>
      </div>

      {/* 3. MODULE CONTENT AREA */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${modulePadding}`}>
        <div className="max-w-7xl mx-auto pb-20">
          {message && (
            <div
              className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
            >
              <i
                className={`fa-solid ${message.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}
              ></i>
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
              <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] md:col-span-2"></div>
              <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem]"></div>
              <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem]"></div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Stats Hero */}
                  <BentoCard
                    className="md:col-span-8"
                    title="Platform Etkileşimi"
                    icon="fa-solid fa-chart-line"
                    iconColor="bg-indigo-100 text-indigo-600"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <StatValue
                        value={students.length}
                        label="Öğrenci"
                        subValue="+2 Bu Ay"
                        trend="up"
                      />
                      <StatValue
                        value={worksheets.length}
                        label="Materyal"
                        subValue="Aktif Kullanım"
                      />
                      <StatValue
                        value={assessments.length}
                        label="Rapor"
                        subValue="%94 Başarı"
                        trend="up"
                      />
                      <StatValue
                        value={curriculums.length}
                        label="Program"
                        subValue="Bireysel Plan"
                      />
                    </div>
                    {performanceTrends && (
                      <div className="mt-12 h-64 w-full">
                        <LineChart
                          data={performanceTrends}
                          lines={[
                            { key: 'puan', color: '#6366f1', label: 'Ortalama Dikkat Skoru' },
                          ]}
                          height={250}
                        />
                      </div>
                    )}
                  </BentoCard>

                  {/* Active Student Shortcut */}
                  <BentoCard
                    className="md:col-span-4"
                    title="Son Odak"
                    icon="fa-solid fa-star"
                    iconColor="bg-amber-100 text-amber-600"
                  >
                    {activeStudent ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-5 mb-8">
                          <img
                            src={activeStudent.avatar}
                            className="w-20 h-20 rounded-[2rem] border-4 border-white dark:border-zinc-700 shadow-xl"
                            alt=""
                          />
                          <div>
                            <h4 className="text-xl font-black text-zinc-900 dark:text-white leading-none mb-2">
                              {activeStudent.name}
                            </h4>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                              {activeStudent.grade}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-zinc-400">GELİŞİM</span>
                            <span className="text-emerald-500">%78</span>
                          </div>
                          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-1000 shadow-lg shadow-emerald-500/20"
                              style={{ width: '78%' }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <ActionButton
                            label="PROFİLİ AÇ"
                            icon="fa-solid fa-arrow-right"
                            onClick={() => setActiveTab('students')}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-400 italic text-sm">
                        <i className="fa-solid fa-user-plus text-4xl mb-4 opacity-20"></i>
                        Aktif öğrenci seçilmedi
                      </div>
                    )}
                  </BentoCard>

                  {/* Activities Quick List */}
                  <BentoCard
                    className="md:col-span-12"
                    title="Son Üretilen Materyaller"
                    icon="fa-solid fa-history"
                    iconColor="bg-zinc-100 text-zinc-900"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {worksheets.slice(0, 4).map((ws) => (
                        <div
                          key={ws.id}
                          className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center text-xl text-zinc-400 group-hover:text-indigo-600 transition-colors">
                            <i className={ws.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">
                              {ws.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                              {new Date(ws.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {worksheets.length === 0 && (
                        <div className="col-span-4 text-center py-8 text-zinc-400">
                          Henüz materyal üretilmedi.
                        </div>
                      )}
                    </div>
                  </BentoCard>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="h-[85vh] rounded-[3rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl relative z-10">
                  <AdvancedStudentManager onBack={() => setActiveTab('overview')} />
                </div>
              )}

              {activeTab === 'evaluations' && (
                <BentoCard
                  title="Tanısal Analiz Geçmişi"
                  icon="fa-solid fa-clipboard-user"
                  iconColor="bg-purple-100 text-purple-600"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-700">
                          <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Öğrenci
                          </th>
                          <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                            Dikkat
                          </th>
                          <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                            Bellek
                          </th>
                          <th className="p-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Tarih
                          </th>
                          <th className="p-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {assessments.map((a) => (
                          <tr
                            key={a.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all group"
                          >
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 group-hover:text-purple-600 transition-colors">
                                  {a.studentName[0]}
                                </div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                  {a.studentName}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 text-center">
                              <span className="px-3 py-1 rounded-lg bg-red-50 text-red-600 font-mono font-black text-xs">
                                %{a.report.scores.attention}
                              </span>
                            </td>
                            <td className="p-6 text-center">
                              <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-mono font-black text-xs">
                                %{a.report.scores.spatial}
                              </span>
                            </td>
                            <td className="p-6 text-sm text-zinc-500 font-bold">
                              {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="p-6 text-right">
                              <button
                                onClick={() => setSelectedAssessment(a)}
                                className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
                              >
                                Raporu Aç
                              </button>
                            </td>
                          </tr>
                        ))}
                        {assessments.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-20 text-center text-zinc-400 font-bold italic"
                            >
                              Kayıtlı değerlendirme bulunamadı.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </BentoCard>
              )}

              {activeTab === 'plans' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {curriculums.map((plan) => (
                    <BentoCard
                      key={plan.id}
                      title={`${plan.durationDays} GÜNLÜK PROGRAM`}
                      icon="fa-solid fa-graduation-cap"
                      iconColor="bg-emerald-100 text-emerald-600"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mb-1">
                            {plan.studentName}
                          </h4>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            {plan.grade}
                          </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-[10px]">
                          AKTİF
                        </div>
                      </div>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-400">Genel İlerleme</span>
                          <span className="text-zinc-900 dark:text-white">
                            %{' '}
                            {Math.round(
                              (plan.schedule.filter((d) => d.isCompleted).length /
                                plan.schedule.length) *
                                100
                            )}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20"
                            style={{
                              width: `${(plan.schedule.filter((d) => d.isCompleted).length / plan.schedule.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02]">
                          PLANA GİT
                        </button>
                        <button
                          onClick={() => {}}
                          className="w-14 h-14 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center text-zinc-500"
                        >
                          <i className="fa-solid fa-print"></i>
                        </button>
                      </div>
                    </BentoCard>
                  ))}
                  {curriculums.length === 0 && (
                    <div className="lg:col-span-2 p-20 text-center text-zinc-400 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] font-bold">
                      Henüz eğitim planı oluşturulmamış.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BentoCard
                    title="Kurumsal Raporlama"
                    icon="fa-solid fa-file-invoice"
                    iconColor="bg-blue-100 text-blue-600"
                  >
                    <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                      Tüm öğrencilerin gelişim verilerini tek bir PDF dosyasında birleştirin.
                      Karşılaştırmalı analitikler ve aylık gelişim özetleri içerir.
                    </p>
                    <button
                      onClick={() => alert('Bu modül toplu veri analizi için hazırlanmaktadır.')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                      RAPOR SİHİRBAZINI AÇ
                    </button>
                  </BentoCard>
                  <BentoCard
                    title="Kullanım İstatistikleri"
                    icon="fa-solid fa-database"
                    iconColor="bg-zinc-900 text-white"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          TOPLAM ÜRETİM
                        </span>
                        <span className="font-black text-lg">{worksheets.length} Sayfa</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          AKTİF ÖĞRENCİ
                        </span>
                        <span className="font-black text-lg">{students.length} Kişi</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          ORT. ANALİZ SKORU
                        </span>
                        <span className="font-black text-lg text-indigo-600">%82</span>
                      </div>
                    </div>
                  </BentoCard>
                </div>
              )}

              {activeTab === 'settings' && (
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 ${customUi.density === 'compact' ? 'gap-4' : 'gap-8'} pb-10`}
                >
                  <div className="lg:col-span-3">
                    <div
                      className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm ${radiusClass} p-4 lg:sticky lg:top-24`}
                    >
                      <div className="space-y-2">
                        {settingsTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setSettingsCategory(tab.id as typeof settingsCategory)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-start gap-4 group ${settingsCategory === tab.id ? `bg-white dark:bg-zinc-900/80 shadow-md border border-zinc-200 dark:border-zinc-700 ${accentRing} ring-2` : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'}`}
                          >
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${settingsCategory === tab.id ? `${accentSoft}` : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}
                            >
                              <i className={`fa-solid ${tab.icon}`}></i>
                            </div>
                            <div>
                              <h3
                                className={`text-sm font-black ${settingsCategory === tab.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                              >
                                {tab.label}
                              </h3>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                                {tab.desc}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`lg:col-span-9 ${settingsSpacing}`}>
                    {settingsCategory === 'profile' && (
                      <div className={settingsSpacing}>
                        <BentoCard
                          className={radiusClass}
                          title="Kişisel Bilgiler"
                          icon="fa-solid fa-user-pen"
                          iconColor={accentSoft}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-3 flex flex-col items-center gap-6">
                              <div className="relative group/avatar">
                                <div className="w-40 h-40 rounded-[3.5rem] p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-2xl overflow-hidden transform group-hover/avatar:scale-105 transition-all duration-500">
                                  <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full rounded-[3.3rem] object-cover bg-white dark:bg-zinc-800"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const url = prompt('Profil resmi URL giriniz:', avatarUrl);
                                    if (url) setAvatarUrl(url);
                                  }}
                                  className="absolute inset-0 bg-black/60 rounded-[3.5rem] opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center text-white"
                                >
                                  <i className="fa-solid fa-camera text-3xl mb-2"></i>
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    Resmi Değiştir
                                  </span>
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setAvatarUrl(
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
                                    )
                                  }
                                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                  <i className="fa-solid fa-dice mr-2"></i> Yeni Üret
                                </button>
                              </div>
                            </div>

                            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    Tam Ad Soyad
                                  </label>
                                  <div className="relative group">
                                    <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    E-Posta (Sabit)
                                  </label>
                                  <div className="relative group">
                                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"></i>
                                    <input
                                      type="text"
                                      value={user.email}
                                      disabled
                                      className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-400 cursor-not-allowed outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    Telefon Numarası
                                  </label>
                                  <div className="relative group">
                                    <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                                    <input
                                      type="tel"
                                      value={editPhone}
                                      onChange={(e) => setEditPhone(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    Meslek / Uzmanlık
                                  </label>
                                  <div className="relative group">
                                    <i className="fa-solid fa-briefcase absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                                    <input
                                      type="text"
                                      value={editProfession}
                                      onChange={(e) => setEditProfession(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    Kurum / Okul Bilgisi
                                  </label>
                                  <div className="relative group">
                                    <i className="fa-solid fa-building absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                                    <input
                                      type="text"
                                      value={editInstitution}
                                      onChange={(e) => setEditInstitution(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                    Kısa Biyografi
                                  </label>
                                  <div className="relative group">
                                    <textarea
                                      value={editBio}
                                      onChange={(e) => setEditBio(e.target.value)}
                                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-20 resize-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-10 flex justify-end">
                            <button
                              onClick={handleUpdateProfile}
                              disabled={isSavingProfile}
                              className="px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isSavingProfile ? (
                                <i className="fa-solid fa-circle-notch fa-spin mr-3"></i>
                              ) : (
                                <i className="fa-solid fa-check-double mr-3"></i>
                              )}
                              Profil Bilgilerini Güncelle
                            </button>
                          </div>
                        </BentoCard>
                      </div>
                    )}

                    {settingsCategory === 'appearance' && (
                      <div className={settingsSpacing}>
                        <BentoCard
                          className={radiusClass}
                          title="Arayüz Hakimiyeti"
                          icon="fa-solid fa-sliders"
                          iconColor={accentSoft}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                Yoğunluk
                              </p>
                              <div className="flex gap-3">
                                {['compact', 'comfortable'].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => {
                                      setCustomUi((prev) => ({
                                        ...prev,
                                        density: option as typeof customUi.density,
                                      }));
                                      if (onUpdateUiSettings && externalUiSettings) {
                                        onUpdateUiSettings({
                                          ...externalUiSettings,
                                          compactMode: option === 'compact',
                                        });
                                      }
                                    }}
                                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${customUi.density === option ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                  >
                                    {option === 'compact' ? 'Kompakt' : 'Dengeli'}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-zinc-400">
                                Modül boşluklarını azaltarak daha fazla içerik sığdırır.
                              </p>
                            </div>
                            <div className="space-y-4">
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                Köşe Yuvarlığı
                              </p>
                              <div className="flex gap-3">
                                {['lg', 'xl', '2xl'].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      setCustomUi((prev) => ({
                                        ...prev,
                                        radius: option as typeof customUi.radius,
                                      }))
                                    }
                                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${customUi.radius === option ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                  >
                                    {option === 'lg'
                                      ? 'Keskin'
                                      : option === 'xl'
                                        ? 'Yumuşak'
                                        : 'Ultra'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                Sidebar Konumu
                              </p>
                              <div className="flex gap-3">
                                {['left', 'right'].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      setCustomUi((prev) => ({
                                        ...prev,
                                        sidebarPosition: option as typeof customUi.sidebarPosition,
                                      }))
                                    }
                                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${customUi.sidebarPosition === option ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                  >
                                    {option === 'left' ? 'Sol' : 'Sağ'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                Vurgu Rengi
                              </p>
                              <div className="flex gap-3">
                                {['indigo', 'emerald', 'cyan'].map((option) => (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      setCustomUi((prev) => ({
                                        ...prev,
                                        accent: option as typeof customUi.accent,
                                      }))
                                    }
                                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${customUi.accent === option ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                                  >
                                    {option === 'indigo'
                                      ? 'İndigo'
                                      : option === 'emerald'
                                        ? 'Zümrüt'
                                        : 'Siyan'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </BentoCard>

                        <BentoCard
                          className={radiusClass}
                          title="Sistem Tercihleri"
                          icon="fa-solid fa-palette"
                          iconColor="bg-amber-50 text-amber-600"
                        >
                          <div className="space-y-4">
                            <div
                              onClick={handleToggleDarkMode}
                              className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-indigo-400 transition-all group"
                            >
                              <div className="flex items-center gap-5">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${darkModeEnabled ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-500'}`}
                                >
                                  <i
                                    className={`fa-solid ${darkModeEnabled ? 'fa-moon' : 'fa-sun'}`}
                                  ></i>
                                </div>
                                <div>
                                  <p className="font-black text-zinc-800 dark:text-zinc-200 text-sm">
                                    Karanlık Mod
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    Gece kullanımı için optimize edin
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${darkModeEnabled ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                              >
                                <div
                                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${darkModeEnabled ? 'left-8' : 'left-1'}`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </BentoCard>
                      </div>
                    )}

                    {settingsCategory === 'ai' && (
                      <div className={settingsSpacing}>
                        <BentoCard
                          className={radiusClass}
                          title="AI Orkestrasyon"
                          icon="fa-solid fa-brain"
                          iconColor={accentSoft}
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                Model
                              </label>
                              <select
                                value={aiSettings.model}
                                onChange={(e) =>
                                  setAiSettings((prev) => ({ ...prev, model: e.target.value }))
                                }
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                              >
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="internal-pro">Oogmatik Pro</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                Çıktı Dili
                              </label>
                              <select
                                value={aiSettings.tone}
                                onChange={(e) =>
                                  setAiSettings((prev) => ({ ...prev, tone: e.target.value }))
                                }
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                              >
                                <option value="kurumsal">Kurumsal</option>
                                <option value="öğretmen">Öğretmen Tonu</option>
                                <option value="bilimsel">Bilimsel</option>
                                <option value="dostane">Dostane</option>
                              </select>
                            </div>
                            <div className="lg:col-span-2">
                              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                Yaratıcılık
                              </label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={aiSettings.creativity}
                                  onChange={(e) =>
                                    setAiSettings((prev) => ({
                                      ...prev,
                                      creativity: Number(e.target.value),
                                    }))
                                  }
                                  className="w-full accent-indigo-600"
                                />
                                <span className="text-xs font-black text-indigo-600 w-12 text-right">
                                  %{aiSettings.creativity}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                Analiz Derinliği
                              </label>
                              <select
                                value={aiSettings.analysisDepth}
                                onChange={(e) =>
                                  setAiSettings((prev) => ({
                                    ...prev,
                                    analysisDepth: e.target.value,
                                  }))
                                }
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                              >
                                <option value="detailed">Detaylı</option>
                                <option value="summary">Özet</option>
                                <option value="bullet">Madde Madde</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                                Gizlilik Profili
                              </label>
                              <select
                                value={aiSettings.dataPrivacy}
                                onChange={(e) =>
                                  setAiSettings((prev) => ({
                                    ...prev,
                                    dataPrivacy: e.target.value,
                                  }))
                                }
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-zinc-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                              >
                                <option value="balanced">Dengeli</option>
                                <option value="strict">Sıkı</option>
                                <option value="collab">İşbirlikçi</option>
                              </select>
                            </div>
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                onClick={() =>
                                  setAiSettings((prev) => ({
                                    ...prev,
                                    autoSuggest: !prev.autoSuggest,
                                  }))
                                }
                                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-indigo-400 transition-all"
                              >
                                <div>
                                  <p className="font-black text-zinc-800 dark:text-zinc-200 text-sm">
                                    Akıllı Öneriler
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    Konuya göre otomatik öner
                                  </p>
                                </div>
                                <div
                                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${aiSettings.autoSuggest ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                  <div
                                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${aiSettings.autoSuggest ? 'left-7' : 'left-1'}`}
                                  ></div>
                                </div>
                              </div>
                              <div
                                onClick={() =>
                                  setAiSettings((prev) => ({
                                    ...prev,
                                    voiceAssistant: !prev.voiceAssistant,
                                  }))
                                }
                                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-indigo-400 transition-all"
                              >
                                <div>
                                  <p className="font-black text-zinc-800 dark:text-zinc-200 text-sm">
                                    Sesli Asistan
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    AI yanıtlarını seslendir
                                  </p>
                                </div>
                                <div
                                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${aiSettings.voiceAssistant ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                >
                                  <div
                                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${aiSettings.voiceAssistant ? 'left-7' : 'left-1'}`}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </BentoCard>
                      </div>
                    )}

                    {settingsCategory === 'notifications' && (
                      <div className={settingsSpacing}>
                        <BentoCard
                          className={radiusClass}
                          title="Bildirim Kontrolü"
                          icon="fa-solid fa-bell"
                          iconColor="bg-emerald-50 text-emerald-600"
                        >
                          <div className="space-y-4">
                            <div
                              onClick={handleToggleNotifications}
                              className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:border-emerald-400 transition-all group"
                            >
                              <div className="flex items-center gap-5">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${emailNotificationsEnabled ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500'}`}
                                >
                                  <i className="fa-solid fa-bell"></i>
                                </div>
                                <div>
                                  <p className="font-black text-zinc-800 dark:text-zinc-200 text-sm">
                                    E-Posta Bildirimleri
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    Haftalık özet ve kritik raporlar
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${emailNotificationsEnabled ? 'bg-emerald-600 shadow-lg shadow-emerald-500/40' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                              >
                                <div
                                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${emailNotificationsEnabled ? 'left-8' : 'left-1'}`}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <h4 className="font-black text-zinc-800 dark:text-zinc-200 text-sm mb-2">
                                  Haftalık Özet
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-bold">
                                  Öğrenci gelişim raporlarını tek e-postada topla.
                                </p>
                              </div>
                              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <h4 className="font-black text-zinc-800 dark:text-zinc-200 text-sm mb-2">
                                  Kritik Uyarılar
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-bold">
                                  Düşüş eğiliminde otomatik uyarı gönder.
                                </p>
                              </div>
                            </div>
                          </div>
                        </BentoCard>
                      </div>
                    )}

                    {settingsCategory === 'security' && (
                      <div className={settingsSpacing}>
                        <BentoCard
                          className={radiusClass}
                          title="Güvenlik ve Erişim"
                          icon="fa-solid fa-shield-halved"
                          iconColor="bg-blue-50 text-blue-600"
                        >
                          <div className="h-full flex flex-col justify-between pt-2">
                            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl mb-8">
                              <div className="flex items-start gap-4">
                                <i className="fa-solid fa-info-circle text-blue-600 mt-1"></i>
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                                  Güvenliğiniz için şifrenizi en az 3 ayda bir değiştirmenizi
                                  öneririz. Şifreniz en az 8 karakter, büyük harf ve sembol
                                  içermelidir.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => {
                                  const pass = prompt('Yeni şifre giriniz:');
                                  if (pass && pass.length >= 6) {
                                    alert('Şifre güncelleme isteği gönderildi.');
                                  }
                                }}
                                className="flex-1 px-6 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                              >
                                Şifre Değiştir
                              </button>
                              <button
                                onClick={onOpenSettingsModal}
                                className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                              >
                                Gelişmiş Ayarlar
                              </button>
                            </div>
                          </div>
                        </BentoCard>

                        <BentoCard
                          className={`${radiusClass} border-red-100 dark:border-red-900/30`}
                          title="Tehlikeli Bölge"
                          icon="fa-solid fa-triangle-exclamation"
                          iconColor="bg-red-50 text-red-600"
                        >
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-red-50/30 dark:bg-red-900/5 rounded-[2.5rem]">
                            <div className="text-center md:text-left">
                              <h5 className="font-black text-red-700 dark:text-red-400 text-sm mb-1 uppercase tracking-tight">
                                Hesabı Kalıcı Olarak Kapat
                              </h5>
                              <p className="text-[11px] text-zinc-500 font-bold">
                                Tüm öğrenci verileriniz, raporlarınız ve arşiviniz geri dönülemez
                                şekilde silinecektir.
                              </p>
                            </div>
                            <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">
                              HESABI SİL
                            </button>
                          </div>
                        </BentoCard>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AssessmentReportViewer
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        user={user}
      />
    </div>
  );
};
