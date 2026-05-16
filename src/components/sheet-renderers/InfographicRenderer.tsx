import React from 'react';
import type { ContentBlock, ThemeConfig, CompactA4Config } from '@/types/activityStudio';

interface InfographicRendererProps {
  data: any;
  settings?: any;
}

function getBlockLabel(type: string): string {
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
  type: string,
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
    marginBottom: '8px',
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
      return { ...base, padding: '10px 14px', backgroundColor: `${accentColor}11`, borderRadius: '12px', border: `1px solid ${accentColor}22` };
    case 'spacing':
      return { height: `${(compactA4Config?.marginMM ?? 15) * 0.5}mm` };
    default:
      return base;
  }
}

/**
 * InfographicRenderer - Handles modular output from ActivityStudio
 */
export const InfographicRenderer: React.FC<InfographicRendererProps> = ({ data }) => {
  // Extract data from standard wrapper
  const item = Array.isArray(data) ? data[0] : (data.items ? data.items[0] : data);
  const wizardData = item.data || item.wizardData || item;
  
  const title = wizardData.title || wizardData.goal?.title || 'Etkinlik';
  const blocks = wizardData.blocks || [];
  const pedagogicalNote = wizardData.goal?.pedagogicalNote || '';
  const themeConfig = wizardData.themeConfig || null;
  const compactA4Config = wizardData.compactA4Config || null;

  const sortedBlocks = [...blocks].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <div className="infographic-render-container w-full" style={{ fontFamily: "'Lexend', sans-serif" }}>
       {/* Sayfa Başlığı */}
       <h1
          style={{
            fontSize: `18pt`,
            fontWeight: 'bold',
            lineHeight: 1.4,
            marginBottom: '16px',
            color: themeConfig?.primaryColor ?? '#1F2937',
            borderBottom: '4px solid #f3f4f6',
            paddingBottom: '8px'
          }}
        >
          {title}
        </h1>

        {/* İçerik Blokları */}
        <div style={{ marginBottom: '24px' }}>
          {sortedBlocks.map((block: any) => {
            if (block.type === 'spacing') {
              return <div key={block.id} style={getBlockStyle(block.type, themeConfig, compactA4Config)} />;
            }

            const label = getBlockLabel(block.type);
            return (
              <div key={block.id} style={getBlockStyle(block.type, themeConfig, compactA4Config)}>
                {label && (
                  <span style={{ fontWeight: '700', marginRight: '6px', color: themeConfig?.accentColor ?? '#6366F1' }}>{label}</span>
                )}
                {block.content}
              </div>
            );
          })}
        </div>

        {/* Pedagojik Not Footer */}
        {pedagogicalNote && (
          <div
            style={{
              marginTop: '40px',
              borderTop: '2px solid #f3f4f6',
              paddingTop: '12px',
              fontSize: '10pt',
              color: '#666',
              fontStyle: 'italic',
              textTransform: 'none'
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '8pt', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.1em' }}>Klinik & Pedagojik Not</span>
            {pedagogicalNote}
          </div>
        )}
    </div>
  );
};
