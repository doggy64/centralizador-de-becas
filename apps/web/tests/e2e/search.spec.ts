import { expect, test } from '@playwright/test';

test('MVP-004 permite editar búsquedas y recuperar resultados desde la URL', async ({ page }, info) => {
  await page.goto('/becas?q=INGENIERIA');
  const search = page.getByRole('searchbox', { name: 'Buscar becas' });
  await expect(search).toHaveValue('INGENIERIA');
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Convocatorias encontradas — 1 para «INGENIERIA»');
  await search.fill('medicina');
  await search.press('Enter');
  await expect(page.getByRole('link', { name: /Beca ficticia de Medicina/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toHaveCount(0);
  await page.reload();
  await expect(search).toHaveValue('medicina');
  await page.screenshot({ path: info.outputPath('busqueda.png') });
  await search.fill('');
  await search.press('Enter');
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
});

test('MVP-004 consulta institución y programa mediante la API', async ({ page }) => {
  for (const term of ['Institución ficticia de pruebas', 'Programa de prueba']) {
    await page.goto('/becas?q=' + encodeURIComponent(term));
    await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveValue(term);
  }
});
