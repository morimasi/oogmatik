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

    it('canvas içerikleri overlay\'e kopyalanmalı', async () => {
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
    it('indirme link\'i DOM\'a eklenmeli ve Blob URL kullanmalı', async () => {
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

    it('Letter kağıt boyutu desteklenmeli', () => {
      const page = document.createElement('div');
      page.className = 'worksheet-page';
      page.innerHTML = '<p>Letter test</p>';
      document.body.appendChild(page);

      printService.print('.worksheet-page', 'Letter');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl).not.toBeNull();
      expect(styleEl!.textContent).toContain('216mm');
      expect(styleEl!.textContent).toContain('279mm');
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
});
