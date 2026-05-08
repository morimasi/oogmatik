import React, { useState } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { useA4EditorStore } from '../store/useA4EditorStore';
import { 
  Divider, 
  IconButton, 
  MenuButton 
} from './Toolbar/ToolbarShared';

// Modüler Bileşenler
import { TypographyModule } from './Toolbar/TypographyModule';
import { LayoutModule } from './Toolbar/LayoutModule';
import { ClinicalFocusModule } from './Toolbar/ClinicalFocusModule';
import { ActionModule } from './Toolbar/ActionModule';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: () => void;
  onAssign?: () => void;
  onShare?: () => void;
  onAddToWorkbook?: () => void;
  workbookItemCount?: number;
  onSpeak?: () => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
  isEditMode?: boolean;
  onToggleEdit?: () => void;
  isCurriculumMode?: boolean;
  onCompleteCurriculumTask?: () => void;
  onFeedback?: () => void;
  worksheetData?: WorksheetData;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onSettingsChange,
  onSave,
  onAssign,
  onShare,
  onAddToWorkbook,
  workbookItemCount = 0,
  onSpeak,
  isSpeaking,
  onStopSpeak,
  isPreviewMode,
  onTogglePreview,
  isEditMode,
  onToggleEdit,
  isCurriculumMode,
  onCompleteCurriculumTask,
  onFeedback,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { isEditorOpen, setEditorOpen } = useA4EditorStore();

  const updateSetting = (key: keyof StyleSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateSettings = (updates: Partial<StyleSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 md:px-4 py-1.5 select-none relative z-[60] bg-[var(--surface-glass)]/30 backdrop-blur-md border-b border-[var(--border-color)]">
      
      {/* SOL GRUP: Editör Araçları */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        
        {/* Tipografi Modülü */}
        <div className="relative">
          <MenuButton
            icon="fa-font"
            label="Yazı Editörü"
            isOpen={activeMenu === 'typo'}
            onClick={() => toggleMenu('typo')}
          />
          <TypographyModule
            settings={settings}
            updateSetting={updateSetting}
            isOpen={activeMenu === 'typo'}
            onClose={() => setActiveMenu(null)}
          />
        </div>

        {/* Mizanpaj Modülü */}
        <div className="relative">
          <MenuButton
            icon="fa-table-cells-large"
            label="Mizanpaj"
            isOpen={activeMenu === 'layout'}
            onClick={() => toggleMenu('layout')}
          />
          <LayoutModule
            settings={settings}
            updateSetting={updateSetting}
            updateSettings={updateSettings}
            isOpen={activeMenu === 'layout'}
            onClose={() => setActiveMenu(null)}
          />
        </div>

        {/* Klinik Odak Modülü */}
        <div className="relative">
          <MenuButton
            icon="fa-eye"
            label="Klinik Araçlar"
            active={settings.focusMode}
            isOpen={activeMenu === 'clinical'}
            onClick={() => toggleMenu('clinical')}
          />
          <ClinicalFocusModule
            settings={settings}
            updateSetting={updateSetting}
            isOpen={activeMenu === 'clinical'}
            onClose={() => setActiveMenu(null)}
          />
        </div>

        <Divider />

        {/* Özel Araçlar */}
        <div className="flex items-center gap-1">
            <IconButton
              icon="fa-wand-magic-sparkles"
              title="Serbest Tasarımcı (A4 Editor)"
              active={isEditorOpen}
              onClick={() => setEditorOpen(!isEditorOpen)}
              colorClass={isEditorOpen ? 'bg-indigo-600 !text-white shadow-indigo-200' : 'text-indigo-500'}
            />
             <IconButton
              icon={isPreviewMode ? "fa-eye-slash" : "fa-expand"}
              title={isPreviewMode ? "Odak Modundan Çık" : "Odak Modu (ESC)"}
              active={isPreviewMode}
              onClick={onTogglePreview}
              colorClass={isPreviewMode ? 'text-amber-600' : 'text-slate-500'}
            />
            <IconButton
              icon="fa-pen-to-square"
              title="Metin Düzenleme"
              active={isEditMode}
              onClick={onToggleEdit}
              colorClass={isEditMode ? 'text-indigo-600' : 'text-slate-500'}
            />
            <IconButton
              icon={isSpeaking ? 'fa-stop' : 'fa-volume-high'}
              title={isSpeaking ? "Durdur" : "Sesli Oku"}
              active={isSpeaking}
              onClick={isSpeaking ? onStopSpeak : onSpeak}
              colorClass={isSpeaking ? 'text-red-500 animate-pulse' : 'text-sky-500'}
            />
            {onFeedback && (
                 <IconButton
                    icon="fa-comment-dots"
                    title="Geri Bildirim Gönder"
                    onClick={onFeedback}
                    colorClass="text-purple-500"
                />
            )}
        </div>
      </div>

      {/* SAĞ GRUP: Aksiyonlar & Çıktı */}
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
          onAddToWorkbook={onAddToWorkbook}
          workbookItemCount={workbookItemCount}
        />
      </div>
    </div>
  );
};
