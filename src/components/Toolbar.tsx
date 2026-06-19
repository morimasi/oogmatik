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

export const Toolbar = ({
  settings,
  onSettingsChange,
  onSave,
  onAssign,
  onShare,
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
}: ToolbarProps) => {
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

        {/* Hızlı Ölçek (İçerik) */}
        <div className="flex items-center bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)] px-2 py-1 mx-1 shadow-inner h-8 md:h-9" title="Sayfa İçeriği Boyutu">
            <i className="fa-solid fa-magnifying-glass-minus text-[10px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent-color)] transition-colors" onClick={() => updateSetting('contentScale', Math.max(0.5, (settings.contentScale || 1) - 0.05))}></i>
            <input 
               type="range" 
               min="0.5" 
               max="1.5" 
               step="0.05" 
               value={settings.contentScale || 1} 
               onChange={(e: any) => updateSetting('contentScale', parseFloat(e.target.value))}
               className="w-16 md:w-20 lg:w-28 mx-2 accent-[var(--accent-color)] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <i className="fa-solid fa-magnifying-glass-plus text-[10px] text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent-color)] transition-colors" onClick={() => updateSetting('contentScale', Math.min(1.5, (settings.contentScale || 1) + 0.05))}></i>
            <span className="text-[10px] font-black text-[var(--text-secondary)] ml-2 w-7 text-right font-mono tracking-tighter">
               {Math.round((settings.contentScale || 1) * 100)}%
            </span>
        </div>

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
        />
      </div>
    </div>
  );
};
