import { describe, it, expect, beforeEach } from 'vitest';
import { useFascicleStore } from '../src/store/useFascicleStore';
import { getFasciclePageCount, normalizeFascicleContent } from '../src/utils/fascicleContentNormalizer';
import { ActivityType } from '../src/types/activity';
import { fascicleAIEngine } from '../src/services/fascicleAIEngine';
import { sanitizeSvgMarkup } from '../src/utils/fascicleSecurity';

describe('Fasikül Stüdyosu Ultra-Premium v2.5 Duman Testleri', () => {
  beforeEach(() => {
    useFascicleStore.getState().reset();
  });

  it('useFascicleStore başlangıç durumu ve items ekleme/silme doğru çalışmalı', () => {
    const store = useFascicleStore.getState();
    expect(store.items).toHaveLength(0);
    expect(store.metadata.title).toBe('İsimsiz Fasikül');

    // Aktivite ekleme
    store.addItem({
      id: 'test-item-1',
      type: ActivityType.FIND_LETTER_PAIR,
      difficulty: 'Kolay',
      pageCount: 1,
      order: 0,
      content: { 
        data: [{ title: 'Harf Eşleme' }],
        pedagogicalNote: 'Görsel harf ayrıştırma ZPD güven inşası.'
      }
    });

    const updated = useFascicleStore.getState();
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].id).toBe('test-item-1');
    expect((updated.items[0].content as any).pedagogicalNote).toBeDefined();

    // Boş sayfa ekleme
    updated.addBlankPage();
    const withBlank = useFascicleStore.getState();
    expect(withBlank.items).toHaveLength(2);
    expect(withBlank.items[1].type).toBe('blank_page');

    // Undo kontrolü
    withBlank.undo();
    const afterUndo = useFascicleStore.getState();
    expect(afterUndo.items).toHaveLength(1);
  });

  it('getFasciclePageCount farklı içerik türleri için sayfa sayısını doğru hesaplamalı', () => {
    // Standart tek sayfalık
    const normalCount = getFasciclePageCount({
      type: ActivityType.FIND_LETTER_PAIR,
      pageCount: 1,
      content: {}
    });
    expect(normalCount).toBe(1);

    // SuperStudio çoklu sayfa
    const superCount = getFasciclePageCount({
      type: ActivityType.SUPER_STUDIO,
      pageCount: 1,
      content: { content: [{}, {}, {}] }
    });
    expect(superCount).toBe(3);

    // Sınav (8 soru = 2 sayfa)
    const sinavCount = getFasciclePageCount({
      type: ActivityType.SINAV,
      pageCount: 1,
      content: { sorular: [1, 2, 3, 4, 5, 6, 7, 8] }
    });
    expect(sinavCount).toBe(2);
  });

  it('normalizeFascicleContent SheetRenderer için veriyi doğru formatlamalı', () => {
    const normalized = normalizeFascicleContent({
      type: ActivityType.SINAV,
      content: { baslik: 'Matematik Sınavı', sorular: [1, 2, 3] }
    }, 2);

    expect(normalized.activityType).toBe(ActivityType.SINAV);
    expect((normalized.data as any).baslik).toBe('Matematik Sınavı');
  });

  it('fascicleAIEngine singleton ve metodları tanımlı olmalı', () => {
    expect(fascicleAIEngine).toBeDefined();
    expect(typeof fascicleAIEngine.autoSortByDifficulty).toBe('function');
    expect(typeof fascicleAIEngine.generateCoverDesign).toBe('function');
    expect(typeof fascicleAIEngine.generateExecutiveSummary).toBe('function');
    expect(typeof fascicleAIEngine.getSmartSuggestions).toBe('function');
  });

  it('pedagogicalNote ve tanı koyucu olmayan dil prensipleri sağlanmalı', () => {
    const sampleItem = {
      id: 'zpd-test',
      type: ActivityType.READING_STROOP,
      difficulty: 'Kolay' as const,
      pageCount: 1,
      order: 0,
      content: {
        title: 'Stroop Testi',
        pedagogicalNote: 'Öğrencinin çeldiricileri bastırma ve dikkat odaklama becerisini destekler.'
      }
    };

    const note = (sampleItem.content as any).pedagogicalNote;
    expect(note).toBeTruthy();
    // Tanı koyucu dil içermemeli
    expect(note).not.toContain('disleksisi var');
    expect(note).not.toContain('hasta');
    expect(note).not.toContain('özürlü');
  });

  // Faz 4 / XSS-1: AI kapak SVG'si sanitize edilmeden basılmaz
  it('sanitizeSvgMarkup zararlı script ve olay niteliklerini temizlemeli', () => {
    const dirty =
      '<svg viewBox="0 0 10 10"><script>alert(1)</script>' +
      '<circle cx="5" cy="5" r="4" onload="alert(2)" fill="#9b8df7" /></svg>';

    const clean = sanitizeSvgMarkup(dirty);

    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('alert(');
    expect(clean).not.toContain('onload');
    expect(clean).toContain('circle');
    expect(clean).toContain('#9b8df7');
  });

  it('sanitizeSvgMarkup güvenli dekoratif SVG\'yi korumalı, boş girdide boş dönmeli', () => {
    const safe = '<svg viewBox="0 0 800 600"><rect x="0" y="0" width="10" height="10" fill="#7dcea0" /></svg>';

    expect(sanitizeSvgMarkup(safe)).toContain('rect');
    expect(sanitizeSvgMarkup('')).toBe('');
    expect(sanitizeSvgMarkup(null)).toBe('');
  });

  // Faz 2 / FEA-4: AI yönetici özeti store üzerinden kalıcı tutulur
  it('executiveSummary store\'da saklanmalı ve reset ile temizlenmeli', () => {
    useFascicleStore.getState().setExecutiveSummary('Bu fasikül güven inşası için sıralanmıştır.');
    expect(useFascicleStore.getState().executiveSummary).toBe('Bu fasikül güven inşası için sıralanmıştır.');

    useFascicleStore.getState().reset();
    expect(useFascicleStore.getState().executiveSummary).toBe('');
  });
});
