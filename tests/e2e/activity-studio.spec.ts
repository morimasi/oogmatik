import { test, expect } from '@playwright/test';

test('activity studio view renders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Ultra Etkinlik Studyosu/i }).click();
  await expect(page.getByText(/Ultra Etkinlik Uretim Studyosu/i)).toBeVisible();
});
