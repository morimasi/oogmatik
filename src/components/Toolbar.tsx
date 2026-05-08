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
              colorClass={isEditorOpen ? 'bg-indigo-600 !text-white' : 'text-indigo-500'}
            />
            <IconButton
              icon={isSpeaking ? 'fa-stop' : 'fa-volume-high'}
              title={isSpeaking ? "Durdur" : "Sesli Oku"}
              active={isSpeaking}
              onClick={isSpeaking ? onStopSpeak : onSpeak}
              colorClass={isSpeaking ? 'text-red-500 animate-pulse' : 'text-sky-500'}
            />
        </div>
      </div>

      {/* SAĞ GRUP: Aksiyonlar & Çıktı */}
      <div className="flex items-center gap-2">
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
