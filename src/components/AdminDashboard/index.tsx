import React, { useState, useEffect } from 'react';
import { User, ActivityStats } from '../../types';
import { authService } from '../../services/authService';
import { statsService } from '../../services/statsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useRBAC } from '../../hooks/useRBAC';

// Lazy Loaded Views to break circular dependencies
const ProfileView = React.lazy(() => import('../ProfileView').then(m => ({ default: m.ProfileView })));
const SavedWorksheetsView = React.lazy(() => import('../SavedWorksheetsView').then(m => ({ default: m.SavedWorksheetsView })));
const FavoritesSection = React.lazy(() => import('../FavoritesSection').then(m => ({ default: m.FavoritesSection })));

// New Imports - Relative to src/components/AdminDashboard/
import { AdminAnalytics } from './AdminAnalytics';
import { AdminActivityManager } from './AdminActivityManager';
import { AdminPromptStudio } from './AdminPromptStudio';
import { AdminFeedback } from './AdminFeedback';
import { AdminStaticContent } from './AdminStaticContent';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminDraftReview } from './AdminDraftReview';
import { AdminActivityApproval } from './AdminActivityApproval';
import { AdminPermissionsIDE } from './PermissionsIDE';

import { logError } from '../../utils/logger.js';
interface AdminDashboardProps {
  onBack: () => void;
}

const PAGE_SIZE = 15;

const NavButton = ({ active, label, icon, onClick, count }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none success-glow' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
  >
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="flex-1 text-left">{label}</span>
    {count && (
      <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{count}</span>
    )}
  </button>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { isAdmin } = useRBAC();

  // Persistent Tab State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'activities' | 'prompts' | 'static_content' | 'feedbacks' | 'drafts' | 'approvals' | 'permissions'
  >(() => {
    const saved = localStorage.getItem('admin_active_tab');
    return (saved as any) || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  // Data States
  const [stats, setStats] = useState<ActivityStats[]>([]);
  const [_loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);

  // Inspector Mode
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [inspectView, setInspectView] = useState<'profile' | 'archive' | 'favorites'>('profile');

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        authService.getAllUsers(0, PAGE_SIZE),
        statsService.getAllStats(),
      ]);
      setUsersCount(usersData.count || 0);
      setStats(statsData);
    } catch (e: unknown) {
      logError('Admin load error', e as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin)
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl mt-20">
        403 - Yetkisiz Erişim
      </div>
    );

  if (inspectingUser) {
    return (
      <div className="h-screen flex flex-col bg-zinc-50 dark:bg-black">
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center shadow-sm z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setInspectingUser(null);
                setInspectView('profile');
              }}
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors text-zinc-500"
            >
              <i className="fa-solid fa-arrow-left"></i> Geri
            </button>
            <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-700 pl-4">
              <img
                src={inspectingUser.avatar}
                className="w-8 h-8 rounded-full border border-zinc-200"
                alt=""
              />
              <div>
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">
                  {inspectingUser.name}
                </h3>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Kullanıcı İnceleme Modu
                </p>
              </div>
            </div>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setInspectView('profile')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'profile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}
            >
              Profil
            </button>
            <button
              onClick={() => setInspectView('archive')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'archive' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}
            >
              Arşiv
            </button>
            <button
              onClick={() => setInspectView('favorites')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'favorites' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}
            >
              Koleksiyon
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div>}>
            {inspectView === 'profile' && (
              <ProfileView
                onBack={() => setInspectingUser(null)}
                onSelectActivity={() => {}}
                onLoadSaved={() => {}}
                targetUser={inspectingUser}
              />
            )}
            {inspectView === 'archive' && (
              <div className="h-full p-4 overflow-y-auto">
                <SavedWorksheetsView
                  onLoad={() => {}}
                  onBack={() => setInspectView('profile')}
                  targetUserId={inspectingUser.id}
                />
              </div>
            )}
            {inspectView === 'favorites' && (
              <div className="h-full p-4 overflow-y-auto">
                <FavoritesSection onSelectActivity={() => {}} targetUserId={inspectingUser.id} />
              </div>
            )}
          </React.Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[var(--bg-primary)] overflow-hidden font-lexend relative">
      {/* Shimmer Effect overlay globally for the Admin Panel */}
      <div className="absolute inset-0 pointer-events-none shimmer-effect opacity-10 z-0"></div>

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[var(--bg-paper)] border-r border-[var(--border-color)] flex flex-col shrink-0 z-20 m-2 rounded-[2.5rem] h-[calc(100%-16px)] shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--accent-muted)]">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] leading-none">
              Yönetim
            </h2>
            <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">
              Kontrol Merkezi
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Analiz & Kullanıcı
          </p>
          <NavButton
            active={activeTab === 'dashboard'}
            label="Genel Bakış"
            icon="fa-chart-pie"
            onClick={() => setActiveTab('dashboard')}
          />
          <NavButton
            active={activeTab === 'users'}
            label="Kullanıcılar"
            icon="fa-users"
            onClick={() => setActiveTab('users')}
          />
          <NavButton
            active={activeTab === 'permissions'}
            label="Yetki Matrisi (RBAC)"
            icon="fa-shield-halved"
            onClick={() => setActiveTab('permissions')}
          />

          <p className="px-4 mt-6 mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            İçerik Motoru
          </p>
          <NavButton
            active={activeTab === 'activities'}
            label="Aktivite Yöneticisi"
            icon="fa-layer-group"
            onClick={() => setActiveTab('activities')}
          />
          <NavButton
            active={activeTab === 'prompts'}
            label="Prompt Stüdyosu"
            icon="fa-terminal"
            onClick={() => setActiveTab('prompts')}
          />
          <NavButton
            active={activeTab === 'drafts'}
            label="OCR Taslakları"
            icon="fa-camera-rotate"
            onClick={() => setActiveTab('drafts')}
          />
          <NavButton
            active={activeTab === 'approvals'}
            label="İçerik Onayları"
            icon="fa-check-double"
            onClick={() => setActiveTab('approvals')}
          />
          <NavButton
            active={activeTab === 'static_content'}
            label="Veri Kaynakları"
            icon="fa-database"
            onClick={() => setActiveTab('static_content')}
          />

          <p className="px-4 mt-6 mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Destek
          </p>
          <NavButton
            active={activeTab === 'feedbacks'}
            label="Gelen Kutusu"
            icon="fa-inbox"
            onClick={() => setActiveTab('feedbacks')}
            count={3}
          />
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm border border-[var(--border-color)]"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Uygulamaya Dön
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 p-2 pl-0">
        {/* Top Header */}
        <header className="h-16 bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 mb-4 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">
              {activeTab === 'dashboard' && 'Kontrol Paneli'}
              {activeTab === 'users' && 'Kullanıcı Yönetimi'}
              {activeTab === 'activities' && 'Aktivite Yöneticisi'}
              {activeTab === 'prompts' && 'AI Prompt Laboratuvarı'}
              {activeTab === 'static_content' && 'Veri Kaynakları (CMS)'}
              {activeTab === 'feedbacks' && 'Geri Bildirimler'}
              {activeTab === 'drafts' && 'Taslak Havuzu (OCR)'}
              {activeTab === 'approvals' && 'İçerik Onay Merkezi'}
              {activeTab === 'permissions' && 'Yetkilendirme (RBAC)'}
            </h1>
            <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-color)]">
              v1.3.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Aktif
            </div>
            <img
              src={user.avatar}
              alt=""
              className="w-8 h-8 rounded-full border border-[var(--border-color)]"
            />
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[2.5rem] shadow-inner">
          <div className="w-full mx-auto pb-20">
            {activeTab === 'dashboard' && <AdminAnalytics stats={stats} totalUsers={usersCount} />}
            {activeTab === 'activities' && <AdminActivityManager />}
            {activeTab === 'prompts' && <AdminPromptStudio />}
            {activeTab === 'static_content' && <AdminStaticContent />}
            {activeTab === 'feedbacks' && <AdminFeedback />}
            {activeTab === 'users' && <AdminUserManagement />}
            {activeTab === 'drafts' && <AdminDraftReview />}
            {activeTab === 'approvals' && <AdminActivityApproval />}
            {activeTab === 'permissions' && <AdminPermissionsIDE />}
          </div>
        </div>
      </main>
    </div>
  );
};

AdminDashboard.displayName = 'AdminDashboard';
