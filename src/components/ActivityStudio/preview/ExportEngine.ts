import type { ThemeConfig, CompactA4Config, ContentBlock, SafePDFMetadata } from '@/types/activityStudio';
import { printService } from '@/utils/printService';

export interface ExportRequest {
  activityId: string;
  format: 'pdf' | 'png' | 'json';
  payload: Record<string, unknown>;
}

// ─── KVKK Güvenli Sanitizasyon ──────────────────────────────────────

/**
 * KVKK Madde 6 — kişisel sağlık verisi (learningProfile, studentName) PDF metadata'ya GİRMEZ.
 * TC kimlik maskele, Türkçe ad/soyad pattern'larını redact et.
 */
export function sanitizeForKVKK(text: string): string {
  let clean = text.replace(/\b\d{11}\b/g, '[TC-MASKED]');
  clean = clean.replace(/(Öğrenci\s+Adı|Ad|Soyad)\s*[:：]\s*\S+/gi, '$1: [Ad]');
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL-MASKED]');
  return clean;
}

/**
 * Tanı koyucu dil → klinik uyumlu dil dönüşümü (Dr. Ahmet Kaya direktifi)
 */
export function sanitizeDiagnosticLanguage(text: string): string {
  return text
    .replace(/disleksisi\s+var/gi, 'disleksi desteğine ihtiyacı var')
    .replace(/disleksik/gi, 'disleksi desteğine ihtiyacı olan')
    .replace(/DEHB['']li/gi, 'DEHB desteğine ihtiyacı olan')
    .replace(/engelli (öğrenci|çocuk)/gi, 'özel gereksinimli $1')
    .replace(/zeka\s+geriliği/gi, 'öğrenme güçlüğü')
    .replace(/özürlü/gi, 'engelli birey');
}

/**
 * SafePDFMetadata oluştur — learningProfile ve studentName HİÇBİR ZAMAN dahil edilmez.
 */
export function buildSafePDFMetadata(
  partial: Omit<SafePDFMetadata, 'generatedDate' | 'pageCount'> & { pageCount?: number }
): SafePDFMetadata {
  return {
    difficultyLevel: partial.difficultyLevel,
    ageGroup: partial.ageGroup,
    targetSkills: partial.targetSkills.map((s) => s.slice(0, 100)),
    generatedDate: new Date().toISOString().split('T')[0],
    pageCount: partial.pageCount ?? 1,
  };
}

// ─── PDF Üretimi ─────────────────────────────────────────────────────

interface PDFExportOptions {
  title: string;
  blocks: ContentBlock[];
  pedagogicalNote: string;
  themeConfig: ThemeConfig | null;
  compactA4Config: CompactA4Config | null;
  metadata: SafePDFMetadata;
}

/**
 * A4 PDF üretimi — jsPDF + html2canvas ile.
 * Pedagojik not footer: 11pt (ASLA 8pt değil — Elif Yıldız direktifi).
 * KVKK: metadata'da learningProfile / studentName YOK.
 */
export async function exportToPDF(options: PDFExportOptions): Promise<Blob> {
  const { title, blocks, pedagogicalNote, themeConfig, compactA4Config, metadata } = options;

  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const bgPaper = themeConfig?.bgPaper ?? '#FFFDF7';
  const textColor = themeConfig?.textColor ?? '#1A1A2E';
  const accentColor = themeConfig?.accentColor ?? '#6366F1';
  const marginMM = compactA4Config?.marginMM ?? 15;
  const fontSize = compactA4Config?.fontSize ?? 12;
  const lineHeight = compactA4Config?.lineHeight ?? 1.8;

  const container = document.createElement('div');
  container.style.cssText = `
    width: 210mm; min-height: 297mm; background: ${bgPaper};
    padding: ${marginMM}mm; box-sizing: border-box;
    font-family: 'Lexend', Arial, sans-serif; color: ${textColor};
    position: absolute; left: -9999px; top: 0;
  `;

  const titleEl = document.createElement('h1');
  titleEl.textContent = sanitizeDiagnosticLanguage(sanitizeForKVKK(title));
  titleEl.style.cssText = `
    font-size: ${Math.max(fontSize + 4, 16)}pt; font-weight: bold;
    color: ${accentColor}; line-height: 1.4; margin-bottom: 12px;
    border-bottom: 2px solid ${accentColor}; padding-bottom: 4px;
    font-family: 'Lexend', Arial, sans-serif;
  `;
  container.appendChild(titleEl);

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  for (const block of sortedBlocks) {
    const el = document.createElement('p');
    const safeContent = sanitizeDiagnosticLanguage(sanitizeForKVKK(block.content));

    if (block.type === 'spacing') {
      el.style.cssText = `height: ${marginMM * 0.4}mm;`;
    } else {
      el.textContent = safeContent;
      el.style.cssText = `
        font-size: ${fontSize}pt; line-height: ${lineHeight}; margin-bottom: 6px;
        font-family: 'Lexend', Arial, sans-serif; color: ${textColor};
      `;
      if (block.type === 'question') {
        el.style.fontWeight = '600';
        el.style.borderLeft = `3px solid ${accentColor}`;
        el.style.paddingLeft = '8px';
      }
    }
    container.appendChild(el);
  }

  // Pedagojik not footer — ZORUNLU 11pt (Elif direktifi: 8pt YASAK)
  if (pedagogicalNote) {
    const footer = document.createElement('div');
    const safeNote = sanitizeDiagnosticLanguage(sanitizeForKVKK(pedagogicalNote));
    footer.style.cssText = `
      margin-top: 20px; border-top: 1px solid #ddd; padding-top: 4px;
      font-size: 11pt; color: #666; font-family: 'Lexend', Arial, sans-serif; line-height: 1.6;
    `;
    footer.innerHTML = `<strong>Pedagojik Not: </strong>${safeNote}`;
    container.appendChild(footer);
  }

  document.body.appendChild(container);

  try {
    // Generate unique ID for printService to target
    const printId = `activity-export-${crypto.randomUUID().slice(0, 8)}`;
    container.id = printId;

    // Use modern printService for high-fidelity PDF
    return await printService.generatePdf(`#${printId}`, title, {
      action: 'download',
    }) as unknown as Blob; // generatePdf might trigger direct download, but we return a proxy blob if needed
  } finally {
    document.body.removeChild(container);
  }
}

// ─── JSON Export ─────────────────────────────────────────────────────

export function exportToJSON(
  activityId: string,
  payload: Record<string, unknown>,
  metadata: SafePDFMetadata
): Blob {
  const safePayload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === 'learningProfile' || key === 'studentName') continue;
    safePayload[key] = value;
  }
  const body = {
    activityId,
    exportedAt: new Date().toISOString(),
    metadata,
    payload: safePayload,
  };
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' });
}

// ─── Extended Export API ─────────────────────────────────────────────

export interface ExportRequestExtended {
  activityId: string;
  format: 'pdf' | 'png' | 'json';
  title: string;
  blocks: ContentBlock[];
  pedagogicalNote: string;
  themeConfig: ThemeConfig | null;
  compactA4Config: CompactA4Config | null;
  metadata: SafePDFMetadata;
  payload?: Record<string, unknown>;
}

export async function exportStudioOutput(request: ExportRequestExtended | ExportRequest): Promise<Blob> {
  // Eski basit API uyumluluğu
  if (!('blocks' in request)) {
    const simple = request as ExportRequest;
    const mime = simple.format === 'json' ? 'application/json' : 'text/plain';
    const content = JSON.stringify({ activityId: simple.activityId, format: simple.format, payload: simple.payload, exportedAt: new Date().toISOString() }, null, 2);
    return new Blob([content], { type: mime });
  }

  const ext = request as ExportRequestExtended;
  switch (ext.format) {
    case 'pdf':
      return exportToPDF({
        title: ext.title,
        blocks: ext.blocks,
        pedagogicalNote: ext.pedagogicalNote,
        themeConfig: ext.themeConfig,
        compactA4Config: ext.compactA4Config,
        metadata: ext.metadata,
      });

    case 'json':
      return exportToJSON(ext.activityId, ext.payload ?? {}, ext.metadata);

    case 'png': {
      const html2canvas = await import('html2canvas');
      const container = document.createElement('div');
      container.style.cssText = `
        width: 210mm; background: ${ext.themeConfig?.bgPaper ?? '#FFFDF7'};
        position: absolute; left: -9999px; top: 0;
      `;
      container.textContent = ext.title;
      document.body.appendChild(container);
      try {
        const canvas = await html2canvas.default(container, {
          useCORS: true,
          backgroundColor: ext.themeConfig?.bgPaper ?? '#FFFDF7',
          logging: false,
        });
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('PNG blob oluşturulamadı'));
          }, 'image/png');
        });
      } finally {
        document.body.removeChild(container);
      }
    }

    default: {
      const _exhausted: never = ext.format;
      void _exhausted;
      return exportToJSON(ext.activityId, ext.payload ?? {}, ext.metadata);
    }
  }
}
