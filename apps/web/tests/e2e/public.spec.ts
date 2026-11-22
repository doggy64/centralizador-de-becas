import { expect, test } from '@playwright/test';

test('MVP-001 permite explorar y postular desde una sesión nueva', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explorar el catálogo' }).click();
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.getByRole('link', { name: /Beca ficticia para Ingeniería/ }).click();
  const apply = page.getByRole('link', { name: 'Postular con la institución' });
  await expect(apply).toHaveAttribute('href', 'https://example.org/postular-demo');
  await expect(page.locator('input')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ingeniería');
  await page.screenshot({ path: info.outputPath('ficha.png') });
  await page.context().route('https://example.org/postular-demo', route => route.fulfill({ body: 'Destino de prueba' }));
  const popup = page.waitForEvent('popup');
  await apply.click();
  await expect(await popup).toHaveURL('https://example.org/postular-demo');
});

test('MVP-001 distingue una ficha sin canal y una ficha inexistente', async ({ page }) => {
  await page.goto('/becas/demo-medicina-por-confirmar');
  await expect(page.getByText('Canal de postulación por confirmar.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Postular/ })).toHaveCount(0);
  await page.goto('/becas/no-existe');
  await expect(page.getByRole('heading', { name: 'Página no disponible' })).toBeVisible();
});

test('la consulta pública distingue parámetros inválidos y una búsqueda vacía', async ({ page }) => {
  await page.goto('/becas?limit=100');
  await expect(page.getByRole('heading', { name: 'Búsqueda no válida' })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Buscar becas' });
  await search.fill('termino-inexistente');
  await search.press('Enter');
  await expect(page.getByText(/No encontramos becas/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver todas las becas' })).toHaveAttribute('href', '/becas');
});
