import type { JSONContent } from '@tiptap/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  A4_HEIGHT,
  A4_WIDTH,
  WHITEBOARD_HEIGHT,
  WHITEBOARD_WIDTH,
  createEmptyPage,
  isRecord,
  type CanvasSnapshot,
  type ExportResult,
  type HybridDocumentSchema,
  type HybridPage,
  type PageMargins,
} from '../types/editor.types';

/**
 * Hibrit editör dışa aktarma motoru.
 * PDF (300 DPI), PNG, gerçek .docx ve birleşik JSON içe/dışa aktarma.
 * Hiçbir fonksiyon sessizce başarısız olmaz; sonuç `ExportResult` ile bildirilir.
 */

const PRINT_DPI = 300;
const CSS_DPI = 96;

const safeName = (value: string, fallback: string): string => {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || fallback).slice(0, 90);
};

const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binary = typeof atob === 'function' ? atob(base64) : '';
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const waitForPaint = (): Promise<void> =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'function') {
      setTimeout(resolve, 0);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

/** Yüksek çözünürlüklü (300 DPI) A4 PDF — verilen DOM sayfalarından. */
export const exportElementsToPdf = async (
  elements: HTMLElement[],
  fileName: string
): Promise<ExportResult> => {
  if (!elements.length) return { ok: false, message: 'PDF için sayfa bulunamadı.' };

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    for (let index = 0; index < elements.length; index += 1) {
      await waitForPaint();
      const dataUrl = await toPng(elements[index], {
        pixelRatio: PRINT_DPI / CSS_DPI,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipAutoScale: true,
      });

      if (index > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(`${safeName(fileName, 'hibrit-belge')}.pdf`);
    return { ok: true, message: 'PDF indirildi (300 DPI).' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'PDF oluşturulamadı.',
    };
  }
};

/** Tek bir DOM alanını PNG olarak indirir. */
export const exportElementToPng = async (
  element: HTMLElement,
  fileName: string,
  options: { transparent?: boolean; multiplier?: number } = {}
): Promise<ExportResult> => {
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: options.multiplier ?? 2,
      backgroundColor: options.transparent ? undefined : '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
    });
    saveAs(dataUrl, `${safeName(fileName, 'hibrit-gorsel')}.png`);
    return { ok: true, message: 'PNG indirildi.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'PNG oluşturulamadı.',
    };
  }
};

/** Bir DOM düğümünü yüksek çözünürlüklü PNG data URL'ine çevirir. */
export const captureElementToPng = async (
  element: HTMLElement,
  multiplier = 2
): Promise<string> => {
  await waitForPaint();
  return toPng(element, {
    pixelRatio: multiplier,
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipAutoScale: true,
  });
};

/** Hazır bir görseli tek sayfalık A4 PDF olarak indirir. */
export const exportDataUrlToPdf = (
  dataUrl: string,
  fileName: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): ExportResult => {
  try {
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });
    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    pdf.save(`${safeName(fileName, 'hibrit-gorsel')}.pdf`);
    return { ok: true, message: 'PDF indirildi.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'PDF oluşturulamadı.',
    };
  }
};

/** Hazır data URL'i PNG dosyası olarak indirir. */
export const downloadPngDataUrl = (dataUrl: string, fileName: string): ExportResult => {
  try {
    saveAs(dataUrl, `${safeName(fileName, 'hibrit-gorsel')}.png`);
    return { ok: true, message: 'PNG indirildi.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'PNG indirilemedi.',
    };
  }
};

/* ------------------------------- DOCX üretimi ------------------------------- */

const extractDataUrlBytes = (src: string): { bytes: Uint8Array; type: 'png' | 'jpg' } | null => {
  if (!src.startsWith('data:image/')) return null;
  const isJpeg = src.startsWith('data:image/jpeg') || src.startsWith('data:image/jpg');
  try {
    return { bytes: dataUrlToBytes(src), type: isJpeg ? 'jpg' : 'png' };
  } catch {
    return null;
  }
};

interface TextStyleState {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  font?: string;
  size?: number;
}

const readTextStyle = (node: JSONContent): TextStyleState => {
  const state: TextStyleState = {};
  const marks = Array.isArray(node.marks) ? node.marks : [];
  marks.forEach((mark) => {
    if (!isRecord(mark)) return;
    switch (mark.type) {
      case 'bold':
        state.bold = true;
        break;
      case 'italic':
        state.italics = true;
        break;
      case 'underline':
        state.underline = true;
        break;
      case 'strike':
        state.strike = true;
        break;
      case 'textStyle': {
        const attrs = isRecord(mark.attrs) ? mark.attrs : {};
        if (typeof attrs.color === 'string') state.color = attrs.color.replace('#', '');
        if (typeof attrs.fontFamily === 'string') state.font = attrs.fontFamily;
        if (typeof attrs.fontSize === 'string') {
          const parsed = Number.parseFloat(attrs.fontSize);
          if (Number.isFinite(parsed)) state.size = Math.round(parsed * 2);
        }
        break;
      }
      case 'highlight': {
        const attrs = isRecord(mark.attrs) ? mark.attrs : {};
        if (typeof attrs.color === 'string') state.highlight = attrs.color.replace('#', '');
        break;
      }
      default:
        break;
    }
  });
  return state;
};

const inlineRuns = (nodes: JSONContent[] | undefined): TextRun[] => {
  if (!Array.isArray(nodes)) return [];
  const runs: TextRun[] = [];

  nodes.forEach((node) => {
    if (node.type === 'hardBreak') {
      runs.push(new TextRun({ text: '', break: 1 }));
      return;
    }
    if (node.type !== 'text' || typeof node.text !== 'string') return;
    const style = readTextStyle(node);
    runs.push(
      new TextRun({
        text: node.text,
        bold: style.bold,
        italics: style.italics,
        underline: style.underline ? {} : undefined,
        strike: style.strike,
        color: style.color,
        shading: style.highlight ? { fill: style.highlight.replace('#', '') } : undefined,
        font: style.font,
        size: style.size,
      })
    );
  });

  return runs.length ? runs : [new TextRun({ text: '' })];
};

const headingLevel = (level: number | undefined): (typeof HeadingLevel)[keyof typeof HeadingLevel] => {
  switch (level) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    default:
      return HeadingLevel.HEADING_4;
  }
};

const tableFromNode = (node: JSONContent): Table => {
  const rows = Array.isArray(node.content) ? node.content : [];
  const docxRows = rows
    .filter((row): row is JSONContent => row.type === 'tableRow')
    .map((row) => {
      const cells = Array.isArray(row.content) ? row.content : [];
      const docxCells = cells.map((cell) => {
        const children = Array.isArray(cell.content) ? cell.content : [];
        const paragraphs: Paragraph[] = [];
        children.forEach((child) => {
          if (child.type === 'paragraph') {
            paragraphs.push(
              new Paragraph({
                children: inlineRuns(child.content),
                spacing: { after: 40 },
              })
            );
          }
        });
        if (!paragraphs.length) paragraphs.push(new Paragraph({ text: '' }));
        return new TableCell({
          children: paragraphs,
          shading:
            cell.type === 'tableHeader' ? { fill: 'EEF2FF', type: 'clear', color: 'auto' } : undefined,
        });
      });
      return new TableRow({ children: docxCells });
    });

  return new Table({
    rows: docxRows.length ? docxRows : [new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: '' })] })] })],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    },
  });
};

interface DocxBlock {
  paragraph?: Paragraph;
  table?: Table;
}

/** Tiptap JSON → docx blokları (başlık, paragraf, liste, tablo, görsel). */
const docxBlocksFromContent = (content: JSONContent | null): DocxBlock[] => {
  const blocks: DocxBlock[] = [];
  if (!content || !Array.isArray(content.content)) return blocks;

  content.content.forEach((node) => {
    switch (node.type) {
      case 'heading':
        blocks.push({
          paragraph: new Paragraph({
            children: inlineRuns(node.content),
            heading: headingLevel(isRecord(node.attrs) ? Number(node.attrs.level) : 1),
            spacing: { before: 240, after: 120 },
          }),
        });
        break;
      case 'paragraph':
        blocks.push({
          paragraph: new Paragraph({
            children: inlineRuns(node.content),
            spacing: { after: 120, line: 320 },
          }),
        });
        break;
      case 'bulletList':
      case 'orderedList': {
        const isOrdered = node.type === 'orderedList';
        const items = Array.isArray(node.content) ? node.content : [];
        items.forEach((item, index) => {
          const itemParagraphs = Array.isArray(item.content) ? item.content : [];
          itemParagraphs.forEach((paragraph) => {
            blocks.push({
              paragraph: new Paragraph({
                children: inlineRuns(paragraph.content),
                bullet: isOrdered ? undefined : { level: 0 },
                numbering: isOrdered ? { reference: 'hybrid-ordered', level: 0 } : undefined,
                spacing: { after: 60 },
              }),
            });
          });
          if (!itemParagraphs.length) {
            blocks.push({ paragraph: new Paragraph({ text: `${index + 1}.` }) });
          }
        });
        break;
      }
      case 'table':
        blocks.push({ table: tableFromNode(node) });
        break;
      case 'image': {
        const attrs = isRecord(node.attrs) ? node.attrs : {};
        const src = typeof attrs.src === 'string' ? attrs.src : '';
        const image = src ? extractDataUrlBytes(src) : null;
        if (image) {
          blocks.push({
            paragraph: new Paragraph({
              children: [
                new ImageRun({
                  data: image.bytes,
                  type: image.type,
                  transformation: { width: 560, height: 360 },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 160 },
            }),
          });
        }
        break;
      }
      case 'blockquote': {
        const children = Array.isArray(node.content) ? node.content : [];
        children.forEach((child) => {
          blocks.push({
            paragraph: new Paragraph({
              children: inlineRuns(child.content),
              indent: { left: 400 },
              border: {
                left: { style: BorderStyle.SINGLE, size: 12, color: '6366F1' },
              },
              spacing: { after: 120 },
            }),
          });
        });
        break;
      }
      default:
        if (Array.isArray(node.content)) {
          blocks.push(...docxBlocksFromContent(node));
        }
        break;
    }
  });

  return blocks;
};

/**
 * Gerçek .docx üretir: her sayfanın akış metni/tabloları + vektör katmanının
 * yüksek çözünürlüklü görseli. `pageImages` sırası `doc.pages` ile eşleşmelidir.
 */
export const exportDocumentToDocx = async (
  doc: HybridDocumentSchema,
  pageImages: string[],
  fileName: string
): Promise<ExportResult> => {
  try {
    const children: Array<Paragraph | Table> = [
      new Paragraph({
        children: [
          new TextRun({ text: doc.title || 'Hibrit Belge', bold: true, size: 36 }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
      }),
    ];

    doc.pages.forEach((page, index) => {
      const blocks = docxBlocksFromContent(page.doc);
      const pageImage = pageImages[index];

      if (index > 0) {
        children.push(new Paragraph({ text: '', pageBreakBefore: true }));
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ text: page.name, bold: true, size: 26, color: '4F46E5' })],
          spacing: { before: index === 0 ? 0 : 240, after: 120 },
        })
      );

      blocks.forEach((block) => {
        if (block.paragraph) children.push(block.paragraph);
        if (block.table) children.push(block.table);
      });

      if (pageImage) {
        const image = extractDataUrlBytes(pageImage);
        if (image) {
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: image.bytes,
                  type: image.type,
                  transformation: { width: 600, height: Math.round((600 * A4_HEIGHT) / A4_WIDTH) },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
            })
          );
        }
      }

      if (!blocks.length && !pageImage) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Bu sayfa boş.', italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          })
        );
      }
    });

    const document = new Document({
      creator: 'bdmind Hibrit Editör',
      title: doc.title,
      description: 'bdmind hibrit belge dışa aktarımı',
      numbering: {
        config: [
          {
            reference: 'hybrid-ordered',
            levels: [
              {
                level: 0,
                format: 'decimal',
                text: '%1.',
                alignment: AlignmentType.START,
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(document);
    saveAs(blob, `${safeName(fileName, 'hibrit-belge')}.docx`);
    return { ok: true, message: 'Word (.docx) indirildi.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Word belgesi oluşturulamadı.',
    };
  }
};

/* --------------------------------- JSON I/O -------------------------------- */

export const exportHybridJson = (doc: HybridDocumentSchema, fileName: string): ExportResult => {
  try {
    const payload = JSON.stringify({ ...doc, updatedAt: new Date().toISOString() }, null, 2);
    saveAs(new Blob([payload], { type: 'application/json;charset=utf-8' }), `${safeName(fileName, 'hibrit-belge')}.json`);
    return { ok: true, message: 'JSON dışa aktarıldı.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'JSON dışa aktarılamadı.',
    };
  }
};

const normalizeMargins = (value: unknown): PageMargins => {
  const record = isRecord(value) ? value : {};
  const read = (key: string, fallback: number): number => {
    const candidate = record[key];
    return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : fallback;
  };
  return {
    top: read('top', 64),
    right: read('right', 56),
    bottom: read('bottom', 64),
    left: read('left', 56),
  };
};

const normalizeSnapshot = (value: unknown, width: number, height: number): CanvasSnapshot => {
  const record = isRecord(value) ? value : {};
  return {
    json: typeof record.json === 'string' ? record.json : JSON.stringify({ version: '6.0.0', objects: [] }),
    width: typeof record.width === 'number' ? record.width : width,
    height: typeof record.height === 'number' ? record.height : height,
    zoom: typeof record.zoom === 'number' ? record.zoom : 1,
  };
};

const normalizePage = (value: unknown, index: number): HybridPage => {
  const record = isRecord(value) ? value : {};
  const fallback = createEmptyPage(index);
  return {
    id: typeof record.id === 'string' ? record.id : fallback.id,
    name: typeof record.name === 'string' ? record.name : fallback.name,
    margins: normalizeMargins(record.margins),
    doc: isRecord(record.doc) ? (record.doc as JSONContent) : null,
    canvas: normalizeSnapshot(record.canvas, A4_WIDTH, A4_HEIGHT),
  };
};

export type ParseDocumentResult =
  | { ok: true; doc: HybridDocumentSchema }
  | { ok: false; error: string };

/** Dışa aktarılmış JSON'u doğrular ve güvenli bir belge döndürür. */
export const parseHybridDocumentJson = (raw: string): ParseDocumentResult => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return { ok: false, error: 'Kök nesne bekleniyordu.' };
    if (parsed.schemaVersion !== 1) {
      return { ok: false, error: 'Desteklenmeyen şema sürümü (schemaVersion: 1 bekleniyor).' };
    }
    if (!Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return { ok: false, error: 'Belgede en az bir sayfa olmalı.' };
    }

    const pages = parsed.pages.map((page, index) => normalizePage(page, index));
    const activePageId =
      typeof parsed.activePageId === 'string' && pages.some((page) => page.id === parsed.activePageId)
        ? parsed.activePageId
        : pages[0].id;

    return {
      ok: true,
      doc: {
        schemaVersion: 1,
        id: typeof parsed.id === 'string' ? parsed.id : `doc_${Date.now()}`,
        title: typeof parsed.title === 'string' ? parsed.title : 'İçe Aktarılan Belge',
        mode: parsed.mode === 'whiteboard' ? 'whiteboard' : 'document',
        activePageId,
        pages,
        whiteboard: {
          canvas: normalizeSnapshot(
            isRecord(parsed.whiteboard) ? parsed.whiteboard.canvas : undefined,
            WHITEBOARD_WIDTH,
            WHITEBOARD_HEIGHT
          ),
        },
        vectorStyle: {
          stroke: '#1e293b',
          fill: 'rgba(79, 70, 229, 0.14)',
          strokeWidth: 2,
          opacity: 1,
          fontSize: 20,
          fontFamily: 'Lexend, sans-serif',
          textColor: '#0f172a',
          ...(isRecord(parsed.vectorStyle) ? parsed.vectorStyle : {}),
        },
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'JSON okunamadı.',
    };
  }
};
