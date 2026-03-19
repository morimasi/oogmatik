import { test, expect } from '@playwright/test';

test.describe('Türkçe Süper Stüdyo - E2E Akışları', () => {
  test.beforeEach(async ({ page }) => {
    // Ana sayfaya git ve Türkçe Süper Stüdyo ikonuna tıkla
    await page.goto('/');

    // Sidebar'ı aç (eğer mobil görünümdeyse veya hover gerekiyorsa)
    // Öğretmen/Kullanıcı giriş yapmış varsayılıyor
    await page.click('.studio-trigger-btn'); // Stüdyolar menüsünü aç

    // Açılan popup menüden Türkçe Süper Stüdyoyu seç
    // Bu elementin tıklanabilir olmasını bekle
    const superStudyoBtn = page.locator('text=Türkçe Süper Stüdyo');
    await expect(superStudyoBtn).toBeVisible();
    await superStudyoBtn.click();

    // Türkçe Süper Stüdyo'nun ana sayfasına geldiğinden emin ol
    await expect(page.locator('h1', { hasText: 'Türkçe Süper Stüdyo' })).toBeVisible();
  });

  test('Giriş paneli ve stüdyo modülleri görünür olmalı', async ({ page }) => {
    // 4 ana modülün kartlarının görünürlüğünü kontrol et
    await expect(page.locator('text=Metin & Paragraf Stüdyosu')).toBeVisible();
    await expect(page.locator('text=Mantık & Muhakeme Stüdyosu')).toBeVisible();
    await expect(page.locator('text=Yazım & Noktalama Stüdyosu')).toBeVisible();
    await expect(page.locator('text=Söz Varlığı & Kelime Fabrikası')).toBeVisible();
  });

  test('Öğretmen Paneline geçiş ve Soru Fabrikası (Magic Generator) testi', async ({ page }) => {
    // Öğretmen paneline/Soru fabrikasına gitmek için URL'yi manuel değiştir veya butona tıkla
    // Bu test için URL tabanlı gideceğiz
    await page.goto('/ogretmen-paneli');

    await expect(page.locator('h1', { hasText: 'Soru Fabrikası' })).toBeVisible();

    // Metin gir
    await page.fill(
      'textarea',
      'Bir varmış bir yokmuş, kırmızı başlıklı kız ormanda gezerken kurdu görmüş.'
    );

    // Sınıf seviyesi seç (örn: 2. Sınıf)
    await page.selectOption('select', '2');

    // Sihirli Soru Üret butonuna tıkla
    await page.click('button:has-text("Sihirli Soru Üret")');

    // Yükleniyor durumunu kontrol et
    await expect(page.locator('text=Yapay zeka metni analiz ediyor')).toBeVisible();

    // Sonucun (soruların) gelmesini bekle (simüle edilmiş AI delayi var ~1.5s)
    // Soru sayısının arttığını doğrula
    await expect(page.locator('.bg-white.p-5.rounded-2xl')).toHaveCount(2, { timeout: 5000 });
  });

  test('Çalışma Kağıdı Stüdyosu (PDF) render testi', async ({ page }) => {
    // PDF sayfasına git
    await page.goto('/calisma-kagidi');

    await expect(page.locator('h1', { hasText: 'Çalışma Kağıdı Stüdyosu' })).toBeVisible();

    // PDF Viewer veya indirme butonunun yüklenmesini bekle
    // Yükleniyor spinnerını bekle
    await expect(page.locator('text=Fasikül Derleniyor...')).toBeVisible();

    // Yükleme tamamlanınca İndir butonunun aktif olduğunu gör
    const downloadBtn = page.locator('text=PDF Olarak İndir');
    await expect(downloadBtn).not.toBeDisabled({ timeout: 10000 }); // Derleme uzun sürebilir
  });
});
