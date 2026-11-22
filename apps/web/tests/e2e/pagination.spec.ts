import { expect, test } from '@playwright/test';

test('MVP-006 pagina y preserva los filtros de la consulta', async ({ page }, info) => {
  await page.goto('/becas?coverage=FULL&limit=1');
  await expect(page.getByRole('link', { name: /Ingeniería/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Paginación' })).toHaveCount(0);

  await page.goto('/becas?limit=1');
  const pagination = page.getByRole('navigation', { name: 'Paginación' });
  await expect(pagination).toContainText('Página 1 de 3');
  await expect(pagination.getByRole('link', { name: 'Siguiente' })).toHaveAttribute('href', '/becas?limit=1&page=2');
  await pagination.getByRole('link', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/limit=1&page=2$/);
  await expect(page.getByRole('link', { name: /Medicina/ })).toBeVisible();
  await expect(pagination.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '/becas?limit=1&page=1');
  await page.screenshot({ path: info.outputPath('paginacion.png') });
});
