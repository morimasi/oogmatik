import React, { useCallback, useEffect } from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import { WorksheetEditor } from './WorksheetEditor';
import { PreviewPane } from './PreviewPane';
import { ExportPanel } from './ExportPanel';
import { TemplateSelector } from './TemplateSelector';
import { DyslexiaControls } from './DyslexiaControls';
import { useWorksheetState } from './hooks/useWorksheetState';
import { useExportEngine } from './hooks/useExportEngine';
import { useTemplateManager } from './hooks/useTemplateManager';
import type { Worksheet, WorksheetTemplate } from './types/worksheet';

export interface UniversalWorksheetViewerProps {
  /** Initial worksheet to load. Omit to start with a blank worksheet. */
  initialWorksheet?: Partial<Worksheet>;
  /** Called whenever the worksheet is auto-saved or manually saved. */
  onSave?: (worksheet: Worksheet) => void | Promise<void>;
  /** Auto-save debounce in milliseconds (default: 2000). Set 0 to disable. */
  autoSaveMs?: number;
  /** If true, show the preview pane side-by-side by default */
  defaultShowPreview?: boolean;
}

/**
 * UniversalWorksheetViewer
 *
 * Full-featured worksheet viewer and editor with:
 * - Block-based editing (text, heading, math, image, list, divider, table)
 * - Live preview with dyslexia-friendly options
 * - Multi-format export (PDF, PNG, JSON, DOCX/TXT)
 * - Template library (built-in + custom)
 * - Advanced accessibility controls (WCAG AA)
 * - Keyboard shortcuts (Ctrl+Z/Y, Ctrl+P, Ctrl+S, Ctrl+E)
 * - Undo / redo stack
 * - Auto-save with configurable debounce
 */
export const UniversalWorksheetViewer: React.FC<UniversalWorksheetViewerProps> = ({
  initialWorksheet,
  onSave,
  autoSaveMs = 2000,
  defaultShowPreview = false,
}) => {
  const ws = useWorksheetState(initialWorksheet);
  const exportEngine = useExportEngine();
  const templateMgr = useTemplateManager();

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

  // ── Default preview visibility ─────────────────────────────────────────────

  useEffect(() => {
    if (defaultShowPreview && !ws.editorState.showPreview) {
      ws.togglePreview();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) ws.redo();
          else ws.undo();
          break;
        case 'y':
          e.preventDefault();
          ws.redo();
          break;
        case 's':
          e.preventDefault();
          if (onSave) {
            ws.setAutoSaving(true);
            void Promise.resolve(onSave(ws.worksheet)).then(() => ws.markSaved()).catch(() => ws.setAutoSaving(false));
          }
          break;
        case 'p':
          e.preventDefault();
          ws.togglePrintMode();
          break;
        case 'e':
          e.preventDefault();
          ws.toggleExportPanel();
          break;
      }
    },
    [ws, onSave],
  );

  // ── Template apply ─────────────────────────────────────────────────────────

  const handleApplyTemplate = useCallback(
    (tpl: WorksheetTemplate) => {
      ws.updateContent(
        { blocks: tpl.content.blocks.map((b) => ({ ...b, id: `${b.id}-${Date.now()}` })) },
        `Şablon uygulandı: ${tpl.name}`,
      );
      ws.toggleTemplateSelector();
    },
    [ws],
  );

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    exportEngine.exportWorksheet(ws.worksheet, ws.exportSettings);
  }, [exportEngine, ws.worksheet, ws.exportSettings]);

  // ── Save status text ───────────────────────────────────────────────────────

  const saveStatusText = ws.editorState.isAutoSaving
    ? 'Kaydediliyor...'
    : ws.editorState.isDirty
    ? 'Kaydedilmemiş değişiklikler'
    : ws.editorState.lastSavedAt
    ? `Kaydedildi ${new Date(ws.editorState.lastSavedAt).toLocaleTimeString('tr-TR')}`
    : '';

  // ── Determine which side panel to show ────────────────────────────────────

  const activeSidePanel: 'export' | 'template' | 'dyslexia' | null =
    ws.editorState.showExportPanel
      ? 'export'
      : ws.editorState.showTemplateSelector
      ? 'template'
      : ws.editorState.showDyslexiaControls
      ? 'dyslexia'
      : null;

  // ── Print mode overlay ─────────────────────────────────────────────────────

  if (ws.editorState.isPrintMode) {
    return (
      <div className={styles.printOverlay} role="dialog" aria-label="Yazdırma görünümü">
        <button
          className={styles.printOverlayClose}
          onClick={ws.togglePrintMode}
          aria-label="Yazdırma görünümünü kapat"
        >
          ✕ Kapat
        </button>
        <PreviewPane
          worksheet={ws.worksheet}
          dyslexiaSettings={ws.dyslexiaSettings}
          zoom={100}
          isPrintMode
        />
      </div>
    );
  }

  return (
    <div
      className={styles.viewer}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Çalışma kağıdı editörü"
    >
      {/* ── Toolbar ── */}
      <div className={styles.toolbar} role="toolbar" aria-label="Düzenleyici araç çubuğu">
        {/* Title */}
        <div className={styles.toolbarTitle}>
          <input
            className={styles.toolbarTitleInput}
            value={ws.worksheet.metadata.title}
            onChange={(e) => ws.updateTitle(e.target.value)}
            aria-label="Çalışma kağıdı başlığı"
            placeholder="Başlık..."
          />
        </div>

        {/* Undo/Redo */}
        <button
          className={styles.toolbarBtn}
          onClick={ws.undo}
          disabled={!ws.canUndo}
          aria-label="Geri al (Ctrl+Z)"
          title="Geri al (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          className={styles.toolbarBtn}
          onClick={ws.redo}
          disabled={!ws.canRedo}
          aria-label="Yeniden yap (Ctrl+Y)"
          title="Yeniden yap (Ctrl+Y)"
        >
          ↪
        </button>

        <span className={styles.toolbarSep} />

        {/* Preview */}
        <button
          className={`${styles.toolbarBtn} ${ws.editorState.showPreview ? styles.toolbarBtnActive : ''}`}
          onClick={ws.togglePreview}
          aria-label="Önizlemeyi aç/kapat"
          aria-pressed={ws.editorState.showPreview}
          title="Önizleme"
        >
          👁 <span>Önizleme</span>
        </button>

        {/* Print */}
        <button
          className={styles.toolbarBtn}
          onClick={ws.togglePrintMode}
          aria-label="Yazdırma görünümü (Ctrl+P)"
          title="Yazdır (Ctrl+P)"
        >
          🖨 <span>Yazdır</span>
        </button>

        <span className={styles.toolbarSep} />

        {/* Templates */}
        <button
          className={`${styles.toolbarBtn} ${ws.editorState.showTemplateSelector ? styles.toolbarBtnActive : ''}`}
          onClick={ws.toggleTemplateSelector}
          aria-label="Şablon seç"
          aria-pressed={ws.editorState.showTemplateSelector}
          title="Şablonlar"
        >
          📋 <span>Şablon</span>
        </button>

        {/* Accessibility */}
        <button
          className={`${styles.toolbarBtn} ${ws.editorState.showDyslexiaControls ? styles.toolbarBtnActive : ''}`}
          onClick={ws.toggleDyslexiaControls}
          aria-label="Erişilebilirlik ayarları"
          aria-pressed={ws.editorState.showDyslexiaControls}
          title="Erişilebilirlik"
        >
          ♿ <span>Erişilebilirlik</span>
        </button>

        {/* Export */}
        <button
          className={`${styles.toolbarBtn} ${ws.editorState.showExportPanel ? styles.toolbarBtnActive : ''} ${styles.toolbarBtnPrimary}`}
          onClick={ws.toggleExportPanel}
          aria-label="Dışa aktarma seçenekleri (Ctrl+E)"
          aria-pressed={ws.editorState.showExportPanel}
          title="Dışa aktar (Ctrl+E)"
        >
          ⬇ <span>Dışa Aktar</span>
        </button>

        {/* Save status */}
        {saveStatusText && (
          <span className={styles.saveStatus} aria-live="polite">
            {saveStatusText}
          </span>
        )}
      </div>

      {/* ── Main area ── */}
      <div className={styles.main}>
        {/* Editor column */}
        <div className={styles.editorCol}>
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
        </div>

        {/* Preview column */}
        {ws.editorState.showPreview && (
          <div className={styles.previewCol}>
            <PreviewPane
              worksheet={ws.worksheet}
              dyslexiaSettings={ws.dyslexiaSettings}
              zoom={ws.editorState.zoom}
              isPrintMode={false}
            />
          </div>
        )}

        {/* Side panel */}
        {activeSidePanel && (
          <div className={styles.sidePanel} role="complementary">
            {activeSidePanel === 'export' && (
              <ExportPanel
                settings={ws.exportSettings}
                jobs={exportEngine.jobs}
                isExporting={exportEngine.isExporting}
                onUpdateSettings={ws.updateExportSettings}
                onExport={handleExport}
                onCancel={exportEngine.cancelExport}
                onClearJobs={exportEngine.clearJobs}
              />
            )}
            {activeSidePanel === 'template' && (
              <TemplateSelector
                templates={templateMgr.filteredTemplates}
                selectedCategory={templateMgr.selectedCategory}
                onSelectCategory={templateMgr.setSelectedCategory}
                onApplyTemplate={handleApplyTemplate}
                onDeleteTemplate={templateMgr.deleteCustomTemplate}
              />
            )}
            {activeSidePanel === 'dyslexia' && (
              <DyslexiaControls
                settings={ws.dyslexiaSettings}
                onUpdate={ws.updateDyslexiaSettings}
                onReset={ws.resetDyslexiaSettings}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

UniversalWorksheetViewer.displayName = 'UniversalWorksheetViewer';
