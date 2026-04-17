/**
 * CaptureEngine izole birim testleri
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CaptureEngine — DOM Yardımcıları', () => {
  let CaptureEngine: typeof import('../src/utils/print/CaptureEngine');

  beforeEach(async () => {
    document.body.innerHTML = '';
    CaptureEngine = await import('../src/utils/print/CaptureEngine');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  // ─── hasRenderableContent ─────────────────────────────────────────────────
  describe('hasRenderableContent', () => {
    it('metin uzunluğu > 10 olduğunda true döndürmeli', () => {
      const el = document.createElement('div');
      el.textContent = 'Bu bir test metnidir ve 10 karakterden uzundur';
      document.body.appendChild(el);

      expect(CaptureEngine.hasRenderableContent([el])).toBe(true);
    });

    it('boş element için false döndürmeli', () => {
      const el = document.createElement('div');
      el.textContent = '';
      document.body.appendChild(el);

      expect(CaptureEngine.hasRenderableContent([el])).toBe(false);
    });

    it('kısa metin ama medya içeren element için true döndürmeli', () => {
      const el = document.createElement('div');
      el.textContent = 'kısa';
      const img = document.createElement('img');
      el.appendChild(img);
      document.body.appendChild(el);

      expect(CaptureEngine.hasRenderableContent([el])).toBe(true);
    });

    it('canvas içeren element için true döndürmeli', () => {
      const el = document.createElement('div');
      const canvas = document.createElement('canvas');
      el.appendChild(canvas);
      document.body.appendChild(el);

      expect(CaptureEngine.hasRenderableContent([el])).toBe(true);
    });

    it('SVG içeren element için true döndürmeli', () => {
      const el = document.createElement('div');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.appendChild(svg);
      document.body.appendChild(el);

      expect(CaptureEngine.hasRenderableContent([el])).toBe(true);
    });

    it('birden fazla boş element listesinde false döndürmeli', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      el1.textContent = '';
      el2.textContent = 'ab';
      document.body.appendChild(el1);
      document.body.appendChild(el2);

      expect(CaptureEngine.hasRenderableContent([el1, el2])).toBe(false);
    });

    it('karışık listede en az bir geçerli element varsa true döndürmeli', () => {
      const empty = document.createElement('div');
      const full = document.createElement('div');
      full.textContent = 'Yeterince uzun bir metin içeriği';
      document.body.appendChild(empty);
      document.body.appendChild(full);

      expect(CaptureEngine.hasRenderableContent([empty, full])).toBe(true);
    });
  });

  // ─── collectPages ─────────────────────────────────────────────────────────
  describe('collectPages', () => {
    it('doğrudan .worksheet-page elemanlarını toplamalı', () => {
      const page1 = document.createElement('div');
      page1.className = 'worksheet-page';
      page1.textContent = 'sayfa 1';
      document.body.appendChild(page1);

      const page2 = document.createElement('div');
      page2.className = 'worksheet-page';
      page2.textContent = 'sayfa 2';
      document.body.appendChild(page2);

      const pages = CaptureEngine.collectPages('.worksheet-page');
      expect(pages).toHaveLength(2);
    });

    it('iç içe geçmiş sayfaları bulmalı', () => {
      const container = document.createElement('div');
      container.className = 'content-area';

      const page1 = document.createElement('div');
      page1.className = 'worksheet-page';
      const page2 = document.createElement('div');
      page2.className = 'a4-page';

      container.appendChild(page1);
      container.appendChild(page2);
      document.body.appendChild(container);

      const pages = CaptureEngine.collectPages('.content-area');
      expect(pages).toHaveLength(2);
    });

    it('root kendisi bir sayfa ise onu dondurmeli', () => {
      const page = document.createElement('div');
      page.className = 'print-page';
      document.body.appendChild(page);

      const pages = CaptureEngine.collectPages('.print-page');
      expect(pages).toHaveLength(1);
      expect(pages[0]).toBe(page);
    });

    it('ic sayfa bulunamazsa root elemanini dondurmeli', () => {
      const fallback = document.createElement('div');
      fallback.className = 'custom-content';
      fallback.textContent = 'no inner pages';
      document.body.appendChild(fallback);

      const pages = CaptureEngine.collectPages('.custom-content');
      expect(pages).toHaveLength(1);
      expect(pages[0]).toBe(fallback);
    });

    it('selector bulunamazsa boş dizi döndürmeli', () => {
      const pages = CaptureEngine.collectPages('.nonexistent');
      expect(pages).toHaveLength(0);
    });

    it('birden fazla root + nested sayfa doğru toplanmalı', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        container.className = 'multi-root';
        const page = document.createElement('div');
        page.className = 'worksheet-page';
        container.appendChild(page);
        document.body.appendChild(container);
      }

      const pages = CaptureEngine.collectPages('.multi-root');
      expect(pages).toHaveLength(3);
    });
  });

  // ─── hideUIElements ───────────────────────────────────────────────────────
  describe('hideUIElements', () => {
    it('UI elemanlarını gizlemeli ve restore fonksiyonu geri getirmeli', () => {
      const btn = document.createElement('button');
      btn.className = 'action-button';
      btn.style.display = 'block';
      document.body.appendChild(btn);

      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.style.display = 'flex';
      document.body.appendChild(handle);

      const restore = CaptureEngine.hideUIElements();

      expect(btn.style.display).toBe('none');
      expect(handle.style.display).toBe('none');

      restore();

      expect(btn.style.display).toBe('block');
      expect(handle.style.display).toBe('flex');
    });
  });

  // ─── pixelLockElement ─────────────────────────────────────────────────────
  describe('pixelLockElement', () => {
    it('inline style eklemeli ve restore fonksiyonu geri almalı', () => {
      const root = document.createElement('div');
      root.style.width = '100%';
      root.innerHTML = '<span style="font-size: 1rem;">test</span>';
      document.body.appendChild(root);

      const origWidth = root.style.width;
      const restore = CaptureEngine.pixelLockElement(root);

      // pixelLock sonrası inline style değişmiş olmalı
      // (jsdom'da computed style sınırlıdır, ama inline still atanmış olmalı)
      expect(root.style.getPropertyValue('letter-spacing')).toBe('0px');

      restore();

      // Restore sonrası orijinal değerlere dönmeli
      expect(root.style.width).toBe(origWidth);
    });
  });

  // ─── stripScalesAndTransforms ─────────────────────────────────────────────
  describe('stripScalesAndTransforms', () => {
    it('parent zoom ve transform değerlerini sıfırlamalı', () => {
      const grandparent = document.createElement('div');
      grandparent.style.zoom = '0.8';
      grandparent.style.transform = 'scale(0.5)';

      const parent = document.createElement('div');
      parent.style.zoom = '1.2';

      const child = document.createElement('div');

      grandparent.appendChild(parent);
      parent.appendChild(child);
      document.body.appendChild(grandparent);

      const restore = CaptureEngine.stripScalesAndTransforms(child);

      expect(parent.style.zoom).toBe('1');
      expect(parent.style.transform).toBe('none');
      expect(grandparent.style.zoom).toBe('1');
      expect(grandparent.style.transform).toBe('none');

      restore();

      expect(parent.style.zoom).toBe('1.2');
      expect(grandparent.style.zoom).toBe('0.8');
      expect(grandparent.style.transform).toBe('scale(0.5)');
    });
  });

  // ─── waitForOverlayImages ─────────────────────────────────────────────────
  describe('waitForOverlayImages', () => {
    it('görsel olmayan overlay için hemen resolve etmeli', async () => {
      const overlay = document.createElement('div');
      overlay.innerHTML = '<p>sadece metin</p>';

      // Hata fırlatmamalı, hemen dönmeli
      await expect(CaptureEngine.waitForOverlayImages(overlay)).resolves.toBeUndefined();
    });

    it('timeout süresi içinde tamamlanmalı', async () => {
      const overlay = document.createElement('div');
      const img = document.createElement('img');
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      overlay.appendChild(img);

      // Kısa timeout ile test
      await expect(CaptureEngine.waitForOverlayImages(overlay, 200)).resolves.toBeUndefined();
    });
  });
});
