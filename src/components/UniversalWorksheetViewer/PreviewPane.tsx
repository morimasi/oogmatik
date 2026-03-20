import React from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { Worksheet, DyslexiaSettings } from './types/worksheet';

interface PreviewPaneProps {
  worksheet: Worksheet;
  dyslexiaSettings: DyslexiaSettings;
  zoom: number;
  isPrintMode: boolean;
}

const fontFamilyMap: Record<string, string> = {
  default: 'inherit',
  OpenDyslexic: '"OpenDyslexic", sans-serif',
  ReadingFont: '"Lexend", "Atkinson Hyperlegible", sans-serif',
};

const contrastStyles: Record<string, React.CSSProperties> = {
  normal: {},
  high: { filter: 'contrast(1.5)' },
  inverted: { filter: 'invert(1)' },
};

export const PreviewPane: React.FC<PreviewPaneProps> = React.memo(
  ({ worksheet, dyslexiaSettings, zoom, isPrintMode }) => {
    const contentStyle: React.CSSProperties = {
      fontFamily: fontFamilyMap[dyslexiaSettings.fontFamily] ?? 'inherit',
      lineHeight: dyslexiaSettings.lineHeight,
      letterSpacing: `${dyslexiaSettings.letterSpacing}px`,
      fontSize: `${dyslexiaSettings.fontSize}px`,
      backgroundColor: dyslexiaSettings.backgroundColor,
      ...contrastStyles[dyslexiaSettings.contrastMode],
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top center',
    };

    const renderBlock = (block: (typeof worksheet.content.blocks)[0]) => {
      switch (block.type) {
        case 'heading': {
          const level = block.headingLevel ?? 2;
          const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          return (
            <Tag key={block.id} className={styles[`previewH${level}`]}>
              {block.content}
            </Tag>
          );
        }
        case 'text':
          return (
            <p key={block.id} className={styles.previewText}>
              {block.content}
            </p>
          );
        case 'math':
          return (
            <div key={block.id} className={styles.previewMath}>
              <code>{block.mathRaw ?? block.content}</code>
            </div>
          );
        case 'divider':
          return <hr key={block.id} className={styles.previewDivider} />;
        case 'list':
          return (
            <ul key={block.id} className={styles.previewList}>
              {(block.listItems ?? []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          );
        case 'image':
          return block.imageUrl ? (
            <figure key={block.id} className={styles.previewImage}>
              <img src={block.imageUrl} alt={block.content || 'Görsel'} />
            </figure>
          ) : null;
        case 'table':
          return (
            <table key={block.id} className={styles.previewTable}>
              <tbody>
                {(block.tableData ?? []).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={`${styles.previewPane} ${isPrintMode ? styles.printMode : ''}`}
        role="region"
        aria-label="Çalışma kağıdı önizlemesi"
      >
        <div
          id="worksheet-preview-root"
          className={styles.previewPage}
          style={contentStyle}
        >
          <h1 className={styles.previewTitle}>{worksheet.metadata.title}</h1>
          {worksheet.metadata.description && (
            <p className={styles.previewDescription}>{worksheet.metadata.description}</p>
          )}
          <div className={styles.previewContent}>
            {worksheet.content.blocks.map(renderBlock)}
          </div>
          <div className={styles.previewMeta}>
            {worksheet.metadata.author && (
              <span>Hazırlayan: {worksheet.metadata.author}</span>
            )}
            {worksheet.metadata.grade && <span>Sınıf: {worksheet.metadata.grade}</span>}
          </div>
        </div>
      </div>
    );
  },
);

PreviewPane.displayName = 'PreviewPane';
