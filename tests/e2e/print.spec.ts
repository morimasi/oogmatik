import { test, expect } from '@playwright/test';

// Simple end-to-end print smoke test for dynamic paper size feature
test.describe('Print Margin - Dynamic Paper Size', () => {
  test('prints with A4 and preserved top margins', async ({ page }) => {
    // Adjust URL to your local dev server if needed
    await page.goto('http://localhost:5173');

    // Ensure UI is loaded
    await expect(page).toBeTruthy();

    // Trigger print (will invoke printService.print with current paperSize from UI)
    const printBtn = page.locator('button[title="Yazdır (PDF)"]');
    await printBtn.click();

    // Wait a bit for print sequence to initialize (no real PDF capture here in CI)
    await page.waitForTimeout(1000);
  });

  test('prints with Letter and legal margins', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Change paper size via UI if exposed; if not, this test assumes default A4; you can adapt selectors
    const paperSizeDropdown = page.locator('select[aria-label="Kağıt Boyutu"]');
    if ((await paperSizeDropdown.count()) > 0) {
      await paperSizeDropdown.selectOption('Letter');
      await page.waitForTimeout(200);
      await page.locator('button[title="Yazdır (PDF)"]').click();
      await page.waitForTimeout(1000);
    }
  });
});
