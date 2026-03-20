import React, { useState, useCallback } from 'react';
import styles from './MobileWorksheetViewer.module.css';
import type { WorksheetContentBlockType } from '../UniversalWorksheetViewer/types/worksheet';

interface MobileEditorToolbarProps {
  onAddBlock: (type: WorksheetContentBlockType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
}

const PRIMARY_TOOLS: Array<{ action: string; icon: string; label: string }> = [
  { action: 'undo', icon: '↩', label: 'Geri Al' },
  { action: 'redo', icon: '↪', label: 'Yinele' },
  { action: 'save', icon: '💾', label: 'Kaydet' },
  { action: 'preview', icon: '👁', label: 'Önizle' },
  { action: 'export', icon: '⬇', label: 'İndir' },
  { action: 'more', icon: '⋯', label: 'Daha Fazla' },
];

const BLOCK_TOOLS: Array<{ type: WorksheetContentBlockType; icon: string; label: string }> = [
  { type: 'text', icon: '¶', label: 'Metin' },
  { type: 'heading', icon: 'H', label: 'Başlık' },
  { type: 'list', icon: '☰', label: 'Liste' },
  { type: 'table', icon: '⊞', label: 'Tablo' },
  { type: 'divider', icon: '─', label: 'Ayraç' },
];

export const MobileEditorToolbar: React.FC<MobileEditorToolbarProps> = ({
  onAddBlock,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onPreview,
  canUndo,
  canRedo,
  isDirty,
}) => {
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const handlePrimaryAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'undo':
          onUndo();
          break;
        case 'redo':
          onRedo();
          break;
        case 'save':
          onSave();
          break;
        case 'preview':
          onPreview();
          break;
        case 'export':
          onExport();
          break;
        case 'more':
          setShowBlockPicker((prev) => !prev);
          break;
      }
    },
    [onUndo, onRedo, onSave, onPreview, onExport],
  );

  const handleAddBlock = useCallback(
    (type: WorksheetContentBlockType) => {
      onAddBlock(type);
      setShowBlockPicker(false);
    },
    [onAddBlock],
  );

  return (
    <div className={styles.mobileToolbar} role="toolbar" aria-label="Düzenleyici araç çubuğu">
      {/* Primary actions */}
      <div className={styles.mobileToolbarPrimary}>
        {PRIMARY_TOOLS.map(({ action, icon, label }) => (
          <button
            key={action}
            className={`${styles.mobileToolbarBtn} ${action === 'save' && isDirty ? styles.mobileToolbarBtnDirty : ''}`}
            onClick={() => handlePrimaryAction(action)}
            disabled={(action === 'undo' && !canUndo) || (action === 'redo' && !canRedo)}
            aria-label={label}
            title={label}
          >
            {icon}
            <span className={styles.mobileToolbarBtnLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* Block picker bottom sheet */}
      {showBlockPicker && (
        <div className={styles.mobileBlockPicker} role="menu" aria-label="Blok ekle">
          <div className={styles.mobileBlockPickerTitle}>Blok Ekle</div>
          <div className={styles.mobileBlockPickerGrid}>
            {BLOCK_TOOLS.map(({ type, icon, label }) => (
              <button
                key={type}
                className={styles.mobileBlockBtn}
                onClick={() => handleAddBlock(type)}
                role="menuitem"
              >
                <span className={styles.mobileBlockIcon}>{icon}</span>
                <span className={styles.mobileBlockLabel}>{label}</span>
              </button>
            ))}
          </div>
          <button
            className={styles.mobileBlockPickerClose}
            onClick={() => setShowBlockPicker(false)}
            aria-label="Kapat"
          >
            İptal
          </button>
        </div>
      )}
    </div>
  );
};

MobileEditorToolbar.displayName = 'MobileEditorToolbar';
