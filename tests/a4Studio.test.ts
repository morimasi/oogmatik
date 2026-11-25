import { describe, it, expect } from 'vitest';
import type { SingleWorksheetData, WorksheetBlock, WorksheetData } from '../src/types';
import {
  ANSWER_KEY_PAGE_ID,
  PAGE_TEMPLATES,
  applyPageTemplate,
  auditSummary,
  auditWorksheet,
  blockAnswer,
  buildAnswerKeyPage,
  collectAnswers,
  contrastRatio,
  inlineTextTarget,
  sanitizeFileBaseName,
  splitTextAtBoundary,
  splitTextBlock,
  worksheetToHtml,
} from '../src/services/a4StudioService';
import {
  deleteVersion,
  importVersions,
  loadBlockLibrary,
  loadVersions,
  parseVersionsFile,
  removeBlockFromLibrary,
  saveBlockToLibrary,
  saveVersion,
  serializeVersions,
  versionStorageKey,
} from '../src/services/a4DraftService';
import { cloneBlockForLibrary } from '../src/services/a4StudioService';

const block = (
  id: string,
  type: WorksheetBlock['type'],
  content: Record<string, unknown>,
  extra: Partial<WorksheetBlock> = {}
): WorksheetBlock => ({ id, type, content, ...extra });

const page = (blocks: WorksheetBlock[]): SingleWorksheetData => ({
  title: 'Deneme Etkinliği',
  instruction: 'Yönerge metni',
  layoutArchitecture: { cols: 1, gap: 16, blocks },
});

const data = (blocks: WorksheetBlock[] = []): WorksheetData => [page(blocks)];

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe('a4StudioService — satır içi düzenleme ve cevap anahtarı', () => {
  it('metin taşıyan bileşenler için düzenleme hedefi döndürür', () => {
    expect(inlineTextTarget(block('b1', 'header', { text: 'BAŞLIK' }))).toMatchObject({
      key: 'text',
      value: 'BAŞLIK',
    });
    expect(inlineTextTarget(block('b2', 'visual_clue_card', { clue: 'İpucu' }))).toMatchObject({
      key: 'clue',
      value: 'İpucu',
    });
    expect(inlineTextTarget(block('b3', 'table', { headers: [] }))).toBeNull();
  });

  it('cevabı farklı içerik şekillerinden türetir', () => {
    expect(blockAnswer(block('a', 'question', { answer: 'B' }))).toBe('B');
    expect(blockAnswer(block('b', 'question', { correctAnswer: 'C' }))).toBe('C');
    expect(blockAnswer(block('c', 'question', {}, { answerText: 'Öğretmen cevabı' }))).toBe(
      'Öğretmen cevabı'
    );
    expect(blockAnswer(block('d', 'cloze_test', { text: 'Ali [gitti] ve [oynadı].' }))).toBe(
      'gitti • oynadı'
    );
    expect(blockAnswer(block('e', 'text', { text: 'cevapsız' }))).toBe('');
  });

  it('cevapları toplar ve ayrı cevap anahtarı sayfası üretir', () => {
    const workbook = data([
      block('q1', 'question', { text: 'Soru 1', answer: 'A' }),
      block('q2', 'question', { text: 'Soru 2' }),
      block('c1', 'cloze_test', { text: 'Bir [elma] ve bir [armut].' }),
    ]);

    const entries = collectAnswers(workbook);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.answer).toBe('A');

    const answerPage = buildAnswerKeyPage(workbook);
    expect(answerPage?.id).toBe(ANSWER_KEY_PAGE_ID);
    const blocks = answerPage?.layoutArchitecture?.blocks ?? [];
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(String(blocks[0]?.content && (blocks[0].content as { text?: string }).text)).toContain(
      'CEVAP'
    );
  });

  it('cevap yoksa cevap anahtarı sayfası üretmez', () => {
    expect(buildAnswerKeyPage(data([block('t1', 'text', { text: 'Sadece metin' })]))).toBeNull();
  });
});

describe('a4StudioService — üretim denetimi', () => {
  it('küçük punto ve düşük kontrastı hata olarak işaretler', () => {
    const issues = auditWorksheet(
      data([
        block('h1', 'header', { text: 'BAŞLIK' }, { style: { fontSize: 11 } }),
        block(
          't1',
          'text',
          { text: 'Soluk metin' },
          { style: { color: '#EEEEEE', backgroundColor: '#FFFFFF' } }
        ),
      ])
    );
    expect(issues.some((issue) => issue.fix === 'increase-font')).toBe(true);
    expect(issues.some((issue) => issue.fix === 'contrast')).toBe(true);
    expect(auditSummary(issues).score).toBeLessThan(100);
  });

  it('alt metinsiz görseli ve sıkışık satır aralığını yakalar', () => {
    const issues = auditWorksheet(
      data([
        block('i1', 'image', { prompt: '' }),
        block('t2', 'text', { text: 'Metin' }, { style: { lineHeight: 1.1 } }),
      ])
    );
    expect(issues.some((issue) => issue.id === 'i1-alt')).toBe(true);
    expect(issues.some((issue) => issue.fix === 'line-height')).toBe(true);
  });

  it('temiz sayfada hata üretmez ve yüksek puan verir', () => {
    const issues = auditWorksheet(
      data([block('h2', 'header', { text: 'BAŞLIK' }, { style: { fontSize: 18, lineHeight: 1.6 } })]),
      { fontSize: 'orta', lineHeight: 1.6 } as never
    );
    expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0);
    expect(auditSummary(issues).score).toBe(100);
  });

  it('WCAG kontrast oranını hesaplar', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeLessThan(4.5);
    expect(contrastRatio('bilinmeyen', '#FFFFFF')).toBeNull();
  });
});

describe('a4StudioService — şablonlar, bölme ve dışa aktarma', () => {
  it('her sayfa şablonu en az bir bileşen üretir', () => {
    PAGE_TEMPLATES.forEach((template) => {
      expect(template.build().length).toBeGreaterThan(0);
    });
  });

  it('şablonu ilk blok sayfasına ekler', () => {
    const next = applyPageTemplate(data([block('t1', 'text', { text: 'Mevcut' })]), 'guided-practice');
    const blocks = Array.isArray(next) ? next[0].layoutArchitecture?.blocks ?? [] : [];
    expect(blocks.length).toBeGreaterThan(1);
    expect(blocks[0]?.id).toBe('t1');
  });

  it('blok desteklemeyen sayfayı şablonla bozmaz', () => {
    const legacy: WorksheetData = [{ title: 'Eski', instruction: 'Yönerge' }];
    const next = applyPageTemplate(legacy, 'reflection');
    expect(Array.isArray(next) && next[0].layoutArchitecture).toBeUndefined();
  });

  it('metni cümle sınırından ikiye böler', () => {
    const text = `${'Birinci cümle burada ve oldukça uzun. '.repeat(3)}${'İkinci cümle burada ve oldukça uzun. '.repeat(3)}${'Üçüncü cümle burada ve oldukça uzun. '.repeat(3)}`;
    const parts = splitTextAtBoundary(text);
    expect(parts).not.toBeNull();
    expect(parts?.[0]).toContain('Birinci');
    expect(parts?.[1]).toContain('Üçüncü');
    expect(splitTextAtBoundary('Kısa metin.')).toBeNull();
  });

  it('bölünen metin bloğu iki ayrı kimlik üretir', () => {
    const long = `${'Uzun cümle bir. '.repeat(20)}Son cümle.`;
    const next = splitTextBlock(data([block('t9', 'text', { text: long })]), 't9');
    const blocks = Array.isArray(next) ? next[0].layoutArchitecture?.blocks ?? [] : [];
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.id).toBe('t9');
    expect(blocks[1]?.id).not.toBe('t9');
  });

  it('Word için güvenli HTML üretir ve gizli blokları atlar', () => {
    const html = worksheetToHtml(
      data([
        block('h1', 'header', { text: '<script>alert(1)</script>' }),
        block('q1', 'question', { text: 'Soru?', options: ['A', 'B'], answer: 'A' }),
        block('x1', 'text', { text: 'Gizli' }, { hidden: true }),
      ]),
      { title: 'Test', includeAnswers: true }
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('Cevap:');
    expect(html).not.toContain('Gizli');
  });

  it('dosya adını güvenli hale getirir', () => {
    expect(sanitizeFileBaseName('Deneme / Etkinlik: 1')).toBe('Deneme-Etkinlik-1');
    expect(sanitizeFileBaseName('   ')).toBe('bdmind-etkinlik');
  });

  it('kişisel kütüphane kopyası yeni kimlik üretir ve içeriği derin kopyalar', () => {
    const source = block('b1', 'question', { text: 'Soru', options: ['A'] });
    const copy = cloneBlockForLibrary(source);
    expect(copy.id).not.toBe('b1');
    expect(copy.content).toEqual(source.content);
    (copy.content as { options: string[] }).options.push('B');
    expect((source.content as { options: string[] }).options).toEqual(['A']);
  });
});

describe('a4DraftService — sürümler ve kişisel kütüphane', () => {
  it('sürüm kaydeder, listeler ve siler', () => {
    const storage = new MemoryStorage();
    const result = saveVersion('TEST', 'İlk sürüm', data([block('t1', 'text', { text: 'a' })]), storage);
    expect(result.saved).toBe(true);
    expect(loadVersions('TEST', storage)).toHaveLength(1);
    expect(loadVersions('TEST', storage)[0]?.name).toBe('İlk sürüm');
    expect(storage.getItem(versionStorageKey('TEST'))).toBeTruthy();

    const afterDelete = deleteVersion('TEST', result.versions[0].id, storage);
    expect(afterDelete).toHaveLength(0);
  });

  it('bozuk depolama içeriğinde güvenli boş liste döndürür', () => {
    const storage = new MemoryStorage();
    storage.setItem(versionStorageKey('BOZUK'), '{bozuk');
    expect(loadVersions('BOZUK', storage)).toEqual([]);
  });

  it('sürüm dosyasını dışa/içe aktarır', () => {
    const storage = new MemoryStorage();
    const { versions } = saveVersion('AKTARIM', 'S1', data([block('t1', 'text', { text: 'a' })]), storage);
    const file = serializeVersions(versions);
    const parsed = parseVersionsFile(file);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.name).toBe('S1');
    expect(parseVersionsFile('geçersiz')).toEqual([]);

    const imported = importVersions('YENI', parsed, storage);
    expect(imported).toHaveLength(1);
    expect(loadVersions('YENI', storage)).toHaveLength(1);
  });

  it('kişisel blok kütüphanesine ekler ve çıkarır', () => {
    const storage = new MemoryStorage();
    const library = saveBlockToLibrary(block('b1', 'text', { text: 'a' }), 'Metin', storage);
    expect(library).toHaveLength(1);
    expect(loadBlockLibrary(storage)[0]?.label).toBe('Metin');
    expect(removeBlockFromLibrary(library[0].id, storage)).toHaveLength(0);
  });
});
