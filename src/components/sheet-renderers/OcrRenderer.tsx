import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { GraphicRenderer } from '../MatSinavStudyosu/components/GraphicRenderer';

type OcrData = {
  content?: string;
  grafikVeri?: Record<string, unknown>;
  title?: string;
  pedagogicalNote?: string;
  targetSkills?: string[];
  /** Sütun sayısı (blueprint'ten alınır, varsayılan 1) */
  columns?: number;
  /** Önerilen font boyutu (pt) */
  estimatedFontSize?: number;
};

type Props = {
  data: OcrData;
};

// ─── İzin verilen HTML etiketleri ─────────────────────────────────────────
const ALLOWED_TAGS = [
  'div', 'p', 'span', 'strong', 'em', 'u', 'b', 'i', 'br',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'header', 'footer', 'aside',
  'dl', 'dt', 'dd', 'pre', 'blockquote', 'hr', 'small',
] as const;

const ALLOWED_ATTRS = ['class', 'style', 'data-type', 'colspan', 'rowspan'];

// ─── İşaretçi tabanlı render ────────────────────────────────────────────
// AI içeriğinde [GRAFIK:tip] işaretçisi varsa GraphicRenderer ile render edilir
// [KELIME_BANKASI:k1,k2,k3] → styled word bank kutusu
// [TABLO:3x4] → basit tablo placeholder (tablo zaten HTML içinde olmalı)

const MARKER_GRAFIK_RE = /\[GRAFIK:([^\]]+)\]/g;
const MARKER_KELIME_BANKASI_RE = /\[KELIME_BANKASI:([^\]]+)\]/g;

/**
 * Marker'lara göre HTML içeriğini parçalara böler.
 * Her parça ya düz HTML string, ya GrafikMarker, ya WordBankMarker olur.
 */
type ContentPart =
  | { kind: 'html'; html: string }
  | { kind: 'grafik'; tip: string }
  | { kind: 'wordbank'; words: string[] };

const parseContentParts = (html: string): ContentPart[] => {
  const parts: ContentPart[] = [];
  let last = 0;

  // Grafik işaretçilerini bul
  const allMatches: Array<{ index: number; length: number; part: ContentPart }> = [];

  for (const m of html.matchAll(MARKER_GRAFIK_RE)) {
    allMatches.push({
      index: m.index ?? 0,
      length: m[0].length,
      part: { kind: 'grafik', tip: m[1] },
    });
  }
  for (const m of html.matchAll(MARKER_KELIME_BANKASI_RE)) {
    allMatches.push({
      index: m.index ?? 0,
      length: m[0].length,
      part: { kind: 'wordbank', words: m[1].split(',').map(w => w.trim()).filter(Boolean) },
    });
  }

  allMatches.sort((a, b) => a.index - b.index);

  for (const match of allMatches) {
    if (match.index > last) {
      parts.push({ kind: 'html', html: html.slice(last, match.index) });
    }
    parts.push(match.part);
    last = match.index + match.length;
  }

  if (last < html.length) {
    parts.push({ kind: 'html', html: html.slice(last) });
  }

  if (parts.length === 0) {
    parts.push({ kind: 'html', html });
  }

  return parts;
};

// ─── Ana Bileşen ─────────────────────────────────────────────────────────

export const OcrRenderer: React.FC<Props> = ({ data }) => {
  const columns = data.columns ?? 1;
  const fontSize = data.estimatedFontSize ?? 11;

  const sanitizedContent = useMemo(
    () =>
      data.content
        ? DOMPurify.sanitize(String(data.content), {
            ALLOWED_TAGS: [...ALLOWED_TAGS],
            ALLOWED_ATTR: ALLOWED_ATTRS,
          })
        : '',
    [data.content]
  );

  const contentParts = useMemo(
    () => (sanitizedContent ? parseContentParts(sanitizedContent) : []),
    [sanitizedContent]
  );

  // Kompakt print-optimized stiller
  const sheetStyle: React.CSSProperties = {
    fontFamily: "'Lexend', sans-serif",
    fontSize: `${fontSize}px`,
    lineHeight: '1.3',
    padding: '8mm 10mm',
    boxSizing: 'border-box',
    width: '100%',
  };

  const contentWrapStyle: React.CSSProperties =
    columns > 1
      ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '8px',
          alignItems: 'start',
        }
      : {};

  return (
    <div className="ocr-content-sheet" style={sheetStyle}>
      {/* Başlık */}
      {data.title && (
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 900,
            marginBottom: '6px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '2px solid #333',
            paddingBottom: '4px',
          }}
        >
          {data.title}
        </h2>
      )}

      {/* Yerleşik grafik verisi */}
      {data.grafikVeri && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '4px 0',
          }}
          className="print:my-1"
        >
          <GraphicRenderer grafik={data.grafikVeri as any} />
        </div>
      )}

      {/* Ana içerik (marker tabanlı + HTML) */}
      {contentParts.length > 0 && (
        <div style={contentWrapStyle}>
          {contentParts.map((part, i) => {
            if (part.kind === 'html') {
              return (
                <div
                  key={i}
                  className="ocr-html-block"
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: part.html }}
                />
              );
            }
            if (part.kind === 'grafik') {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <GraphicRenderer grafik={{ tip: part.tip } as any} />
                </div>
              );
            }
            if (part.kind === 'wordbank') {
              return (
                <div
                  key={i}
                  style={{
                    border: '2px solid #333',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    margin: '4px 0',
                    fontSize: `${fontSize}px`,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    KELİME BANKASI
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {part.words.map((w, wi) => (
                      <span
                        key={wi}
                        style={{
                          border: '1px solid #666',
                          borderRadius: '3px',
                          padding: '1px 5px',
                          fontSize: `${fontSize}px`,
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Pedagojik not (sadece ekranda, baskıda gizli) */}
      {data.pedagogicalNote && (
        <div
          className="print:hidden"
          style={{
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '6px',
          }}
        >
          <p style={{ fontSize: '10px', color: '#3730a3', margin: 0 }}>
            <strong>Öğretmen Notu:</strong> {data.pedagogicalNote}
          </p>
        </div>
      )}

      {/* Kompakt print CSS */}
      <style>{`
        .ocr-content-sheet p { margin-bottom: 4px; }
        .ocr-content-sheet li { margin-bottom: 3px; }
        .ocr-content-sheet table { border-collapse: collapse; width: 100%; }
        .ocr-content-sheet td, .ocr-content-sheet th {
          border: 1px solid #999; padding: 3px 5px; font-size: 11px;
        }
        .ocr-content-sheet th { font-weight: bold; background: #f5f5f5; }
        .ocr-html-block p { margin-bottom: 4px; }
        .ocr-html-block li { margin-bottom: 3px; }
        @media print {
          .ocr-content-sheet { padding: 8mm 10mm; }
          .print\\:hidden { display: none !important; }
          .print\\:my-1 { margin-top: 4px; margin-bottom: 4px; }
        }
      `}</style>
    </div>
  );
};

export default OcrRenderer;
