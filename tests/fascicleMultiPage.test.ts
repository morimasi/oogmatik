import { describe, it, expect } from 'vitest';
import { buildFasciclePages, getFasciclePageCount } from '../src/utils/fascicleContentNormalizer';
import { ActivityType } from '../src/types/activity';

/**
 * Fasikülde hiçbir etkinlik sayfası kırpılmaz:
 * üretilen tüm A4 sayfaları sırayla yerleştirilir ve sayfa sayısı render ile aynı kaynaktan gelir.
 */
describe('Fasikül çok sayfalı etkinlik yerleşimi', () => {
  it('Etkinlik Havuzu sarmalındaki TÜM üretilmiş sayfalar korunmalı', () => {
    const item = {
      type: ActivityType.FIND_LETTER_PAIR,
      content: {
        data: [
          { title: 'Harf Eşleme 1', items: [{ id: 1 }] },
          { title: 'Harf Eşleme 2', items: [{ id: 2 }] },
          { title: 'Harf Eşleme 3', items: [{ id: 3 }] },
        ],
        title: 'Harf Eşleme',
        instruction: 'Eşleri bulun.',
        pedagogicalNote: 'Görsel ayrımlama becerisini destekler.',
      },
    };

    const { pages } = buildFasciclePages(item, 1);
    expect(pages).toHaveLength(3);
    expect(pages.map(p => (p as unknown as { title: string }).title)).toEqual([
      'Harf Eşleme 1',
      'Harf Eşleme 2',
      'Harf Eşleme 3',
    ]);
    expect(getFasciclePageCount({ ...item, pageCount: 1 })).toBe(3);
  });

  it('Süper Stüdyo her içerik payload’ını ayrı sayfaya yerleştirmeli', () => {
    const item = {
      type: ActivityType.SUPER_STUDIO,
      content: { content: [{ title: 'S1' }, { title: 'S2' }] },
    };

    const { pages } = buildFasciclePages(item, 1);
    expect(pages).toHaveLength(2);
    expect(getFasciclePageCount({ ...item, pageCount: 1 })).toBe(2);
  });

  it('Kelime-Cümle öğeleri sayfa başına sınırla bölünmeli, hiçbir öğe kaybolmamalı', () => {
    const items = Array.from({ length: 23 }, (_, i) => ({ id: i + 1 }));
    const item = {
      type: ActivityType.KELIME_CUMLE,
      content: {
        content: { title: 'Boşluk Doldurma', instructions: 'Tamamla.', items, activityType: 'bosluk_doldurma' },
        config: { type: 'bosluk_doldurma', itemsPerPage: 10 },
      },
    };

    const { pages } = buildFasciclePages(item, 1);
    expect(pages).toHaveLength(3);

    const renderedItemCount = pages.reduce((sum, page) => {
      const inner = (page as unknown as { content: { items: unknown[] } }).content;
      return sum + inner.items.length;
    }, 0);
    expect(renderedItemCount).toBe(23);
    expect(getFasciclePageCount({ ...item, pageCount: 1 })).toBe(3);
  });

  it('Sınav soruları sayfalara bölünmeli, toplam soru sayısı korunmalı', () => {
    const sorular = Array.from({ length: 9 }, (_, i) => ({ id: `s${i + 1}` }));
    const item = {
      type: ActivityType.SINAV,
      content: { baslik: 'Deneme Sınavı', sorular },
    };

    const { pages } = buildFasciclePages(item, 2);
    expect(pages).toHaveLength(3);

    const renderedQuestions = pages.reduce(
      (sum, page) => sum + ((page as unknown as { sorular: unknown[] }).sorular?.length || 0),
      0
    );
    expect(renderedQuestions).toBe(9);

    // Her sayfa gerçek toplamı gösterir (4 değil, 9)
    pages.forEach(page => {
      expect((page as unknown as { totalSoruOverride: number }).totalSoruOverride).toBe(9);
    });
    expect(getFasciclePageCount({ ...item, pageCount: 1 })).toBe(3);
  });

  it('Tek sayfalık etkinlik ve boş sayfa tek A4 olarak kalmalı', () => {
    const single = {
      type: ActivityType.FIND_LETTER_PAIR,
      content: { title: 'Tek Sayfa', items: [{ id: 1 }] },
    };
    expect(getFasciclePageCount({ ...single, pageCount: 1 })).toBe(1);

    const blank = { type: 'blank_page', content: { title: 'Not' } };
    expect(getFasciclePageCount({ ...blank, pageCount: 1 })).toBe(1);
  });
});
