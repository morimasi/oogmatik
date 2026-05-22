import React, { useState } from 'react';
import { ProfileData } from '../../types/profile';
import { Student, SavedWorksheet, AppTheme, UiSettings } from '../../types';
import { ProfileTabId, PROFILE_TABS } from './constants';
import { ProfileHeader } from './components/ProfileHeader';
import { TabNavigation } from './components/TabNavigation';
import { OverviewModule } from './modules/OverviewModule';
import { StudentsModule } from './modules/StudentsModule';
import { AnalysisModule } from './modules/AnalysisModule';
import { PlansModule } from './modules/PlansModule';
import { ReportsModule } from './modules/ReportsModule';
import { SettingsModule } from './modules/SettingsModule';
import { SharedContentPanel } from './components/SharedContentPanel';
import { useStudentStore } from '../../store/useStudentStore';
import { useRBAC } from '../../hooks/useRBAC';
import { PermissionModule } from '../../types/rbac';
import { useProfileShare } from './hooks/useProfileShare';
import { ShareModal } from '../ShareModal';
import { SharedModuleType } from '../../services/profileShareService';

interface ProfileProps {
  data: ProfileData;
  activeStudent: Student | null;
  onBack: () => void;
  onSelectActivity: (id: string) => void;
  onLoadSaved: (ws: SavedWorksheet) => void;
  theme?: AppTheme;
  uiSettings?: UiSettings;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateUiSettings?: (settings: UiSettings) => void;
  onOpenSettingsModal?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  data,
  activeStudent,
  onBack,
  onSelectActivity,
  onLoadSaved,
  theme,
  uiSettings,
  onUpdateTheme,
  onUpdateUiSettings,
  onOpenSettingsModal,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('overview');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingModule, setSharingModule] = useState<SharedModuleType>('overview');
  const [isSharing, setIsSharing] = useState(false);
  const { setActiveStudent: setActiveStudentInStore } = useStudentStore();
  const { canAccess, role } = useRBAC();
  const { sharedItems, unreadCount, shareModule, removeShare, refreshSharedItems } = useProfileShare();

  const tabPermissions: Record<ProfileTabId, PermissionModule | null> = {
    overview: null,
    students: 'students',
    analysis: 'analytics',
    plans: 'planning',
    reports: 'reports',
    shared: null,
    settings: 'settings',
  };

  const allowedTabs = PROFILE_TABS.filter((tab: { id: ProfileTabId }) => {
    // Öğretmen ve admin rolleri için tüm sekmeler tamamen kullanıma açık olmalı
    if (role === 'teacher' || role === 'admin' || role === 'superadmin') {
      return true;
    }
    const perm = tabPermissions[tab.id];
    return !perm || canAccess(perm);
  });

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewModule
            data={data}
            activeStudent={activeStudent}
            onSelectActivity={onSelectActivity}
            onLoadSaved={onLoadSaved}
            onTabChange={(tab: string) => setActiveTab(tab as ProfileTabId)}
            onShare={() => { setSharingModule('overview'); setShareModalOpen(true); }}
          />
        );
      case 'students':
        return (
          <StudentsModule
            data={data}
            activeStudent={activeStudent}
            onBack={onBack}
            onLoadMaterial={onLoadSaved}
            setActiveStudent={setActiveStudentInStore}
          />
        );
      case 'analysis':
        return (
          <AnalysisModule
            data={data}
            onShare={() => { setSharingModule('analysis'); setShareModalOpen(true); }}
          />
        );
      case 'plans':
        return (
          <PlansModule
            data={data}
            onShare={() => { setSharingModule('plans'); setShareModalOpen(true); }}
          />
        );
      case 'reports':
        return (
          <ReportsModule
            data={data}
            onShare={() => { setSharingModule('reports'); setShareModalOpen(true); }}
          />
        );
      case 'shared':
        return (
          <SharedContentPanel
            items={sharedItems}
            loading={false}
            onOpenModule={(moduleType) => setActiveTab(moduleType as ProfileTabId)}
            onRemoveShare={removeShare}
          />
        );
      case 'settings':
        return (
          <SettingsModule
            data={data}
            theme={theme}
            uiSettings={uiSettings}
            onUpdateTheme={onUpdateTheme}
            onUpdateUiSettings={onUpdateUiSettings}
            onOpenSettingsModal={onOpenSettingsModal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen h-full bg-[var(--bg-primary)] overflow-y-auto">
      {/* Header */}
      <ProfileHeader
        user={data.user}
        isReadOnly={data.isReadOnly}
        onBack={onBack}
      />

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-6 py-4">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allowedTabs={allowedTabs}
          unreadCount={unreadCount}
        />
      </div>

      {/* Module Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderActiveModule()}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={async (ids, permission, message) => {
          if (!ids.length) return;
          setIsSharing(true);
          for (const id of ids) {
            await shareModule(id, sharingModule, permission || 'view', undefined, message);
          }
          setIsSharing(false);
          setShareModalOpen(false);
          refreshSharedItems();
        }}
        isSending={isSharing}
        showPermissionSelector
        worksheetTitle={PROFILE_TABS.find(t => t.id === sharingModule)?.label}
      />
    </div>
  );
};