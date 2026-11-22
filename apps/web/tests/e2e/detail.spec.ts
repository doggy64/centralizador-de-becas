import { expect, test } from '@playwright/test';

test('MVP-015 presenta condiciones clave de una edición desde su URL', async ({ page }, info) => {
  await page.goto('/becas/demo-ingenieria-2027');
  await expect(page.getByRole('heading', { name: /Ingeniería/ })).toBeVisible();
  await expect(page.getByText('Institución ficticia de pruebas', { exact: true })).toBeVisible();
  const facts = page.locator('.detail-facts').first();
  await expect(facts).toContainText('Programa de prueba');
  await expect(facts).toContainText('Edición vigente');
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
  await expect(page.getByRole('heading', { name: 'Plazos de la convocatoria' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Plazos de la convocatoria' }).getByText('31 de diciembre de 2027 (fecha ficticia)')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fuente y verificación' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fuente DEMO, no oficial' })).toHaveAttribute('href', 'https://example.org/convocatoria-demo');
  await expect(page.getByText(/Última revisión:/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('ficha-basica.png'), fullPage: true });
});

test('MVP-015 muestra una ausencia como no especificada', async ({ page }) => {
  await page.goto('/becas/demo-medicina-por-confirmar');
  const facts = page.locator('.detail-facts').first();
  await expect(facts).toContainText('Sitio institucional');
  await expect(facts).toContainText('No especificado');
  await expect(page.getByRole('heading', { name: 'Requisitos de elegibilidad' }).locator('..')).toContainText('No especificado.');
  await expect(page.getByRole('heading', { name: 'Documentos requeridos' }).locator('..')).toContainText('No especificado.');
  await expect(page.getByRole('heading', { name: 'Beneficios y costos' }).locator('..')).toContainText('No especificado.');
  await expect(page.getByText('Pendiente de verificación').first()).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Información pendiente de verificación' })).toBeVisible();
});

test('MVP-025 identifica una edición cerrada sin marcarla como abierta', async ({ page }) => {
  await page.goto('/becas/demo-historia-cerrada');
  await expect(page.getByText('Cerrada', { exact: true })).toBeVisible();
  await expect(page.getByText('Abierta', { exact: true })).toHaveCount(0);
});

test('abre la evidencia y regresa al catálogo con la misma consulta', async ({ page }) => {
  await page.goto('/becas?q=prueba&country=BO');
  await page.getByRole('link', { name: /Beca ficticia para Ingeniería/ }).click();
  const requirements = page.getByRole('region', { name: 'Requisitos de elegibilidad' });
  await requirements.getByText('Ver evidencia').click();
  await expect(requirements.getByText('Texto de prueba')).toBeVisible();
  await page.getByRole('link', { name: /Volver al catálogo/ }).click();
  await expect(page).toHaveURL(/\/becas\?q=prueba&country=BO$/);
});
