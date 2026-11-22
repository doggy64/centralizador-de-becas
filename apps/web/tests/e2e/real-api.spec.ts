import { expect, test } from '@playwright/test';

const realApiBaseUrl = process.env.E2E_API_BASE_URL;

test.describe('integración con API real', () => {
  test.skip(!realApiBaseUrl, 'Requiere E2E_API_BASE_URL y la API de DEV 2 disponible.');

  test('un estudiante abre catálogo y ficha publicada sin adaptadores de UI', async ({ page }) => {
    await page.goto('/becas');

    const scholarshipLink = page.locator('article a').first();
    await expect(scholarshipLink).toBeVisible();
    await scholarshipLink.click();

    await expect(page).toHaveURL(/\/becas\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fuente y verificación' })).toBeVisible();
  });
});
