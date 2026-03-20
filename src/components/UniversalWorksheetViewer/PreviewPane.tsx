import React, { useRef } from 'react';
import type { WorksheetDocument, DyslexiaSettings, EditorSettings } from './types/worksheet';
import styles from './UniversalWorksheetViewer.module.css';

interface PreviewPaneProps {
  document: WorksheetDocument;
  dyslexiaSettings: DyslexiaSettings;
  editorSettings: EditorSettings;
  onZoomChange: (zoom: number) => void;
}

const ZOOM_OPTIONS = [50, 75, 100, 125, 150, 200] as const;

export function PreviewPane({ document: doc, dyslexiaSettings, editorSettings, onZoomChange }: PreviewPaneProps) {
  const { content, meta } = doc;
  const printRef = useRef<HTMLDivElement>(null);

  const fontFamilyStyle =
    dyslexiaSettings.fontFamily === 'default'
      ? 'inherit'
      : dyslexiaSettings.fontFamily === 'OpenDyslexic'
        ? '"OpenDyslexic", sans-serif'
        : '"Arial", "Helvetica", sans-serif';

  const previewStyle: React.CSSProperties = {
    fontFamily: fontFamilyStyle,
    lineHeight: dyslexiaSettings.lineHeight,
    letterSpacing: `${dyslexiaSettings.letterSpacing}px`,
    backgroundColor: dyslexiaSettings.backgroundColor,
    color: dyslexiaSettings.highContrast ? '#000000' : 'inherit',
    transform: `scale(${editorSettings.zoom / 100})`,
    transformOrigin: 'top center',
  };

  return (
    <section className={styles.previewPane} aria-label="Önizleme">
      <header className={styles.previewHeader}>
        <span className={styles.previewTitle}>Önizleme</span>
        <div className={styles.zoomControls} role="group" aria-label="Zoom kontrolleri">
          <button
            className={styles.zoomBtn}
            onClick={() => {
              const idx = ZOOM_OPTIONS.indexOf(editorSettings.zoom as typeof ZOOM_OPTIONS[number]);
              if (idx > 0) onZoomChange(ZOOM_OPTIONS[idx - 1]);
            }}
            aria-label="Uzaklaştır"
            disabled={editorSettings.zoom <= 50}
            title="Uzaklaştır"
          >
            −
          </button>
          <select
            className={styles.zoomSelect}
            value={editorSettings.zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            aria-label="Zoom seviyesi"
          >
            {ZOOM_OPTIONS.map((z) => (
              <option key={z} value={z}>
                {z}%
              </option>
            ))}
          </select>
          <button
            className={styles.zoomBtn}
            onClick={() => {
              const idx = ZOOM_OPTIONS.indexOf(editorSettings.zoom as typeof ZOOM_OPTIONS[number]);
              if (idx < ZOOM_OPTIONS.length - 1) onZoomChange(ZOOM_OPTIONS[idx + 1]);
            }}
            aria-label="Yaklaştır"
            disabled={editorSettings.zoom >= 200}
            title="Yaklaştır"
          >
            +
          </button>
        </div>
      </header>

      <div className={styles.previewScrollContainer}>
        <div
          className={`${styles.previewPage} ${dyslexiaSettings.highContrast ? styles.highContrast : ''}`}
          style={previewStyle}
          ref={printRef}
          aria-label="Çalışma sayfası önizlemesi"
        >
          {/* Student info row */}
          {content.studentInfoVisible && (
            <div className={styles.previewStudentInfo} aria-label="Öğrenci bilgisi">
              <span>Ad Soyad: ___________________________</span>
              <span>Tarih: _______________</span>
            </div>
          )}

          {/* Title */}
          {content.titleVisible && meta.title && (
            <h1 className={styles.previewDocTitle}>{meta.title}</h1>
          )}

          {/* Meta: subject + grade */}
          {(meta.subject || meta.grade) && (
            <div className={styles.previewMeta}>
              {meta.subject && <span>{meta.subject}</span>}
              {meta.subject && meta.grade && <span className={styles.previewMetaSep}>·</span>}
              {meta.grade && <span>{meta.grade}</span>}
            </div>
          )}

          {/* Instruction */}
          {content.instructionText && (
            <p className={styles.previewInstruction}>{content.instructionText}</p>
          )}

          {/* Content blocks */}
          <div className={styles.previewBlocks}>
            {content.blocks.map((block) => {
              switch (block.type) {
                case 'heading': {
                  const Tag = (`h${block.level ?? 2}`) as 'h1' | 'h2' | 'h3';
                  return (
                    <Tag key={block.id} className={styles.previewHeading}>
                      {block.content}
                    </Tag>
                  );
                }
                case 'text':
                  return (
                    <p
                      key={block.id}
                      className={styles.previewText}
                      style={{
                        fontWeight: block.bold ? 'bold' : undefined,
                        fontStyle: block.italic ? 'italic' : undefined,
                        textDecoration: block.underline ? 'underline' : undefined,
                      }}
                    >
                      {block.content}
                    </p>
                  );
                case 'blank':
                  return (
                    <div key={block.id} className={styles.previewBlank}>
                      {block.label && <span className={styles.previewBlankLabel}>{block.label}:</span>}
                      {Array.from({ length: block.lines }).map((_, i) => (
                        <div key={i} className={styles.previewBlankLine} aria-hidden="true" />
                      ))}
                    </div>
                  );
                case 'divider':
                  return <hr key={block.id} className={styles.previewDivider} aria-hidden="true" />;
                case 'image':
                  return (
                    <div key={block.id} className={styles.previewImageBlock}>
                      <img src={block.src} alt={block.alt} style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          {/* Footer */}
          {content.footerText && (
            <footer className={styles.previewFooter}>{content.footerText}</footer>
          )}

          {/* Page break indicator */}
          {editorSettings.showPageBreaks && (
            <div className={styles.pageBreakIndicator} aria-hidden="true">
              ─── Sayfa Sonu ───
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
