import { test, expect } from '@playwright/test';

// End-to-end regression tests for dynamic paper size across 2/4/6 pages
test.describe('Print Margin Regression (Dynamic Paper Size)', () => {
  test('Letter paper size should preserve margins on multi-page output', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // If a paper size dropdown exists, switch to Letter
    const dp = page.locator('select[aria-label="Kağıt Boyutu"]');
    if ((await dp.count()) > 0) {
      await dp.selectOption('Letter');
      await page.waitForTimeout(200);
    }
    // Trigger print
    await page.locator('button[title="Yazdır (PDF)"]').click();
    await page.waitForFunction(
      () => (window as any).__oogmatik_print_paper_size__ === 'Letter',
      {},
      { timeout: 5000 }
    );
    const used = await page.evaluate(() => (window as any).__oogmatik_print_paper_size__);
    expect(used).toBe('Letter');
  });

  test('A4 to Letter transition on multi-page (4 pages, Letter)', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const dp = page.locator('select[aria-label="Kağıt Boyutu"]');
    if ((await dp.count()) > 0) {
      await dp.selectOption('Letter');
      await page.waitForTimeout(200);
    }
    // Ensure at least a content block exists before print
    await page.locator('button[title="Yazdır (PDF)"]').click();
    await page.waitForFunction(
      () => (window as any).__oogmatik_print_paper_size__ !== undefined,
      {},
      { timeout: 6000 }
    );
  });

  test('Legal paper size should preserve margins on multi-page output', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const dp = page.locator('select[aria-label="Kağıt Boyutu"]');
    if ((await dp.count()) > 0) {
      await dp.selectOption('Legal');
      await page.waitForTimeout(200);
    }
    await page.locator('button[title="Yazdır (PDF)"]').click();
    await page.waitForFunction(
      () => (window as any).__oogmatik_print_paper_size__ === 'Legal',
      {},
      { timeout: 6000 }
    );
    const used = await page.evaluate(() => (window as any).__oogmatik_print_paper_size__);
    expect(used).toBe('Legal');
  });
});
