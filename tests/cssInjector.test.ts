/**
 * CSSInjector izole birim testleri
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CSSInjector — CSS Enjeksiyon Modülü', () => {
  let CSSInjector: typeof import('../src/utils/print/CSSInjector');

  beforeEach(async () => {
    document.body.innerHTML = '';
    document.body.className = '';
    document.head.innerHTML = '';
    CSSInjector = await import('../src/utils/print/CSSInjector');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
    // Style elementlerini temizle
    document.querySelectorAll('style').forEach((s) => s.remove());
  });

  // ─── ensurePrintStyle ─────────────────────────────────────────────────────
  describe('ensurePrintStyle', () => {
    it('A4 için doğru @page kuralı oluşturmalı', () => {
      CSSInjector.ensurePrintStyle('A4');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl).not.toBeNull();
      expect(styleEl!.textContent).toContain('@page');
      expect(styleEl!.textContent).toContain('size: A4');
      expect(styleEl!.textContent).toContain('210mm');
      expect(styleEl!.textContent).toContain('297mm');
    });

    it('Extreme_Dikey için A4 kuralı kullanmalı', () => {
      CSSInjector.ensurePrintStyle('Extreme_Dikey');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl!.textContent).toContain('size: A4');
      expect(styleEl!.textContent).toContain('210mm');
      expect(styleEl!.textContent).toContain('297mm');
    });

    it('Extreme_Yatay için landscape A4 kuralı kullanmalı', () => {
      CSSInjector.ensurePrintStyle('Extreme_Yatay');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl!.textContent).toContain('A4 landscape');
      expect(styleEl!.textContent).toContain('297mm');
      expect(styleEl!.textContent).toContain('210mm');
    });

    it('Letter boyutu desteklenmeli', () => {
      CSSInjector.ensurePrintStyle('Letter');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl!.textContent).toContain('size: Letter');
      expect(styleEl!.textContent).toContain('216mm');
      expect(styleEl!.textContent).toContain('279mm');
    });

    it('aynı ID ile mevcut style elementini güncellenmeli (duplikasyon olmamalı)', () => {
      CSSInjector.ensurePrintStyle('A4');
      CSSInjector.ensurePrintStyle('Letter');

      const styleEls = document.querySelectorAll('#oogmatik-print-style');
      expect(styleEls).toHaveLength(1);
      expect(styleEls[0].textContent).toContain('Letter');
    });

    it('printing-mode sınıfı kuralları içermeli', () => {
      CSSInjector.ensurePrintStyle('A4');

      const styleEl = document.getElementById('oogmatik-print-style');
      expect(styleEl!.textContent).toContain('printing-mode');
      expect(styleEl!.textContent).toContain('print-overlay');
    });
  });

  // ─── injectPrintLockCSS ───────────────────────────────────────────────────
  describe('injectPrintLockCSS', () => {
    it('Print Lock style elementi oluşturmalı', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', false);

      expect(styleEl).not.toBeNull();
      expect(styleEl.id).toBe('oogmatik-print-core-styles');
    });

    it('Tailwind responsive grid kilitlerini içermeli', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', false);

      expect(styleEl.textContent).toContain('grid-cols-2');
      expect(styleEl.textContent).toContain('grid-cols-3');
      expect(styleEl.textContent).toContain('grid-cols-4');
      expect(styleEl.textContent).toContain('flex-row');
    });

    it('portrait yönlendirmesi doğru olmalı', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', false);
      expect(styleEl.textContent).toContain('portrait');
    });

    it('landscape yönlendirmesi doğru olmalı', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', true);
      expect(styleEl.textContent).toContain('landscape');
    });

    it('break kilitlerini kıran kuralları içermeli (blank page fix)', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', false);
      expect(styleEl.textContent).toContain('page-break-inside: auto');
      expect(styleEl.textContent).toContain('break-inside: auto');
      expect(styleEl.textContent).toContain('overflow: visible');
    });

    it('print-color-adjust kurallarını içermeli', () => {
      const styleEl = CSSInjector.injectPrintLockCSS('A4', false);
      expect(styleEl.textContent).toContain('print-color-adjust: exact');
      expect(styleEl.textContent).toContain('-webkit-print-color-adjust: exact');
    });
  });

  // ─── forceRenderAllPages & clearRenderAllPagesFlag ────────────────────────
  describe('forceRenderAllPages / clearRenderAllPagesFlag', () => {
    it('forceRenderAllPages bayrağı set edilmeli', async () => {
      await CSSInjector.forceRenderAllPages();

      const flag = (window as { __oogmatik_force_render_all_pages__?: boolean })
        .__oogmatik_force_render_all_pages__;
      expect(flag).toBe(true);
    });

    it('clearRenderAllPagesFlag bayrağı temizlemeli', async () => {
      await CSSInjector.forceRenderAllPages();
      CSSInjector.clearRenderAllPagesFlag();

      const flag = (window as { __oogmatik_force_render_all_pages__?: boolean })
        .__oogmatik_force_render_all_pages__;
      expect(flag).toBeUndefined();
    });

    it('forceRenderAllPages event dispatch etmeli', async () => {
      let eventFired = false;
      window.addEventListener('oogmatik:render-all-pages', () => {
        eventFired = true;
      });

      await CSSInjector.forceRenderAllPages();
      expect(eventFired).toBe(true);
    });
  });
});
