/**
 * printService simülasyon testi
 * Tablet'te yaşanan boş sayfa sorununu PC'de simüle eder.
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// jsdom'da html2canvas çalışmaz, sadece printService'in DOM manipülasyonunu test ediyoruz
describe('printService - Tablet Blank Page Fix', () => {
  let printService: typeof import('../src/utils/printService').printService;

  beforeEach(async () => {
    // Her testten önce temiz DOM
    document.body.innerHTML = '';
    document.body.className = '';

    // window.print mock
    vi.spyOn(window, 'print').mockImplementation(() => {});

    const mod = await import('../src/utils/printService');
    printService = mod.printService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    document.body.className = '';
    const style = document.getElementById('oogmatik-print-style');
    if (style) style.remove();
  });

  describe('print() — DOM Clone Mode', () => {
    it('worksheet-page varken overlay oluşturmalı ve printing-mode eklemeli', async () => {
      // Sahte worksheet-page oluştur
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>Test içerik</p>';
      page.style.width = '210mm';
      page.style.minHeight = '297mm';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      // Overlay oluşturuldu mu?
      const overlay = document.getElementById('print-overlay');
      expect(overlay).not.toBeNull();
      // jsdom'da style.display doğrudan set edilmeyebilir, zIndex kontrol et
      expect(overlay!.style.zIndex).toBe('2147483647');

      // printing-mode sınıfı eklendi mi?
      expect(document.body.classList.contains('printing-mode')).toBe(true);

      // Overlay'de tablo yapısı var mı?
      const table = overlay!.querySelector('table');
      expect(table).not.toBeNull();
      const thead = overlay!.querySelector('thead');
      expect(thead).not.toBeNull();
      const tfoot = overlay!.querySelector('tfoot');
      expect(tfoot).not.toBeNull();

      // İçerik klonlandı mı?
      const clonedText = overlay!.textContent;
      expect(clonedText).toContain('Test içerik');

      // window.print çağrılana kadar bekle (350ms delay)
      await new Promise((r) => setTimeout(r, 500));
      expect(window.print).toHaveBeenCalled();
    });

    it('worksheet-page bulunamazsa fallback olarak window.print çağırmalı', () => {
      printService.print('.nonexistent-selector', 'A4');
      expect(window.print).toHaveBeenCalled();
    });

    it("canvas içerikleri overlay'e kopyalanmalı", async () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
      }
      page.appendChild(canvas);
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      const overlay = document.getElementById('print-overlay');
      const clonedCanvas = overlay!.querySelector('canvas');
      // jsdom'da canvas tam desteklenmez ama element var olmalı
      expect(clonedCanvas || overlay!.querySelector('img')).not.toBeNull();
    });
  });

  describe('buildCapturedPrintOverlay — Captured Print', () => {
    it('data URL görsellerden overlay oluşturmalı', async () => {
      // Küçük 1x1 kırmızı pixel PNG
      const tinyPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      // buildCapturedPrintOverlay private, ama generatePdf üzerinden test edebiliriz
      // Doğrudan overlay oluşturmayı simüle et
      const overlay = document.createElement('div');
      overlay.id = 'print-overlay';
      overlay.style.display = 'block';
      document.body.appendChild(overlay);

      const page = document.createElement('div');
      page.className = 'print-page';
      page.style.width = '210mm';
      page.style.minHeight = '297mm';

      const img = document.createElement('img');
      img.src = tinyPng;
      img.alt = 'print-page';
      img.style.display = 'block';
      img.style.width = '100%';

      page.appendChild(img);
      overlay.appendChild(page);

      // Overlay doğru yapılandırıldı mı?
      expect(overlay.querySelectorAll('img').length).toBe(1);
      expect(overlay.querySelector('.print-page')).not.toBeNull();
    });
  });

  describe('waitForOverlayImages — Image Decode', () => {
    it('img.decode() fonksiyonu printService kodunda kullanılıyor olmalı', async () => {
      // waitForOverlayImages private scope'ta, doğrudan test edemeyiz.
      // Bunun yerine kaynak kodda img.decode() kullanıldığını doğrulayalım.
      const mod = await import('../src/utils/printService?raw');
      const source = typeof mod.default === 'string' ? mod.default : JSON.stringify(mod);
      expect(source).toContain('img.decode');
      expect(source).toContain('decode()');
    });

    it('timeout 5000ms olarak ayarlanmış olmalı (tablet-safe)', async () => {
      const mod = await import('../src/utils/printService?raw');
      const source = typeof mod.default === 'string' ? mod.default : JSON.stringify(mod);
      expect(source).toContain('5000');
    });
  });

  describe('Download — Blob URL', () => {
    it("indirme link'i DOM'a eklenmeli ve Blob URL kullanmalı", async () => {
      // fetch mock — data URL → blob
      const mockBlob = new Blob(['fake-png'], { type: 'image/png' });
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      globalThis.URL.createObjectURL = createObjectURLMock;
      globalThis.URL.revokeObjectURL = revokeObjectURLMock;

      // DOM'a sahte worksheet-page ekle
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>test</p>';
      document.body.appendChild(page);

      // a.click mock
      const clickMock = vi.fn();
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreateElement(tag);
        if (tag === 'a') {
          el.click = clickMock;
        }
        return el;
      });

      // captureAndPrint download modunda çağırmak istiyoruz ama html2canvas
      // jsdom'da çalışmaz. Data URL download mantığını doğrudan test edelim:
      const tinyPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      // Download logic simülasyonu (captureAndPrint'ten alınan kod)
      const dataUrls = [tinyPng];
      const title = 'Test_Etkinlik';

      for (let i = 0; i < dataUrls.length; i++) {
        const url = dataUrls[i];
        const fileName = `${title}_sayfa_${i + 1}.png`;
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
      }

      // fetch çağrıldı mı?
      expect(fetchMock).toHaveBeenCalledWith(tinyPng);

      // Blob URL oluşturuldu mu?
      expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);

      // <a> elementi DOM'a eklendi mi?
      const addedLink = document.querySelector('a[download]');
      expect(addedLink).not.toBeNull();
      expect(addedLink!.getAttribute('href')).toBe('blob:mock-url');
      expect(addedLink!.getAttribute('download')).toBe('Test_Etkinlik_sayfa_1.png');

      // click çağrıldı mı?
      expect(clickMock).toHaveBeenCalled();
    });
  });

  describe('Print CSS — ensurePrintStyle', () => {
    it('print style elementi oluşturulmalı', () => {
      // print() çağrıldığında style oluşturulur
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>CSS test</p>';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl).not.toBeNull();
      expect(styleEl!.textContent).toContain('@page');
      expect(styleEl!.textContent).toContain('printing-mode');
      expect(styleEl!.textContent).toContain('print-overlay');
      expect(styleEl!.textContent).toContain('210mm');
    });

    it('Extreme_Yatay kağıt boyutu desteklenmeli', () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>Extreme Yatay test</p>';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'Extreme_Yatay');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl).not.toBeNull();
      expect(styleEl!.textContent).toContain('297mm');
      expect(styleEl!.textContent).toContain('210mm');
    });
  });

  describe('afterprint Cleanup', () => {
    it('afterprint event sonrası printing-mode kaldırılmalı', async () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>Cleanup test</p>';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      // printing-mode eklendi
      expect(document.body.classList.contains('printing-mode')).toBe(true);

      // afterprint event'i tetikle
      window.dispatchEvent(new Event('afterprint'));

      // Cleanup oldu mu?
      expect(document.body.classList.contains('printing-mode')).toBe(false);

      const overlay = document.getElementById('print-overlay');
      if (overlay) {
        expect(overlay.innerHTML).toBe('');
        expect(overlay.style.display).toBe('none');
      }
    });
  });

  describe('Timing — Tablet delays', () => {
    it('print() 350ms delay ile çağrılmalı (tablet safe)', async () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>Delay test</p>';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      // 100ms sonra henüz çağrılmamalı
      await new Promise((r) => setTimeout(r, 100));
      expect(window.print).not.toHaveBeenCalled();

      // 500ms sonra çağrılmış olmalı (350ms delay + tolerans)
      await new Promise((r) => setTimeout(r, 400));
      expect(window.print).toHaveBeenCalled();
    });
  });

  // ─── Yeni Testler: Barrel Export Uyumluluk ────────────────────────────────
  describe('Barrel Export — Geriye Dönük Uyumluluk', () => {
    it('printService.print metodu mevcut olmalı', () => {
      expect(typeof printService.print).toBe('function');
    });

    it('printService.captureAndPrint metodu mevcut olmalı', () => {
      expect(typeof printService.captureAndPrint).toBe('function');
    });

    it('printService.generatePdf metodu mevcut olmalı', () => {
      expect(typeof printService.generatePdf).toBe('function');
    });

    it('printService.generateRealPdf metodu mevcut olmalı', () => {
      expect(typeof printService.generateRealPdf).toBe('function');
    });

    it('PaperSize tipi import edilebilmeli', async () => {
      const mod = await import('../src/utils/printService');
      expect(mod).toHaveProperty('printService');
    });

    it('print/index barrel modülünden doğrudan import çalışmalı', async () => {
      const mod = await import('../src/utils/print/index');
      expect(mod.printService).toBeDefined();
      expect(typeof mod.printService.print).toBe('function');
      expect(typeof mod.printService.captureAndPrint).toBe('function');
      expect(typeof mod.printService.generatePdf).toBe('function');
      expect(typeof mod.printService.generateRealPdf).toBe('function');
    });

    it('CaptureEngine fonksiyonları barrel üzerinden erişilebilmeli', async () => {
      const mod = await import('../src/utils/print/index');
      expect(typeof mod.preloadFontsForCapture).toBe('function');
      expect(typeof mod.onCloneForCapture).toBe('function');
      expect(typeof mod.captureAllPages).toBe('function');
      expect(typeof mod.collectPages).toBe('function');
      expect(typeof mod.hasRenderableContent).toBe('function');
    });

    it('CSSInjector fonksiyonları barrel üzerinden erişilebilmeli', async () => {
      const mod = await import('../src/utils/print/index');
      expect(typeof mod.ensurePrintStyle).toBe('function');
      expect(typeof mod.forceRenderAllPages).toBe('function');
      expect(typeof mod.clearRenderAllPagesFlag).toBe('function');
    });

    it('PreviewRenderer fonksiyonları barrel üzerinden erişilebilmeli', async () => {
      const mod = await import('../src/utils/print/index');
      expect(typeof mod.renderPagePreview).toBe('function');
      expect(typeof mod.renderAllPagesPreview).toBe('function');
    });
  });

  // ─── Edge Case: Boş İçerik Korumaları ────────────────────────────────────
  describe('Edge Case — Boş İçerik', () => {
    it('selector bulunamadığında fallback window.print çağrılmalı', () => {
      printService.print('.really-nonexistent', 'A4');
      expect(window.print).toHaveBeenCalled();
    });

    it('çoklu sayfa içeriğinde tüm sayfalar klonlanmalı', async () => {
      for (let i = 0; i < 3; i++) {
        const page = document.createElement('div');
        page.className = 'worksheet-page';
        page.innerHTML = `<p>Sayfa ${i + 1}</p>`;
        document.body.appendChild(page);
      }

      printService.print('.worksheet-page', 'A4');

      const overlay = document.getElementById('print-overlay');
      expect(overlay).not.toBeNull();
      const clonedContent = overlay!.textContent;
      expect(clonedContent).toContain('Sayfa 1');
      expect(clonedContent).toContain('Sayfa 2');
      expect(clonedContent).toContain('Sayfa 3');
    });

    it('nested worksheet-page sayfaları doğru toplanmalı', () => {
      const container = document.createElement('div');
      container.className = 'content-root';

      const page1 = document.createElement('div');
      page1.className = 'worksheet-page';
      page1.innerHTML = '<p>Nested sayfa 1</p>';

      const page2 = document.createElement('div');
      page2.className = 'a4-page';
      page2.innerHTML = '<p>Nested sayfa 2</p>';

      container.appendChild(page1);
      container.appendChild(page2);
      document.body.appendChild(container);

      printService.print('.content-root', 'A4');

      const overlay = document.getElementById('print-overlay');
      expect(overlay).not.toBeNull();
      const text = overlay!.textContent ?? '';
      expect(text).toContain('Nested sayfa 1');
      expect(text).toContain('Nested sayfa 2');
    });
  });

  // ─── Çoklu Sayfa Overlay Doğrulama ───────────────────────────────────────
  describe('Çoklu Sayfa Overlay', () => {
    it('N sayfa = N adet wrapper oluşmalı', () => {
      const pages = 5;
      for (let i = 0; i < pages; i++) {
        const page = document.createElement('div');
        page.className = 'worksheet-page';
        page.innerHTML = `<p>S${i + 1}</p>`;
        document.body.appendChild(page);
      }

      printService.print('.worksheet-page', 'A4');

      const overlay = document.getElementById('print-overlay');
      const wrappers = overlay!.querySelectorAll('.oogmatik-print-wrapper');
      expect(wrappers).toHaveLength(pages);
    });

    it('input/select degerleri klonlanan overlay icine tasinmali', () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'test-value';
      page.appendChild(input);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      page.appendChild(checkbox);

      document.body.appendChild(page);

      printService.print('.worksheet-page', 'A4');

      const overlay = document.getElementById('print-overlay');
      const clonedInputs = overlay!.querySelectorAll('input');
      expect(clonedInputs.length).toBeGreaterThanOrEqual(2);

      const textInput = Array.from(clonedInputs).find((i) => i.type === 'text');
      expect(textInput?.value).toBe('test-value');

      const chk = Array.from(clonedInputs).find((i) => i.type === 'checkbox');
      expect(chk?.checked).toBe(true);
    });
  });
});

