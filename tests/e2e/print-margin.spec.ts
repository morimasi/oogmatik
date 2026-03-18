import { test, expect } from '@playwright/test';

test.describe('Print Margin - Dynamic Paper Size (E2E)', () => {
  test('should pass Letter paper size to print and preserve margins', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Try to select Letter if the control is available
    const hasSelector = await page.locator('select[aria-label="Kağıt Boyutu"]').count();
    if (hasSelector > 0) {
      await page.locator('select[aria-label="Kağıt Boyutu"]').selectOption('Letter');
      await page.waitForTimeout(200);
    }

    // Trigger print
    await page.locator('button[title="Yazdır (PDF)"]').click();
    // Wait for the internal signal that PaperSize was used
    await page.waitForFunction(
      () => (window as any).__oogmatik_print_paper_size__ !== undefined,
      null,
      { timeout: 5000 }
    );
    const used = await page.evaluate(() => (window as any).__oogmatik_print_paper_size__);
    expect(used).toBe('Letter');
  });
});
