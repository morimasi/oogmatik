import type {
  SingleWorksheetData,
  StyleSettings,
  WorksheetBlock,
  WorksheetData,
} from '../types';
import {
  blockPreview,
  blockTypeLabel,
  cloneValue,
  createBlock,
  flattenBlocks,
  getPageBlocks,
  withPageBlocks,
} from './a4EditorService';

/**
 * a4StudioService — A4 Studio'nun saf (yan etkisiz) yardımcı katmanı.
 *
 * Burada üretim denetimi (okunabilirlik/erişilebilirlik), cevap anahtarı türetme,
 * sayfa şablonları, satır içi düzenleme hedefleri, taşma/bölünme yardımcıları ve
 * Word/panoya aktarma çıktısı yaşar. Tüm fonksiyonlar immutable ve test edilebilir.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const contentOf = (block: WorksheetBlock): Record<string, unknown> => {
  if (isRecord(block.content)) return block.content;
  if (typeof block.content === 'string') return { text: block.content };
  return {};
};

const pagesOf = (data: WorksheetData): SingleWorksheetData[] =>
  Array.isArray(data) ? data.filter((page) => !!page && typeof page === 'object') : [];

/* -------------------------------------------------------------------------- */
/* 1. Satır içi (sayfa üzerinde) düzenleme hedefleri                           */
/* -------------------------------------------------------------------------- */

export interface InlineTextTarget {
  key: 'text' | 'title' | 'clue';
  label: string;
  value: string;
}

const INLINE_TEXT_KEYS: Partial<
  Record<WorksheetBlock['type'], { key: InlineTextTarget['key']; label: string }>
> = {
  header: { key: 'text', label: 'Başlık metni' },
  text: { key: 'text', label: 'Paragraf metni' },
  question: { key: 'text', label: 'Soru metni' },
  cloze_test: { key: 'text', label: 'Boşluk doldurma metni' },
  logic_card: { key: 'text', label: 'Kart metni' },
  footer_validation: { key: 'text', label: 'Doğrulama metni' },
  visual_clue_card: { key: 'clue', label: 'İpucu metni' },
};

/** Sayfa üzerinde doğrudan düzenlenebilen metin alanını döndürür. */
export const inlineTextTarget = (block: WorksheetBlock): InlineTextTarget | null => {
  const config = INLINE_TEXT_KEYS[block.type];
  if (!config) return null;
  const content = contentOf(block);
  const raw = content[config.key];
  if (isRecord(raw) || Array.isArray(raw)) return null;
  return { key: config.key, label: config.label, value: asString(raw) };
};

/** Bileşenin öğretmen için kısa cevap/özet metni (yoksa boş dize). */
export const blockAnswer = (block: WorksheetBlock): string => {
  if (typeof block.answerText === 'string' && block.answerText.trim()) {
    return block.answerText.trim();
  }
  const content = contentOf(block);
  const direct = [content.answer, content.correctAnswer, content.solution, content.targetValue]
    .map(asString)
    .find((value) => value.trim().length > 0);
  if (direct) return direct.trim();

  if (Array.isArray(content.answers)) {
    const answers = content.answers.map(asString).filter(Boolean);
    if (answers.length) return answers.join(' • ');
  }

  const text = asString(content.text);
  const cloze = text.match(/\[([^\]]+)\]/g);
  if (cloze?.length) return cloze.map((item) => item.slice(1, -1)).join(' • ');

  return '';
};

/* -------------------------------------------------------------------------- */
/* 2. Cevap anahtarı türetme (öğrenci nüshası / öğretmen nüshası)              */
/* -------------------------------------------------------------------------- */

export interface AnswerEntry {
  blockId: string;
  pageIndex: number;
  label: string;
  answer: string;
}

export const collectAnswers = (data: WorksheetData): AnswerEntry[] =>
  flattenBlocks(data).flatMap((entry) => {
    const answer = blockAnswer(entry.block);
    if (!entry.block.id || !answer) return [];
    return [
      {
        blockId: entry.block.id,
        pageIndex: entry.pageIndex,
        label: blockPreview(entry.block) || blockTypeLabel(entry.block.type),
        answer,
      },
    ];
  });

export const ANSWER_KEY_PAGE_ID = 'a4-answer-key-page';

/**
 * Cevap anahtarını ayrı bir A4 sayfası olarak üretir.
 * Öğretmen nüshasıdır; öğrenci nüshasında asla render edilmez.
 */
export const buildAnswerKeyPage = (data: WorksheetData): SingleWorksheetData | null => {
  const entries = collectAnswers(data);
  if (!entries.length) return null;

  const blocks: WorksheetBlock[] = [
    {
      id: 'a4-answer-key-title',
      type: 'header',
      content: { text: 'CEVAP ANAHTARI' },
      style: { fontSize: 20, textAlign: 'center' },
    },
    {
      id: 'a4-answer-key-body',
      type: 'text',
      content: {
        text: entries.map((entry, index) => `${index + 1}. ${entry.label} → ${entry.answer}`).join('\n'),
      },
      style: { lineHeight: 1.7, letterSpacing: 0.2 },
    },
    {
      id: 'a4-answer-key-note',
      type: 'visual_clue_card',
      content: {
        title: 'ÖĞRETMEN NÜSHASI',
        clue:
          'Bu sayfa öğrenciye dağıtılmaz. Cevap anahtarı KVKK gereği öğrenci nüshasında gizlenir.',
        icon: 'fa-key',
      },
    },
  ];

  return {
    id: ANSWER_KEY_PAGE_ID,
    title: 'Cevap Anahtarı',
    instruction: 'Öğretmen nüshası — öğrenciye dağıtılmaz.',
    layoutArchitecture: { cols: 1, gap: 12, blocks },
  };
};

/* -------------------------------------------------------------------------- */
/* 3. Üretim denetimi: okunabilirlik + erişilebilirlik                         */
/* -------------------------------------------------------------------------- */

export type AuditSeverity = 'error' | 'warn' | 'info';
export type AuditFix =
  | 'increase-font'
  | 'line-height'
  | 'letter-spacing'
  | 'contrast'
  | 'split-text'
  | 'open-content';

export interface AuditIssue {
  id: string;
  severity: AuditSeverity;
  title: string;
  detail: string;
  blockId?: string;
  fix?: AuditFix;
}

const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: '#ffffff',
};

const normalizeHex = (input: string): string | null => {
  const raw = input.trim().toLowerCase();
  const named = NAMED_COLORS[raw] ?? raw;
  if (/^#[0-9a-f]{3}$/.test(named)) {
    return `#${named[1]}${named[1]}${named[2]}${named[2]}${named[3]}${named[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(named)) return named;

  const rgb = named.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    const toHex = (value: string) => Number(value).toString(16).padStart(2, '0');
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  return null;
};

const relativeLuminance = (hex: string): number => {
  const normalized = normalizeHex(hex) ?? '#000000';
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

/** WCAG 2.1 kontrast oranı. Renk çözülemezse null döner. */
export const contrastRatio = (foreground: string, background: string): number | null => {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
};

const baseFontSize = (settings?: StyleSettings): number => {
  if (typeof settings?.fontSize === 'number') return settings.fontSize;
  switch (settings?.fontSize) {
    case 'küçük':
      return 14;
    case 'büyük':
      return 20;
    default:
      return 16;
  }
};

const TEXTUAL_TYPES: Array<WorksheetBlock['type']> = [
  'header',
  'text',
  'question',
  'cloze_test',
  'logic_card',
  'footer_validation',
  'visual_clue_card',
];

/**
 * A4 üretim denetimi. Disleksi dostu eşikler: punto ≥ 14, satır yüksekliği ≥ 1.4,
 * kontrast ≥ 4.5, uzun paragraf ≤ 900 karakter, görselde alt metin zorunlu.
 */
export const auditWorksheet = (
  data: WorksheetData,
  settings?: StyleSettings
): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  const defaultFont = baseFontSize(settings);
  const defaultLineHeight = settings?.lineHeight ?? 1.6;

  flattenBlocks(data).forEach((entry) => {
    const block = entry.block;
    const blockId = block.id;
    const content = contentOf(block);
    const isTextual = TEXTUAL_TYPES.includes(block.type);
    const fontSize = block.style?.fontSize ?? defaultFont;
    const lineHeight = block.style?.lineHeight ?? defaultLineHeight;

    if (isTextual && fontSize < 14) {
      issues.push({
        id: `${blockId}-font`,
        severity: 'error',
        title: 'Punto disleksi eşiğinin altında',
        detail: `${blockTypeLabel(block.type)} ${fontSize}px. Öneri: en az 14px (tercihen 16px).`,
        blockId,
        fix: 'increase-font',
      });
    }

    if (isTextual && lineHeight < 1.4) {
      issues.push({
        id: `${blockId}-line`,
        severity: 'warn',
        title: 'Satır aralığı sıkışık',
        detail: `Satır yüksekliği ${lineHeight}. Disleksi dostu alt sınır 1.4×.`,
        blockId,
        fix: 'line-height',
      });
    }

    if (block.type === 'text' || block.type === 'cloze_test') {
      const text = asString(content.text);
      if (text.length > 900) {
        issues.push({
          id: `${blockId}-length`,
          severity: 'warn',
          title: 'Paragraf çok uzun',
          detail: `${text.length} karakter tek blokta. İkiye bölmek okunabilirliği artırır.`,
          blockId,
          fix: 'split-text',
        });
      }
      if (text.length > 120 && !block.style?.letterSpacing) {
        issues.push({
          id: `${blockId}-tracking`,
          severity: 'info',
          title: 'Harf aralığı devralınıyor',
          detail: 'Uzun metinlerde 0.2–0.6px harf aralığı disleksi okumasını kolaylaştırır.',
          blockId,
          fix: 'letter-spacing',
        });
      }
      if (block.type === 'cloze_test' && !/\[[^\]]+\]/.test(text)) {
        issues.push({
          id: `${blockId}-cloze`,
          severity: 'warn',
          title: 'Boşluk bulunamadı',
          detail: 'Boşluk doldurma bloğunda [cevap] biçiminde en az bir boşluk olmalı.',
          blockId,
          fix: 'open-content',
        });
      }
    }

    if (block.style?.color) {
      const background = block.style.backgroundColor ?? '#ffffff';
      const ratio = contrastRatio(block.style.color, background);
      if (ratio !== null && ratio < 4.5) {
        issues.push({
          id: `${blockId}-contrast`,
          severity: 'error',
          title: 'Kontrast WCAG AA altında',
          detail: `Oran ${ratio}:1 (eşik 4.5:1). Baskıda soluk kalır.`,
          blockId,
          fix: 'contrast',
        });
      }
    }

    if (block.type === 'image') {
      const altText = asString(content.alt) || asString(content.prompt);
      if (!altText.trim()) {
        issues.push({
          id: `${blockId}-alt`,
          severity: 'error',
          title: 'Görselde alt metin yok',
          detail: 'Ekran okuyucu ve erişilebilir PDF için görsel açıklaması zorunlu.',
          blockId,
          fix: 'open-content',
        });
      }
    }

    if (block.type === 'question' && !blockAnswer(block)) {
      issues.push({
        id: `${blockId}-answer`,
        severity: 'info',
        title: 'Cevap anahtarında eksik',
        detail: 'Bu soru için cevap tanımlanmamış; öğretmen nüshasında görünmez.',
        blockId,
        fix: 'open-content',
      });
    }
  });

  const severityOrder: Record<AuditSeverity, number> = { error: 0, warn: 1, info: 2 };
  return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};

export const auditSummary = (issues: AuditIssue[]) => ({
  errors: issues.filter((issue) => issue.severity === 'error').length,
  warnings: issues.filter((issue) => issue.severity === 'warn').length,
  infos: issues.filter((issue) => issue.severity === 'info').length,
  score: Math.max(
    0,
    100 -
      issues.filter((issue) => issue.severity === 'error').length * 12 -
      issues.filter((issue) => issue.severity === 'warn').length * 4
  ),
});

/* -------------------------------------------------------------------------- */
/* 4. Sayfa şablonları (hazır iskeletler)                                     */
/* -------------------------------------------------------------------------- */

export interface PageTemplateDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  cols?: number;
  build: () => WorksheetBlock[];
}

export const PAGE_TEMPLATES: PageTemplateDefinition[] = [
  {
    id: 'guided-practice',
    label: 'Yönlendirilmiş Alıştırma',
    description: 'Başlık + yönerge + soru + doğrulama kutusu',
    icon: 'fa-route',
    build: () => [
      createBlock('header', { text: 'ALIŞTIRMA SAYFASI' }),
      createBlock('text', {
        text: 'Yönerge: Aşağıdaki soruyu okuyup doğru seçeneği işaretleyin. İlk soru ısınma sorusudur.',
      }),
      createBlock('question', {
        text: 'Isınma: Aşağıdakilerden hangisi bir sesli harftir?',
        options: ['a', 'b', 'k', 'm'],
        answer: 'a',
      }),
      createBlock('footer_validation', {
        text: 'Çalışmanı bitirdiğinde hedeflediğin doğru sayısını yaz.',
        targetValue: '4/5',
      }),
    ],
  },
  {
    id: 'reading-response',
    label: 'Okuma + Yanıt',
    description: 'Kısa metin, iki açık uçlu soru, ipucu kartı',
    icon: 'fa-book-open',
    build: () => [
      createBlock('header', { text: 'OKUDUĞUNU ANLAMA' }),
      createBlock('text', {
        text: 'Kısa metni buraya yazın. Cümleler kısa, satır aralığı geniş olsun.',
      }),
      createBlock('question', {
        text: 'Metnin ana fikri nedir?',
        options: ['A', 'B', 'C'],
        answer: 'A',
      }),
      createBlock('visual_clue_card', {
        title: 'İPUCU',
        clue: 'Cevabı bulamazsan metnin ilk ve son cümlesini yeniden oku.',
        icon: 'fa-lightbulb',
      }),
    ],
  },
  {
    id: 'two-column-vocab',
    label: 'İki Kolonlu Sözcük',
    description: 'Eşleştirme + tablo, 2 kolon akış',
    icon: 'fa-table-columns',
    cols: 2,
    build: () => [
      createBlock('header', { text: 'SÖZCÜK ÇALIŞMASI' }),
      createBlock('match_columns', {
        leftColumn: [{ text: 'kitap' }, { text: 'kalem' }, { text: 'defter' }],
        rightColumn: [{ text: 'yazı yazmak' }, { text: 'okumak' }, { text: 'not almak' }],
      }),
      createBlock('table', {
        headers: ['Sözcük', 'Anlamı'],
        rows: [
          ['kitap', ''],
          ['kalem', ''],
        ],
      }),
    ],
  },
  {
    id: 'cloze-warmup',
    label: 'Boşluk Doldurma Isınma',
    description: 'Kısa boşluk metni + ipucu',
    icon: 'fa-pen-nib',
    build: () => [
      createBlock('header', { text: 'BOŞLUK DOLDURMA' }),
      createBlock('cloze_test', {
        text: 'Ali okula [gitti] ve arkadaşlarıyla [oynadı].',
      }),
      createBlock('visual_clue_card', {
        title: 'HATIRLATMA',
        clue: 'Köşeli parantez içindeki sözcükler cevap anahtarına yazılır.',
        icon: 'fa-key',
      }),
    ],
  },
  {
    id: 'reflection',
    label: 'Öz Değerlendirme',
    description: 'Kutu ızgarası + yansıma sorusu',
    icon: 'fa-face-smile',
    build: () => [
      createBlock('header', { text: 'BUGÜN NE ÖĞRENDİM?' }),
      createBlock('text', { text: 'Bugün en çok hangi bölümde zorlandın? Neden?' }),
      createBlock('grid', { cols: 5, cells: ['😀', '🙂', '😐', '🙁', '😟'] }),
      createBlock('footer_validation', {
        text: 'Kendini değerlendir: hedeflediğin çalışmayı tamamladın mı?',
        targetValue: 'Evet',
      }),
    ],
  },
];

export const getPageTemplate = (templateId: string): PageTemplateDefinition | undefined =>
  PAGE_TEMPLATES.find((template) => template.id === templateId);

/** Şablonu ilk blok destekleyen sayfaya ekler; blok yoksa veriyi değiştirmez. */
export const applyPageTemplate = (data: WorksheetData, templateId: string): WorksheetData => {
  const template = getPageTemplate(templateId);
  if (!template) return data;
  const pages = pagesOf(data);
  if (!pages.length) return data;

  const targetIndex = pages.findIndex(
    (page) => Array.isArray(page.layoutArchitecture?.blocks) || Array.isArray(page.blocks)
  );
  if (targetIndex < 0) return data;

  const target = pages[targetIndex];
  const existing = getPageBlocks(target);
  const nextBlocks = [...existing, ...template.build()];
  const nextPages = pages.map((page, index) =>
    index === targetIndex
      ? withPageBlocks(
          template.cols
            ? {
                ...page,
                layoutArchitecture: {
                  cols: template.cols,
                  gap: page.layoutArchitecture?.gap ?? 20,
                  blocks: nextBlocks,
                },
              }
            : { ...page, layoutArchitecture: page.layoutArchitecture ?? { cols: 1, gap: 16, blocks: [] } },
          nextBlocks
        )
      : page
  );

  return Array.isArray(data) ? nextPages : data;
};

/* -------------------------------------------------------------------------- */
/* 5. Taşma / bölünme yardımcıları                                            */
/* -------------------------------------------------------------------------- */

/** Metni cümle sınırından ikiye böler; bölünemezse null döner. */
export const splitTextAtBoundary = (text: string): [string, string] | null => {
  const trimmed = text.trim();
  if (trimmed.length < 120) return null;

  const paragraphs = trimmed.split(/\n{2,}/);
  if (paragraphs.length > 1) {
    const mid = Math.ceil(paragraphs.length / 2);
    return [paragraphs.slice(0, mid).join('\n\n'), paragraphs.slice(mid).join('\n\n')];
  }

  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [trimmed];
  if (sentences.length < 2) return null;
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(' ').trim(), sentences.slice(mid).join(' ').trim()];
};

/** Uzun metin bloğunu iki ayrı bloğa böler (taşma düzeltmesi). */
export const splitTextBlock = (data: WorksheetData, blockId: string): WorksheetData => {
  const pages = pagesOf(data);
  if (!pages.length) return data;
  const id = blockId;

  const nextPages = pages.map((page) => {
    const blocks = getPageBlocks(page);
    if (!blocks.some((block) => block.id === id)) return page;
    const next: WorksheetBlock[] = [];
    blocks.forEach((block) => {
      if (block.id !== id) {
        next.push(block);
        return;
      }
      const parts = splitTextAtBoundary(asString(contentOf(block).text));
      if (!parts) {
        next.push(block);
        return;
      }
      next.push({ ...block, content: { ...contentOf(block), text: parts[0] } });
      next.push({
        ...block,
        id: createBlock(block.type, {}).id,
        content: { ...contentOf(block), text: parts[1], isContinuation: true },
      });
    });
    return withPageBlocks(page, next);
  });

  return Array.isArray(data) ? nextPages : data;
};

/* -------------------------------------------------------------------------- */
/* 6. Dışa aktarma: Word (HTML) ve panoya kopyalama                           */
/* -------------------------------------------------------------------------- */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const blockToHtml = (block: WorksheetBlock, includeAnswers: boolean): string => {
  const content = contentOf(block);
  const text = asString(content.text) || asString(content.clue);
  const answer =
    includeAnswers && blockAnswer(block)
      ? `<p style="font-size:10pt;color:#0D9488;margin:2pt 0 8pt"><strong>Cevap:</strong> ${escapeHtml(
          blockAnswer(block)
        )}</p>`
      : '';

  switch (block.type) {
    case 'header':
      return `<h2 style="font-size:15pt;margin:10pt 0 6pt">${escapeHtml(text)}</h2>`;
    case 'text':
      return `<p style="font-size:11pt;line-height:1.6;margin:0 0 8pt">${escapeHtml(text).replace(
        /\n/g,
        '<br/>'
      )}</p>${answer}`;
    case 'question': {
      const options = Array.isArray(content.options) ? content.options.map(asString) : [];
      const list = options
        .map((option, index) => `<li>${String.fromCharCode(65 + index)}) ${escapeHtml(option)}</li>`)
        .join('');
      return `<p style="font-size:11pt;margin:0 0 4pt"><strong>${escapeHtml(text)}</strong></p>${
        list ? `<ol style="margin:0 0 8pt 14pt;font-size:11pt">${list}</ol>` : ''
      }${answer}`;
    }
    case 'table': {
      const headers = Array.isArray(content.headers) ? content.headers.map(asString) : [];
      const rows = Array.isArray(content.rows) ? content.rows : [];
      const head = headers.length
        ? `<tr>${headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr>`
        : '';
      const body = rows
        .map((row) => {
          const cells = Array.isArray(row) ? row.map(asString) : [asString(row)];
          return `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`;
        })
        .join('');
      return `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt;margin:0 0 8pt">${head}${body}</table>`;
    }
    case 'cloze_test':
      return `<p style="font-size:11pt;line-height:1.9;margin:0 0 8pt">${escapeHtml(text).replace(
        /\[([^\]]+)\]/g,
        '______'
      )}</p>${answer}`;
    case 'match_columns': {
      const left = Array.isArray(content.leftColumn) ? content.leftColumn : [];
      const right = Array.isArray(content.rightColumn) ? content.rightColumn : [];
      const toText = (item: unknown) =>
        isRecord(item) ? asString(item.text) : asString(item);
      return `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt;margin:0 0 8pt"><tr><th>Kavram</th><th>Eşleşim</th></tr>${left
        .map(
          (item, index) =>
            `<tr><td>${escapeHtml(toText(item))}</td><td>${escapeHtml(toText(right[index]))}</td></tr>`
        )
        .join('')}</table>${answer}`;
    }
    case 'visual_clue_card':
      return `<p style="font-size:10pt;font-style:italic;border-left:3px solid #0D9488;padding-left:8pt;margin:0 0 8pt">${escapeHtml(
        text
      )}</p>`;
    case 'image':
      return `<p style="font-size:9pt;color:#64748b;margin:0 0 8pt">[Görsel: ${escapeHtml(
        asString(content.alt) || asString(content.prompt) || 'açıklama yok'
      )}]</p>`;
    case 'grid': {
      const cells = Array.isArray(content.cells) ? content.cells.map(asString) : [];
      return `<p style="font-size:11pt;margin:0 0 8pt">${cells
        .map((cell) => `[ ${escapeHtml(cell)} ]`)
        .join(' ')}</p>`;
    }
    default: {
      const fallback = text || blockPreview(block);
      return fallback
        ? `<p style="font-size:10pt;margin:0 0 8pt">${escapeHtml(fallback)}</p>`
        : '';
    }
  }
};

/** Word (.doc) ve panoya kopyalama için güvenli, yazdırılabilir HTML üretir. */
export const worksheetToHtml = (
  data: WorksheetData,
  options: { title?: string; includeAnswers?: boolean; onlyBlockIds?: string[] } = {}
): string => {
  const pages = pagesOf(data);
  const includeAnswers = options.includeAnswers === true;
  const only = options.onlyBlockIds?.length ? new Set(options.onlyBlockIds) : null;

  const body = pages
    .map((page) => {
      const blocks = getPageBlocks(page).filter(
        (block) =>
          !block.hidden && (!only || (block.id ? only.has(block.id) : false))
      );
      if (!blocks.length) return '';
      const title = page.title ? `<h1 style="font-size:18pt;margin:0 0 6pt">${escapeHtml(page.title)}</h1>` : '';
      const instruction = page.instruction
        ? `<p style="font-size:11pt;font-style:italic;margin:0 0 10pt">${escapeHtml(page.instruction)}</p>`
        : '';
      return `<section>${title}${instruction}${blocks
        .map((block) => blockToHtml(block, includeAnswers))
        .join('')}</section>`;
    })
    .join('<hr style="border:none;border-top:1px dashed #cbd5e1;margin:12pt 0"/>');

  const title = options.title ?? pages[0]?.title ?? 'bdmind Etkinliği';
  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="font-family:Lexend, Arial, sans-serif;color:#1E293B;line-height:1.6">${body}</body></html>`;
};

/** Dosya adı için güvenli taban üretir (Türkçe karakterler korunur). */
export const sanitizeFileBaseName = (value: string, fallback = 'bdmind-etkinlik'): string => {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(0, 80) || fallback;
};

/** Yaklaşık bellek boyutu (UTF-16 karakter başına 2 bayt). */
export const estimateBytes = (value: unknown): number => {
  try {
    return JSON.stringify(value ?? null).length * 2;
  } catch {
    return 0;
  }
};

/** Blok listesinden klonlanmış (yeni kimlikli) kopya üretir — kişisel kütüphane için. */
export const cloneBlockForLibrary = (block: WorksheetBlock): WorksheetBlock => ({
  ...block,
  id: createBlock(block.type, {}).id,
  content: cloneValue(block.content),
  style: block.style ? { ...block.style } : undefined,
  hidden: false,
  locked: false,
});
