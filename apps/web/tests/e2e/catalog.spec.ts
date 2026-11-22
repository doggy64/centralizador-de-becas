import { expect, test } from '@playwright/test';

test('MVP-003 muestra datos de catálogo y plazos originales sin inventar fechas', async ({ page }, info) => {
  await page.goto('/becas');
  const engineering = page.getByRole('listitem').filter({ hasText: 'Beca ficticia para Ingeniería' });
  await expect(engineering.getByText('Bolivia', { exact: true })).toBeVisible();
  await expect(engineering.getByText('Maestría', { exact: true })).toBeVisible();
  await expect(engineering.getByText('Abierta', { exact: true })).toBeVisible();
  await expect(engineering.getByText('31 de diciembre de 2027 (fecha ficticia)', { exact: true })).toBeVisible();
  const medicine = page.getByRole('listitem').filter({ hasText: 'Beca ficticia de Medicina' });
  await expect(medicine.locator('dd').last()).toHaveText('Por confirmar');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('catalogo.png'), fullPage: true });
  await engineering.getByRole('link').click();
  await expect(page).toHaveURL(/becas\/demo-ingenieria-2027$/);
});
