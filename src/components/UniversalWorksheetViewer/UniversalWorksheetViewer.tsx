import React, { useCallback, useEffect, useState, useRef } from 'react';
import { WorksheetEditor } from './WorksheetEditor';
import { PreviewPane } from './PreviewPane';
import { ExportPanel } from './ExportPanel';
import { TemplateSelector } from './TemplateSelector';
import { DyslexiaControls } from './DyslexiaControls';
import { useWorksheetState } from './hooks/useWorksheetState';
import { useExportEngine } from './hooks/useExportEngine';
import { useTemplateManager } from './hooks/useTemplateManager';
import styles from './UniversalWorksheetViewer.module.css';

export interface UniversalWorksheetViewerProps {
  /** Optional initial document title */
  initialTitle?: string;
  /** Whether to show the export panel by default */
  showExportPanel?: boolean;
  /** Whether to show dyslexia controls by default */
  showDyslexiaControls?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Aria label override */
  ariaLabel?: string;
}

type PanelId = 'export' | 'dyslexia' | 'templates' | null;

export function UniversalWorksheetViewer({
  initialTitle: _initialTitle,
  showExportPanel = false,
  showDyslexiaControls = false,
  className,
  ariaLabel = 'Evrensel Çalışma Sayfası Görüntüleyici',
}: UniversalWorksheetViewerProps) {
  const worksheetState = useWorksheetState();
  const { state, undo, redo, canUndo, canRedo, save, updateEditorSettings, updateDyslexiaSettings, updateExportSettings, setDocument } = worksheetState;

  const exportEngine = useExportEngine({
    document: state.document,
    defaultSettings: state.exportSettings,
  });

  const templateManager = useTemplateManager({
    currentDocument: state.document,
    onLoadTemplate: setDocument,
  });

  const [activePanel, setActivePanel] = useState<PanelId>(
    showExportPanel ? 'export' : showDyslexiaControls ? 'dyslexia' : null,
  );
  const [isPrintView, setIsPrintView] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (!ctrlOrMeta) return;

      switch (e.key.toLowerCase()) {
        case 'z':
          if (!e.shiftKey) { e.preventDefault(); undo(); }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 's':
          e.preventDefault();
          save();
          break;
        case 'p':
          e.preventDefault();
          setIsPrintView((v) => !v);
          break;
        case 'e':
          e.preventDefault();
          setActivePanel((p) => (p === 'export' ? null : 'export'));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, save]);

  // ── Panel toggle helper ───────────────────────────────────────────────────
  const togglePanel = useCallback((id: PanelId) => {
    setActivePanel((current) => (current === id ? null : id));
  }, []);

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isPrintView) {
    return (
      <div className={styles.printView} aria-label="Yazdırma görünümü">
        <div className={styles.printViewToolbar}>
          <button
            className={styles.printViewBtn}
            onClick={handlePrint}
            aria-label="Yazdır"
          >
            🖨️ Yazdır
          </button>
          <button
            className={styles.printViewBtn}
            onClick={() => setIsPrintView(false)}
            aria-label="Editöre geri dön"
          >
            ← Editöre Geri Dön
          </button>
        </div>
        <PreviewPane
          document={state.document}
          dyslexiaSettings={state.dyslexiaSettings}
          editorSettings={state.editorSettings}
          onZoomChange={(z) => updateEditorSettings({ zoom: z as typeof state.editorSettings.zoom })}
        />
      </div>
    );
  }

  return (
    <div
      ref={mainRef}
      className={`${styles.uwvRoot} ${className ?? ''}`}
      aria-label={ariaLabel}
      role="application"
    >
      {/* ── Top toolbar ───────────────────────────────────────────────── */}
      <header className={styles.uwvToolbar} role="toolbar" aria-label="Araç çubuğu">
        {/* Undo / Redo */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={undo}
            disabled={!canUndo}
            aria-label="Geri Al (Ctrl+Z)"
            title="Geri Al (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={redo}
            disabled={!canRedo}
            aria-label="İleri Al (Ctrl+Y)"
            title="İleri Al (Ctrl+Y)"
          >
            ↪
          </button>
        </div>

        <span className={styles.toolbarSep} aria-hidden="true" />

        {/* Save */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={save}
            aria-label="Kaydet (Ctrl+S)"
            title="Kaydet (Ctrl+S)"
            disabled={state.isSaving}
          >
            {state.isSaving ? '⏳' : '💾'} {state.isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        <span className={styles.toolbarSep} aria-hidden="true" />

        {/* Templates */}
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolbarBtn} ${activePanel === 'templates' ? styles.toolbarBtnActive : ''}`}
            onClick={() => togglePanel('templates')}
            aria-label="Şablon seç"
            aria-pressed={activePanel === 'templates'}
            title="Şablonlar"
          >
            📋 Şablonlar
          </button>
        </div>

        <span className={styles.toolbarSep} aria-hidden="true" />

        {/* Export */}
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolbarBtn} ${activePanel === 'export' ? styles.toolbarBtnActive : ''}`}
            onClick={() => togglePanel('export')}
            aria-label="Dışa aktar paneli (Ctrl+E)"
            aria-pressed={activePanel === 'export'}
            title="Dışa Aktar (Ctrl+E)"
          >
            📤 Dışa Aktar
          </button>
        </div>

        <span className={styles.toolbarSep} aria-hidden="true" />

        {/* Dyslexia */}
        <div className={styles.toolbarGroup}>
          <button
            className={`${styles.toolbarBtn} ${activePanel === 'dyslexia' ? styles.toolbarBtnActive : ''}`}
            onClick={() => togglePanel('dyslexia')}
            aria-label="Erişilebilirlik ayarları"
            aria-pressed={activePanel === 'dyslexia'}
            title="Erişilebilirlik"
          >
            ♿ Erişilebilirlik
          </button>
        </div>

        <span className={styles.toolbarSep} aria-hidden="true" />

        {/* Print */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={() => setIsPrintView(true)}
            aria-label="Yazdırma görünümü (Ctrl+P)"
            title="Yazdırma Görünümü (Ctrl+P)"
          >
            🖨️ Yazdır
          </button>
        </div>

        {/* Dirty indicator */}
        <div className={styles.toolbarStatus} role="status" aria-live="polite">
          {state.isDirty && !state.isSaving && (
            <span className={styles.unsavedBadge} title="Kaydedilmemiş değişiklikler">●</span>
          )}
        </div>
      </header>

      {/* ── Main layout ───────────────────────────────────────────────── */}
      <div className={styles.uwvBody}>
        {/* Editor pane */}
        <WorksheetEditor worksheetState={worksheetState} />

        {/* Preview pane */}
        <PreviewPane
          document={state.document}
          dyslexiaSettings={state.dyslexiaSettings}
          editorSettings={state.editorSettings}
          onZoomChange={(z) => updateEditorSettings({ zoom: z as typeof state.editorSettings.zoom })}
        />

        {/* Side panels */}
        {activePanel === 'export' && (
          <ExportPanel
            exportEngine={exportEngine}
            exportSettings={state.exportSettings}
            onSettingsChange={updateExportSettings}
          />
        )}
        {activePanel === 'dyslexia' && (
          <DyslexiaControls
            settings={state.dyslexiaSettings}
            onChange={updateDyslexiaSettings}
          />
        )}
      </div>

      {/* Template selector modal */}
      {activePanel === 'templates' && (
        <TemplateSelector
          templateManager={templateManager}
          onClose={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}
