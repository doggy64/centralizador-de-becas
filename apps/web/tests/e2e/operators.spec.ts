import { expect, test } from '@playwright/test';

test('crea un trabajo, conserva la clave al reintentar y muestra el informe', async ({ page }) => {
  const id = '8c62ea94-31c7-4a0e-b882-6bf65ced3a40';
  const keys: string[] = [];
  await page.route('**/operadores/api/busquedas', async route => {
    keys.push(route.request().headers()['idempotency-key']);
    expect(route.request().postDataJSON()).toEqual({ query: 'Becas de posgrado', publish: false });
    await route.fulfill(keys.length === 1 ? { status: 503 } : { status: 202, json: { id, statusUrl: '/admin/busquedas/' + id } });
  });
  await page.route('**/operadores/api/busquedas/' + id, route => route.fulfill({ json: {
    id, query: 'Becas de posgrado', createdAt: '2026-01-01T12:00:00Z', status: 'DONE_WITH_ISSUES',
    report: { published: 1, pending: 1, results: [
      { url: 'https://example.org/1', status: 'PUBLISHED', slug: 'demo-ingenieria-2027' },
      { url: 'https://example.org/2', status: 'SOURCE_REVIEW', reason: 'Fuente pendiente' },
    ] },
  } }));
  await page.goto('/operadores');
  await page.getByLabel('Consulta de búsqueda').fill('Becas de posgrado');
  await page.getByRole('button', { name: 'Iniciar búsqueda' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'No se pudo contactar' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar búsqueda' }).click();
  await expect(page.getByText('Completada con incidencias')).toBeVisible();
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
  await expect(page.getByRole('link', { name: 'Ver ficha pública' })).toHaveAttribute('href', '/becas/demo-ingenieria-2027');
});

test('la API de operadores exige credenciales y el prototipo editorial es navegable', async ({ page, request }) => {
  const denied = await request.post('/operadores/api/busquedas', { data: { query: 'demo', publish: false } });
  expect(denied.status()).toBe(401);
  expect(denied.headers()['www-authenticate']).toContain('Basic');
  await page.goto('/operadores/editorial/fuentes');
  await page.getByRole('link', { name: /Continuar a ingesta/ }).click();
  await expect(page.getByRole('heading', { name: 'Ingesta e inspección' })).toBeVisible();
  await page.getByRole('link', { name: /03 Revisión editorial/ }).click();
  await expect(page.getByRole('heading', { name: 'Historial de decisiones' })).toBeVisible();
});
