import type { StudioGoalConfig } from '@/types/activityStudio';

export interface CompactA4Section {
  type: 'title' | 'content' | 'question' | 'spacing' | 'footer';
  content: string | Record<string, unknown>;
  styling: {
    fontSize: number;
    lineHeight: number;
    marginBottom: number;
    paddingX: number;
  };
}

export interface CompactA4Layout {
  pageSize: 'A4' | 'Letter' | 'B5';
  title: string;
  sections: CompactA4Section[];
  footerText?: string;
  totalPages: number;
}

interface CompactLayoutConfig {
  title: string;
  steps?: string[];
  questions?: string[];
  theme?: {
    bg: string;
    text: string;
    accent: string;
  };
}

export function buildCompactA4Layout(config: CompactLayoutConfig): CompactA4Layout {
  const sections: CompactA4Section[] = [];

  sections.push({
    type: 'title',
    content: config.title,
    styling: {
      fontSize: 14,
      lineHeight: 1.2,
      marginBottom: 6,
      paddingX: 8,
    },
  });

  if (config.steps && config.steps.length > 0) {
    config.steps.forEach((step, idx) => {
      sections.push({
        type: 'content',
        content: `${idx + 1}. ${step}`,
        styling: {
          fontSize: 10,
          lineHeight: 1.4,
          marginBottom: 3,
          paddingX: 8,
        },
      });
    });
  }

  if (config.questions && config.questions.length > 0) {
    sections.push({
      type: 'spacing',
      content: '',
      styling: { fontSize: 0, lineHeight: 0, marginBottom: 4, paddingX: 0 },
    });

    config.questions.forEach((question, idx) => {
      sections.push({
        type: 'question',
        content: `S${idx + 1}: ${question}`,
        styling: {
          fontSize: 9,
          lineHeight: 1.3,
          marginBottom: 2,
          paddingX: 8,
        },
      });
    });
  }

  sections.push({
    type: 'footer',
    content: `Zorluk: Ortam: Online | Bitiş: ___`,
    styling: { fontSize: 8, lineHeight: 1, marginBottom: 0, paddingX: 8 },
  });

  return {
    pageSize: 'A4',
    title: config.title,
    sections,
    totalPages: Math.ceil(sections.length / 12),
  };
}

export function compactA4ToHtml(layout: CompactA4Layout): string {
  let html = `
    <div style="font-family: 'Lexend', sans-serif; max-width: 210mm; margin: 0 auto; padding: 10mm;">
      <style>
        @media print { margin: 0; padding: 0; }
        .compact-page { page-break-after: always; margin-bottom: 20mm; }
      </style>
  `;

  layout.sections.forEach((section) => {
    const { fontSize, lineHeight, marginBottom, paddingX } = section.styling;
    const style = `font-size: ${fontSize}pt; line-height: ${lineHeight}; margin-bottom: ${marginBottom}mm; padding: 0 ${paddingX}mm;`;

    switch (section.type) {
      case 'title':
        html += `<h1 style="${style} font-weight: bold;">${section.content}</h1>`;
        break;
      case 'content':
        html += `<p style="${style}">${section.content}</p>`;
        break;
      case 'question':
        html += `<p style="${style} margin-left: 4mm;">${section.content}</p>`;
        break;
      case 'footer':
        html += `<hr style="margin: 2mm 0;" /><p style="${style} font-size: 8pt; color: #666;">${section.content}</p>`;
        break;
      default:
        break;
    }
  });

  html += '</div>';
  return html;
}

export function estimateCompactA4Pages(contentLength: number): number {
  const estimatedLinesPerPage = 30;
  const estimatedCharsPerLine = 60;
  const totalChars = contentLength;
  const estimatedLines = Math.ceil(totalChars / estimatedCharsPerLine);

  return Math.max(1, Math.ceil(estimatedLines / estimatedLinesPerPage));
}
