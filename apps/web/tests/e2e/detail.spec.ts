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
  await expect(page.getByRole('heading', { name: 'Requisitos de elegibilidad' })).toBeVisible();
  await expect(page.getByText('Requisito ficticio de ejemplo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Documentos requeridos' })).toBeVisible();
  await expect(page.getByText('Documento ficticio de prueba')).toBeVisible();
  await expect(page.getByText('Cobertura:', { exact: false })).toContainText('Completa');
  await expect(page.getByRole('heading', { name: 'Beneficios y costos' })).toBeVisible();
  await expect(page.getByText('Cobertura ilustrativa no real')).toBeVisible();
  await page.screenshot({ path: info.outputPath('ficha-basica.png'), fullPage: true });
});

test('MVP-015 muestra una ausencia como no especificada', async ({ page }) => {
  await page.goto('/becas/demo-medicina-por-confirmar');
  await expect(page.locator('.detail-facts')).toContainText('Sitio institucional');
  await expect(page.locator('.detail-facts')).toContainText('No especificado');
  await expect(page.getByRole('heading', { name: 'Requisitos de elegibilidad' }).locator('..')).toContainText('No especificado.');
  await expect(page.getByRole('heading', { name: 'Documentos requeridos' }).locator('..')).toContainText('No especificado.');
  await expect(page.getByRole('heading', { name: 'Beneficios y costos' }).locator('..')).toContainText('No especificado.');
});
