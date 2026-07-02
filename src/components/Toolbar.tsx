import React from 'react';
import { ActivityType, StyleSettings, WorksheetData } from '../types';
import { IconButton } from './Toolbar/ToolbarShared';
import { ActionModule } from './Toolbar/ActionModule';

interface ToolbarProps {
  settings: StyleSettings;
  onSave: () => void;
  onAssign?: () => void;
  onShare?: () => void;
  onFeedback?: () => void;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
  isCurriculumMode?: boolean;
  onCompleteCurriculumTask?: () => void;
  worksheetData?: WorksheetData;
  activityType?: ActivityType | string;
}

export const Toolbar = ({
  settings,
  onSave,
  onAssign,
  onShare,
  onFeedback,
  isPreviewMode,
  onTogglePreview,
  isCurriculumMode,
  onCompleteCurriculumTask,
  worksheetData,
  activityType,
}: ToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 md:px-4 py-1.5 select-none relative z-[60] bg-[var(--surface-glass)]/30 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="flex items-center gap-1.5 md:gap-2.5">
        <IconButton
          icon={isPreviewMode ? "fa-eye-slash" : "fa-expand"}
          title={isPreviewMode ? "Odak Modundan Çık" : "Odak Modu (ESC)"}
          active={isPreviewMode}
          onClick={onTogglePreview}
          colorClass={isPreviewMode ? 'text-amber-600' : 'text-slate-500'}
        />
      </div>

      <div className="flex items-center gap-2">
        {isCurriculumMode && onCompleteCurriculumTask && (
            <button
                onClick={onCompleteCurriculumTask}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-black shadow-lg shadow-green-200 transition-all active:scale-95 animate-in zoom-in"
            >
                <i className="fa-solid fa-check-double"></i>
                BUGÜNÜ TAMAMLA
            </button>
        )}
        <ActionModule
          settings={settings}
          onSave={onSave}
          onAssign={onAssign}
          onShare={onShare}
          onFeedback={onFeedback}
          worksheetData={worksheetData}
          activityType={activityType}
        />
      </div>
    </div>
  );
};
