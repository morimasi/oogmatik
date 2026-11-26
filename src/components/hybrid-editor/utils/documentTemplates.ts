import type React from 'react';
import {
  A4_HEIGHT,
  A4_WIDTH,
  DEFAULT_MARGINS,
  DEFAULT_VECTOR_STYLE,
  WHITEBOARD_HEIGHT,
  WHITEBOARD_WIDTH,
  createEmptyPage,
  emptySnapshot,
  type BackgroundPattern,
  type HybridDocumentSchema,
} from '../types/editor.types';

/**
 * Hibrit Belge & Vektör Stüdyosu — Hazır Eğitim Şablonları & Kağıt Desenleri.
 *
 * Tüm şablonlar Lexend font standardına ve MEB / Özel Eğitim ilkelerine
 * (tanı koyucu dil olmadan, güven inşası odaklı) uygun tasarlanmıştır.
 */

export interface HybridTemplate {
  id: string;
  title: string;
  description: string;
  mode: 'document' | 'whiteboard';
  build: () => HybridDocumentSchema;
}

const newDocId = (): string => `doc_tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const HYBRID_TEMPLATES: HybridTemplate[] = [
  {
    id: 'dyslexia-reading',
    title: 'Disleksi Dostu Okuma Çalışması',
    description: 'Geniş satırlı okuma alanı, 5N1K tablosu ve kelime kutusu',
    mode: 'document',
    build: () => {
      const page = createEmptyPage(0);
      page.name = 'Okuma Sayfası';
      page.background = 'lined';
      page.doc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Okuma ve Anlama Çalışması' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Yönerge: Metni kendi hızında, hecelere dikkat ederek oku. Önemli gördüğün kelimelerin altını çiz.',
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Buraya kısa, anlaşılır ve öğrenciye uygun okuma metnini yazın veya yapıştırın…',
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '5N1K Soruları' }],
          },
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Soru' }] }] },
                  { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Yanıtım' }] }] },
                ],
              },
              ...['Kim?', 'Ne oldu?', 'Nerede?', 'Ne zaman?', 'Neden?'].map((q) => ({
                type: 'tableRow',
                content: [
                  { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: q }] }] },
                  { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
                ],
              })),
            ],
          },
        ],
      };

      return {
        schemaVersion: 1,
        id: newDocId(),
        title: 'Disleksi Dostu Okuma Çalışması',
        mode: 'document',
        activePageId: page.id,
        pages: [page],
        whiteboard: { canvas: emptySnapshot(WHITEBOARD_WIDTH, WHITEBOARD_HEIGHT), background: 'dots' },
        vectorStyle: { ...DEFAULT_VECTOR_STYLE },
        updatedAt: new Date().toISOString(),
      };
    },
  },
  {
    id: 'bep-observation',
    title: 'BEP Gelişim & Destek Planı',
    description: 'SMART ölçütlü haftalık bireysel gelişim ve destek tablosu',
    mode: 'document',
    build: () => {
      const page = createEmptyPage(0);
      page.name = 'BEP Planı';
      page.margins = { ...DEFAULT_MARGINS };
      page.background = 'blank';
      page.doc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Bireysel Destek & Gelişim Planı' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Not: Bu form yalnızca eğitsel destek adımlarını ve güçlü yönleri takip etmek amacıyla hazırlanmıştır.',
              },
            ],
          },
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ölçülebilir Hedef' }] }] },
                  { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Destek Stratejisi' }] }] },
                  { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Gözlem / İlerleme' }] }] },
                ],
              },
              ...[1, 2, 3].map((row) => ({
                type: 'tableRow',
                content: [
                  { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: `Hedef ${row}: ` }] }] },
                  { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
                  { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
                ],
              })),
            ],
          },
        ],
      };

      return {
        schemaVersion: 1,
        id: newDocId(),
        title: 'BEP Gelişim ve Destek Planı',
        mode: 'document',
        activePageId: page.id,
        pages: [page],
        whiteboard: { canvas: emptySnapshot(WHITEBOARD_WIDTH, WHITEBOARD_HEIGHT), background: 'dots' },
        vectorStyle: { ...DEFAULT_VECTOR_STYLE },
        updatedAt: new Date().toISOString(),
      };
    },
  },
  {
    id: 'whiteboard-concept',
    title: 'Kavram Haritası (Tahta)',
    description: 'Noktalı sınırsız tahtada merkez kavram ve bağlantılı notlar',
    mode: 'whiteboard',
    build: () => {
      const page = createEmptyPage(0);
      const objects = [
        {
          type: 'Rect',
          left: 1350,
          top: 900,
          width: 280,
          height: 110,
          rx: 18,
          ry: 18,
          fill: '#EEF2FF',
          stroke: '#4F46E5',
          strokeWidth: 3,
        },
        {
          type: 'IText',
          left: 1410,
          top: 940,
          text: 'Ana Kavram',
          fontSize: 24,
          fontFamily: 'Lexend, sans-serif',
          fill: '#1E1B4B',
        },
        {
          type: 'Rect',
          left: 980,
          top: 720,
          width: 220,
          height: 140,
          rx: 12,
          ry: 12,
          fill: '#FEF3C7',
          stroke: '#F59E0B',
          strokeWidth: 2,
        },
        {
          type: 'IText',
          left: 1015,
          top: 775,
          text: 'Alt Fikir 1',
          fontSize: 18,
          fontFamily: 'Lexend, sans-serif',
          fill: '#78350F',
        },
        {
          type: 'Rect',
          left: 1780,
          top: 720,
          width: 220,
          height: 140,
          rx: 12,
          ry: 12,
          fill: '#ECFDF5',
          stroke: '#0D9488',
          strokeWidth: 2,
        },
        {
          type: 'IText',
          left: 1815,
          top: 775,
          text: 'Alt Fikir 2',
          fontSize: 18,
          fontFamily: 'Lexend, sans-serif',
          fill: '#134E4A',
        },
      ];

      return {
        schemaVersion: 1,
        id: newDocId(),
        title: 'Kavram Haritası',
        mode: 'whiteboard',
        activePageId: page.id,
        pages: [page],
        whiteboard: {
          background: 'dots',
          canvas: {
            json: JSON.stringify({ version: '6.0.0', objects, background: '#ffffff' }),
            width: WHITEBOARD_WIDTH,
            height: WHITEBOARD_HEIGHT,
            zoom: 1,
          },
        },
        vectorStyle: { ...DEFAULT_VECTOR_STYLE },
        updatedAt: new Date().toISOString(),
      };
    },
  },
];

export const getBackgroundPatternStyle = (
  pattern: BackgroundPattern = 'blank'
): React.CSSProperties => {
  switch (pattern) {
    case 'lined':
      return {
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(148, 163, 184, 0.25) 31px, rgba(148, 163, 184, 0.25) 32px)',
        backgroundSize: `${A4_WIDTH}px 32px`,
      };
    case 'grid':
      return {
        backgroundImage:
          'linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      };
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.28) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      };
    case 'blank':
    default:
      return {};
  }
};

export const countDocumentWords = (doc: HybridDocumentSchema): { words: number; chars: number } => {
  const texts: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') texts.push(record.text);
    if (Array.isArray(record.content)) record.content.forEach(walk);
  };
  doc.pages.forEach((page) => walk(page.doc));
  const joined = texts.join(' ').trim();
  if (!joined) return { words: 0, chars: 0 };
  return {
    words: joined.split(/\s+/).filter(Boolean).length,
    chars: joined.replace(/\s+/g, '').length,
  };
};

export const PAGE_DIMENSIONS = { A4_WIDTH, A4_HEIGHT };
