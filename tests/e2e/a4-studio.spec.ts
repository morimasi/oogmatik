import { test, expect } from '@playwright/test';

/**
 * A4 Studio uçtan uca senaryosu (15. paket: E2E + görsel regresyon).
 *
 * Varsayılan olarak atlanır: test, üretilmiş bir etkinlik ve oturum açmış
 * kullanıcı gerektirir. Çalıştırmak için:
 *   A4_E2E=1 npx playwright test tests/e2e/a4-studio.spec.ts
 *
 * Görsel regresyon ilk çalıştırmada baseline üretir; ikinci çalıştırma
 * piksel farkını doğrular. Baseline dosyaları depoya eklenmelidir.
 */

const enabled = process.env.A4_E2E === '1';

test.describe('A4 Studio — düzenleme ve çıktı akışı', () => {
  test.skip(!enabled, 'A4_E2E=1 ve oturum açmış kullanıcı gerekir.');

  test('blok seç → yerinde düzenle → geri al → denetim → kaydet', async ({ page }) => {
    await page.goto('/');

    // Etkinlik üretimi (uygulamanın ana akışı).
    await page.getByRole('button', { name: /etkinlik oluştur|üret/i }).first().click();
    await page.waitForSelector('.worksheet-page', { timeout: 90_000 });

    // A4 Tasarımcısını aç.
    await page.getByRole('button', { name: /A4 Tasarımcısını Aç/i }).click();
    const panel = page.getByRole('complementary', { name: 'A4 tasarımcısı paneli' });
    await expect(panel).toBeVisible();

    // İlk metin bloğunu seç ve yerinde düzenle.
    const block = page.locator('[data-block-id]').first();
    await expect(block).toBeVisible();
    await block.click();
    await block.dblclick();
    const inline = page.getByRole('textbox', { name: /metin|başlık/i }).first();
    await inline.fill('E2E — düzenlenmiş metin');
    await page.getByRole('button', { name: 'Uygula' }).click();
    await expect(page.locator('body')).toContainText('E2E — düzenlenmiş metin');

    // Geri al → metin eski hâline döner.
    await page.keyboard.press('Control+z');
    await expect(page.locator('body')).not.toContainText('E2E — düzenlenmiş metin');

    // Denetim sekmesi ve komut paleti.
    await panel.getByRole('tab', { name: /Denetim/i }).click();
    await expect(panel.getByText('Üretim Denetimi')).toBeVisible();

    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog', { name: 'Komut paleti' })).toBeVisible();
    await page.keyboard.press('Escape');

    // Görsel regresyon: panel + A4 sayfası.
    await expect(page).toHaveScreenshot('a4-studio-panel.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
