import { describe, it, expect, beforeEach } from 'vitest';
import {
  clampPageIndex,
  flattenPreviewPages,
  hasRenderablePages,
} from '../src/components/SuperStudio/components/A4PreviewPanel';
import {
  generateOfflineSuperStudioTemplate,
  buildOfflinePayload,
} from '../src/services/generators/superOfflineEngine';
import { useSuperStudioStore } from '../src/store/useSuperStudioStore';
import type { GeneratedContentPayload } from '../src/types/superStudio';

const makePayload = (id: string, templateId: string, contents: (string | null)[]): GeneratedContentPayload => ({
  id,
  templateId,
  createdAt: Date.now(),
  pages: contents.map((c, i) => ({
    title: `Sayfa ${i + 1}`,
    content: c as unknown as string,
    instruction: 'Yönerge',
  })),
});

describe('SuperStudio Preview — sayfa geçişi ve boş içerik koruması', () => {
  it('clampPageIndex: negatif indekste 0 döner', () => {
    expect(clampPageIndex(-5, 4)).toBe(0);
  });

  it('clampPageIndex: taşan indekste son sayfaya kelepçelenir', () => {
    expect(clampPageIndex(99, 4)).toBe(3);
    expect(clampPageIndex(4, 4)).toBe(3);
  });

  it('clampPageIndex: NaN / boş listede 0 döner (boş preview güvenliği)', () => {
    expect(clampPageIndex(NaN, 4)).toBe(0);
    expect(clampPageIndex(2, 0)).toBe(0);
    expect(clampPageIndex(0, 0)).toBe(0);
  });

  it('clampPageIndex: geçerli indeksi aynen geçirir, ondalığı tabanlar', () => {
    expect(clampPageIndex(1, 4)).toBe(1);
    expect(clampPageIndex(1.9, 4)).toBe(1);
  });

  it('flattenPreviewPages: boş listede boş dizi döner', () => {
    expect(flattenPreviewPages([])).toEqual([]);
  });

  it('flattenPreviewPages: içeriği boş sayfaları eler (boş sayfa koruması)', () => {
    const pages = flattenPreviewPages([
      makePayload('c1', 'okuma-anlama', ['Dolu içerik', '   ', '']),
    ]);
    expect(pages).toHaveLength(1);
    expect(pages[0].content).toBe('Dolu içerik');
    expect(pages[0].contentId).toBe('c1');
  });

  it('hasRenderablePages: tamamen boş içerikte false döner', () => {
    expect(hasRenderablePages([])).toBe(false);
    expect(hasRenderablePages([makePayload('c1', 'okuma-anlama', ['', '  '])])).toBe(false);
  });

  it('hasRenderablePages: en az bir dolu sayfada true döner', () => {
    expect(
      hasRenderablePages([makePayload('c1', 'okuma-anlama', ['', 'Gerçek içerik'])])
    ).toBe(true);
  });
});

describe('SuperStudio — hayalet templateSettings temizliği', () => {
  beforeEach(() => {
    useSuperStudioStore.getState().resetStore();
  });

  it('seçim kaldırılan şablonun ayarları templateSettings içinde kalmaz', () => {
    const store = useSuperStudioStore.getState();
    store.toggleTemplate('okuma-anlama');
    expect(useSuperStudioStore.getState().selectedTemplates).toContain('okuma-anlama');
    expect(useSuperStudioStore.getState().templateSettings['okuma-anlama']).toBeDefined();

    useSuperStudioStore.getState().toggleTemplate('okuma-anlama');
    const after = useSuperStudioStore.getState();
    expect(after.selectedTemplates).not.toContain('okuma-anlama');
    expect('okuma-anlama' in after.templateSettings).toBe(false);
  });

  it('seçilen şablon varsayılan ayarlarla başlar', () => {
    useSuperStudioStore.getState().toggleTemplate('dil-bilgisi');
    const settings = useSuperStudioStore.getState().templateSettings['dil-bilgisi'];
    expect(settings).toBeDefined();
    expect(typeof settings).toBe('object');
  });
});

describe('superOfflineEngine — GeneratedContentPayload şema uyumu ve zengin içerik', () => {
  const templates = [
    'okuma-anlama',
    'dil-bilgisi',
    'mantik-muhakeme',
    'yaratici-yazarlik',
    'yazim-noktalama',
    'soz-varligi',
    'hece-ses',
    'kelime-bilgisi',
  ];

  it.each(templates)('%s: boş olmayan gerçek Türkçe eğitim içeriği üretir', (tpl) => {
    const md = generateOfflineSuperStudioTemplate(tpl, {}, '3. Sınıf', 'Doğa', 'Orta');
    expect(typeof md).toBe('string');
    expect(md.trim().length).toBeGreaterThan(100);
    expect(md.toLowerCase()).not.toContain('lorem');
    expect(md).toContain('GÖREV');
    expect(md).toContain('Öğretmen Notu');
  });

  it('bilinmeyen şablon placeholder yerine zengin pedagojik varsayılan döner', () => {
    const md = generateOfflineSuperStudioTemplate('bilinmeyen-sablon', {}, null, 'Uzay', 'Kolay');
    expect(md).not.toContain('henüz hazırlanıyor');
    expect(md).toContain('GÖREV 1');
    expect(md).toContain('GÖREV 2');
    expect(md).toContain('Öğretmen Notu');
  });

  it('buildOfflinePayload: GeneratedContentPayload şemasına uyar', () => {
    const md = generateOfflineSuperStudioTemplate('okuma-anlama', {}, '2. Sınıf', 'Orman', 'Kolay');
    const payload = buildOfflinePayload('okuma-anlama', md, 'Okuma Anlama', 'Oku ve cevapla.');
    expect(payload.id).toBeTruthy();
    expect(payload.templateId).toBe('okuma-anlama');
    expect(typeof payload.createdAt).toBe('number');
    expect(payload.pages.length).toBeGreaterThan(0);
    for (const [i, page] of payload.pages.entries()) {
      expect(page.title).toBeTruthy();
      expect(page.content.trim().length).toBeGreaterThan(0);
      expect(page.pageNumber).toBe(i + 1);
      expect(page.totalPages).toBe(payload.pages.length);
      expect(page.pedagogicalNote).toBeTruthy();
    }
  });

  it('buildOfflinePayload: boş markdown girdisinde güvenli varsayılan üretir (boş sayfa yok)', () => {
    const payload = buildOfflinePayload('okuma-anlama', '   ', '', 'Yönerge');
    expect(payload.pages.length).toBeGreaterThan(0);
    expect(payload.pages[0].content.trim().length).toBeGreaterThan(0);
    expect(payload.pages[0].title).toBeTruthy();
  });

  it('KVKK: offline içerikte tanı koyucu dil ve öğrenci verisi yer almaz', () => {
    const md = generateOfflineSuperStudioTemplate('okuma-anlama', {}, '2. Sınıf', 'Orman', 'Kolay');
    expect(md).not.toMatch(/disleksisi var/i);
    expect(md).not.toMatch(/dehb.?li (öğrenci|çocuk)/i);
    expect(md).not.toMatch(/tanı:/i);
  });
});
