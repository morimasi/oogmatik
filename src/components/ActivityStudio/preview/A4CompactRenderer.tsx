import React from 'react';
import type { ContentBlock, ThemeConfig, CompactA4Config } from '@/types/activityStudio';

interface A4CompactRendererProps {
  title: string;
  blocks: ContentBlock[];
  pedagogicalNote: string;
  themeConfig: ThemeConfig | null;
  compactA4Config: CompactA4Config | null;
}

function getBlockLabel(type: ContentBlock['type']): string {
  switch (type) {
    case 'title': return '';
    case 'question': return 'Soru:';
    case 'explanation': return 'Açıklama:';
    case 'activity': return 'Etkinlik:';
    case 'resource': return 'Kaynak:';
    case 'spacing': return '';
    default: return '';
  }
}

function getBlockStyle(
  type: ContentBlock['type'],
  themeConfig: ThemeConfig | null,
  compactA4Config: CompactA4Config | null
): React.CSSProperties {
  const textColor = themeConfig?.textColor ?? '#1A1A2E';
  const accentColor = themeConfig?.accentColor ?? '#6366F1';
  const fontSize = compactA4Config?.fontSize ?? 12;
  const lineHeight = compactA4Config?.lineHeight ?? 1.8;

  const base: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    lineHeight,
    color: textColor,
    fontFamily: "'Lexend', sans-serif",
    marginBottom: '6px',
  };

  switch (type) {
    case 'title':
      return {
        ...base,
        fontSize: `${Math.max(fontSize + 2, 14)}pt`,
        fontWeight: 'bold',
        color: accentColor,
        lineHeight: 1.4,
        marginBottom: '10px',
        borderBottom: `2px solid ${accentColor}`,
        paddingBottom: '4px',
      };
    case 'question':
      return {
        ...base,
        fontWeight: '600',
        marginBottom: '4px',
        paddingLeft: '8px',
        borderLeft: `3px solid ${accentColor}`,
      };
    case 'explanation':
      return { ...base, fontStyle: 'italic', opacity: 0.85 };
    case 'activity':
      return { ...base, padding: '6px 8px', backgroundColor: `${accentColor}11`, borderRadius: '6px' };
    case 'spacing':
      return { height: `${(compactA4Config?.marginMM ?? 15) * 0.5}mm` };
    default:
      return base;
  }
}

/**
 * A4 kağıt boyutunda (210×297mm) kompakt etkinlik sayfası önizlemesi.
 * Tema token'ları + CompactA4Config uygulanır. Lexend font disleksi standardı.
 */
export const A4CompactRenderer = React.forwardRef<HTMLDivElement, A4CompactRendererProps>(
  function A4CompactRenderer({ title, blocks, pedagogicalNote, themeConfig, compactA4Config }, ref) {
    const bgPaper = themeConfig?.bgPaper ?? '#FFFDF7';
    const textColor = themeConfig?.textColor ?? '#1A1A2E';
    const marginMM = compactA4Config?.marginMM ?? 15;
    const fontSize = compactA4Config?.fontSize ?? 12;

    const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

    return (
      <div
        ref={ref}
        data-testid="a4-compact-renderer"
        style={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: bgPaper,
          padding: `${marginMM}mm`,
          boxSizing: 'border-box',
          fontFamily: "'Lexend', sans-serif",
          color: textColor,
          position: 'relative',
        }}
      >
        {/* Sayfa Başlığı */}
        <h1
          style={{
            fontSize: `${Math.max(fontSize + 4, 16)}pt`,
            fontWeight: 'bold',
            lineHeight: 1.4,
            marginBottom: '12px',
            color: themeConfig?.primaryColor ?? '#1F2937',
            fontFamily: "'Lexend', sans-serif",
          }}
        >
          {title || 'Etkinlik Başlığı'}
        </h1>

        {/* İçerik Blokları */}
        <div style={{ marginBottom: '20px' }}>
          {sortedBlocks.map((block) => {
            if (block.type === 'spacing') {
              return <div key={block.id} style={getBlockStyle(block.type, themeConfig, compactA4Config)} />;
            }

            const label = getBlockLabel(block.type);
            return (
              <div key={block.id} style={getBlockStyle(block.type, themeConfig, compactA4Config)}>
                {label && (
                  <span style={{ fontWeight: '700', marginRight: '4px' }}>{label}</span>
                )}
                {block.content}
              </div>
            );
          })}
        </div>

        {/* Pedagojik Not Footer */}
        {pedagogicalNote && (
          <div
            data-testid="a4-pedagogical-footer"
            style={{
              position: 'absolute',
              bottom: `${marginMM}mm`,
              left: `${marginMM}mm`,
              right: `${marginMM}mm`,
              borderTop: '1px solid #ddd',
              paddingTop: '4px',
              fontSize: '11pt',
              color: '#666',
              fontFamily: "'Lexend', sans-serif",
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: '600' }}>Pedagogik Not: </span>
            {pedagogicalNote}
          </div>
        )}
      </div>
    );
  }
);
