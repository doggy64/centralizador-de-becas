import { expect, test } from '@playwright/test';

test('MVP-015 presenta condiciones clave de una edición desde su URL', async ({ page }, info) => {
  await page.goto('/becas/demo-ingenieria-2027');
  await expect(page.getByRole('heading', { name: /Ingeniería/ })).toBeVisible();
  await expect(page.getByText('Institución ficticia de pruebas', { exact: true })).toBeVisible();
  const facts = page.locator('.detail-facts');
  await expect(facts).toContainText('Programa de prueba');
  await expect(facts).toContainText('2027-a');
  await expect(facts).toContainText('Maestría');
  await expect(facts).toContainText('Bolivia');
  await expect(facts).toContainText('Virtual');
  await page.screenshot({ path: info.outputPath('ficha-basica.png'), fullPage: true });
});

test('MVP-015 muestra una ausencia como no especificada', async ({ page }) => {
  await page.goto('/becas/demo-medicina-por-confirmar');
  await expect(page.locator('.detail-facts')).toContainText('Sitio institucional');
  await expect(page.locator('.detail-facts')).toContainText('No especificado');
});
