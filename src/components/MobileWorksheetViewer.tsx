import React, { useState, useCallback, useEffect } from 'react';
import styles from './MobileWorksheetViewer/MobileWorksheetViewer.module.css';
import { TouchControls } from './MobileWorksheetViewer/TouchControls';
import { MobileEditorToolbar } from './MobileWorksheetViewer/MobileEditorToolbar';
import { MobileExportPanel } from './MobileWorksheetViewer/MobileExportPanel';
import { WorksheetEditor } from './UniversalWorksheetViewer/WorksheetEditor';
import { PreviewPane } from './UniversalWorksheetViewer/PreviewPane';
import { useWorksheetState } from './UniversalWorksheetViewer/hooks/useWorksheetState';
import { useExportEngine } from './UniversalWorksheetViewer/hooks/useExportEngine';
import { useExportHistory } from './UniversalWorksheetViewer/hooks/useExportHistory';
import type { Worksheet, ExportFormat, WorksheetContentBlockType } from './UniversalWorksheetViewer/types/worksheet';

export interface MobileWorksheetViewerProps {
  /** Initial worksheet to load */
  initialWorksheet?: Partial<Worksheet>;
  /** Auto-save callback */
  onSave?: (worksheet: Worksheet) => void | Promise<void>;
  /** Auto-save debounce in ms (default: 3000) */
  autoSaveMs?: number;
}

/**
 * MobileWorksheetViewer
 *
 * Mobile-optimized worksheet viewer with:
 * - Touch gestures (swipe, pinch-zoom, long-press, double-tap)
 * - Collapsible bottom toolbar
 * - Full-screen editor mode
 * - Mobile export (native share + download)
 * - Pull-to-refresh
 */
export const MobileWorksheetViewer: React.FC<MobileWorksheetViewerProps> = ({
  initialWorksheet,
  onSave,
  autoSaveMs = 3000,
}) => {
  const ws = useWorksheetState(initialWorksheet);
  const exportEngine = useExportEngine();
  const exportHistory = useExportHistory();

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  // ── Auto-save ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoSaveMs || !ws.editorState.isDirty || !onSave) return;
    ws.setAutoSaving(true);
    const timer = setTimeout(async () => {
      try {
        await onSave(ws.worksheet);
        ws.markSaved();
      } catch {
        ws.setAutoSaving(false);
      }
    }, autoSaveMs);
    return () => clearTimeout(timer);
  }, [ws.editorState.isDirty, ws.worksheet, autoSaveMs, onSave]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gestures ───────────────────────────────────────────────────────────────

  const handlePinchZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(200, Math.max(50, prev + delta * 0.1)));
  }, []);

  const handlePullRefresh = useCallback(() => {
    ws.resetWorksheet();
  }, [ws]);

  const handleDoubleTap = useCallback((_x: number, _y: number) => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      await exportEngine.exportWorksheet(ws.worksheet, { ...ws.exportSettings, format });
      exportHistory.addEntry({
        worksheetId: ws.worksheet.metadata.id,
        worksheetTitle: ws.worksheet.metadata.title,
        format,
        settings: ws.exportSettings,
        status: 'done',
      });
      setShowExportPanel(false);
    },
    [exportEngine, ws.worksheet, ws.exportSettings, exportHistory],
  );

  // ── Add block ──────────────────────────────────────────────────────────────

  const handleAddBlock = useCallback(
    (type: WorksheetContentBlockType) => {
      ws.addBlock({ type, content: '' });
    },
    [ws],
  );

  // ── Save status ────────────────────────────────────────────────────────────

  const saveStatusText = ws.editorState.isAutoSaving
    ? 'Kaydediliyor...'
    : ws.editorState.isDirty
    ? 'Kaydedilmemiş'
    : ws.editorState.lastSavedAt
    ? `Kaydedildi ${new Date(ws.editorState.lastSavedAt).toLocaleTimeString('tr-TR')}`
    : '';

  const viewer = (
    <div className={`${styles.mobileViewer} ${isFullscreen ? styles.mobileFullscreen : ''}`}>
      {/* Header */}
      <div className={styles.mobileHeader}>
        <input
          className={styles.mobileTitle}
          value={ws.worksheet.metadata.title}
          onChange={(e) => ws.updateTitle(e.target.value)}
          placeholder="Başlık..."
          aria-label="Başlık"
        />
        <button
          className={styles.mobileHeaderBtn}
          onClick={() => setShowPreview((p) => !p)}
          aria-label={showPreview ? 'Editörü göster' : 'Önizleme'}
        >
          {showPreview ? '✏️' : '👁'}
        </button>
        <button
          className={styles.mobileHeaderBtn}
          onClick={() => setShowExportPanel(true)}
          aria-label="Dışa aktar"
        >
          ⬇
        </button>
      </div>

      {/* Save status */}
      {saveStatusText && (
        <div className={styles.mobileSaveStatus} aria-live="polite">
          {saveStatusText}
        </div>
      )}

      {/* Content */}
      <TouchControls
        className={styles.mobileContent}
        onPinchZoom={handlePinchZoom}
        onPullRefresh={handlePullRefresh}
        onDoubleTap={handleDoubleTap}
      >
        {showPreview ? (
          <PreviewPane
            worksheet={ws.worksheet}
            dyslexiaSettings={ws.dyslexiaSettings}
            zoom={zoom}
            isPrintMode={false}
          />
        ) : (
          <WorksheetEditor
            content={ws.worksheet.content}
            selectedBlockId={ws.editorState.selectedBlockId}
            onUpdateContent={ws.updateContent}
            onAddBlock={ws.addBlock}
            onUpdateBlock={ws.updateBlock}
            onRemoveBlock={ws.removeBlock}
            onMoveBlock={ws.moveBlock}
            onSelectBlock={ws.selectBlock}
          />
        )}
      </TouchControls>

      {/* Bottom toolbar */}
      <MobileEditorToolbar
        onAddBlock={handleAddBlock}
        onUndo={ws.undo}
        onRedo={ws.redo}
        onSave={() => {
            const result = onSave?.(ws.worksheet);
            void Promise.resolve(result).then(() => ws.markSaved());
          }}
        onExport={() => setShowExportPanel(true)}
        onPreview={() => setShowPreview((p) => !p)}
        canUndo={ws.canUndo}
        canRedo={ws.canRedo}
        isDirty={ws.editorState.isDirty}
      />

      {/* Export bottom sheet */}
      {showExportPanel && (
        <MobileExportPanel
          worksheetTitle={ws.worksheet.metadata.title}
          onExport={handleExport}
          isExporting={exportEngine.isExporting}
          onClose={() => setShowExportPanel(false)}
        />
      )}
    </div>
  );

  return viewer;
};

MobileWorksheetViewer.displayName = 'MobileWorksheetViewer';
