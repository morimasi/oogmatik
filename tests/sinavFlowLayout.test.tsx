/**
 * Sınav akışkan soru dizilimi (multi-column) düzen testi.
 * Grid kök nedeni: grid satırı en uzun karta göre yükseklik alır + break-inside:avoid
 * tüm satırı iter → ölü boşluklar. Multi-column akışta her soru bağımsız akar.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SinavOnizleme } from '../src/components/SinavStudyosu/SinavOnizleme';
import type { Sinav, PrintConfig } from '../src/types/sinav';

const kisaSoru = {
  id: 's1',
  tip: 'coktan-secmeli',
  zorluk: 'Kolay',
  soruMetni: 'Kısa soru.',
  secenekler: ['A şıkkı', 'B şıkkı', 'C şıkkı', 'D şıkkı'],
  dogruCevap: 0,
  kazanimKodu: 'T.5.3.7',
  puan: 10,
  tahminiSure: 60,
} as const;

const uzunSoru = {
  id: 's2',
  tip: 'acik-uclu',
  zorluk: 'Zor',
  soruMetni:
    'Uzun soru metni. '.repeat(40),
  dogruCevap: 'Örnek cevap metni',
  kazanimKodu: 'T.5.3.8',
  puan: 20,
  tahminiSure: 300,
} as const;

const mockSinav = {
  id: 'sinav-1',
  baslik: 'Akışkan Dizilim Test Sınavı',
  sinif: 5,
  secilenKazanimlar: ['T.5.3.7'],
  sorular: [kisaSoru, uzunSoru],
  toplamPuan: 30,
  tahminiSure: 360,
  olusturmaTarihi: '2026-01-01',
  olusturanKullanici: 'test',
  cevapAnahtari: { sorular: [] },
} as unknown as Sinav;

const mockConfig: PrintConfig = {
  fontSize: 10,
  fontFamily: 'helvetica',
  columns: 2,
  marginMm: 18,
  questionSpacingMm: 8,
  lineHeight: 1.6,
  textAlign: 'left',
};

function renderHtml(isPrinting: boolean): string {
  return renderToStaticMarkup(
    <SinavOnizleme sinav={mockSinav} config={mockConfig} isPrinting={isPrinting} />,
  );
}

describe('SinavOnizleme akışkan (multi-column) soru dizilimi', () => {
  it('(a) container multi-column kullanır, grid kullanmaz; soru bölünmez', () => {
    for (const isPrinting of [false, true]) {
      const html = renderHtml(isPrinting);
      // React inline style → column-count / column-gap / column-fill
      expect(html).toContain('column-count');
      expect(html).toContain('break-inside:avoid');
      expect(html).not.toContain('display:grid');
      expect(html).not.toContain('grid-template-columns');
    }
  });

  it('(b) soru aralarında boşluk payı vardır', () => {
    const screenHtml = renderHtml(false);
    expect(screenHtml).toContain('margin-bottom');
    const printHtml = renderHtml(true);
    // Baskı <style> bloğu: sütun aralığı + soru altı boşluk + bölünmezlik
    expect(printHtml).toContain('column-gap');
    expect(printHtml).toContain('margin-bottom:3mm');
    expect(printHtml).toContain('break-inside:avoid');
    // Ayırıcı çizgi korunur
    expect(printHtml).toMatch(/border-bottom:\s*1px dashed #ccc/);
  });

  it('(c) farklı uzunluktaki sorular art arda gelir, sabit satır yüksekliği yoktur', () => {
    const html = renderHtml(false);
    const firstIdx = html.indexOf('Kısa soru.');
    const secondIdx = html.indexOf('Uzun soru metni.');
    expect(firstIdx).toBeGreaterThan(-1);
    expect(secondIdx).toBeGreaterThan(firstIdx);
    // Sabit satır/kart yüksekliği dayatması yok
    expect(html).not.toContain('grid-template-rows');
    expect(html).not.toMatch(/min-height:\s*\d/);
  });
});
