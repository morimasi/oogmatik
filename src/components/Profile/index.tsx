import React, { useState } from 'react';
import { ProfileData } from '../../types/profile';
import { Student } from '../../types';
import { ProfileTabId } from './constants';
import { ProfileHeader } from './components/ProfileHeader';
import { TabNavigation } from './components/TabNavigation';
import { OverviewModule } from './modules/OverviewModule';
import { StudentsModule } from './modules/StudentsModule';
import { AnalysisModule } from './modules/AnalysisModule';
import { PlansModule } from './modules/PlansModule';
import { ReportsModule } from './modules/ReportsModule';
import { SettingsModule } from './modules/SettingsModule';
import { useStudentStore } from '../../store/useStudentStore';

interface ProfileProps {
  data: ProfileData;
  activeStudent: Student | null;
  onBack: () => void;
  onSelectActivity: (id: any) => void;
  onLoadSaved: (ws: any) => void;
  theme?: any;
  uiSettings?: any;
  onUpdateTheme?: (theme: any) => void;
  onUpdateUiSettings?: (settings: any) => void;
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
  const { setActiveStudent: setActiveStudentInStore } = useStudentStore();

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
          />
        );
      case 'plans':
        return (
          <PlansModule
            data={data}
          />
        );
      case 'reports':
        return (
          <ReportsModule
            data={data}
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
        />
      </div>

      {/* Module Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderActiveModule()}
      </div>
    </div>
  );
};