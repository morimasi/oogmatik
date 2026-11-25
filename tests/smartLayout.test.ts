/**
 * Akıllı Mizanpaj Motoru — Saf planlama çekirdeği testleri
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  chunkByHeights,
  rebalanceChunks,
  planBreakOffsets,
  resolvePageBox,
  buildExportPages,
  type BlockMeasure,
} from '../src/utils/print/SmartLayout';

describe('resolvePageBox', () => {
  it('A4 dikey için kenar boşluklarını düşer', () => {
    const box = resolvePageBox('A4', 8, false);
    expect(box.widthPx).toBeGreaterThan(780);
    expect(box.heightPx).toBeGreaterThan(1110);
    expect(box.contentWidthPx).toBeLessThan(box.widthPx);
    expect(box.contentHeightPx).toBeLessThan(box.heightPx);
    expect(box.landscape).toBe(false);
  });

  it('yatay modda genişlik ve yüksekliği takas eder', () => {
    const portrait = resolvePageBox('A4', 8, false);
    const landscape = resolvePageBox('A4', 8, true);
    expect(landscape.widthPx).toBe(portrait.heightPx);
    expect(landscape.heightPx).toBe(portrait.widthPx);
  });

  it('geçersiz kağıt tipinde A4 değerlerine düşer', () => {
    const box = resolvePageBox('Bilinmeyen' as never, 8, false);
    expect(box.widthPx).toBeGreaterThan(700);
  });
});

describe('chunkByHeights', () => {
  it('sığan öğeleri tek grupta tutar', () => {
    expect(chunkByHeights([100, 100, 100], 400)).toEqual([[0, 1, 2]]);
  });

  it('sayfayı aşınca yeni grup açar ve öğeyi bölmez', () => {
    const groups = chunkByHeights([300, 300, 200], 500);
    expect(groups).toEqual([[0], [1, 2]]);
  });

  it('tek başına sayfaya sığmayan öğeyi yalnız bırakır', () => {
    const groups = chunkByHeights([120, 900, 120], 500);
    expect(groups).toEqual([[0], [1], [2]]);
  });

  it('boş girdi için boş dizi döner', () => {
    expect(chunkByHeights([], 500)).toEqual([]);
  });
});

describe('rebalanceChunks', () => {
  it('son sayfada tek kalan öğeyi önceki sayfadan kaydırır', () => {
    const heights = [130, 130, 130, 130, 5];
    const groups = rebalanceChunks([[0, 1, 2], [3, 4]], heights, 400);
    // Son grup %35 doluluğun altında → önceki gruptan son öğe kaydırılır
    expect(groups[1]).toEqual([2, 3, 4]);
    expect(groups[0]).toEqual([0, 1]);
  });

  it('dengeli dağılımı bozmaz', () => {
    const heights = [200, 200, 200, 200];
    const groups = rebalanceChunks([[0, 1], [2, 3]], heights, 500);
    expect(groups).toEqual([[0, 1], [2, 3]]);
  });
});

describe('planBreakOffsets', () => {
  it('sayfaya sığan içerik için tek dilim döner', () => {
    expect(planBreakOffsets([], 800, 1000)).toEqual([0, 800]);
  });

  it('bloğun içinden geçmek yerine blok başından keser', () => {
    const blocks: BlockMeasure[] = [
      { top: 0, height: 300 },
      { top: 300, height: 400 }, // 300–700
      { top: 700, height: 300 },
    ];
    const offsets = planBreakOffsets(blocks, 1000, 600);
    // İlk kesme noktası 700 (blok başı) olmalı, 600 (blok ortası) değil
    expect(offsets[0]).toBe(0);
    expect(offsets).toContain(700);
    expect(offsets).not.toContain(600);
  });

  it('bölünebilir blokta satır sınırını tercih eder', () => {
    const blocks: BlockMeasure[] = [
      { top: 0, height: 400 },
      {
        top: 400,
        height: 500,
        splittable: true,
        children: [
          { top: 400, height: 100 },
          { top: 500, height: 100 },
          { top: 600, height: 100 },
          { top: 700, height: 100 },
          { top: 800, height: 100 },
        ],
      },
    ];
    const offsets = planBreakOffsets(blocks, 900, 650);
    // 650 yerine 600 (satır sınırı) tercih edilmeli
    expect(offsets).toContain(600);
  });

  it('her zaman totalHeight ile biter ve artan sıradadır', () => {
    const blocks: BlockMeasure[] = Array.from({ length: 12 }, (_, i) => ({
      top: i * 250,
      height: 250,
    }));
    const offsets = planBreakOffsets(blocks, 3000, 700);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(3000);
    for (let i = 1; i < offsets.length; i += 1) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
    }
  });

  it('sonsuz döngüye girmez (ilerleme garantisi)', () => {
    const blocks: BlockMeasure[] = [{ top: 0, height: 5000 }];
    const offsets = planBreakOffsets(blocks, 5000, 100);
    expect(offsets.length).toBeGreaterThan(2);
    expect(offsets[offsets.length - 1]).toBe(5000);
  });
});

describe('buildExportPages', () => {
  it('içerik yoksa boş dizi döner', () => {
    expect(buildExportPages([], { paperSize: 'A4' })).toEqual([]);
  });

  it('layout üretmeyen ortamda sayfayı bozmadan tek sayfa döner', () => {
    document.body.innerHTML = '<div class="worksheet-page"><p>Merhaba</p></div>';
    const source = document.querySelector('.worksheet-page') as HTMLElement;
    const pages = buildExportPages([source], { paperSize: 'A4' });
    expect(pages).toHaveLength(1);
    expect(pages[0].total).toBe(1);
    expect(pages[0].isContinuation).toBe(false);
    expect(pages[0].element.textContent).toContain('Merhaba');
    document.body.innerHTML = '';
  });
});
