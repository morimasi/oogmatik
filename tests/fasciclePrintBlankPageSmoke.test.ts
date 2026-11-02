// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { collectPages } from '../src/utils/print/CaptureEngine';

describe('Fasikül Baskı ve Boş Sayfa Önleme Testleri (Zafer Aydın)', () => {
  it('collectPages iç içe geçmiş worksheet-page elemanlarını tekilleştirmeli (nested page de-duplication)', () => {
    // Mock DOM yapısı oluştur:
    // Dış sayfa (.worksheet-page) -> İçerik -> İç sayfa (.worksheet-page)
    const container = document.createElement('div');
    container.id = 'fascicle-print-container';

    const outerPage1 = document.createElement('div');
    outerPage1.className = 'worksheet-page outer-1';
    const innerPage1 = document.createElement('div');
    innerPage1.className = 'worksheet-page inner-1';
    outerPage1.appendChild(innerPage1);

    const outerPage2 = document.createElement('div');
    outerPage2.className = 'worksheet-page outer-2';

    container.appendChild(outerPage1);
    container.appendChild(outerPage2);
    document.body.appendChild(container);

    const pages = collectPages('#fascicle-print-container .worksheet-page');

    // İç içe geçmiş inner-1 filtrelenmiş olmalı, yalnızca 2 adet outer sayfa dönmeli
    expect(pages.length).toBe(2);
    expect(pages[0].classList.contains('outer-1')).toBe(true);
    expect(pages[1].classList.contains('outer-2')).toBe(true);
    expect(pages.some(p => p.classList.contains('inner-1'))).toBe(false);

    // Temizle
    document.body.removeChild(container);
  });

  it('collectPages bağımsız (sibling) worksheet-page elemanlarını eksiksiz toplamalı', () => {
    const container = document.createElement('div');
    container.id = 'print-root';

    for (let i = 1; i <= 4; i++) {
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.setAttribute('data-page', String(i));
      container.appendChild(page);
    }
    document.body.appendChild(container);

    const pages = collectPages('#print-root .worksheet-page');
    expect(pages.length).toBe(4);

    document.body.removeChild(container);
  });

  it('Fasikül başlığı boş veya İsimsiz Fasikül olduğunda nöro-pedagojik yedek metin kullanılmalı', () => {
    const getFooterTitle = (title?: string) => {
      return title && title !== 'İsimsiz Fasikül' ? title : 'bdmind Özel Eğitim';
    };

    expect(getFooterTitle(undefined)).toBe('bdmind Özel Eğitim');
    expect(getFooterTitle('')).toBe('bdmind Özel Eğitim');
    expect(getFooterTitle('İsimsiz Fasikül')).toBe('bdmind Özel Eğitim');
    expect(getFooterTitle('4. Sınıf Disleksi Destek Fasikülü')).toBe('4. Sınıf Disleksi Destek Fasikülü');
  });
});
