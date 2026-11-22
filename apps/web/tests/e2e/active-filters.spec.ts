import { expect, test } from '@playwright/test';

test('MVP-012 y MVP-013 combinan, quitan y limpian filtros', async ({ page }, info) => {
  await page.goto('/becas?q=prueba&status=OPEN&modality=ONLINE');
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
  const active = page.getByRole('region', { name: 'Filtros aplicados' });
  await expect(active.getByRole('link', { name: 'Quitar Vigencia: Abierta' })).toHaveAttribute('href', '/becas?q=prueba&modality=ONLINE');
  await active.getByRole('link', { name: 'Quitar Modalidad: Virtual' }).click();
  await expect(page).toHaveURL(/q=prueba&status=OPEN$/);
  await active.getByRole('link', { name: 'Limpiar filtros' }).click();
  await expect(page).toHaveURL(/\/becas$/);
  await page.screenshot({ path: info.outputPath('filtros-activos.png'), fullPage: true });
});

test('MVP-005 explica el resultado vacío y permite recuperar el catálogo', async ({ page }) => {
  await page.goto('/becas?q=tema-inexistente&coverage=FULL');
  await expect(page.getByRole('heading', { name: 'No encontramos becas' })).toBeVisible();
  await page.getByRole('link', { name: 'Limpiar filtros y ver todas las becas' }).click();
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
});
