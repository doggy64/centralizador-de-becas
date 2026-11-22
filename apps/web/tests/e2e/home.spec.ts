import { expect, test } from '@playwright/test';

test('MVP-002 ofrece búsqueda por teclado y acceso al catálogo', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Encuentra tu próxima beca' })).toBeVisible();
  await expect(page.getByText(/Explora convocatorias y consulta cómo postular/)).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Buscar becas' });
  await expect(search).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar el catálogo' })).toHaveAttribute('href', '/becas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('inicio.png') });
  await search.fill('Ingeniería');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/becas\?q=Ingenier%C3%ADa$/);
  await expect(page.getByRole('link', { name: /Beca ficticia para Ingeniería/ })).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Explorar el catálogo' }).click();
  await expect(page).toHaveURL(/\/becas$/);
  await expect(page.getByRole('link', { name: /Beca ficticia de Medicina/ })).toBeVisible();
});
