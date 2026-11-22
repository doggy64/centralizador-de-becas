import { expect, test } from '@playwright/test';

test('MVP-029 y MVP-030 mantienen foco y navegación por teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const catalogLink = page.getByRole('link', { name: 'Catálogo', exact: true });
  await catalogLink.focus();
  await expect(catalogLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/becas$/);
  await expect(page.getByRole('form', { name: 'Filtros de becas' })).toBeVisible();
});

test('MVP-029 evita desbordamiento a 360 px en ficha y catálogo', async ({ page }) => {
  await page.goto('/becas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/becas/demo-ingenieria-2027');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
